<div align="center">


# Vault — Cloud Workspace & File Manager

**The next-generation, self-hosted cloud storage experience.**  
*Blazing-fast direct S3 uploads, in-browser notebook editing, file sharing, zero-trust private vaults, and instant multi-format previews.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js 24 LTS](https://img.shields.io/badge/Node.js-24%20LTS-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Storage: S3 / MinIO / RustFS](https://img.shields.io/badge/Storage-S3%20%7C%20MinIO%20%7C%20RustFS-C71A36?style=flat-square&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB%207%2B-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-122%20Passing-10b981?style=flat-square&logo=checkmarx&logoColor=white)](tests/)
[![Deploy on Vercel](https://img.shields.io/badge/Vercel-Serverless%20Ready-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

[**Features**](#-key-features) • [**Live Showcase**](#-product-tour--live-showcase) • [**Installation**](#-installation--quickstart) • [**Customizations**](#-appearance--customizations) • [**Deployment**](#-deployment-options) • [**Environment**](#-environment-variables)

---

</div>

## Why Vault?

Most S3 file managers are clunky administrative consoles built for devops, or sluggish cloud drives that funnel multi-gigabyte uploads through overloaded proxy servers.

**Vault is different.** It combines the polished user experience of a modern desktop operating system with enterprise-grade storage engineering:
- **Zero-Proxy Direct Streaming:** Small and multi-gigabyte files stream directly between the browser and your S3-compatible storage (RustFS, MinIO, Ceph, AWS S3) with zero server bottleneck.
- **Built-In Notebook Editor:** Create, draft, and modify `.env`, Markdown, code, and config files directly in the browser with syntax highlighting, line numbers, and instant save.
- **True In-Browser Previews:** View PDFs with a high-DPI canvas reader, preview Word `.docx` and Excel `.xlsx` spreadsheets, watch videos, stream audio with ID3 album art, and inspect `.env` secrets with automatic masking.
- **Zero-Trust Private Vaults:** Individual password-protected buckets that auto-lock after 15 minutes of inactivity and isolate private files even from system administrators.

---

## Product Tour & Live Showcase

### 1. Unified Command Center & File Manager
> Manage unlimited buckets, navigate nested directories with instant breadcrumbs, drag-and-drop uploads, and search through thousands of objects with instantaneous filtering.

<div align="center">
  <img src="docs/assets/dashboard.png" alt="Vault Command Center and File Manager" width="92%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---


### 2. Integrated Notebook Editor (Create & Edit)
> Create brand-new files or edit existing ones directly within Vault. Includes line numbers, 2-space tab indentation, live character/word/byte statistics, format dropdowns, and `⌘S` / `Ctrl+S` keyboard shortcuts with unsaved changes protection.

<div align="center">
  <img src="docs/assets/notebook-editor.png" alt="Notebook Code and Config Editor Modal" width="92%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### 3. Smart `.env` Secrets Inspector & Code Preview
> Auto-detects sensitive credential keys (`API_KEY`, `SECRET`, `PASSWORD`, `DSN`) and masks them by default (`••••••••••`). Toggle reveal on demand, copy individual values, copy all, or jump straight into the editor.

<div align="center">
  <p float="left">
    <img src="docs/assets/env-preview.png" alt=".env Secrets Inspector with Auto Masking" width="48%" style="border-radius: 8px; margin-right: 2%;" />
    <img src="docs/assets/code-preview.png" alt="Syntax Highlighted Code Preview" width="48%" style="border-radius: 8px;" />
  </p>
</div>

---

### 4. Rich Markdown & Document Reader
> Renders GitHub-flavored Markdown with formatted tables, code blocks, lists, and links, plus estimated reading times. Toggle between rendered view and raw source mode in a single click.

<div align="center">
  <img src="docs/assets/markdown-preview.png" alt="Markdown Preview Modal" width="92%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### 5. Public Share URL
> Share Files Folder via Public URLs with specified time period token access

<div align="center">
  <img src="docs/assets/public-share-url.png" alt="Markdown Preview Modal" width="92%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

> Revoke Access to the File Anytime for maximum peace of mind.

---

## Key Features

| Category | Capability | Highlight |
| :--- | :--- | :--- |
| **High-Speed Transfers** | Direct S3 Client Uploads | Small files use signed PUTs; files >8 MiB use parallel S3 Multipart uploads up to 5 TiB. |
| **Upload Monitoring** | Real-Time Telemetry | Rolling speed meter (MB/s), estimated time remaining (ETA), pause/resume, and cancellation. |
| **In-Browser Notebook** | Create & Edit Files | Line-numbered gutter, Tab indentation, live stats, `⌘S` quick save, custom file extensions. |
| **Security & Vaults** | Password-Protected Buckets | Dedicated "Only Me" buckets with bcrypt passwords, 15-minute auto-locking, and zero admin snooping. |
| **Universal Previews** | Document & Media Viewers | High-DPI PDF.js reader, DOCX (Mammoth), XLSX/CSV (SheetJS), video & audio with ID3 covers. |
| **Public Sharing** | Expiring Public Links | Share files or folders with 1h to 10-year expiry, bearer tokens, AES-256 encrypted storage, and instant revocation. |
| **Personalization** | Appearance & Particle Engine | Dark/Light themes, curated typography, custom accent colors, and hardware-accelerated CSS rain/leaf physics. |

---

## Appearance & Customizations

Vault treats aesthetics and comfort as first-class citizens. Open **Account Settings → Preferences** to tailor your workspace:

<div align="center">
  <img src="docs/assets/appearance-preferences.png" alt="Appearance and Preferences Customization" width="92%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

### Customization Options
- **Theme Modes:** True Dark Mode (high-contrast, deep blacks) and Clean Light Mode.
- **Font Typography:** Seamlessly switch between curated font stacks (`Inter`, `Outfit`, `Fira Code`, `JetBrains Mono`, `Roboto`, `System`).
- **Accent Palettes:** Tailor the brand glow across Cyan, Indigo, Violet, Rose, Emerald, and Amber.
- **Particle Physics Engine:** An ambient background particle simulation (Rain or Falling Leaves) powered strictly by GPU-accelerated CSS animations:
  - **Direction:** Downward, angled right, or angled left.
  - **Speed:** Fluid adjustment from 0.5× to 2.0× real-time.
  - **Drop Dimensions:** Fine-tune droplet height (12–120 px) and width (1–4 px).
  - **Effects:** Optional water splash impacts along the bottom viewport edge.
  - **Density:** Light (16 particles), Balanced (32), or Full (56), throttled automatically for mobile viewports.

<div align="center">
  <img src="docs/assets/rain-preview.png" alt="Live Particle Physics Engine Preview" width="85%" />
</div>

---

## Architecture & Data Flow

Vault connects your browser directly to your storage infrastructure:

```mermaid
flowchart TD
    subgraph Client["Browser (React 19 + TypeScript)"]
        UI["Vault UI & Notebook Editor"]
        DirectUpload["Direct-to-S3 Multipart Engine"]
        PreviewEngines["PDF.js / SheetJS / Mammoth / Audio"]
    end

    subgraph Backend["Vault Server / Vercel Serverless"]
        AuthService["Auth & Zero-Trust Lock Manager"]
        Presigner["S3 Presigned URL & Ticket Issuer"]
        ShareService["Share Link & Token Vault"]
    end

    subgraph Storage["Object Storage"]
        S3["RustFS / MinIO / AWS S3 Storage"]
    end

    subgraph Database["MongoDB Database"]
        Mongo[("Users, Buckets, Preferences & Shares")]
    end

    UI -->|1. Request Presigned URL| Presigner
    Presigner -->|Verify Auth & Lock Status| AuthService
    AuthService --> Mongo
    Presigner -->|2. Issue Signed S3 URL| DirectUpload
    DirectUpload -->|3. PUT Chunks Directly (Bypass Server)| S3
    UI -->|4. Complete Upload Ticket| Presigner
    Presigner -->|Verify ETags & Publish| S3
    PreviewEngines -->|Stream Media Directly via 307| S3
```

---

## Installation & Quickstart

### Prerequisites
- **Node.js:** 24.x LTS or higher
- **MongoDB:** 7.0+ (local instance or MongoDB Atlas)
- **Object Storage:** Any S3-compatible storage (RustFS, MinIO, AWS S3, Cloudflare R2, Ceph)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ashishgaurav/file-manager.git
cd file-manager
npm ci
```

### 2. Configure Environment

Copy the example configuration file:

```bash
cp .env.example .env
```

Generate a secure random JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Update `.env` with your database and storage credentials:

```ini
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/vault
MONGO_DB=vault
JWT_SECRET=your_generated_random_secret_here

# Object Storage (RustFS / MinIO / S3)
MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_BUCKET=public-files
MINIO_PRIVATE_BUCKET=shared-files
MINIO_REGION=us-east-1

# Optional: Initial Administrator (Runs setup wizard at /setup if omitted)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_secure_password
```

### 3. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment Options

Vault can be deployed as a high-performance **Docker container**, a standard **Node.js persistent process**, or a **Vercel Serverless application**.

### Option A: Docker Deployment (Recommended for Production)

A multi-stage production `Dockerfile` is included:

```bash
# Build the optimized production image
docker build -t vault-file-manager .

# Run container with environment configuration
docker run -d \
  --name vault \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  vault-file-manager
```

### Option B: Node.js Host (Render / Railway / VPS)

```bash
# Compile client bundle and serverless entry
npm run build

# Start production server
npm start
```

### Option C: Vercel Serverless Function

Vault features built-in Vercel configuration (`vercel.json` and `server/vercel.ts` adapter):

1. Import the repository into your [Vercel Dashboard](https://vercel.com).
2. Set the environment variables in the Vercel project settings (`MONGO_URI`, `JWT_SECRET`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, etc.).
3. **Configure RustFS/MinIO CORS:** Add your deployed Vercel domain to your storage server's CORS settings so the browser can perform direct PUT requests:
   ```env
   RUSTFS_CORS_ALLOWED_ORIGINS="https://your-vault-app.vercel.app"
   ```
4. Verify CORS readiness:
   ```bash
   curl -i -X OPTIONS 'https://your-storage-api.com/bucket/cors-check' \
     -H 'Origin: https://your-vault-app.vercel.app' \
     -H 'Access-Control-Request-Method: PUT' \
     -H 'Access-Control-Request-Headers: content-type'
   ```
5. Click **Deploy**.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `MONGO_URI` | **Yes** | — | MongoDB connection string (e.g. `mongodb+srv://...`) |
| `MONGO_DB` | No | `vault` | Database name |
| `JWT_SECRET` | **Yes** (Prod) | — | Cryptographically random string for session tokens |
| `SHARE_TOKEN_SECRET` | No | Falls back to `JWT_SECRET` | Secret used to encrypt public share link tokens with AES-256-GCM |
| `SESSION_TTL` | No | `7d` | User session duration |
| `ADMIN_EMAIL` | No | — | Seeds default administrator account |
| `ADMIN_PASSWORD` | No | — | Seeds default administrator password |
| `SETUP_TOKEN` | No | — | Optional token required during the first-run `/setup` wizard |
| `MINIO_ENDPOINT` | **Yes** | — | S3/RustFS endpoint URL for server operations |
| `MINIO_PUBLIC_ENDPOINT` | No | `MINIO_ENDPOINT` | Browser-reachable HTTPS URL for client presigned uploads |
| `MINIO_ACCESS_KEY` | **Yes** | — | S3 storage access key |
| `MINIO_SECRET_KEY` | **Yes** | — | S3 storage secret key |
| `MINIO_BUCKET` | No | `public-files` | Default shared bucket name |
| `MINIO_PRIVATE_BUCKET` | No | `shared-files` | Default private bucket selection preference |
| `MINIO_REGION` | No | `us-east-1` | S3 region identifier |
| `PORT` | No | `3000` | Port for the HTTP server |
| `HOST` | No | `0.0.0.0` | Bind host address |

---

## Testing & Code Quality

Vault maintains high test coverage with zero external mocking services required:

```bash
# Run unit & integration test suite (122 tests)
npm test

# Check code formatting & lint rules
npm run lint

# Compile TypeScript and production client/server bundles
npm run build
```

---

## NOTE

> This program doesn't guarantee encryption of the files and folder on the hardware level. Owner may still be able to check all the bucket content using the drives manually.

> This program is for managaing one's own stuff in a bucket hosted by themselves among family and friends.

---

## License

Vault is open-source software licensed under the **[MIT License](LICENSE)**.
