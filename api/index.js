// server/app.ts
import express4 from "express";
import cookieParser from "cookie-parser";

// src/lib/rain.ts
var RAIN_DIRECTIONS = [
  { value: "down-right", label: "\u2198 Right" },
  { value: "down", label: "\u2193 Down" },
  { value: "down-left", label: "\u2199 Left" }
];
var RAIN_DENSITIES = [
  { value: "light", label: "Light", count: 16 },
  { value: "balanced", label: "Balanced", count: 32 },
  { value: "full", label: "Full", count: 56 }
];
var RAIN_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 12, max: 120, step: 1 },
  width: { min: 1, max: 4, step: 0.5 }
};
var DEFAULT_RAIN = {
  direction: "down-right",
  density: "balanced",
  speed: 1,
  height: 64,
  width: 1.5,
  splash: false,
  color: "theme"
};
function isRainSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key) => Object.hasOwn(DEFAULT_RAIN, key)) && RAIN_DIRECTIONS.some((option) => option.value === settings.direction) && RAIN_DENSITIES.some((option) => option.value === settings.density) && Object.entries(RAIN_LIMITS).every(([key, range]) => typeof settings[key] === "number" && Number.isFinite(settings[key]) && settings[key] >= range.min && settings[key] <= range.max) && typeof settings.splash === "boolean" && typeof settings.color === "string" && (settings.color === "theme" || /^#[0-9a-f]{6}$/i.test(settings.color));
}

// src/lib/preferences.ts
var FONTS = {
  inter: { label: "Inter", family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  system: { label: "System", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  serif: { label: "Serif", family: "Georgia, 'Times New Roman', serif" },
  mono: { label: "Monospace", family: "'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace" }
};
var ACCENTS = {
  indigo: { label: "Indigo", light: "#4f46e5", dark: "#818cf8" },
  violet: { label: "Violet", light: "#7c3aed", dark: "#a78bfa" },
  blue: { label: "Blue", light: "#2563eb", dark: "#60a5fa" },
  teal: { label: "Teal", light: "#0f766e", dark: "#2dd4bf" },
  rose: { label: "Rose", light: "#be123c", dark: "#fb7185" },
  amber: { label: "Amber", light: "#92400e", dark: "#fbbf24" }
};
function isPreferences(value) {
  if (!value || typeof value !== "object") return false;
  const p = value;
  return (p.theme === "light" || p.theme === "dark") && typeof p.font === "string" && Object.hasOwn(FONTS, p.font) && typeof p.accent === "string" && Object.hasOwn(ACCENTS, p.accent) && typeof p.rain === "boolean" && (!("rainSettings" in p) || isRainSettings(p.rainSettings)) && Object.keys(p).every((key) => ["theme", "font", "accent", "rain", "rainSettings"].includes(key));
}

// server/db.ts
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
var db;
var users;
var initialized = false;
var BCRYPT_ROUNDS = 12;
async function connectDB() {
  if (initialized && db && users) {
    return db;
  }
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it to your .env file or hosting environment variables.");
  }
  if (!globalThis._mongoClientPromise) {
    const client2 = new MongoClient(uri, {
      serverSelectionTimeoutMS: 1e4,
      maxPoolSize: 10
    });
    globalThis._mongoClientPromise = client2.connect().catch((err) => {
      globalThis._mongoClientPromise = void 0;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("SSL alert") || msg.includes("tlsv1 alert internal error") || msg.includes("alert number 80")) {
        throw new Error(
          "MongoDB connection rejected by Atlas (SSL alert 80). Please allow access from anywhere (0.0.0.0/0) in MongoDB Atlas \u2192 Network Access, as Vercel serverless functions use dynamic IP addresses."
        );
      }
      throw err;
    });
  }
  const client = await globalThis._mongoClientPromise;
  db = client.db(process.env.MONGO_DB || "vault");
  users = db.collection("users");
  if (!initialized) {
    try {
      await users.createIndex({ email: 1 }, { unique: true });
      await users.updateMany({ role: { $exists: false } }, { $set: { role: "admin" } });
    } catch {
    }
    initialized = true;
    console.log(`[vault] connected to MongoDB (db: ${db.databaseName})`);
  }
  return db;
}
function getUsers() {
  if (!users) throw new Error("Database not connected");
  return users;
}
function toPublicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name || "",
    preferences: isPreferences(user.preferences) ? user.preferences : void 0,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  };
}
async function countUsers() {
  return getUsers().estimatedDocumentCount();
}
async function findUserByEmail(email) {
  return getUsers().findOne({ email: email.toLowerCase().trim() });
}
async function getUserById(id) {
  if (!ObjectId.isValid(id)) return null;
  return getUsers().findOne({ _id: new ObjectId(id) });
}
async function createUser(email, password, role = "user") {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const doc = {
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    createdAt: /* @__PURE__ */ new Date()
  };
  try {
    const result = await getUsers().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === 11e3) {
      throw new Error("A user with that email already exists");
    }
    throw err;
  }
}
async function deleteUser(id) {
  if (!ObjectId.isValid(id)) return false;
  const result = await getUsers().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
async function updateUserPassword(id, newPassword) {
  if (!ObjectId.isValid(id)) return false;
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const result = await getUsers().updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash } }
  );
  return result.matchedCount === 1;
}
var adminChecked = false;
async function seedAdmin() {
  if (adminChecked) return;
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("[vault] ADMIN_EMAIL / ADMIN_PASSWORD not set \u2014 first-run setup will be available");
    adminChecked = true;
    return;
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    adminChecked = true;
    return;
  }
  await createUser(email, password, "admin");
  adminChecked = true;
  console.log(`[vault] seeded admin user: ${email}`);
}
async function updateUserProfile(id, updates) {
  if (!ObjectId.isValid(id)) return null;
  const user = await getUsers().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" }
  );
  return user ? toPublicUser(user) : null;
}

