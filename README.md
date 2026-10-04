# Vault — File Manager

A minimal, modern file manager UI backed by S3-compatible storage (MinIO / RustFS),
MongoDB authentication, and in-browser previews (images, video, audio, PDF, text,
`.env`, Word and Excel).

## Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express (serves the API and the built frontend), MongoDB, S3 SDK
- **Auth:** JWT in an HttpOnly cookie, admin/user roles, first-run setup

The backend can run as a **Serverless Function on Vercel** or as a **long-running Node server** (`server/index.ts`). In development it
runs Vite in middleware mode; in production it serves `dist/` and the `/api/*` routes.

## Local development

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:3000
```

## Bucket management

Open the bucket dropdown in the header to switch buckets or refresh the list.
Admins also get **Create bucket** and a trash button beside each bucket.
Creation validates S3-compatible names. Deletion requires typing the exact name
and succeeds only for an empty bucket; it never deletes files recursively. Older
object versions and delete markers must also be removed using your storage tools.

After creation, Vault selects the new bucket. Deleting the selected bucket switches
to another available bucket; deleting the last one shows a create-bucket screen.
The configured private/default buckets are selection preferences. Opening Vault
no longer automatically creates or recreates the private bucket.

These are shared vault buckets: all signed-in users retain file access to buckets
available to the server credentials. The admin role controls bucket creation and
deletion, not per-user file privacy. New buckets are not given a public-read policy.
The server's storage credentials need bucket create/delete permissions in addition
to the existing list/object permissions.

For direct browser uploads from Vercel, allow your deployed frontend origin in
RustFS's `RUSTFS_CORS_ALLOWED_ORIGINS` and restart RustFS when changing that server
setting ([RustFS CORS documentation](https://docs.rustfs.com/en/administration/cors)).
Bucket creation does not change CORS or access policies. If direct uploads fail,
the existing proxy fallback is subject to Vercel's
[4.5 MB request limit](https://vercel.com/docs/functions/limitations).

## Checks

```bash
npm test          # bucket API authorization, validation, errors and selection tests
npm run build     # TypeScript, frontend and Vercel function bundle
npm run lint
```

The tests mock S3 and do not read `.env`, connect to MongoDB or mutate real storage.

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

## Production (Node / Docker)

```bash
npm run build   # tsc -b && vite build  -> dist/
npm start       # NODE_ENV=production tsx server/index.ts
```

The server serves `dist/` and the API from one origin, so cookies just work.
Health check: `GET /healthz`.

## Deployment

Vault can be deployed on **Vercel** (Serverless) or on any **Node / Docker container host** (Render, Railway, Fly.io, etc.).

### Deploying to Vercel

Vault includes native Vercel configuration (`vercel.json` and the generated `api/index.js` serverless function adapter):

1. Push your repository to GitHub / GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New** → **Project** and import this repository.
3. Configure the **Environment Variables** in the Vercel project settings:
   - `MONGO_URI` (e.g. MongoDB Atlas connection string)
   - `MONGO_DB` (e.g. `vault`)
   - `JWT_SECRET` (generate using `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `MINIO_ENDPOINT` (e.g. `https://dev-fs-api.a3group.co.in/` or your RustFS / S3 endpoint)
   - `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
   - `MINIO_BUCKET` / `MINIO_PRIVATE_BUCKET`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (optional: if omitted, setup wizard runs at `/setup`)
4. Click **Deploy**.

> **How Vercel Serverless is optimized in Vault:**
> - **Direct-to-S3 Uploads:** Files upload directly to S3 via presigned PUT URLs, bypassing Vercel's 4.5 MB serverless payload limit.
> - **Media Streaming (307 Redirects):** Audio and video streams redirect directly to S3 presigned URLs, avoiding proxying media through the function.
> - **MongoDB Connection Pooling:** Reuses pooled MongoClient connections across serverless lambda freezes and warm starts.

---

### Deploying to Node / Container Hosts

Deploy the whole app (frontend + long-running API) as a persistent service:

- **Render** — a `render.yaml` blueprint is included. Or create a Web Service:
  - Build: `npm ci && npm run build`
  - Start: `npm start`
  - Health check: `/healthz`
- **Railway / Heroku** — a `Procfile` (`web: npm start`) is included.
- **Docker / Fly.io / Coolify** — a production multi-stage `Dockerfile` is included:
  ```bash
  docker build -t vault-file-manager .
  docker run -p 3000:3000 --env-file .env vault-file-manager
  ```

Set all required environment variables in the host's dashboard. In production (`NODE_ENV=production`), session cookies are marked `Secure`, so the site must be served over HTTPS (all hosts above provide this automatically).
