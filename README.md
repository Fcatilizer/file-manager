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
Every member can create a password-protected **Only me** bucket. Admins can also
create shared buckets. A trash button appears for buckets you can delete.
Creation validates S3-compatible names. Deletion requires typing the exact name
and succeeds only for an empty bucket; it never deletes files recursively. Older
object versions and delete markers must also be removed using your storage tools.

After creation, Vault selects the new bucket. Deleting the selected bucket switches
to another available bucket; deleting the last one shows a create-bucket screen.
The configured private/default buckets are selection preferences. Opening Vault
no longer automatically creates or recreates the private bucket.

Existing buckets remain shared. Private buckets are visible only to their owner,
including when another member is an app admin. Each private bucket has a separate
password (12 characters minimum, 72 UTF-8 bytes maximum), stored as a bcrypt hash.
Unlocks last 15 minutes and are tied to the current login. **Lock now** and password
changes revoke all unlocks for that bucket; logout removes this login's unlocks.
Changing a bucket password requires its current password; there is no admin reset.
Five password checks per bucket/owner are allowed per 15-minute window.

Ownership and unlock checks cover every file API, previews, and URL generation.
Private signed URLs last at most 60 seconds; already-issued URLs remain usable
until they expire, and locking cannot recall downloaded files or an active transfer.
This is application access control, not client-side encryption: operators with
server/storage credentials can still access the data. RustFS buckets must remain
non-public. Back up MongoDB with storage: it holds ownership and password hashes.
The `vault-private-` storage-name prefix is reserved and fails closed if metadata
is missing. The displayed name is independent of the generated storage name.
An interrupted creation can be retried with the same name and password.

New buckets are not given a public-read policy. Storage credentials need bucket
create/delete permissions in addition to existing list/object permissions.
MongoDB must allow creation of the ownership, grant, and rate-limit indexes.

