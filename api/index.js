// server/app.ts
import express5 from "express";
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
function getDatabase() {
  if (!db) throw new Error("Database not connected");
  return db;
}

// server/auth.ts
import { randomUUID, createHash } from "node:crypto";

// server/bucket-store.ts
var indexes;
async function collections() {
  const db2 = getDatabase();
  const buckets = db2.collection("private_buckets");
  const grants = db2.collection("bucket_grants");
  const attempts = db2.collection("bucket_attempts");
  indexes ??= Promise.all([
    buckets.createIndex({ claim: 1 }, { unique: true, sparse: true }),
    buckets.createIndex({ ownerId: 1, state: 1 }),
    grants.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    grants.createIndex({ session: 1 }),
    attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]).catch((err) => {
    indexes = void 0;
    throw err;
  });
  await indexes;
  return { buckets, grants, attempts };
}
async function upsert(operation) {
  try {
    await operation();
  } catch (err) {
    if (err?.code !== 11e3) throw err;
    await operation();
  }
}
var mongoBucketStore = {
  async find(name) {
    return (await collections()).buckets.findOne({ _id: name });
  },
  async findClaim(claim) {
    return (await collections()).buckets.findOne({ claim });
  },
  async listOwned(ownerId) {
    return (await collections()).buckets.find({ ownerId, state: "active" }).toArray();
  },
  async reserve(record) {
    await (await collections()).buckets.insertOne(record);
  },
  async activate(name) {
    await (await collections()).buckets.updateOne({ _id: name, state: "creating" }, { $set: { state: "active" } });
  },
  async revoke(name) {
    await (await collections()).buckets.updateOne({ _id: name }, { $inc: { version: 1 } });
  },
  async changePassword(name, version, passwordHash) {
    const result = await (await collections()).buckets.updateOne({ _id: name, version, state: "active" }, { $set: { passwordHash }, $inc: { version: 1 } });
    return result.matchedCount === 1;
  },
  async markDeleted(name) {
    await (await collections()).buckets.updateOne({ _id: name }, { $set: { state: "deleted" }, $unset: { claim: "" }, $inc: { version: 1 } });
  },
  async getGrant(id) {
    return (await collections()).grants.findOne({ _id: id });
  },
  async putGrant(grant) {
    const { grants } = await collections();
    await upsert(() => grants.replaceOne({ _id: grant._id }, grant, { upsert: true }));
  },
  async deleteSession(session) {
    await (await collections()).grants.deleteMany({ session });
  },
  async attempt(id, expiresAt) {
    const { attempts } = await collections();
    let count = 0;
    await upsert(async () => {
      const result = await attempts.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true, returnDocument: "after" });
      count = result.count;
    });
    return count;
  }
};

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
  const options = { expiresIn: getTtl(), jwtid: randomUUID() };
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
authRouter.post("/logout", async (req, res) => {
  const session = req.cookies?.[SESSION_COOKIE];
  try {
    if (typeof session === "string") await mongoBucketStore.deleteSession(createHash("sha256").update(session).digest("hex"));
  } finally {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
  }
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

// server/share-token.ts
import { createCipheriv, createDecipheriv, createHash as createHash2, randomBytes } from "node:crypto";
function encryptionKey() {
  const secret = process.env.SHARE_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("SHARE_TOKEN_SECRET or JWT_SECRET is required");
  return createHash2("sha256").update("vault:share-token:v1:").update(secret || "dev-insecure-secret-change-me").digest();
}
function encryptShareToken(token) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}
function recoverShareToken(encrypted) {
  if (!encrypted) return void 0;
  try {
    const payload = Buffer.from(encrypted, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return void 0;
  }
}

// server/shares.ts
import { createHash as createHash4, randomBytes as randomBytes2, randomUUID as randomUUID3 } from "node:crypto";
import express3 from "express";
import { HeadObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// src/lib/iconPaths.ts
var ICON_PATHS = {
  info: ["M12 22a10 10 0 100-20 10 10 0 000 20", "M12 11v6", "M12 7h.01"],
  link: ["M10 13a5 5 0 007 .5l3-3a5 5 0 00-7-7l-1.7 1.7", "M14 11a5 5 0 00-7-.5l-3 3a5 5 0 007 7l1.7-1.7"],
  folder: [
    "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
  ],
  folderPlus: [
    "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
    "M12 11v6",
    "M9 14h6"
  ],
  back: ["M9 14L4 9l5-5", "M20 20v-7a4 4 0 00-4-4H4"],
  // Standard File
  file: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6"
  ],
  // Word / Document (.doc, .docx, .odt)
  fileDoc: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M8 12h8",
    "M8 15h8",
    "M8 18h5"
  ],
  // PDF Document (.pdf)
  filePdf: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M9 17v-5h2a1.5 1.5 0 010 3H9",
    "M13.5 12h1.5a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5h-1.5z"
  ],
  // Spreadsheet (.xlsx, .xls, .csv)
  fileSheet: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M8 13h8",
    "M8 17h8",
    "M12 11v8"
  ],
  // Presentation (.pptx, .ppt, .key)
  fileSlide: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M8 12h8v5H8z",
    "M10 19h4"
  ],
  // Code & Config (.json, .ts, .js, .py, etc.)
  fileCode: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M10 13l-2 2 2 2",
    "M14 13l2 2-2 2"
  ],
  // Plain Text / Notes (.txt, .md, .log)
  fileText: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M8 12h8",
    "M8 15h8"
  ],
  // Image (.jpg, .png, .webp, .svg)
  fileImage: [
    "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z",
    "M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
    "M21 15l-5-5L5 21"
  ],
  image: [
    "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z",
    "M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
    "M21 15l-5-5L5 21"
  ],
  // Video (.mp4, .mov, .webm)
  fileVideo: [
    "M23 7l-7 5 7 5V7z",
    "M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z"
  ],
  video: [
    "M23 7l-7 5 7 5V7z",
    "M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z"
  ],
  // Audio (.mp3, .wav, .flac)
  fileAudio: [
    "M9 18V5l12-2v13",
    "M9 18a3 3 0 11-6 0 3 3 0 016 0z",
    "M21 16a3 3 0 11-6 0 3 3 0 016 0z"
  ],
  music: [
    "M9 18V5l12-2v13",
    "M9 18a3 3 0 11-6 0 3 3 0 016 0z",
    "M21 16a3 3 0 11-6 0 3 3 0 016 0z"
  ],
  // Archive (.zip, .tar, .rar)
  fileArchive: [
    "M21 8v13H3V8",
    "M1 3h22v5H1z",
    "M10 12h4",
    "M12 11v6"
  ],
  archive: [
    "M21 8v13H3V8",
    "M1 3h22v5H1z",
    "M10 12h4",
    "M12 11v6"
  ],
  rain: ["M7 14H6a4 4 0 110-8 6 6 0 0111.6-1A4.5 4.5 0 1120 14h-1", "M9 14l-2 4", "M14 14l-2 4", "M19 14l-2 4", "M10 20l-1 2"],
  // Actions & Controls
  plus: ["M12 5v14", "M5 12h14"],
  chevronDown: ["M6 9l6 6 6-6"],
  refresh: ["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0114.85-3.36L23 10", "M1 14l4.64 4.36A9 9 0 0020.49 15"],
  database: ["M20 6c0 2.2-3.6 4-8 4S4 8.2 4 6s3.6-4 8-4 8 1.8 8 4z", "M4 6v12c0 2.2 3.6 4 8 4s8-1.8 8-4V6", "M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4"],
  upload: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  download: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  trash: [
    "M3 6h18",
    "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6",
    "M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
  ],
  sun: [
    "M12 7a5 5 0 100 10 5 5 0 000-10z",
    "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
  ],
  moon: ["M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"],
  close: ["M18 6L6 18", "M6 6l12 12"],
  chevronLeft: ["M15 18l-6-6 6-6"],
  chevronRight: ["M9 18l6-6-6-6"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"],
  eyeOff: [
    "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94",
    "M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19",
    "M14.12 14.12a3 3 0 11-4.24-4.24",
    "M1 1l22 22"
  ],
  lock: [
    "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z",
    "M7 11V7a5 5 0 0110 0v4"
  ],
  key: [
    "M7.5 15.5m-5.5 0a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0",
    "M21 2l-9.6 9.6",
    "M15.5 7.5l3 3L22 7l-3-3"
  ],
  search: ["M11 19a8 8 0 100-16 8 8 0 000 16z", "M21 21l-4.35-4.35"],
  code: ["M16 18l6-6-6-6", "M8 6l-6 6 6 6"],
  text: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h5"],
  copy: [
    "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2",
    "M16 4h2a2 2 0 012 2v4",
    "M21 14H11a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z"
  ],
  check: ["M20 6L9 17l-5-5"],
  externalLink: [
    "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6",
    "M15 3h6v6",
    "M10 14L21 3"
  ],
  // Users / Accounts
  users: [
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
    "M9 11a4 4 0 100-8 4 4 0 000 8z",
    "M23 21v-2a4 4 0 00-3-3.87",
    "M16 3.13a4 4 0 010 7.75"
  ],
  userPlus: [
    "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
    "M8.5 11a4 4 0 100-8 4 4 0 000 8z",
    "M20 8v6",
    "M23 11h-6"
  ],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]
};