// server/auth.ts
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt2 from "bcryptjs";
var SESSION_COOKIE = "vault_session";
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    return "dev-insecure-secret-change-me";
  }
  return secret;
}
function getTtl() {
  return process.env.SESSION_TTL || "7d";
}
function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  };
}
function signToken(userId, email) {
  const options = { expiresIn: getTtl() };
  return jwt.sign({ sub: userId, email }, getSecret(), options);
}
function verifyToken(token) {
  try {
    const payload = jwt.verify(token, getSecret());
    if (typeof payload === "string" || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}
async function resolveUserFromToken(token) {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await getUserById(String(payload.sub));
  if (!user) return null;
  return { id: String(user._id), email: user.email, role: user.role };
}
async function requireAuth(req, res, next) {
  try {
    const user = await resolveUserFromToken(req.cookies?.[SESSION_COOKIE]);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    ;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
var authRouter = express.Router();
authRouter.get("/status", async (_req, res) => {
  const total = await countUsers();
  res.json({
    needsSetup: total === 0,
    setupTokenRequired: Boolean(process.env.SETUP_TOKEN)
  });
});
authRouter.post("/setup", async (req, res) => {
  const total = await countUsers();
  if (total > 0) {
    res.status(403).json({ error: "Setup has already been completed" });
    return;
  }
  const setupToken = process.env.SETUP_TOKEN;
  if (setupToken && req.body?.token !== setupToken) {
    res.status(403).json({ error: "Invalid setup token" });
    return;
  }
  const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const user = await createUser(email, password, "admin");
  const token = signToken(String(user._id), user.email);
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  res.status(201).json({ user: toPublicUser(user) });
});
authRouter.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const user = await findUserByEmail(email);
  if (!user || !await bcrypt2.compare(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = signToken(String(user._id), user.email);
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  res.json({ user: toPublicUser(user) });
});
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ success: true });
});
authRouter.get("/me", async (req, res) => {
  const user = await resolveUserFromToken(req.cookies?.[SESSION_COOKIE]);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const full = await getUserById(user.id);
  res.json({ user: full ? toPublicUser(full) : null });
});
authRouter.post("/password", requireAuth, async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current password and new password are required" });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }
  const full = await getUserById(user.id);
  if (!full) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const valid = await bcrypt2.compare(currentPassword, full.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }
  await updateUserPassword(user.id, newPassword);
  res.json({ success: true, message: "Password updated successfully" });
});
authRouter.patch("/me", requireAuth, async (req, res) => {
  const user = req.user;
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body) || !Object.keys(body).length || Object.keys(body).some((key) => !["name", "preferences"].includes(key))) {
    res.status(400).json({ error: "Provide a name or preferences to update" });
    return;
  }
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 80 || Array.from(body.name).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))) {
    res.status(400).json({ error: "Name must contain 1\u201380 characters without control characters" });
    return;
  }
  if ("preferences" in body && !isPreferences(body.preferences)) {
    res.status(400).json({ error: "Invalid preferences" });
    return;
  }
  const updated = await updateUserProfile(user.id, {
    ..."name" in body ? { name: body.name.trim() } : {},
    ..."preferences" in body ? { preferences: body.preferences } : {}
  });
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: updated });
});