For direct browser uploads from Vercel, allow your deployed frontend origin in
RustFS's `RUSTFS_CORS_ALLOWED_ORIGINS` and restart RustFS when changing that server
setting ([RustFS CORS documentation](https://docs.rustfs.com/en/administration/cors)).
Bucket creation does not change CORS or access policies. File bytes never pass
through Vercel, including on failure; the old proxy endpoint now refuses uploads.
Use a browser-reachable HTTPS `MINIO_ENDPOINT`, or set `MINIO_PUBLIC_ENDPOINT`
when the backend uses a separate internal storage address.

For the current deployment, add this to the **RustFS server/container environment**
(preserve any other trusted origins), then restart/recreate RustFS:

```env
RUSTFS_CORS_ALLOWED_ORIGINS="https://file-manager-phi-sepia.vercel.app"
```

This setting belongs on RustFS, not in Vercel's environment. Its Console CORS
setting is separate and does not enable S3 API uploads. The S3 endpoint and any
reverse proxy must permit `OPTIONS`/`PUT`, allow `Content-Type`, and return the
matching `Access-Control-Allow-Origin`. Verify before retrying an upload:

```sh
curl -i -X OPTIONS 'https://dev-fs-api.a3group.co.in/shared-files/cors-check' \
  -H 'Origin: https://file-manager-phi-sepia.vercel.app' \
  -H 'Access-Control-Request-Method: PUT' \
  -H 'Access-Control-Request-Headers: content-type'
```

A successful HTTP status alone is insufficient: the CORS allow-origin/method/header
response fields must permit the browser request. If a proxy supplies CORS, avoid
adding duplicate allow-origin headers. Do not make buckets publicly writable.

### Large-file uploads

Files larger than 8 MiB use S3 multipart upload: normally 8 MiB parts, at most
three simultaneous direct-to-storage requests. Part size grows for very large
files to stay within 10,000 parts (application cap: 5 TiB). Ensure the storage
proxy body limit allows the selected part size; chunking does not bypass CORS.
Smaller files, including empty files, use direct signed PUTs.

Failed transient transfers retry up to twice with fresh signed URLs. The UI shows
byte progress, cancellation, and persistent errors instead of silently falling
back to Vercel. The server verifies part sizes/ETags through S3 ListParts before
completion, so exposing ETag to browser JavaScript is not required. Storage
credentials need multipart create/upload/list-parts/complete/abort permissions.

Upload tickets are bound to the initiating user and login, expire after 24 hours,
and every signing/completion request rechecks bucket access. Private buckets
retain their existing unlock expiry and 60-second signed URL limit; a locked
bucket must be unlocked before starting a new attempt. Cleanup is allowed for
the initiating login after the bucket locks. Automatic retries work within the
open page; resuming after reload is not implemented.

Failures/cancellations attempt to abort incomplete multipart uploads. A closed
tab, lost connection or expired login can prevent cleanup: configure an
`AbortIncompleteMultipartUpload` lifecycle rule in storage where supported, or
periodically remove stale multipart uploads. The frontend does not change bucket
lifecycle rules or CORS settings automatically.

## Account settings and appearance

Click your avatar or name to open **Account settings**:

- **Profile:** update your display name (your login email stays unchanged).
- **Password:** change your password after confirming the current password.
- **Preferences:** preview and save the theme (Light/Dark chips), interface font, accent color and rain
  animation. Rain is off by default and its toggle appears only here. Closing the
  modal or choosing **Cancel changes** restores the last saved appearance.

Names and saved preferences are stored with the user in MongoDB and loaded on
sign-in. Appearance is also cached in this browser for the sign-in screen. Existing
accounts work without a database migration. The header theme shortcut saves its
change to the signed-in account as well.

All font stacks, the font stylesheet URL, accent palettes and default preferences
live in `src/lib/preferences.ts`. `src/lib/appearance.ts` applies those choices as
CSS variables; UI components consume the variables. Add future sections to
`AccountSettingsModal.tsx` and validate any new persisted settings on the server.

### Rain customization and reusable controls

Rain settings include downward/right/left direction, speed (0.5–2×), drop height
(12–120 px), drop width (1–4 px), optional bottom-edge splashes, and theme color or
any custom hex color. A contained live preview uses the same renderer as the
background. Save, Cancel and Reset apply to all rain settings too.

Density offers Light (16 drops), Balanced (32) or Full (56). Mobile displays half
of those drops; the small preview uses fewer particles. Rain and splashes use CSS
transforms/opacity without a JavaScript frame loop. Off removes the animation
nodes; reduced motion disables animation, and hidden tabs pause it. Older account
preferences without customization automatically use the defaults.

Maintenance is split by responsibility:

- `src/lib/rain.ts`: defaults, ranges, density limits and shared API validation.
- `src/components/RainBackground.tsx`: reusable background/preview renderer.
- `src/styles/rain-animation.css`: drop/splash keyframes, directions and motion rules.
- `src/components/settings/SettingsControls.tsx`: reusable chips, ranges and switches.
- `src/components/settings/PreferencesPanel.tsx` and `RainSettingsPanel.tsx`: settings UI.
- `src/styles/settings-controls.css`, `rain-settings.css`, `account-settings.css`: scoped UI styles.

## Checks

```bash
npm test          # account and bucket API tests
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
| `MINIO_PUBLIC_ENDPOINT` | no | Browser-reachable HTTPS endpoint for signed uploads; defaults to `MINIO_ENDPOINT` |
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
> - **Direct-to-S3 Uploads:** Small files use signed PUTs; large files use multipart uploads with retries, progress and cancellation. File bytes bypass Vercel's serverless payload limit.
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

## Public sharing

Use the link icon beside a file or folder to create a read-only public URL.
Choose 1 hour, 6 hours, 24 hours, a custom number of hours (up to 10 years), or
permanent. Anyone holding the URL can access the item without signing in.
Folder shares include existing and future contents under that folder, with
paginated browsing. File shares reference the current object at that path;
replacing it changes what recipients download.

Private-bucket sharing requires the owner to unlock the bucket first. The share
then remains available independently of bucket locks and password changes, until
it expires or the creator revokes it. Deleting the private bucket invalidates its
shares. Open the item's share dialog to view and revoke your active links.
Permanent means no automatic expiry; it does not prevent revocation.

Share tokens contain 256 random bits. Authentication uses SHA-256 hashes; new
links also retain an AES-256-GCM encrypted token so the creator can copy the same
URL again from active links. Encryption uses `SHARE_TOKEN_SECRET`, falling back
to `JWT_SECRET`; keep this secret stable and backed up. Changing it prevents
re-copying old URLs, but their existing public URLs remain valid. Older hash-only
links cannot be reconstructed; create a new link if you no longer have the URL. Public
pages have no third-party resources, disable caching/indexing, and suppress
referrers. Storage policies are not made public. Downloads redirect to signed,
attachment-only storage URLs valid for at most 60 seconds and no later than the
share expiry. Revocation cannot recall those URLs, active transfers, or saved
copies. Share URLs are bearer credentials: anyone they are forwarded to can use
them. Configure hosting/access logs to redact `/api/public/*` token paths.

Public share pages use Vault's file icons, font/accent preferences, folder
breadcrumbs and file rows. Recipients see the sharer's display name (email
username when no name is set), creation time, original duration, remaining time
at page load, and readable expiry dates labeled UTC. Full email addresses are
not published. Existing links resolve the current owner profile automatically.

## Item details

The information icon beside a file or folder opens storage metadata. File details
include exact size, MIME type, modified time, ETag, storage class, version (when
available), and custom metadata. Folder details scan nested contents across
pages, up to 10,000 entries; capped scans are explicitly partial. Original
creation and last-opened timestamps are not available from object storage.

Public shares show a Vault-styled unavailable page for expired/revoked links and
missing items, plus not-found and server-error pages. File rows include preview
and download controls. Public previews reuse the same React `PreviewModal`, `DocxPreview`, and
`SheetPreview` as the signed-in vault: Mammoth + DOMPurify for DOCX, SheetJS for
spreadsheets, and the existing media, PDF, text, and masked `.env` views. A
`PreviewSource` adapter loads bytes through the authorized share token instead
of the account API. Text previews retain the 1 MB limit and office previews the
20 MB limit; unsupported formats offer the same download fallback. Existing
public links enter `/share` with the token in the URL fragment. The shared browser stays mounted while the existing Vault preview modal opens and closes through local state; folder browsing also uses client-side navigation. Legacy `/shared-preview` links open the same browser with the preview overlaid.
Media preview URLs expire within 60 seconds, bounded by the share expiry.
Already-loaded previews and active streams cannot be recalled after revocation.

## Animation preferences migration

Appearance preferences use `preferences.animations.type` (`none`, `rain`, or
`leaves`) and `preferences.animations.settings` for each effect's settings.
Rain and leaves retain independent dimensions, speed, direction, density, color,
and splash/breeze options. The Preferences panel labels these **Default animation
settings**. Animation rendering and styles remain in separate modules.

For an existing database, run these commands with that deployment's `MONGO_URI`
and optional `MONGO_DB` configured (the script also reads `.env`):

```sh
npm run migrate:animations -- --dry-run
npm run migrate:animations
```

The migration preserves appearance and effect choices, only updates preferences,
can be rerun, and skips invalid records or concurrent changes. Inspect the printed
counts for skipped/conflicting records. API reads and browser cache reads also
accept legacy `rain`/`rainSettings`/`animation`/`leafSettings` preferences; new saves
write the canonical schema. Run the migration again after retiring old deployments
if an old server has subsequently written legacy preferences.

## Custom PDF reader

Vault and public shares use the same PDF.js canvas reader with zoom, fit to width,
continuous scrolling, and single-page navigation. Canvas and page container sizes
stay matched so contents are not clipped. Fitted pages adapt to viewport resizing;
high-DPI bitmaps are bounded and render tasks cancel before their canvas is reused.
The browser-native viewer remains an optional desktop fallback. PDF.js fonts,
character maps and WASM assets are served locally from `pdfjs-assets/`, populated
by the Vite build plugin, rather than depending on a third-party CDN at preview time.
