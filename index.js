/**
 * Simple Express + Prisma backend with Socket.IO.
 * - Health: GET /api/health
 * - Users: GET /api/users, POST /api/users
 * - Posts: GET /api/posts, POST /api/posts
 * - Socket.IO at /api/socketio (CORS-enabled)
 *
 * Configure via environment variables:
 *   PORT (default 4000)
 *   DATABASE_URL (required for Prisma; default uses SQLite file ./dev.db)
 *   FRONTEND_ORIGIN (set to your Vercel URL to restrict CORS; defaults to '*')
 *
 * Deploy on Render: add DATABASE_URL as an env var in Render (Postgres or SQLite),
 * set start command `npm start`, and ensure build step runs `npx prisma generate` if needed.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const user = await prisma.user.create({ data: { email, name }});
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Posts
app.get('/api/posts', async (req, res) => {
  const posts = await prisma.post.findMany();
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  const { title, content, authorId } = req.body;
  if (!title || !authorId) return res.status(400).json({ error: 'title and authorId required' });
  try {
    const post = await prisma.post.create({ data: { title, content, authorId }});
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  path: '/api/socketio',
  cors: { origin: FRONTEND_ORIGIN, methods: ['GET','POST'] }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('message', (msg) => {
    // broadcast to others
    socket.broadcast.emit('message', msg);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('Backend listening on port', PORT);
  console.log('Socket.IO path: /api/socketio');
});