// server/users.ts
import express2 from "express";
var VALID_ROLES = ["admin", "user"];
function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
var usersRouter = express2.Router();
usersRouter.get("/", async (_req, res) => {
  const all = await getUsers().find({}).sort({ createdAt: 1 }).toArray();
  res.json({ users: all.map(toPublicUser) });
});
usersRouter.post("/", async (req, res) => {
  const email = req.body?.email;
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const role = VALID_ROLES.includes(req.body?.role) ? req.body.role : "user";
  if (!isEmail(email)) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  try {
    const user = await createUser(email, password, role);
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    res.status(400).json({ error: message });
  }
});
usersRouter.delete("/:id", async (req, res) => {
  const current = req.user;
  const id = String(req.params.id);
  if (current && id === current.id) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }
  const target = await getUserById(id);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.role === "admin") {
    const adminCount = await getUsers().countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      res.status(400).json({ error: "Cannot delete the last admin" });
      return;
    }
  }
  await deleteUser(id);
  res.json({ success: true });
});
usersRouter.patch("/:id/password", async (req, res) => {
  const id = String(req.params.id);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const target = await getUserById(id);
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await updateUserPassword(id, password);
  res.json({ success: true, message: "Password updated successfully" });
});

// server/s3.ts
import express3 from "express";
import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// src/lib/buckets.ts
function validateBucketName(name) {
  if (typeof name !== "string" || !name) return "Enter a bucket name";
  if (name.length < 3 || name.length > 63) return "Use between 3 and 63 characters";
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
    return "Use lowercase letters, numbers, dots or hyphens; start and end with a letter or number";
  }
  if (name.includes("..") || name.includes(".-") || name.includes("-.")) {
    return "Dots must separate letters or numbers";
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) return "Bucket names cannot be IP addresses";
  if (/^(xn--|sthree-|amzn-s3-demo-)/.test(name) || /(-s3alias|--ol-s3|\.mrap|--x-s3|--table-s3)$/.test(name)) {
    return "This bucket name uses a reserved prefix or suffix";
  }
  return null;
}

