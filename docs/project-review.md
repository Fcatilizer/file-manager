# Vault review — 4 October 2026

Reviewed the authentication and user-management code, storage API, file-manager
state and dialogs, preview paths, and Vercel build/adapter configuration. This was
a source review with local mocked tests, not an audit of the deployed server,
storage policies, MongoDB, or production credentials.

## Bucket management delivered

The header now has a custom dropdown with selection, refresh, admin-only creation,
and a delete action beside each bucket. The server enforces the admin role and
validates creation names. Deletion requires an exact-name confirmation and uses
only S3 DeleteBucket: it does not empty a bucket or delete versions. Errors remain
visible in the dialog for correction or retry.

Creation selects the new bucket; deleting the active bucket selects an available
fallback and resets navigation. An empty vault disables uploads and folder
creation and offers admins a create action. Opening the app no longer recreates
`MINIO_PRIVATE_BUCKET`. Existing default/private settings are selection preferences.
Stale file-list responses are ignored after navigation. No runtime dependency was
added, and the Vercel function bundle was rebuilt.

## Existing findings to address separately

1. **Bucket separation does not provide member privacy.** `server/app.ts` mounts
   the file API behind login only. `server/s3.ts` lists buckets using the shared
   server credential and accepts the requested bucket on every file operation.
   Thus members can read, upload and delete within all accessible buckets. This
   fits a fully shared vault; individual private vaults need per-user bucket or
   prefix permissions enforced on every route, including presigned URLs.

2. **Raw uploaded active content is served on the app's origin.** In
   `server/s3.ts`, the raw route returns the object's stored Content-Type with
   `Content-Disposition: inline`. Uploads accept a caller-supplied content type.
   Opening an uploaded HTML or active SVG via its raw URL can therefore execute
   content with the app's origin and issue authenticated requests. Serve such
   files from an isolated origin, force attachment download, or apply a sandbox
   policy. This finding is from source inspection; no live exploit was attempted.

3. **File listing and folder deletion stop after one storage response.** The
   list-files route, folder-size requests and folder-delete route do not follow
   continuation tokens. Large folders can show incomplete contents or totals,
   and deletion can leave objects behind. The delete route also does not inspect
   per-object errors returned by DeleteObjects before reporting success. Add
   pagination, bounded concurrency for folder-size work, and partial-error handling.
   A non-empty bucket will still be refused by the new bucket-deletion operation.

4. **Admin password reset has a request-field mismatch.**
   `src/lib/api.ts` sends `{ newPassword }` from `adminResetPassword`, while
   `server/users.ts` reads `req.body.password`. Resetting another user's password
   therefore fails validation even when the supplied password is valid.

5. **Large-file behavior depends on direct storage access.** Uploads first try a
   presigned PUT and then fall back to the Express proxy. That proxy buffers the
   entire request and cannot bypass the deployed platform's request-size limit.
   Vercel documents a [4.5 MB function request limit](https://vercel.com/docs/functions/limitations).
   Configure the frontend origin in
   [RustFS CORS](https://docs.rustfs.com/en/administration/cors) so browser uploads
   reach storage directly. Creating buckets does not configure CORS or public
   policies. Non-media previews also still use the raw proxy; validate large PDF
   and Office previews against the deployed platform separately.

## Verification

- `npm run build`: TypeScript, frontend, and Vercel function bundle passed.
- `npm test`: 14 tests passed, covering anonymous/member authorization, name
  validation, creation, confirmation, deletion, storage-error mapping and fallback
  selection. S3 is mocked; the tests do not load `.env` or connect to MongoDB.
- Chromium checks with mocked API responses passed: keyboard navigation and
  Escape, selecting the current bucket, validation, creation retry, typed delete
  confirmation, non-empty errors, deleting inactive/active/last buckets, reloading
  an empty vault, recovery by creating a bucket, member restrictions, and mobile
  light/dark layouts. No page errors were observed.
- `npm run lint`: exits successfully with React state-in-effect warnings.
- `git diff --check`: passed.

No production deployment or real bucket mutation was performed. Live storage
create/delete permissions and the deployed CORS configuration remain unverified.