// src/lib/fileIcons.ts
var EXT_MAP = {
  // Word / Documents
  doc: { category: "doc", label: "Word Document", iconName: "fileDoc", colorLight: "#2563eb", colorDark: "#60a5fa" },
  docx: { category: "doc", label: "Word Document", iconName: "fileDoc", colorLight: "#2563eb", colorDark: "#60a5fa" },
  odt: { category: "doc", label: "OpenDocument Text", iconName: "fileDoc", colorLight: "#2563eb", colorDark: "#60a5fa" },
  rtf: { category: "doc", label: "Rich Text", iconName: "fileDoc", colorLight: "#2563eb", colorDark: "#60a5fa" },
  dot: { category: "doc", label: "Word Template", iconName: "fileDoc", colorLight: "#2563eb", colorDark: "#60a5fa" },
  dotx: { category: "doc", label: "Word Template", iconName: "fileDoc", colorLight: "#2563eb", colorDark: "#60a5fa" },
  // PDF
  pdf: { category: "pdf", label: "PDF Document", iconName: "filePdf", colorLight: "#dc2626", colorDark: "#f87171" },
  // Spreadsheets
  xls: { category: "sheet", label: "Excel Spreadsheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  xlsx: { category: "sheet", label: "Excel Spreadsheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  xlsm: { category: "sheet", label: "Excel Spreadsheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  csv: { category: "sheet", label: "CSV Spreadsheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  tsv: { category: "sheet", label: "TSV Spreadsheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  ods: { category: "sheet", label: "OpenDocument Sheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  numbers: { category: "sheet", label: "Numbers Sheet", iconName: "fileSheet", colorLight: "#059669", colorDark: "#34d399" },
  // Presentations
  ppt: { category: "slide", label: "PowerPoint", iconName: "fileSlide", colorLight: "#ea580c", colorDark: "#fb923c" },
  pptx: { category: "slide", label: "PowerPoint", iconName: "fileSlide", colorLight: "#ea580c", colorDark: "#fb923c" },
  odp: { category: "slide", label: "OpenDocument Slide", iconName: "fileSlide", colorLight: "#ea580c", colorDark: "#fb923c" },
  key: { category: "slide", label: "Keynote", iconName: "fileSlide", colorLight: "#ea580c", colorDark: "#fb923c" },
  // Code & Config
  json: { category: "code", label: "JSON Data", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  js: { category: "code", label: "JavaScript", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  jsx: { category: "code", label: "React JSX", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  ts: { category: "code", label: "TypeScript", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  tsx: { category: "code", label: "React TSX", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  html: { category: "code", label: "HTML Document", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  htm: { category: "code", label: "HTML Document", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  css: { category: "code", label: "CSS Stylesheet", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  scss: { category: "code", label: "SCSS Stylesheet", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  sass: { category: "code", label: "Sass Stylesheet", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  less: { category: "code", label: "Less Stylesheet", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  py: { category: "code", label: "Python Script", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  rs: { category: "code", label: "Rust Source", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  go: { category: "code", label: "Go Source", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  java: { category: "code", label: "Java Source", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  c: { category: "code", label: "C Source", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  cpp: { category: "code", label: "C++ Source", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  cs: { category: "code", label: "C# Source", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  php: { category: "code", label: "PHP Script", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  rb: { category: "code", label: "Ruby Script", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  sql: { category: "code", label: "SQL Query", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  sh: { category: "code", label: "Shell Script", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  bash: { category: "code", label: "Bash Script", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  zsh: { category: "code", label: "Zsh Script", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  yaml: { category: "code", label: "YAML Config", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  yml: { category: "code", label: "YAML Config", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  toml: { category: "code", label: "TOML Config", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  xml: { category: "code", label: "XML Document", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  vue: { category: "code", label: "Vue Component", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  svelte: { category: "code", label: "Svelte Component", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  graphql: { category: "code", label: "GraphQL Schema", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  prisma: { category: "code", label: "Prisma Schema", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  dockerfile: { category: "code", label: "Dockerfile", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  env: { category: "code", label: "Environment Config", iconName: "fileCode", colorLight: "#0891b2", colorDark: "#38bdf8" },
  // Text & Notes
  txt: { category: "text", label: "Plain Text", iconName: "fileText", colorLight: "#475569", colorDark: "#94a3b8" },
  md: { category: "text", label: "Markdown", iconName: "fileText", colorLight: "#475569", colorDark: "#94a3b8" },
  markdown: { category: "text", label: "Markdown", iconName: "fileText", colorLight: "#475569", colorDark: "#94a3b8" },
  log: { category: "text", label: "Log File", iconName: "fileText", colorLight: "#475569", colorDark: "#94a3b8" },
  ini: { category: "text", label: "Configuration", iconName: "fileText", colorLight: "#475569", colorDark: "#94a3b8" },
  conf: { category: "text", label: "Configuration", iconName: "fileText", colorLight: "#475569", colorDark: "#94a3b8" },
  // Images
  jpg: { category: "image", label: "JPEG Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  jpeg: { category: "image", label: "JPEG Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  png: { category: "image", label: "PNG Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  gif: { category: "image", label: "GIF Animation", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  svg: { category: "image", label: "SVG Vector", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  webp: { category: "image", label: "WebP Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  bmp: { category: "image", label: "Bitmap Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  ico: { category: "image", label: "Icon", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  avif: { category: "image", label: "AVIF Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  tiff: { category: "image", label: "TIFF Image", iconName: "fileImage", colorLight: "#7c3aed", colorDark: "#a78bfa" },
  // Video
  mp4: { category: "video", label: "MP4 Video", iconName: "fileVideo", colorLight: "#e11d48", colorDark: "#fb7185" },
  mov: { category: "video", label: "QuickTime Video", iconName: "fileVideo", colorLight: "#e11d48", colorDark: "#fb7185" },
  mkv: { category: "video", label: "MKV Video", iconName: "fileVideo", colorLight: "#e11d48", colorDark: "#fb7185" },
  webm: { category: "video", label: "WebM Video", iconName: "fileVideo", colorLight: "#e11d48", colorDark: "#fb7185" },
  avi: { category: "video", label: "AVI Video", iconName: "fileVideo", colorLight: "#e11d48", colorDark: "#fb7185" },
  m4v: { category: "video", label: "M4V Video", iconName: "fileVideo", colorLight: "#e11d48", colorDark: "#fb7185" },
  // Audio
  mp3: { category: "audio", label: "MP3 Audio", iconName: "fileAudio", colorLight: "#d97706", colorDark: "#fbbf24" },
  wav: { category: "audio", label: "WAV Audio", iconName: "fileAudio", colorLight: "#d97706", colorDark: "#fbbf24" },
  flac: { category: "audio", label: "FLAC Audio", iconName: "fileAudio", colorLight: "#d97706", colorDark: "#fbbf24" },
  ogg: { category: "audio", label: "OGG Audio", iconName: "fileAudio", colorLight: "#d97706", colorDark: "#fbbf24" },
  m4a: { category: "audio", label: "M4A Audio", iconName: "fileAudio", colorLight: "#d97706", colorDark: "#fbbf24" },
  aac: { category: "audio", label: "AAC Audio", iconName: "fileAudio", colorLight: "#d97706", colorDark: "#fbbf24" },
  // Archives
  zip: { category: "archive", label: "ZIP Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  tar: { category: "archive", label: "TAR Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  gz: { category: "archive", label: "GZIP Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  rar: { category: "archive", label: "RAR Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  "7z": { category: "archive", label: "7-Zip Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  bz2: { category: "archive", label: "BZIP2 Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  xz: { category: "archive", label: "XZ Archive", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  iso: { category: "archive", label: "Disc Image", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" },
  dmg: { category: "archive", label: "Apple Disk Image", iconName: "fileArchive", colorLight: "#b45309", colorDark: "#f59e0b" }
};
function getFileTypeInfo(name, isFolder) {
  if (isFolder) {
    return {
      category: "folder",
      label: "Folder",
      iconName: "folder",
      colorLight: "#4f46e5",
      colorDark: "#818cf8"
    };
  }
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext && EXT_MAP[ext]) {
    return EXT_MAP[ext];
  }
  return {
    category: "other",
    label: ext ? `${ext.toUpperCase()} File` : "File",
    iconName: "file",
    colorLight: "#64748b",
    colorDark: "#94a3b8"
  };
}

// server/public-share-style.ts
var publicShareStyle = `
* {
  box-sizing:border-box}
body {
  margin:0;
  background:#f7f8fa;
  color:#172033;
  font-family:var(--font);
  font-size:14px}
a {
  color:inherit;
  text-decoration:none}
svg {
  flex-shrink:0;
  vertical-align:middle}
.topbar {
  height:80px;
  border-bottom:1px solid #e2e6ed;
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 max(24px,calc((100vw - 1120px)/2));
  gap:20px}
.brand {
  font-size:26px;
  font-weight:650;
  letter-spacing:-1px;
  display:flex;
  gap:12px;
  align-items:center}
.brand span {
  font-size:17px;
  color:var(--accent)}
.pill {
  display:inline-flex;
  align-items:center;
  gap:7px;
  border:1px solid #e0e4eb;
  border-radius:99px;
  padding:8px 12px;
  font-size:12px;
  color:#657086;
  white-space:nowrap}
main {
  max-width:1120px;
  margin:48px auto;
  padding:0 24px}
.intro {
  display:flex;
  gap:18px;
  align-items:center;
  margin-bottom:28px}
.hero-icon {
  padding:18px;
  border:1px solid #e0e4eb;
  background:#fff;
  border-radius:16px;
  color:var(--accent)}
h1 {
  font-size:28px;
  letter-spacing:-.6px;
  margin:0 0 8px;
  overflow-wrap:anywhere}
.muted {
  color:#768197;
  line-height:1.6;
  margin:0}
.details {
  display:grid;
  grid-template-columns:1.1fr 1fr 1.2fr;
  gap:20px;
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:14px;
  padding:22px;
  margin-bottom:32px}
.label {
  display:block;
  text-transform:uppercase;
  font-size:10px;
  letter-spacing:1px;
  color:#7a8598;
  margin-bottom:10px}
.person {
  display:flex;
  align-items:center;
  gap:10px}
.avatar {
  width:34px;
  height:34px;
  display:grid;
  place-items:center;
  background:color-mix(in srgb,var(--accent) 10%,white);
  color:var(--accent);
  border-radius:50%;
  font-weight:600}
.value {
  font-weight:550;
  overflow-wrap:anywhere}
.details small {
  display:block;
  margin-top:5px;
  color:#768197;
  font-size:11px;
  line-height:1.5}
nav {
  display:flex;
  gap:9px;
  align-items:center;
  flex-wrap:wrap;
  margin:0 0 16px;
  color:#738097;
  font-size:13px}
nav a {
  color:var(--accent)}
.list {
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:12px;
  overflow:hidden}
.row {
  display:grid;
  grid-template-columns:minmax(0,1fr) 90px 165px 40px;
  gap:16px;
  align-items:center;
  padding:17px 20px;
  border-bottom:1px solid #edf0f4}
.row:last-child {
  border-bottom:0}
a.row:hover {
  background:color-mix(in srgb,var(--accent) 4%,white)}
.row:focus-visible,nav a:focus-visible,.next:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:-3px}
.row.heading {
  background:#fbfcfd;
  color:#8490a2;
  font-size:10px;
  letter-spacing:1px;
  text-transform:uppercase;
  padding-top:12px;
  padding-bottom:12px}
.filename {
  display:flex;
  gap:12px;
  align-items:center;
  min-width:0}
.filename span {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap}
.size,.modified {
  font-size:12px;
  color:#8490a2;
  text-align:right}
.action {
  color:var(--accent);
  text-align:right}
.empty {
  padding:48px;
  text-align:center;
  color:#768197}
.footer {
  display:flex;
  justify-content:space-between;
  gap:16px;
  margin-top:18px;
  color:#8490a2;
  font-size:12px}
.next {
  color:var(--accent)}
.notice {
  margin-top:28px;
  color:#8490a2;
  font-size:12px;
  line-height:1.6}
time {
  white-space:normal}
@media(max-width:640px) {
  .topbar {
  height:68px;
  padding:0 20px}
.brand {
  font-size:23px}
main {
  margin:28px auto;
  padding:0 18px}
.intro {
  gap:12px}
h1 {
  font-size:23px}
.hero-icon {
  padding:13px}
.details {
  grid-template-columns:1fr;
  padding:18px;
  gap:18px}
.row {
  grid-template-columns:minmax(0,1fr) 65px 24px;
  gap:8px;
  padding:16px 14px}
.modified {
  display:none}
.row.heading .modified {
  display:none}
.footer {
  flex-wrap:wrap}
.pill {
  font-size:11px}
.notice {
  margin-top:20px}
}

`;

// server/public-share-page.ts
var escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var icon = (name, size2 = 18, color = "currentColor") => `<svg aria-hidden="true" width="${size2}" height="${size2}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${(ICON_PATHS[name] || ICON_PATHS.file).map((path) => `<path d="${path}"/>`).join("")}</svg>`;
var date = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(value) + " UTC";
var time = (value) => `<time datetime="${value.toISOString()}">${date(value)}</time>`;
function duration(ms) {
  const minutes = Math.max(1, Math.ceil(ms / 6e4));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${Math.floor(hours)}h ${minutes % 60}m`;
}
function size(bytes) {
  if (bytes === void 0) return "\u2014";
  if (bytes < 1024) return `${bytes} B`;
  const unit = Math.min(3, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** unit).toFixed(1)} ${["B", "KB", "MB", "GB"][unit]}`;
}
function renderPublicSharePage({ base, root, requested, folder, sharer, createdAt, expiresAt, entries, nextCursor, preferences }) {
  const accent = ACCENTS[preferences?.accent || "indigo"]?.light || ACCENTS.indigo.light;
  const font = FONTS[preferences?.font || "inter"]?.family || FONTS.inter.family;
  const title = root.split("/").filter(Boolean).pop() || "Shared folder";
  const href = (key, download = false) => `${base}?key=${encodeURIComponent(key)}${download ? "&amp;download=1" : ""}`;
  const crumbs = [`<a href="${base}">${escapeHtml(title)}</a>`];
  if (folder && requested !== root) {
    let path = root;
    for (const part of requested.slice(root.length).split("/").filter(Boolean)) {
      path += part + "/";
      crumbs.push(`<span>/</span><a href="${href(path)}">${escapeHtml(part)}</a>`);
    }
  }
  const rows = entries.map((entry) => {
    const name = entry.key.slice(folder && requested.endsWith("/") ? requested.length : 0).split("/").filter(Boolean).pop() || entry.key;
    const info = getFileTypeInfo(name, entry.folder);
    return `<a class="row" href="${href(entry.key, !entry.folder)}" aria-label="${escapeHtml((entry.folder ? "Open folder " : "Download file ") + name)}"><div class="filename">${icon(info.iconName, 19, info.colorLight)}<span>${escapeHtml(name)}</span></div><span class="size">${entry.folder ? "Folder" : size(entry.size)}</span><span class="modified">${entry.modified ? time(entry.modified) : "\u2014"}</span><span class="action">${icon(entry.folder ? "chevronRight" : "download", 16)}</span></a>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} \xB7 Vault</title><style>:root{--accent:${accent};--font:${font}}${publicShareStyle}</style></head><body><header class="topbar"><div class="brand"><span>\u25C6</span>Vault</div><span class="pill">${icon("link", 14)} Shared with you</span></header><main><section class="intro"><div class="hero-icon">${icon(folder ? "folder" : getFileTypeInfo(title, false).iconName, 30)}</div><div><h1>${escapeHtml(title)}</h1><p class="muted">${folder ? "Shared folder" : "Shared file"} \xB7 View and download access</p></div></section><section class="details" aria-label="Sharing details"><div><span class="label">Shared by</span><div class="person"><span class="avatar">${escapeHtml(Array.from(sharer)[0]?.toUpperCase() || "V")}</span><span class="value">${escapeHtml(sharer)}</span></div></div><div><span class="label">Sharing duration</span><span class="value">${expiresAt ? duration(expiresAt.getTime() - createdAt.getTime()) : "Permanent link"}</span><small>Shared ${time(createdAt)}</small></div><div><span class="label">${expiresAt ? "Available until" : "Availability"}</span><span class="value">${expiresAt ? time(expiresAt) : "Until the owner revokes it"}</span><small>${expiresAt ? `${duration(expiresAt.getTime() - Date.now())} remaining` : "No automatic expiry"}</small></div></section><nav aria-label="Shared folder navigation">${icon("folder", 15)}${crumbs.join("")}</nav><section class="list" aria-label="Shared files"><div class="row heading"><span>Name</span><span class="size">Size</span><span class="modified">Modified</span><span></span></div>${rows || '<div class="empty">This folder is empty.</div>'}</section><div class="footer"><span>${entries.length} item${entries.length === 1 ? "" : "s"}${nextCursor ? " on this page" : ""} \xB7 Read-only</span>${nextCursor ? `<a class="next" href="${href(requested)}&amp;cursor=${encodeURIComponent(nextCursor)}">Next page \u2192</a>` : ""}</div><p class="notice">${folder ? "Open a folder to browse, or select a file to download. This link includes future additions to this folder." : "Select the file to download it."} No Vault account required.</p></main></body></html>`;
}

// server/bucket-protection.ts
import { createHash as createHash3, randomUUID as randomUUID2 } from "node:crypto";
import bcrypt3 from "bcryptjs";

// src/lib/bucketProtection.ts
var PRIVATE_BUCKET_PREFIX = "vault-private-";
var BUCKET_UNLOCK_MS = 15 * 60 * 1e3;
var PRIVATE_URL_SECONDS = 60;
function validateBucketPassword(value) {
  if (typeof value !== "string" || value.length < 12) return "Use at least 12 characters for the bucket password";
  if (new TextEncoder().encode(value).length > 72) return "Bucket passwords must be at most 72 UTF-8 bytes";
  return null;
}

// server/bucket-protection.ts
var BucketAccessError = class extends Error {
  status;
  code;
  bucket;
  retryAfter;
  constructor(status, message, code, bucket) {
    super(message);
    this.status = status;
    this.code = code;
    this.bucket = bucket;
  }
};
function bucketSession(req) {
  const cookie = req.cookies?.vault_session;
  if (typeof cookie !== "string" || !cookie) throw new BucketAccessError(401, "Unauthorized");
  return createHash3("sha256").update(cookie).digest("hex");
}
function bucketUser(req) {
  const user = req.user;
  if (!user) throw new BucketAccessError(401, "Unauthorized");
  return user;
}
var BucketProtection = class {
  store;
  constructor(store = mongoBucketStore) {
    this.store = store;
  }
  async owned(req, name) {
    const bucket = await this.store.find(name);
    if (!bucket || bucket.ownerId !== bucketUser(req).id || bucket.state !== "active") {
      throw new BucketAccessError(404, "Bucket not found");
    }
    return bucket;
  }
  async grantExpiry(req, bucket) {
    const grant = await this.store.getGrant(`${bucket._id}:${bucketSession(req)}`);
    return grant && grant.version === bucket.version && grant.expiresAt.getTime() > Date.now() ? grant.expiresAt : null;
  }
  async authorize(req, name) {
    bucketUser(req);
    const bucket = await this.store.find(name);
    if (!bucket && !name.startsWith(PRIVATE_BUCKET_PREFIX)) return null;
    if (!bucket || bucket.state !== "active" || bucket.ownerId !== bucketUser(req).id) throw new BucketAccessError(404, "Bucket not found");
    if (!await this.grantExpiry(req, bucket)) throw new BucketAccessError(423, "Unlock this bucket to continue", "BUCKET_LOCKED", name);
    return bucket;
  }
  async describe(req, names) {
    const owned = await this.store.listOwned(bucketUser(req).id);
    const shared = names.filter((name) => !name.startsWith(PRIVATE_BUCKET_PREFIX));
    const visible = [];
    for (const name of shared) {
      if (!await this.store.find(name)) visible.push({ name, label: name, isPrivate: false, locked: false });
    }
    for (const bucket of owned) {
      if (!names.includes(bucket._id)) continue;
      const expiry = await this.grantExpiry(req, bucket);
      visible.push({ name: bucket._id, label: bucket.label, isPrivate: true, locked: !expiry, unlockedUntil: expiry?.toISOString() });
    }
    return visible;
  }
  async checkPassword(req, bucket, password) {
    if (bucketUser(req).id !== bucket.ownerId) throw new BucketAccessError(404, "Bucket not found");
    const window = Math.floor(Date.now() / BUCKET_UNLOCK_MS);
    const end = (window + 1) * BUCKET_UNLOCK_MS;
    const count = await this.store.attempt(`${bucket.ownerId}:${bucket._id}:${window}`, new Date(end));
    if (count > 5) {
      const error = new BucketAccessError(429, "Too many password attempts. Try again in a few minutes.");
      error.retryAfter = Math.ceil((end - Date.now()) / 1e3);
      throw error;
    }
    if (validateBucketPassword(password) || !await bcrypt3.compare(password, bucket.passwordHash)) {
      throw new BucketAccessError(400, "Bucket password is incorrect");
    }
  }
  async unlock(req, name, password) {
    const bucket = await this.owned(req, name);
    await this.checkPassword(req, bucket, password);
    const session = bucketSession(req);
    const expiresAt = new Date(Date.now() + BUCKET_UNLOCK_MS);
    await this.store.putGrant({ _id: `${name}:${session}`, session, bucket: name, version: bucket.version, expiresAt });
    return { name, label: bucket.label, isPrivate: true, locked: false, unlockedUntil: expiresAt.toISOString() };
  }
  async reserve(req, label, password) {
    const error = validateBucketPassword(password);
    if (error) throw new BucketAccessError(400, error);
    const ownerId = bucketUser(req).id;
    const claim = `${ownerId}:${label}`;
    const existing = await this.store.findClaim(claim);
    if (existing) {
      if (existing.state !== "creating") throw new BucketAccessError(409, "You already have a private bucket with this name");
      await this.checkPassword(req, existing, password);
      return existing;
    }
    const bucket = {
      _id: `${PRIVATE_BUCKET_PREFIX}${randomUUID2()}`,
      ownerId,
      label,
      claim,
      passwordHash: await bcrypt3.hash(password, 12),
      version: 1,
      state: "creating"
    };
    try {
      await this.store.reserve(bucket);
    } catch (err) {
      if (err?.code === 11e3) throw new BucketAccessError(409, "Bucket creation is already in progress. Retry with the same name and password.");
      throw err;
    }
    return bucket;
  }
};

// server/shares.ts
var collection = () => getDatabase().collection("public_shares");
var indexes2;
async function indexedCollection() {
  const shares2 = collection();
  indexes2 ??= Promise.all([
    shares2.createIndex({ tokenHash: 1 }, { unique: true }),
    shares2.createIndex({ ownerId: 1, bucket: 1, key: 1 })
  ]).catch((err) => {
    indexes2 = void 0;
    throw err;
  });
  await indexes2;
  return shares2;
}
var mongoShareStore = {
  async insert(record) {
    await (await indexedCollection()).insertOne(record);
  },
  async findToken(tokenHash) {
    return (await indexedCollection()).findOne({ tokenHash });
  },
  async list(ownerId, bucket, key) {
    return (await indexedCollection()).find({ ownerId, bucket, key, revoked: false }).sort({ createdAt: -1 }).toArray();
  },
  async revoke(_id, ownerId) {
    await (await indexedCollection()).updateOne({ _id, ownerId }, { $set: { revoked: true } });
  }
};
var hash = (token) => createHash4("sha256").update(token).digest("hex");
var asyncRoute = (fn) => (req, res, next) => {
  void fn(req, res).catch(next);
};
var safeKey = (key) => !key.split("/").some((part) => part === "." || part === "..") && ![...key].some((char) => char.charCodeAt(0) < 32 || char === "\\");
var summary = (share) => {
  const token = recoverShareToken(share.encryptedToken);
  return { id: share._id, expiresAt: share.expiresAt, createdAt: share.createdAt, path: token && hash(token) === share.tokenHash ? `/api/public/${token}` : void 0 };
};
function createShareRouters(s3, protection = new BucketProtection(), store = mongoShareStore, getSharer = getUserById) {
  const management = express3.Router();
  management.use(express3.json());
  management.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  management.post("/", asyncRoute(async (req, res) => {
    const { bucket, key, folder, duration: duration2, customHours } = req.body || {};
    if (typeof bucket !== "string" || !bucket || typeof key !== "string" || !key || !safeKey(key) || typeof folder !== "boolean" || folder !== key.endsWith("/")) throw new BucketAccessError(400, "Select a valid file or folder");
    const metadata = await protection.authorize(req, bucket);
    const hours = duration2 === "custom" ? customHours : { "1h": 1, "6h": 6, "24h": 24 }[duration2];
    if (duration2 !== "permanent" && (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0 || hours > 87600)) throw new BucketAccessError(400, "Choose an expiry between 0 and 87,600 hours");
    if (folder) {
      const result = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key, MaxKeys: 1 }));
      if (!result.Contents?.length) throw new BucketAccessError(404, "Folder not found");
    } else await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const profile = await getSharer(bucketUser(req).id);
    const sharerName = profile?.name?.trim() || bucketUser(req).email.split("@")[0];
    const token = randomBytes2(32).toString("base64url");
    const record = {
      _id: randomUUID3(),
      tokenHash: hash(token),
      encryptedToken: encryptShareToken(token),
      ownerId: bucketUser(req).id,
      sharerName,
      bucket,
      key,
      folder,
      privateOwner: metadata?.ownerId,
      expiresAt: duration2 === "permanent" ? null : new Date(Date.now() + hours * 36e5),
      createdAt: /* @__PURE__ */ new Date(),
      revoked: false
    };
    await store.insert(record);
    res.status(201).json({ ...summary(record), path: `/api/public/${token}` });
  }));
  management.get("/", asyncRoute(async (req, res) => {
    const { bucket, key } = req.query;
    if (typeof bucket !== "string" || typeof key !== "string") throw new BucketAccessError(400, "Bucket and key required");
    const records = await store.list(bucketUser(req).id, bucket, key);
    res.json({ shares: records.filter((s) => !s.expiresAt || s.expiresAt.getTime() > Date.now()).map(summary) });
  }));
  management.delete("/:id", asyncRoute(async (req, res) => {
    await store.revoke(String(req.params.id), bucketUser(req).id);
    res.json({ success: true });
  }));
  const publicRouter = express3.Router();
  publicRouter.use((_req, res, next) => {
    res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" });
    next();
  });
  publicRouter.get("/:token", asyncRoute(async (req, res) => {
    const token = String(req.params.token);
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new BucketAccessError(404, "Share unavailable or expired");
    const share = await store.findToken(hash(token));
    if (!share || share.revoked || share.expiresAt && share.expiresAt.getTime() <= Date.now()) throw new BucketAccessError(404, "Share unavailable or expired");
    const owner = await protection.store.find(share.bucket);
    if (share.privateOwner && (!owner || owner.state !== "active" || owner.ownerId !== share.privateOwner) || !share.privateOwner && (owner || share.bucket.startsWith(PRIVATE_BUCKET_PREFIX))) throw new BucketAccessError(404, "Share unavailable or expired");
    const requested = req.query.key === void 0 ? share.key : req.query.key;
    if (typeof requested !== "string" || !safeKey(requested) || (share.folder ? !requested.startsWith(share.key) : requested !== share.key)) throw new BucketAccessError(404, "Item not shared");
    const base = `/api/public/${token}`;
    if (req.query.download === "1") {
      if (requested.endsWith("/")) throw new BucketAccessError(400, "Choose a file to download");
      const ttl = share.expiresAt ? Math.min(60, Math.floor((share.expiresAt.getTime() - Date.now()) / 1e3)) : 60;
      if (ttl < 1) throw new BucketAccessError(404, "Share unavailable or expired");
      const filename = encodeURIComponent(requested.split("/").pop() || "download");
      const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: share.bucket, Key: requested, ResponseContentDisposition: `attachment; filename="${filename}"; filename*=UTF-8''${filename}`, ResponseContentType: "application/octet-stream" }), { expiresIn: ttl });
      res.redirect(303, url);
      return;
    }
    const profile = await getSharer(share.ownerId);
    const sharer = profile?.name?.trim() || share.sharerName || profile?.email.split("@")[0] || "Vault member";
    let entries;
    let nextCursor;
    if (share.folder && requested.endsWith("/")) {
      const cursor = req.query.cursor;
      if (cursor !== void 0 && (typeof cursor !== "string" || cursor.length > 4096)) throw new BucketAccessError(400, "Invalid page");
      const result = await s3.send(new ListObjectsV2Command({ Bucket: share.bucket, Prefix: requested, Delimiter: "/", MaxKeys: 100, ContinuationToken: cursor }));
      entries = [
        ...(result.CommonPrefixes || []).filter((p) => p.Prefix?.startsWith(requested)).map((p) => ({ key: p.Prefix, folder: true })),
        ...(result.Contents || []).filter((o) => o.Key && o.Key !== requested && o.Key.startsWith(requested)).map((o) => ({ key: o.Key, folder: false, size: o.Size, modified: o.LastModified }))
      ];
      nextCursor = result.IsTruncated ? result.NextContinuationToken : void 0;
    } else {
      const object = await s3.send(new HeadObjectCommand({ Bucket: share.bucket, Key: requested }));
      entries = [{ key: requested, folder: false, size: object.ContentLength, modified: object.LastModified }];
    }
    res.type("html").send(renderPublicSharePage({
      base,
      root: share.key,
      requested,
      folder: share.folder,
      sharer,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      entries,
      nextCursor,
      preferences: profile?.preferences
    }));
  }));
  const errors = (err, _req, res, next) => {
    if (err instanceof BucketAccessError) {
      res.status(err.status).json({ error: err.message, code: err.code, bucket: err.bucket });
      return;
    }
    if (["NoSuchKey", "NotFound", "NoSuchBucket"].includes(err?.name)) {
      res.status(404).json({ error: "Item unavailable" });
      return;
    }
    next(err);
  };
  management.use(errors);
  publicRouter.use(errors);
  return { management, publicRouter };
}

// server/object-metadata.ts
import { HeadObjectCommand as HeadObjectCommand2, ListObjectsV2Command as ListObjectsV2Command2 } from "@aws-sdk/client-s3";
async function getObjectMetadata(s3, bucket, key) {
  if (!key.endsWith("/")) {
    const object = await s3.send(new HeadObjectCommand2({ Bucket: bucket, Key: key }));
    return {
      key,
      isFolder: false,
      size: object.ContentLength ?? 0,
      lastModified: object.LastModified?.toISOString(),
      contentType: object.ContentType,
      etag: object.ETag?.replace(/^"|"$/g, ""),
      storageClass: object.StorageClass || "STANDARD",
      versionId: object.VersionId,
      metadata: object.Metadata
    };
  }
  let cursor;
  let size2 = 0, fileCount = 0, latest = 0, pages = 0;
  const folders = /* @__PURE__ */ new Set();
  do {
    const page = await s3.send(new ListObjectsV2Command2({ Bucket: bucket, Prefix: key, MaxKeys: 1e3, ContinuationToken: cursor }));
    for (const object of page.Contents || []) {
      if (!object.Key?.startsWith(key)) continue;
      if (object.LastModified) latest = Math.max(latest, object.LastModified.getTime());
      const relative = object.Key.slice(key.length);
      const parts = relative.split("/");
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join("/"));
      if (object.Key !== key && !object.Key.endsWith("/")) {
        fileCount++;
        size2 += object.Size || 0;
      }
    }
    cursor = page.IsTruncated ? page.NextContinuationToken : void 0;
    pages++;
  } while (cursor && pages < 10);
  return { key, isFolder: true, size: size2, fileCount, folderCount: folders.size, lastModified: latest ? new Date(latest).toISOString() : void 0, partial: !!cursor };
}

// server/s3.ts
import express4 from "express";
import {
  S3Client as S3Client2,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command as ListObjectsV2Command3,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand as GetObjectCommand2,
  HeadBucketCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrl2 } from "@aws-sdk/s3-request-presigner";
import bcrypt4 from "bcryptjs";

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
function createStorageClient() {
  return new S3Client2({
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || "admin",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "password"
    },
    forcePathStyle: true
  });
}
function createS3Router(protection = new BucketProtection()) {
  const s3 = createStorageClient();
  const defaultBucket = process.env.MINIO_BUCKET || "fruitms-public-local";
  const privateBucket = process.env.MINIO_PRIVATE_BUCKET || "shared-files";
  console.log(`[vault] S3 endpoint: ${process.env.MINIO_ENDPOINT || "http://localhost:9000"}`);
  console.log(`[vault] default bucket: ${defaultBucket} | private bucket: ${privateBucket}`);
  const router = express4.Router();
  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  router.get("/buckets", wrap(async (req, res) => {
    const result = await s3.send(new ListBucketsCommand({}));
    const bucketDetails = await protection.describe(req, result.Buckets?.map((b) => b.Name).filter((n) => !!n) || []);
    const buckets = bucketDetails.map((bucket) => bucket.name);
    res.json({
      buckets,
      bucketDetails,
      defaultBucket: buckets.includes(defaultBucket) ? defaultBucket : "",
      privateBucket: buckets.includes(privateBucket) ? privateBucket : ""
    });
  }));
  router.post("/buckets", express4.json(), wrap(async (req, res) => {
    const isPrivate = req.body?.private === true;
    if (!isPrivate && bucketUser(req).role !== "admin") throw new BucketAccessError(403, "Admin access required");
    const name = req.body?.name;
    const error = validateBucketName(name);
    if (error) throw new BucketAccessError(400, error);
    if (name.startsWith(PRIVATE_BUCKET_PREFIX)) throw new BucketAccessError(400, "This prefix is reserved for private bucket storage");
    if (isPrivate) {
      const record = await protection.reserve(req, name, req.body?.password);
      try {
        await s3.send(new HeadBucketCommand({ Bucket: record._id }));
      } catch (err) {
        const failure = err;
        if (failure.name !== "NotFound" && failure.name !== "NoSuchBucket" && failure.$metadata?.httpStatusCode !== 404) throw err;
        await s3.send(new CreateBucketCommand({ Bucket: record._id }));
      }
      await protection.store.activate(record._id);
      const details = await protection.unlock(req, record._id, req.body?.password);
      res.status(201).json({ success: true, bucket: record._id, details });
      return;
    }
    if (await protection.store.find(name)) throw new BucketAccessError(409, "Bucket name unavailable");
    try {
      await s3.send(new CreateBucketCommand({ Bucket: name }));
      res.status(201).json({ success: true, bucket: name, details: { name, label: name, isPrivate: false, locked: false } });
    } catch (err) {
      bucketError(res, err);
    }
  }));
  router.post("/buckets/:name/unlock", express4.json(), wrap(async (req, res) => {
    res.json({ details: await protection.unlock(req, String(req.params.name), req.body?.password) });
  }));
  router.post("/buckets/:name/lock", wrap(async (req, res) => {
    const bucket = await protection.owned(req, String(req.params.name));
    await protection.store.revoke(bucket._id);
    res.json({ details: { name: bucket._id, label: bucket.label, isPrivate: true, locked: true } });
  }));
  router.patch("/buckets/:name/password", express4.json(), wrap(async (req, res) => {
    const bucket = await protection.owned(req, String(req.params.name));
    const error = validateBucketPassword(req.body?.newPassword);
    if (error) throw new BucketAccessError(400, error);
    await protection.checkPassword(req, bucket, req.body?.currentPassword);
    const changed = await protection.store.changePassword(bucket._id, bucket.version, await bcrypt4.hash(req.body.newPassword, 12));
    if (!changed) throw new BucketAccessError(409, "Bucket changed. Please try again.");
    res.json({ details: { name: bucket._id, label: bucket.label, isPrivate: true, locked: true } });
  }));
  router.delete("/buckets/:name", express4.json(), wrap(async (req, res) => {
    const name = String(req.params.name);
    const bucket = await protection.authorize(req, name);
    if (!bucket && bucketUser(req).role !== "admin") throw new BucketAccessError(403, "Admin access required");
    if (req.body?.confirmName !== (bucket?.label || name)) throw new BucketAccessError(400, "Type the exact bucket name to confirm deletion");
    try {
      await s3.send(new DeleteBucketCommand({ Bucket: name }));
    } catch (err) {
      if (!bucket || err.name !== "NoSuchBucket") {
        bucketError(res, err);
        return;
      }
    }
    if (bucket) await protection.store.markDeleted(name);
    res.json({ success: true });
  }));
  router.use("/folders", express4.json());
  const filePaths = /* @__PURE__ */ new Set(["/files", "/upload-url", "/upload", "/download", "/raw", "/folders", "/metadata"]);
  router.use((req, res, next) => {
    const routePath = req.path.toLowerCase().replace(/\/+$/, "");
    if (!filePaths.has(routePath)) {
      next();
      return;
    }
    void (async () => {
      const requested = routePath === "/folders" ? req.body?.bucket : req.query.bucket;
      if (requested !== void 0 && (typeof requested !== "string" || !requested)) throw new BucketAccessError(400, "A valid bucket name is required");
      const bucket = requested ?? privateBucket;
      const metadata = await protection.authorize(req, bucket);
      res.locals.bucket = bucket;
      res.locals.privateBucket = !!metadata;
      res.locals.urlTtl = metadata ? Math.max(1, Math.min(
        PRIVATE_URL_SECONDS,
        Math.floor(((await protection.grantExpiry(req, metadata))?.getTime() || 0) / 1e3 - Date.now() / 1e3)
      )) : 900;
      next();
    })().catch(next);
  });
  router.get("/metadata", wrap(async (req, res) => {
    const key = req.query.key;
    if (typeof key !== "string" || !key) {
      res.status(400).json({ error: "A file or folder key is required" });
      return;
    }
    try {
      res.json(await getObjectMetadata(s3, res.locals.bucket, key));
    } catch (err) {
      if (["NotFound", "NoSuchKey", "NoSuchBucket"].includes(err.name)) {
        res.status(404).json({ error: "This item no longer exists" });
        return;
      }
      throw err;
    }
  }));
  router.get("/files", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const prefix = req.query.prefix || "";
    const result = await s3.send(
      new ListObjectsV2Command3({ Bucket: bucket, Prefix: prefix, Delimiter: "/" })
    );
    const folders = await Promise.all(
      (result.CommonPrefixes || []).map(async (p) => {
        const folderPrefix = p.Prefix;
        let size2 = 0;
        let lastModified = "";
        try {
          const folderObjects = await s3.send(
            new ListObjectsV2Command3({ Bucket: bucket, Prefix: folderPrefix })
          );
          const items = folderObjects.Contents || [];
          let latestTime = 0;
          for (const item of items) {
            if (item.Key !== folderPrefix) size2 += item.Size || 0;
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
          size: size2,
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
    const bucket = res.locals.bucket;
    const key = req.query.key || "";
    const contentType = req.query.contentType || "application/octet-stream";
    if (!key) {
      res.status(400).json({ error: 'Query parameter "key" is required' });
      return;
    }
    const uploadUrl = await getSignedUrl2(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      }),
      { expiresIn: res.locals.urlTtl }
    );
    res.json({ uploadUrl, bucket, key });
  }));
  router.put(
    "/upload",
    express4.raw({ type: "*/*", limit: "5gb" }),
    wrap(async (req, res) => {
      const bucket = res.locals.bucket;
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
    const bucket = res.locals.bucket;
    const key = req.query.key || "";
    if (key.endsWith("/")) {
      const list = await s3.send(new ListObjectsV2Command3({ Bucket: bucket, Prefix: key }));
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
    const bucket = res.locals.bucket;
    const key = req.query.key || "";
    const signedUrl = await getSignedUrl2(
      s3,
      new GetObjectCommand2({ Bucket: bucket, Key: key }),
      { expiresIn: res.locals.urlTtl }
    );
    res.json({ url: signedUrl });
  }));
  router.get("/raw", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const key = req.query.key || "";
    const redirect = req.query.redirect === "true";
    const isMedia = /\.(mp4|webm|mov|mkv|mp3|wav|ogg|m4a|flac|aac)$/i.test(key);
    const shouldRedirect = redirect || Boolean(process.env.VERCEL) && isMedia;
    if (shouldRedirect) {
      const signedUrl = await getSignedUrl2(
        s3,
        new GetObjectCommand2({ Bucket: bucket, Key: key }),
        { expiresIn: res.locals.urlTtl }
      );
      res.redirect(307, signedUrl);
      return;
    }
    const rangeHeader = req.headers.range;
    const object = await s3.send(
      new GetObjectCommand2({
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
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    };
    if (!/^(image\/(?!svg\+xml)|audio\/|video\/|application\/pdf(?:;|$)|text\/plain(?:;|$))/i.test(headers["Content-Type"])) {
      headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(filename)}"`;
      headers["Content-Security-Policy"] = "sandbox; default-src 'none'";
    }
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
  router.post("/folders", express4.json(), wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const path = req.body?.path || "";
    const folderPath = path.endsWith("/") ? path : path + "/";
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: folderPath, Body: Buffer.alloc(0) })
    );
    res.json({ success: true });
  }));
  router.post("/ensure-bucket", requireAdmin, wrap(async (req, res) => {
    await protection.authorize(req, privateBucket);
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
  router.use((err, _req, res, next) => {
    if (!(err instanceof BucketAccessError)) {
      next(err);
      return;
    }
    if (err.retryAfter) res.setHeader("Retry-After", err.retryAfter);
    res.status(err.status).json({ error: err.message, code: err.code, bucket: err.bucket });
  });
  return router;
}

// server/app.ts
var app = express5();
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
app.use("/api/auth", express5.json(), authRouter);
app.use("/api/users", requireAuth, requireAdmin, express5.json(), usersRouter);
var shares = createShareRouters(createStorageClient());
app.use("/api/public", shares.publicRouter);
app.use("/api/shares", requireAuth, shares.management);
app.use("/api", requireAuth, createS3Router());
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use((err, req, res, next) => {
  if (!req.path.startsWith("/api")) return next(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[vault]", req.method, req.path.startsWith("/api/public/") ? "/api/public/[redacted]" : req.path, "\u2192", message);
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
