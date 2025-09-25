# Render Backend (Express + Prisma)

This is a minimal backend intended to connect to a Next.js frontend hosted on Vercel.

Features:
- REST endpoints: /api/health, /api/users, /api/posts
- Socket.IO at /api/socketio
- Uses Prisma (default SQLite) — you can switch to Postgres in Render by setting DATABASE_URL.

Deployment notes for Render:
1. Create a new Web Service on Render linked to this repository or upload the project.
2. Set `build` commands:
   - `npx prisma generate` (if you use Prisma)
3. Set the start command to:
   - `npm start`
4. Add environment variables in the Render dashboard:
   - `DATABASE_URL` (Render Postgres or other)
   - `FRONTEND_ORIGIN` = your Vercel URL (e.g. https://your-site.vercel.app)
5. If using Postgres, run migrations or use `prisma db push` locally and commit `schema.prisma` changes.

CORS:
The server reads FRONTEND_ORIGIN env var; set it to your Vercel app URL to allow requests only from your frontend.

Socket.IO:
Client should connect to `wss://<your-render-host>/api/socketio` (or http depending on TLS).

If you want, I can:
- Customize endpoints to match your frontend forms.
- Produce a Dockerfile or Render `render.yaml`.

