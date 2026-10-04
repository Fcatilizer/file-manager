# Vault — File Manager

A minimal, modern file manager UI backed by S3-compatible storage (MinIO / RustFS),
MongoDB authentication, and in-browser previews (images, video, audio, PDF, text,
`.env`, Word and Excel).

## Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express (serves the API and the built frontend), MongoDB, S3 SDK
- **Auth:** JWT in an HttpOnly cookie, admin/user roles, first-run setup

The backend is a **long-running Node server** (`server/index.ts`). In development it
runs Vite in middleware mode; in production it serves `dist/` and the `/api/*` routes.

## Local development

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:3000
```

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `MONGO_DB` | no | defaults to `vault` |
| `JWT_SECRET` | yes (prod) | long random hex string |
| `SESSION_TTL` | no | defaults to `7d` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | seeds the first admin; if omitted, a first-run setup screen appears |
| `SETUP_TOKEN` | no | if set, required to complete first-run setup |
| `MINIO_ENDPOINT` | yes | S3/RustFS endpoint |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | yes | S3 credentials |
| `MINIO_BUCKET` / `MINIO_PRIVATE_BUCKET` | no | bucket names |
| `MINIO_REGION` | no | defaults to `us-east-1` |
| `PORT` | no | defaults to `3000` |
| `HOST` | no | defaults to `0.0.0.0` |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Production

```bash
npm run build   # tsc -b && vite build  -> dist/
npm start       # NODE_ENV=production tsx server/index.ts
```

The server serves `dist/` and the API from one origin, so cookies just work.
Health check: `GET /healthz`.

## Deployment

> **Vercel will not work for this app.** Vercel serves the Vite build as static
> files and does not run the Express server, so every `/api/*` request (auth,
> MongoDB, RustFS) 404s — you'll see "Failed to connect to storage". Adding a
> `.env` on Vercel has no effect because there is no server runtime reading it.
> This backend must run on a host that supports a long-running Node process.

Deploy the **whole app** (frontend + API) to a Node host:

- **Render** — a `render.yaml` blueprint is included. Or create a Web Service:
  Build `npm ci && npm run build`, Start `npm start`, health check `/healthz`.
- **Railway / Heroku-style** — a `Procfile` (`web: npm start`) is included.
- **Fly.io / Docker** — a multi-stage `Dockerfile` is included.

Set all required environment variables in the host's dashboard. The app serves
HTTPS-terminated traffic behind the platform proxy; the session cookie is
`Secure` in production, so the site must be served over HTTPS (all the hosts
above provide this automatically).