// server/s3.ts
function bucketError(res, err) {
  const error = err;
  const status = error?.$metadata?.httpStatusCode;
  if (error?.name === "BucketNotEmpty") {
    res.status(409).json({ error: "This bucket is not empty. Remove all files, folders, versions and delete markers before deleting it." });
  } else if (error?.name === "BucketAlreadyExists" || error?.name === "BucketAlreadyOwnedByYou") {
    res.status(409).json({ error: "A bucket with this name already exists. Choose another name." });
  } else if (error?.name === "NoSuchBucket" || status === 404) {
    res.status(404).json({ error: "This bucket no longer exists. Refresh the bucket list." });
  } else if (error?.name === "AccessDenied" || status === 403) {
    res.status(403).json({ error: "The storage credentials do not allow this bucket operation." });
  } else if (error?.name === "InvalidBucketName") {
    res.status(400).json({ error: "Storage rejected this bucket name. Choose another name." });
  } else {
    throw err;
  }
}
var wrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};
function createS3Router() {
  const s3 = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || "admin",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "password"
    },
    forcePathStyle: true
  });
  const defaultBucket = process.env.MINIO_BUCKET || "fruitms-public-local";
  const privateBucket = process.env.MINIO_PRIVATE_BUCKET || "shared-files";
  console.log(`[vault] S3 endpoint: ${process.env.MINIO_ENDPOINT || "http://localhost:9000"}`);
  console.log(`[vault] default bucket: ${defaultBucket} | private bucket: ${privateBucket}`);
  const router = express3.Router();
  router.get("/health", (_req, res) => {
    res.json({ status: "ok", defaultBucket, privateBucket });
  });
  router.get("/buckets", wrap(async (_req, res) => {
    const result = await s3.send(new ListBucketsCommand({}));
    res.json({
      buckets: result.Buckets?.map((b) => b.Name).filter((n) => !!n) || [],
      defaultBucket,
      privateBucket
    });
  }));
  router.post("/buckets", requireAdmin, express3.json(), wrap(async (req, res) => {
    const name = req.body?.name;
    const error = validateBucketName(name);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    try {
      await s3.send(new CreateBucketCommand({ Bucket: name }));
      res.status(201).json({ success: true, bucket: name });
    } catch (err) {
      bucketError(res, err);
    }
  }));
  router.delete("/buckets/:name", requireAdmin, express3.json(), wrap(async (req, res) => {
    const name = String(req.params.name);
    if (!name || req.body?.confirmName !== name) {
      res.status(400).json({ error: "Type the exact bucket name to confirm deletion" });
      return;
    }
    try {
      await s3.send(new DeleteBucketCommand({ Bucket: name }));
      res.json({ success: true });
    } catch (err) {
      bucketError(res, err);
    }
  }));
  router.get("/files", wrap(async (req, res) => {
    const bucket = req.query.bucket || privateBucket;
    const prefix = req.query.prefix || "";
    const result = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, Delimiter: "/" })
    );
    const folders = await Promise.all(
      (result.CommonPrefixes || []).map(async (p) => {
        const folderPrefix = p.Prefix;
        let size = 0;
        let lastModified = "";
        try {
          const folderObjects = await s3.send(
            new ListObjectsV2Command({ Bucket: bucket, Prefix: folderPrefix })
          );
          const items = folderObjects.Contents || [];
          let latestTime = 0;
          for (const item of items) {
            if (item.Key !== folderPrefix) size += item.Size || 0;
            if (item.LastModified) {
              const t = item.LastModified.getTime();
              if (t > latestTime) {
                latestTime = t;
                lastModified = item.LastModified.toISOString();
              }
            }
          }
          if (!lastModified) {
            const placeholder = items.find((i) => i.Key === folderPrefix);
            if (placeholder?.LastModified) lastModified = placeholder.LastModified.toISOString();
          }
        } catch {
        }
        return {
          key: folderPrefix,
          name: folderPrefix.slice(prefix.length).replace(/\/$/, ""),
          isFolder: true,
          size,
          lastModified
        };
      })
    );
    const files = (result.Contents || []).filter((obj) => obj.Key !== prefix && !obj.Key?.endsWith("/")).map((obj) => ({
      key: obj.Key,
      name: obj.Key.slice(prefix.length),
      isFolder: false,
      size: obj.Size || 0,
      lastModified: obj.LastModified?.toISOString() || ""
    }));
    res.json({ items: [...folders, ...files], prefix });
  }));
  router.get("/upload-url", wrap(async (req, res) => {
    const bucket = req.query.bucket || privateBucket;
    const key = req.query.key || "";
    const contentType = req.query.contentType || "application/octet-stream";
    if (!key) {
      res.status(400).json({ error: 'Query parameter "key" is required' });
      return;
    }
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      }),
      { expiresIn: 900 }
    );
    res.json({ uploadUrl, bucket, key });
  }));
  router.put(
    "/upload",
    express3.raw({ type: "*/*", limit: "5gb" }),
    wrap(async (req, res) => {
      const bucket = req.query.bucket || privateBucket;
      const key = req.query.key || "";
      const contentType = req.headers["content-type"] || "application/octet-stream";
      const body = req.body;
      await s3.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
      );
      res.json({ success: true, key });
    })
  );
  router.delete("/files", wrap(async (req, res) => {
    const bucket = req.query.bucket || privateBucket;
    const key = req.query.key || "";
    if (key.endsWith("/")) {
      const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key }));
      if (list.Contents && list.Contents.length > 0) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: list.Contents.map((o) => ({ Key: o.Key })) }
          })
        );
      }
    } else {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }
    res.json({ success: true });
  }));
  router.get("/download", wrap(async (req, res) => {
    const bucket = req.query.bucket || privateBucket;
    const key = req.query.key || "";
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 3600 }
    );
    res.json({ url: signedUrl });
  }));
  router.get("/raw", wrap(async (req, res) => {
    const bucket = req.query.bucket || privateBucket;
    const key = req.query.key || "";
    const redirect = req.query.redirect === "true";
    const isMedia = /\.(mp4|webm|mov|mkv|mp3|wav|ogg|m4a|flac|aac)$/i.test(key);
    const shouldRedirect = redirect || Boolean(process.env.VERCEL) && isMedia;
    if (shouldRedirect) {
      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 3600 }
      );
      res.redirect(307, signedUrl);
      return;
    }
    const rangeHeader = req.headers.range;
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ...rangeHeader ? { Range: rangeHeader } : {}
      })
    );
    const filename = key.split("/").pop() || "file";
    const isPartial = !!rangeHeader && !!object.ContentRange;
    const headers = {
      "Content-Type": object.ContentType || "application/octet-stream",
      "Accept-Ranges": "bytes",
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      "Cache-Control": "private, max-age=3600"
    };
    if (object.ContentLength !== void 0) headers["Content-Length"] = String(object.ContentLength);
    if (isPartial) headers["Content-Range"] = object.ContentRange;
    res.writeHead(isPartial ? 206 : 200, headers);
    const body = object.Body;
    if (!body) {
      res.end();
      return;
    }
    res.on("close", () => {
      const destroyable = body;
      destroyable.destroy?.();
    });
    body.pipe(res);
  }));
  router.post("/folders", express3.json(), wrap(async (req, res) => {
    const bucket = req.body?.bucket || privateBucket;
    const path = req.body?.path || "";
    const folderPath = path.endsWith("/") ? path : path + "/";
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: folderPath, Body: Buffer.alloc(0) })
    );
    res.json({ success: true });
  }));
  router.post("/ensure-bucket", requireAdmin, wrap(async (_req, res) => {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: privateBucket }));
    } catch (err) {
      const error = err;
      if (error?.name !== "NotFound" && error?.name !== "NoSuchBucket" && error?.$metadata?.httpStatusCode !== 404) throw err;
      await s3.send(new CreateBucketCommand({ Bucket: privateBucket }));
      console.log(`[vault] created bucket: ${privateBucket}`);
    }
    res.json({ success: true, bucket: privateBucket });
  }));
  return router;
}

// server/app.ts
var app = express4();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cookieParser());
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});
app.use("/api", async (_req, _res, next) => {
  try {
    await connectDB();
    await seedAdmin();
    next();
  } catch (err) {
    next(err);
  }
});
app.use("/api/auth", express4.json(), authRouter);
app.use("/api/users", requireAuth, requireAdmin, express4.json(), usersRouter);
app.use("/api", requireAuth, createS3Router());
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use((err, req, res, next) => {
  if (!req.path.startsWith("/api")) return next(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[vault]", req.method, req.originalUrl, "\u2192", message);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: message });
});
var app_default = app;

// server/vercel.ts
function handler(req, res) {
  return app_default(req, res);
}
export {
  app_default as app,
  handler as default
};
