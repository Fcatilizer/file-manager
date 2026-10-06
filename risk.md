# Vault Security & Privacy Risk Assessment (`risk.md`)

**Date:** October 2026  
**Scope:** Full Project Security Audit for Public Domain / Internet Deployment  
**Target:** [Vault File Manager](file:///Users/ashishgaurav/Documents/Projects/file-manager)  
**Evaluator:** Antigravity AI Security Pair Programmer  

---

## Executive Summary: Is Storing Private Stuff Safe?

> **VERDICT: NO — NOT SAFELY in its default configuration on a public domain.**

If you deploy this application to the public internet right now and begin storing sensitive, confidential, or private data (personal photos, financial documents, tax forms, private keys, `.env` files, passwords), **you face significant security and privacy risks**:

1. **Multi-User Privacy is Not Enforced:** If you create any additional user account (for family, friends, or colleagues), **that user can see, download, overwrite, and delete all files in your default/shared bucket**. There is no personal user folder isolation or per-file access control.
2. **"Private Buckets" Are Not Encrypted at Rest:** While password-protected private buckets lock API routes behind a password check in MongoDB, the files in S3/MinIO/RustFS are stored in **plaintext**. Anyone with access to S3 credentials, server disks, backups, or storage management consoles can read everything.
3. **First-Run Admin Takeover Risk:** If deployed without pre-set admin credentials and without `SETUP_TOKEN`, anyone on the public internet who discovers the domain can register as the master admin and seize full control.
4. **Brute Force Vulnerability:** The user login endpoint (`/api/auth/login`) has no rate limiting or lockout protection against automated dictionary attacks.
5. **Permanent Public Links:** Public sharing allows creating non-expiring links, and sharing a folder exposes all future files placed into that folder.

Below is the complete, detailed breakdown of every identified risk, vulnerability, attack vector, and mitigation checklist.

---

## Risk Severity Matrix

| ID | Severity | Category | Risk Description | Code Reference |
|---|---|---|---|---|
| **SEC-01** | **CRITICAL** | Data Isolation | No per-user storage isolation in default/shared buckets | [`server/s3.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L175-L215) |
| **SEC-02** | **HIGH** | Storage Security | Private buckets are only logically locked, not encrypted at rest | [`server/s3.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L268-L290), [`server/bucket-protection.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/bucket-protection.ts) |
| **SEC-03** | **HIGH** | Authentication | Unprotected first-run admin setup wizard exposed to the public | [`server/auth.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/auth.ts#L119-L149) |
| **SEC-04** | **RESOLVED** | Authentication | Rate limiting added to auth login (`/api/auth/login`) & setup (`/api/auth/setup`) | [`server/auth.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/auth.ts#L27-L40), [`tests/auth-security.test.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/tests/auth-security.test.ts) |
| **SEC-05** | **HIGH** | Data Leakage | Permanent public share links and recursive folder exposure | [`server/shares.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/shares.ts#L61-L90) |
| **SEC-06** | **HIGH** | Access Control | S3 root/admin credentials used for all operations and signing | [`server/s3.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L63-L77) |
| **SEC-07** | **MEDIUM-HIGH**| Session Security | Stateless JWT sessions cannot be revoked and survive password changes | [`server/auth.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/auth.ts#L172-L227) |
| **SEC-08** | **MEDIUM-HIGH**| Infrastructure | Serverless deployment requires MongoDB Atlas open to `0.0.0.0/0` | [`server/db.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/db.ts#L59-L65) |
| **SEC-09** | **RESOLVED** | Network Security | Global security headers added (CSP, HSTS, SAMEORIGIN, nosniff, Referrer) | [`server/app.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/app.ts#L17-L43), [`vercel.json`](file:///Users/ashishgaurav/Documents/Projects/file-manager/vercel.json#L5-L16) |
| **SEC-10** | **MEDIUM** | Preview / XSS | Client-side file preview risks (Iframe PDF, Excel/Word parsers) | [`src/components/PreviewModal.tsx`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/PreviewModal.tsx#L213-L215), [`DocxPreview.tsx`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/DocxPreview.tsx#L109) |
| **SEC-11** | **MEDIUM** | Integrity | Authenticated non-admin users can delete or overwrite shared files | [`server/s3.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L297-L315) |
| **SEC-12** | **LOW** | Operational | Admin password reset request field mismatch (`password` vs `newPassword`) | [`src/lib/api.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/lib/api.ts#L155), [`server/users.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/users.ts#L83) |

---

## Detailed Technical Findings

### SEC-01: Zero Multi-Tenant Isolation in Default/Shared Buckets (CRITICAL)

- **Affected Code:** [`server/s3.ts:175-193`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L175-L193), [`server/bucket-protection.ts:42-49`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/bucket-protection.ts#L42-L49)
- **Vulnerability Mechanics:**
  In [`server/s3.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts), file operations (`/files`, `/download`, `/raw`, `/upload-url`, `/folders`, `/metadata`) resolve the target bucket from `req.query.bucket || MINIO_PRIVATE_BUCKET` (which defaults to `shared-files`).
  In [`server/bucket-protection.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/bucket-protection.ts):
  ```typescript
  async authorize(req: Request, name: string): Promise<PrivateBucket | null> {
    bucketUser(req)
    const bucket = await this.store.find(name)
    if (!bucket && !name.startsWith(PRIVATE_BUCKET_PREFIX)) return null // <-- Allows access!
    ...
  }
  ```
  If a bucket does not start with `private:`, `authorize()` returns `null` without error.
  The server then executes S3 commands against the shared bucket using the master S3 credentials.
- **Impact on Privacy:**
  - Any user with a registered account (role: `user` or `admin`) can list all files, download any file, preview any file, or delete any file in the default bucket.
  - Files are uploaded directly to the root namespace (e.g., `key: "tax_returns_2025.pdf"`). There is no user prefixing (e.g., `users/<userId>/...`).
  - If you store private files here expecting them to be private to your account, **any other user on your system can access them immediately**.

---

### SEC-02: Private Buckets Lack Encryption at Rest (HIGH)

- **Affected Code:** [`server/s3.ts:268-286`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L268-L286), [`server/bucket-protection.ts:87-105`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/bucket-protection.ts#L87-L105)
- **Vulnerability Mechanics:**
  The "Private Bucket" feature uses a separate bucket name (`private:<uuid>`) and requires a password to generate a 15-minute unlock session in MongoDB.
  However, file uploads are generated via presigned S3 PUT requests without client-side encryption or Server-Side Encryption with Customer-Provided Keys (SSE-C).
- **Impact on Privacy:**
  - All files in `private:<uuid>` are stored in **plaintext** on the S3/MinIO cluster.
  - The bucket password is only checked to gate HTTP API access. It does not cryptographically protect the data.
  - Anyone with direct storage access (cloud S3 console, MinIO web dashboard, server root/SSH, database backups) can inspect and copy all "private" files.

---

### SEC-03: Open First-Run Admin Setup on Public Domain (HIGH)

- **Affected Code:** [`server/auth.ts:119-149`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/auth.ts#L119-L149), [`.env.example:26-28`](file:///Users/ashishgaurav/Documents/Projects/file-manager/.env.example#L26-L28)
- **Vulnerability Mechanics:**
  ```typescript
  authRouter.post('/setup', async (req: Request, res: Response) => {
    const total = await countUsers()
    if (total > 0) return res.status(403).json({ error: 'Setup has already been completed' })
    const setupToken = process.env.SETUP_TOKEN
    if (setupToken && req.body?.token !== setupToken) return res.status(403).json({ error: 'Invalid setup token' })
    ...
  ```
  `SETUP_TOKEN` is optional. If left blank in `.env`, `/api/auth/setup` is completely unrestricted when `countUsers() === 0`.
- **Impact on Public Deployment:**
  - When you deploy the site to a public domain (e.g. on Vercel or Render) before logging in yourself, bots and search engine scanners actively probe `/api/auth/setup` or `/setup`.
  - An attacker can submit an email and password to create the first `admin` account before you do, locking you out of your own server.

---

### SEC-04: Rate Limiting on Login (`/api/auth/login`) (RESOLVED)

- **Affected Code:** [`server/auth.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/auth.ts#L27-L40), [`tests/auth-security.test.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/tests/auth-security.test.ts)
- **Previous Risk:** `POST /api/auth/login` and `/setup` had no rate limiting, allowing automated password guessing or dictionary attacks.
- **Resolution Implemented:**
  - Integrated `express-rate-limit` middleware attached specifically to auth endpoints (`/api/auth/login` and `/api/auth/setup`).
  - Configured a 15-minute window (`AUTH_RATE_LIMIT_WINDOW_MS`, default 15m) with a maximum of 10 failed attempts (`AUTH_RATE_LIMIT_MAX`, default 10).
  - Configured `skipSuccessfulRequests: true` so legitimate logins with the correct password never exhaust user attempts.
  - Returns standard IETF Draft-7 headers (`RateLimit`, `Retry-After`) with HTTP 429 and error message: `"Too many login attempts. Please try again in 15 minutes."`.
  - Rate limiting is scoped exclusively to authentication; file browsing, downloads, uploads, and health checks are unthrottled.
  - Verified with automated test in [`tests/auth-security.test.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/tests/auth-security.test.ts).

---

### SEC-05: Permanent Public Links & Recursive Folder Exposure (HIGH)

- **Affected Code:** [`server/shares.ts:61-90`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/shares.ts#L61-L90), [`server/public-share-page.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/public-share-page.ts)
- **Vulnerability Mechanics:**
  1. **Permanent Duration:** Users can choose `duration: 'permanent'` when generating a public share link (`expiresAt: null`). The link remains active forever unless manually revoked.
  2. **Folder Scope:** Public folder sharing grants access by prefix (`Prefix: requested`). Any file added into that folder in the future is automatically public.
  3. **No Password Protection on Shares:** The link contains a random 32-byte token. Anyone with the link has instant, anonymous read/download access.
- **Impact on Privacy:**
  - If a permanent share link is sent via email, chat, or pasted publicly, it can be cached, indexed, logged in intermediate proxy servers, or forwarded to third parties.
  - Users might forget that a folder was shared, later upload confidential files into it, and unknowingly expose them to the public internet.

---

### SEC-06: S3 Root/Admin Credentials Used Everywhere (HIGH)

- **Affected Code:** [`server/s3.ts:63-76`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L63-L76)
- **Vulnerability Mechanics:**
  `createStorageClient` uses `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` directly.
  Every presigned URL for upload and download is signed with this root key.
  Presigned GET URLs have a 15-minute default TTL (`urlTtl = 900s`).
- **Impact on Privacy:**
  - Presigned URLs cannot be invalidated before expiration: if a user downloads a private file and immediately locks the bucket or deletes the file, the generated S3 link remains live until the S3 signature expires.
  - If MinIO or S3 endpoint is misconfigured with public bucket policies or weak credentials, the storage cluster can be accessed directly without going through Vault.

---

### SEC-07: Stateless JWT Sessions Cannot Be Revoked (MEDIUM-HIGH)

- **Affected Code:** [`server/auth.ts:44-71, 172-179, 193-227`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/auth.ts#L172-L227)
- **Vulnerability Mechanics:**
  - Sessions are managed by a stateless JWT with a 7-day TTL (`SESSION_TTL=7d`).
  - Calling `POST /api/auth/logout` only clears the cookie from the browser and drops bucket session unlock grants in MongoDB. The JWT itself is **not blacklisted**.
  - Changing your password via `POST /api/auth/password` or via admin does **not** invalidate active JWTs. There is no `tokenVersion` or `passwordChangedAt` timestamp check.
- **Impact on Public Deployment:**
  - If a session cookie is intercepted (e.g. from an unencrypted connection, browser history, or malicious extension), the attacker maintains access for up to 7 days, even if you click "Log out" or change your password.

---

### SEC-08: MongoDB Atlas Exposure to `0.0.0.0/0` (MEDIUM-HIGH)

- **Affected Code:** [`server/db.ts:59-65`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/db.ts#L59-L65)
- **Vulnerability Mechanics:**
  When deployed on serverless providers like Vercel, serverless function IP addresses change constantly. To allow connections, Atlas network access must be set to `0.0.0.0/0` (allow access from anywhere).
- **Impact on Security:**
  - The database is publicly accessible on the internet.
  - Security relies 100% on the strength of the MongoDB user password in `MONGO_URI`.
  - If connection credentials leak in git, build logs, or platform env variables, attackers can directly query MongoDB, dump user hashes, and modify records.

---

### SEC-09: Global Security Headers & Clickjacking Protection (RESOLVED)

- **Affected Code:** [`server/app.ts:17-43`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/app.ts#L17-L43), [`vercel.json:5-16`](file:///Users/ashishgaurav/Documents/Projects/file-manager/vercel.json#L5-L16), [`tests/auth-security.test.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/tests/auth-security.test.ts)
- **Previous Risk:** Missing `X-Frame-Options` (Clickjacking), `Strict-Transport-Security` (SSL stripping), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and CSP on dynamic and static responses.
- **Resolution Implemented:**
  - Added global Express security headers middleware to [`server/app.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/app.ts#L17-L43).
  - Configured static asset security headers in [`vercel.json`](file:///Users/ashishgaurav/Documents/Projects/file-manager/vercel.json#L5-L16) so edge CDN responses are equally protected.
  - Headers enforced:
    - `X-Content-Type-Options: nosniff` (prevents MIME sniffing exploits).
    - `X-Frame-Options: SAMEORIGIN` (prevents external origins from embedding Vault in an `<iframe>` for Clickjacking, while permitting in-app PDF previews).
    - `Content-Security-Policy: ...; frame-ancestors 'self'` (modern CSP Clickjacking defense, restricting iframe embedding strictly to self).
    - `Referrer-Policy: strict-origin-when-cross-origin` (prevents sensitive path/query parameter leaks to third parties).
    - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` (restricts unnecessary browser capabilities).
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (forces HTTPS).
  - Verified with automated test in [`tests/auth-security.test.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/tests/auth-security.test.ts).

---

### SEC-10: Client-Side File Preview Risks (MEDIUM)

- **Affected Code:** [`src/components/PreviewModal.tsx:213-215`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/PreviewModal.tsx#L213-L215), [`DocxPreview.tsx:109`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/DocxPreview.tsx#L109), [`SheetPreview.tsx`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/SheetPreview.tsx)
- **Vulnerability Mechanics:**
  1. **PDF in Iframe:** In [`PreviewModal.tsx`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/PreviewModal.tsx#L214):
     `<iframe className="preview__frame" src={src} title={file.name} />`
     The iframe lacks a `sandbox` attribute. PDFs with active AcroForm/JavaScript can run in some browsers.
  2. **Active Content Execution:** In [`server/s3.ts:337-346`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L337-L346), media files on Vercel redirect (307) directly to S3. If S3 serves objects without sandbox headers, stored SVG/HTML could execute scripts on the storage domain.
  3. **Complex Third-Party Parsers:** Untrusted Word and Excel files are parsed client-side using `mammoth` and `xlsx` (SheetJS). Complex file parsing in the browser carries risks of memory corruption, Denial of Service, or prototype pollution if dependencies become outdated.

---

### SEC-11: Authenticated Non-Admin Users Can Delete Shared Files (MEDIUM)

- **Affected Code:** [`server/s3.ts:297-315`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/s3.ts#L297-L315)
- **Vulnerability Mechanics:**
  `DELETE /api/files` only checks `authenticate` (any valid logged-in user). It does not verify whether the user has admin rights or owns the file.
- **Impact:**
  - Any standard user account can issue a `DELETE /api/files?key=` call and wipe out entire directories or files uploaded by the administrator in the shared bucket.

---

### SEC-12: Admin Password Reset Field Mismatch Bug (LOW)

- **Affected Code:** [`src/lib/api.ts:155`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/lib/api.ts#L155), [`server/users.ts:83`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/users.ts#L83)
- **Vulnerability Mechanics:**
  In [`src/lib/api.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/lib/api.ts), `adminResetPassword` sends `{ newPassword }`, but [`server/users.ts`](file:///Users/ashishgaurav/Documents/Projects/file-manager/server/users.ts) checks `req.body.password`.
- **Impact:**
  - Admins cannot reset user passwords from the UI, causing operational lockout.

---

## Actionable Hardening Checklist Before Going Public

If you plan to connect this project to a public domain, follow this prioritized checklist to secure it:

### 1. Mandatory Environment Variables (Do Not Deploy Without These)
- [ ] Set `NODE_ENV=production` (ensures cookies have the `Secure` flag and strict error handling).
- [ ] Set a strong, random `JWT_SECRET` (e.g. 64-byte random hex generated via `openssl rand -hex 64`).
- [ ] Set `SETUP_TOKEN` to a secret passphrase to prevent unauthorized admin creation on first boot.
- [ ] Pre-populate `ADMIN_EMAIL` and `ADMIN_PASSWORD` so the app is initialized immediately without an open setup wizard.
- [ ] Ensure `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` are strong, unique secrets (never `'admin'` / `'password'`).

### 2. Multi-User & Data Isolation Fixes
- [ ] **Do NOT store private files in the default bucket** if you create accounts for other people.
- [ ] Use **Private Buckets** (`private:<uuid>`) for all confidential files.
- [ ] If you want multi-tenant privacy in the main file list, implement user-scoped prefixes: automatically scope all file paths to `users/<userId>/...` in `server/s3.ts`.
- [ ] Restrict `DELETE /api/files` in shared buckets to users with the `admin` role.

### 3. Rate Limiting & Brute Force Defense
- [ ] Add `express-rate-limit` middleware on `/api/auth/login` (e.g., maximum 5 failed attempts per 15 minutes per IP).
- [ ] Add rate limiting on `/api/public/:token` to mitigate URL enumeration.

### 4. Session & Token Revocation
- [ ] Add a `tokenVersion` or `passwordChangedAt` field to user documents in MongoDB.
- [ ] In `resolveUserFromToken`, verify that the token's issued-at time (`iat`) is after `user.passwordChangedAt`. This ensures changing a password immediately revokes all stolen or old sessions.

### 5. HTTP & Security Headers
- [ ] Add global security headers middleware (or configure in `vercel.json`):
  ```json
  {
    "key": "X-Frame-Options",
    "value": "DENY"
  },
  {
    "key": "X-Content-Type-Options",
    "value": "nosniff"
  },
  {
    "key": "Referrer-Policy",
    "value": "strict-origin-when-cross-origin"
  },
  {
    "key": "Strict-Transport-Security",
    "value": "max-age=31536000; includeSubDomains"
  }
  ```
- [ ] Add the `sandbox` attribute to the PDF preview iframe in [`PreviewModal.tsx`](file:///Users/ashishgaurav/Documents/Projects/file-manager/src/components/PreviewModal.tsx#L214):
  `<iframe className="preview__frame" src={src} sandbox="allow-scripts allow-same-origin" title={file.name} />`

### 6. Public Sharing Guardrails
- [ ] Enforce a maximum expiration for public share links (e.g., maximum 30 days; disable `permanent` sharing for sensitive deployments).
- [ ] Add optional password protection for public share links.
- [ ] Add a warning dialog in the UI when sharing folders explaining that all future files in that folder will be accessible.

---

## Conclusion

Is storing private stuff safe right now?
- **For a single user who keeps everything in a Private Bucket:** Relatively safe, provided `SETUP_TOKEN` and strong passwords/secrets are configured.
- **For multiple users or using the default bucket:** **Unsafe.** Any registered user can access all files in the shared bucket.
- **Against automated internet scanners:** **Unsafe** until rate limiting is added to `/api/auth/login` and first-run setup is locked down.

Review and implement the hardening checklist above before mapping your public domain.
