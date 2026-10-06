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
  // Archive (.zip, .tar, .rar, .7z) - Document with zipper
  fileArchive: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M10 7.5h2",
    "M10.5 9.5h2",
    "M10 11.5h2",
    "M10.5 13.5h2",
    "M10 15.5h3v2.5h-3z",
    "M11.5 18v2.5"
  ],
  archive: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M10 7.5h2",
    "M10.5 9.5h2",
    "M10 11.5h2",
    "M10.5 13.5h2",
    "M10 15.5h3v2.5h-3z",
    "M11.5 18v2.5"
  ],
  fileZip: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M10 7.5h2",
    "M10.5 9.5h2",
    "M10 11.5h2",
    "M10.5 13.5h2",
    "M10 15.5h3v2.5h-3z",
    "M11.5 18v2.5"
  ],
  // Disc Image / ISO (.iso, .img, .bin)
  fileIso: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 14a2 2 0 100-4 2 2 0 000 4z",
    "M12 18a6 6 0 006-6",
    "M6 12a6 6 0 006 6"
  ],
  disc: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 14a2 2 0 100-4 2 2 0 000 4z",
    "M12 18a6 6 0 006-6",
    "M6 12a6 6 0 006 6"
  ],
  // Android Package / App Bundle (.apk, .aab)
  fileApk: [
    "M5 12.5a7 7 0 0114 0H5z",
    "M7.5 7L5.5 3.5",
    "M16.5 7l2-3.5",
    "M8.5 9.5h.01",
    "M15.5 9.5h.01",
    "M5.5 14.5v4a2 2 0 002 2h9a2 2 0 002-2v-4",
    "M3 15v3",
    "M21 15v3"
  ],
  // iOS App Package (.ipa)
  fileIpa: [
    "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
    "M8.5 17l3.5-9 3.5 9",
    "M9.5 13.5h5"
  ],
  // Windows Executable / Installer (.exe, .msi)
  fileExe: [
    "M3 4h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z",
    "M3 8.5h18",
    "M6 6.5h.01",
    "M9 6.5h.01",
    "M7 13l2.5 2-2.5 2",
    "M12.5 17h4.5"
  ],
  // Apple Disk Image / macOS Package (.dmg, .pkg)
  fileDmg: [
    "M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z",
    "M4 14.5h16",
    "M18 17.5h.01",
    "M12 8.5v3.5",
    "M9.5 10.5l2.5 2 2.5-2"
  ],
  // Linux AppImage (.AppImage)
  fileAppImage: [
    "M12 2L3 7v10l9 5 9-5V7l-9-5z",
    "M12 22V12",
    "M21 7l-9 5-9-5",
    "M10.5 9.5l3.5 2.5-3.5 2.5z"
  ],
  // Debian Package (.deb)
  fileDeb: [
    "M12 2L3 7v10l9 5 9-5V7l-9-5z",
    "M12 22V12",
    "M21 7l-9 5-9-5",
    "M12 7a2.5 2.5 0 00-2.5-2.5C8 4.5 7 6 9 7",
    "M12 7a2.5 2.5 0 012.5-2.5C16 4.5 17 6 15 7"
  ],
  // RPM Package (.rpm)
  fileRpm: [
    "M12 2L3 7v10l9 5 9-5V7l-9-5z",
    "M12 22V12",
    "M21 7l-9 5-9-5",
    "M12 9v6",
    "M9 12h6"
  ],
  // Packages general
  package: [
    "M16.5 9.4l-9-5.19",
    "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    "M3.27 6.96L12 12.01l8.73-5.05",
    "M12 22.08V12"
  ],
  filePackage: [
    "M16.5 9.4l-9-5.19",
    "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
    "M3.27 6.96L12 12.01l8.73-5.05",
    "M12 22.08V12"
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
  filePlus: [
    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
    "M14 2v6h6",
    "M12 18v-6",
    "M9 15h6"
  ],
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

// src/lib/animationSettings.ts
var ANIMATION_DIRECTIONS = [
  { value: "down-right", label: "\u2198 Right" },
  { value: "down", label: "\u2193 Down" },
  { value: "down-left", label: "\u2199 Left" }
];
var ANIMATION_DENSITIES = [
  { value: "light", label: "Light" },
  { value: "balanced", label: "Balanced" },
  { value: "full", label: "Full" }
];
function isAnimationAppearance(settings, limits) {
  return ANIMATION_DIRECTIONS.some((option) => option.value === settings.direction) && ANIMATION_DENSITIES.some((option) => option.value === settings.density) && Object.entries(limits).every(([key, range]) => typeof settings[key] === "number" && Number.isFinite(settings[key]) && settings[key] >= range.min && settings[key] <= range.max) && typeof settings.color === "string" && (settings.color === "theme" || /^#[0-9a-f]{6}$/i.test(settings.color));
}

// src/lib/rain.ts
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
  return Object.keys(settings).every((key) => Object.hasOwn(DEFAULT_RAIN, key)) && isAnimationAppearance(settings, RAIN_LIMITS) && typeof settings.splash === "boolean";
}

// src/lib/leaves.ts
var LEAF_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 12, max: 40, step: 1 },
  width: { min: 8, max: 28, step: 1 }
};
var DEFAULT_LEAVES = {
  direction: "down-right",
  density: "balanced",
  speed: 1,
  height: 24,
  width: 14,
  breeze: true,
  color: "theme"
};
function isLeafSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key) => Object.hasOwn(DEFAULT_LEAVES, key)) && isAnimationAppearance(settings, LEAF_LIMITS) && typeof settings.breeze === "boolean";
}

// src/lib/preferences.ts
var ANIMATIONS = [
  { value: "none", label: "Off", description: "A quiet background" },
  { value: "rain", label: "Rain", description: "Soft, flowing streaks" },
  { value: "leaves", label: "Falling leaves", description: "Leaves on a gentle breeze" }
];
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
  return (p.theme === "light" || p.theme === "dark") && typeof p.font === "string" && Object.hasOwn(FONTS, p.font) && typeof p.accent === "string" && Object.hasOwn(ACCENTS, p.accent) && typeof p.rain === "boolean" && (!("rainSettings" in p) || isRainSettings(p.rainSettings)) && (!("animation" in p) || ANIMATIONS.some((option) => option.value === p.animation)) && (!("leafSettings" in p) || isLeafSettings(p.leafSettings)) && Object.keys(p).every((key) => ["theme", "font", "accent", "rain", "rainSettings", "animation", "leafSettings"].includes(key));
}

// src/lib/publicShareStyle.ts
var publicShareStyle = `
.public-share-preview .modal-overlay,
.public-share-details .modal-overlay {
  --drop-bg: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
:where(.public-share) * {
  box-sizing:border-box}.public-share {
  margin:0;
  background:#f7f8fa;
  color:#172033;
  font-family:var(--font, var(--font-ui));
  font-size:14px}:where(.public-share) a {
  color:inherit;
  text-decoration:none}:where(.public-share) svg {
  flex-shrink:0;
  vertical-align:middle}:where(.public-share) .topbar {
  height:80px;
  border-bottom:1px solid #e2e6ed;
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 max(24px,calc((100vw - 1120px)/2));
  gap:20px}:where(.public-share) .brand, :where(.public-share) .vault-brand-btn--public {
  font-size:26px;
  font-weight:650;
  letter-spacing:-1px;
  display:inline-flex;
  gap:12px;
  align-items:center;
  color:#172033;
  font-family:inherit;
  background:transparent;
  border:0;
  padding:6px 10px;
  margin-left:-10px;
  border-radius:8px;
  cursor:pointer;
  transition:background-color 0.15s ease}:where(.public-share) .vault-brand-btn--public:hover {
  background:#f1f3f7}:where(.public-share) .vault-brand-btn--public:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:2px}:where(.public-share) .brand span {
  font-size:17px;
  color:var(--accent)}:where(.public-share) .pill {
  display:inline-flex;
  align-items:center;
  gap:7px;
  border:1px solid #e0e4eb;
  border-radius:99px;
  padding:8px 12px;
  font-size:12px;
  color:#657086;
  white-space:nowrap}:where(.public-share) main {
  max-width:1120px;
  margin:48px auto;
  padding:0 24px}:where(.public-share) .intro {
  display:flex;
  gap:18px;
  align-items:center;
  margin-bottom:28px}:where(.public-share) .hero-icon {
  padding:18px;
  border:1px solid #e0e4eb;
  background:#fff;
  border-radius:16px;
  color:var(--accent)}:where(.public-share) h1 {
  font-size:28px;
  letter-spacing:-.6px;
  margin:0 0 8px;
  overflow-wrap:anywhere}:where(.public-share) .muted {
  color:#768197;
  line-height:1.6;
  margin:0}:where(.public-share) .details {
  display:grid;
  grid-template-columns:1.1fr 1fr 1.2fr;
  gap:20px;
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:14px;
  padding:22px;
  margin-bottom:32px}:where(.public-share) .label {
  display:block;
  text-transform:uppercase;
  font-size:10px;
  letter-spacing:1px;
  color:#7a8598;
  margin-bottom:10px}:where(.public-share) .person {
  display:flex;
  align-items:center;
  gap:10px}:where(.public-share) .avatar {
  width:34px;
  height:34px;
  display:grid;
  place-items:center;
  background:color-mix(in srgb,var(--accent) 10%,white);
  color:var(--accent);
  border-radius:50%;
  font-weight:600}:where(.public-share) .value {
  font-weight:550;
  overflow-wrap:anywhere}:where(.public-share) .details small {
  display:block;
  margin-top:5px;
  color:#768197;
  font-size:11px;
  line-height:1.5}:where(.public-share) nav {
  display:flex;
  gap:9px;
  align-items:center;
  flex-wrap:wrap;
  margin:0 0 16px;
  color:#738097;
  font-size:13px}:where(.public-share) nav a {
  color:var(--accent)}:where(.public-share) .list {
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:12px;
  overflow:hidden}:where(.public-share) .row {
  display:grid;
  grid-template-columns:minmax(0,1fr) 90px 165px 108px;
  gap:16px;
  align-items:center;
  padding:17px 20px;
  border-bottom:1px solid #edf0f4}:where(.public-share) .row:last-child {
  border-bottom:0}:where(.public-share) a.row:hover {
  background:color-mix(in srgb,var(--accent) 4%,white)}:where(.public-share) .row:focus-visible,:where(.public-share) nav a:focus-visible,:where(.public-share) .next:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:-3px}:where(.public-share) .row.heading {
  background:#fbfcfd;
  color:#8490a2;
  font-size:10px;
  letter-spacing:1px;
  text-transform:uppercase;
  padding-top:12px;
  padding-bottom:12px}:where(.public-share) .filename {
  display:flex;
  gap:12px;
  align-items:center;
  min-width:0}:where(.public-share) .filename span {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap}:where(.public-share) .size,:where(.public-share) .modified {
  font-size:12px;
  color:#8490a2;
  text-align:right}:where(.public-share) .action {
  color:var(--accent);
  text-align:right}:where(.public-share) .empty {
  padding:48px;
  text-align:center;
  color:#768197}:where(.public-share) .footer {
  display:flex;
  justify-content:space-between;
  gap:16px;
  margin-top:18px;
  color:#8490a2;
  font-size:12px}:where(.public-share) .next {
  color:var(--accent)}:where(.public-share) .notice {
  margin-top:28px;
  color:#8490a2;
  font-size:12px;
  line-height:1.6}:where(.public-share) time {
  white-space:normal}@media(max-width:640px) {:where(.public-share) .topbar {
  height:68px;
  padding:0 20px}:where(.public-share) .brand, :where(.public-share) .vault-brand-btn--public {
  font-size:23px;
  padding:4px 8px;
  margin-left:-8px;
  gap:10px}:where(.public-share) main {
  margin:28px auto;
  padding:0 18px}:where(.public-share) .intro {
  gap:12px}:where(.public-share) h1 {
  font-size:23px}:where(.public-share) .hero-icon {
  padding:13px}:where(.public-share) .details {
  grid-template-columns:1fr;
  padding:18px;
  gap:18px}:where(.public-share) .row {
  grid-template-columns:minmax(0,1fr) 65px 104px;
  gap:8px;
  padding:16px 14px}:where(.public-share) .modified {
  display:none}:where(.public-share) .row.heading .modified {
  display:none}:where(.public-share) .footer {
  flex-wrap:wrap}:where(.public-share) .pill {
  font-size:11px}:where(.public-share) .notice {
  margin-top:20px}
}:where(.public-share) .row:hover {background:color-mix(in srgb,var(--accent) 4%,white)}:where(.public-share) .action {display:flex;justify-content:flex-end;gap:6px}:where(.public-share) .icon-button {display:inline-flex;align-items:center;justify-content:center;width:30px;height:32px;border-radius:6px;color:var(--accent)}:where(.public-share) .icon-button:hover {background:color-mix(in srgb,var(--accent) 10%,white)}:where(.public-share) a:focus-visible {outline:2px solid var(--accent);outline-offset:2px}:where(.public-share) .public-error {max-width:520px;margin:90px auto;background:white;border:1px solid #e0e4eb;border-radius:16px;text-align:center;padding:44px 28px}:where(.public-share) .public-error>svg {color:var(--accent);margin-bottom:24px}:where(.public-share) .public-error p {color:#768197;line-height:1.7;margin:18px 0 28px}:where(.public-share) .public-button {display:inline-flex;padding:11px 18px;background:var(--accent);color:white;border-radius:8px;margin-top:12px}:where(.public-share) .empty p {line-height:1.6;margin-top:12px}@media(max-width:640px) {:where(.public-share) .public-error {margin:40px auto;padding:32px 20px}:where(.public-share) .row {gap:6px}}:where(.public-share) .public-text-button {border:0;background:none;padding:0;color:inherit;font:inherit;cursor:pointer;text-align:left}:where(.public-share) .icon-button {border:0;background:none;cursor:pointer}:where(.public-share) nav .public-text-button,:where(.public-share) .footer .public-text-button {color:var(--accent)}:where(.public-share) .public-text-button:focus-visible,:where(.public-share) .icon-button:focus-visible {outline:2px solid var(--accent);outline-offset:2px}

`;

// server/public-share-page.ts
var escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var publicIcon = (name, size = 18, color = "currentColor") => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${(ICON_PATHS[name] || ICON_PATHS.file).map((path) => `<path d="${path}"/>`).join("")}</svg>`;
function renderPublicShell(title, content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} \xB7 Vault</title><style>:root{--accent:${ACCENTS.indigo.light};--font:${FONTS.inter.family}}${publicShareStyle}</style></head><body class="public-share"><header class="topbar"><a class="brand" href="/"><span>\u25C6</span>Vault</a><span class="pill">Shared with you</span></header><main>${content}</main></body></html>`;
}
function renderPublicError(status, unavailable = false) {
  const title = status >= 500 ? "Something went wrong" : unavailable ? "Files unavailable" : "Page not found";
  const message = status >= 500 ? "We could not load this share. Please try again later." : unavailable ? "This link may have expired, been revoked, or the files may have been removed. Ask the sender for a new link." : "The page you are looking for does not exist. Check the link and try again.";
  return renderPublicShell(title, `<section class="public-error">${publicIcon(unavailable ? "lock" : "file", 44)}<span class="label">${status >= 500 ? "Unable to load" : "404 \xB7 Unavailable"}</span><h1>${title}</h1><p>${message}</p><a class="public-button" href="/">Go to Vault</a></section>`);
}

// server/not-found.ts
function notFound(req, res) {
  res.set({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", Vary: "Accept" });
  if ((req.method === "GET" || req.method === "HEAD") && req.get("accept")?.includes("text/html") && req.accepts(["html", "json"]) === "html") {
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'");
    res.status(404).type("html").send(renderPublicError(404));
    return;
  }
  res.status(404).json({ error: "Not found" });
}

// server/app.ts
import express6 from "express";
import cookieParser from "cookie-parser";

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
import { rateLimit } from "express-rate-limit";
var SESSION_COOKIE = "vault_session";
function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2147483647 ? parsed : fallback;
}
var AUTH_RATE_WINDOW_MS = positiveInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1e3);
var AUTH_RATE_LIMIT_MAX = positiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 10);
function createAuthRateLimiter(action) {
  return rateLimit({
    windowMs: AUTH_RATE_WINDOW_MS,
    limit: AUTH_RATE_LIMIT_MAX,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => {
      const retryAfterSeconds = Number(res.getHeader("Retry-After")) || Math.ceil(AUTH_RATE_WINDOW_MS / 1e3);
      const minutes = Math.ceil(retryAfterSeconds / 60);
      res.status(429).json({
        error: `Too many ${action} attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        retryAfterSeconds
      });
    }
  });
}
var authRateLimiter = createAuthRateLimiter("login");
var setupRateLimiter = createAuthRateLimiter("setup");
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
authRouter.post("/setup", setupRateLimiter, async (req, res) => {
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
authRouter.post("/login", authRateLimiter, async (req, res) => {
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

// server/public-preview-data.ts
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// src/lib/filetype.ts
var IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico", "avif"];
var VIDEO_EXT = ["mp4", "mov", "webm", "m4v", "ogv", "mkv"];
var AUDIO_EXT = ["mp3", "wav", "flac", "ogg", "oga", "aac", "m4a"];
var WORD_EXT = ["docx", "doc", "odt", "rtf", "dot", "dotx"];
var EXCEL_EXT = ["xlsx", "xls", "xlsm", "xlsb", "ods"];
var TEXT_EXT = [
  "txt",
  "md",
  "markdown",
  "json",
  "js",
  "jsx",
  "ts",
  "tsx",
  "css",
  "scss",
  "sass",
  "less",
  "html",
  "htm",
  "xml",
  "yaml",
  "yml",
  "csv",
  "tsv",
  "log",
  "sh",
  "bash",
  "zsh",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "php",
  "sql",
  "toml",
  "ini",
  "env",
  "conf",
  "cfg",
  "gitignore",
  "editorconfig",
  "lock",
  "map",
  "vue",
  "svelte",
  "graphql",
  "prisma",
  "properties",
  "gradle",
  "tf",
  "proto"
];
function extOf(name) {
  const parts = name.split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase();
}
function isEnvFile(name) {
  const lower = name.toLowerCase();
  return lower === ".env" || lower === "env" || lower.startsWith(".env.") || lower.endsWith(".env");
}
function fileKind(name) {
  if (isEnvFile(name)) return "env";
  const ext = extOf(name);
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  if (AUDIO_EXT.includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (WORD_EXT.includes(ext)) return "word";
  if (EXCEL_EXT.includes(ext)) return "excel";
  if (TEXT_EXT.includes(ext)) return "text";
  return "other";
}

// server/bucket-protection.ts
import { createHash as createHash2, randomUUID as randomUUID2 } from "node:crypto";
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
  return createHash2("sha256").update(cookie).digest("hex");
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

// server/media-types.ts
var mediaMime = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", avif: "image/avif", bmp: "image/bmp", ico: "image/x-icon", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/mp4", mkv: "video/x-matroska", mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", ogv: "video/ogg", m4a: "audio/mp4", flac: "audio/flac", aac: "audio/aac", pdf: "application/pdf" };

// server/public-preview-data.ts
async function publicPreviewData(s3, share, key, req, res) {
  if (key.endsWith("/")) throw new BucketAccessError(404, "Item not shared");
  const object = await s3.send(new HeadObjectCommand({ Bucket: share.bucket, Key: key }));
  const name = key.split("/").pop() || "File";
  if (req.query.metadata === "1") {
    res.json({ file: { key, name, isFolder: false, size: object.ContentLength || 0, lastModified: object.LastModified?.toISOString() || "" }, root: share.key, expiresAt: share.expiresAt });
    return;
  }
  const mime = mediaMime[extOf(name)];
  if (mime) {
    const ttl = share.expiresAt ? Math.min(60, Math.floor((share.expiresAt.getTime() - Date.now()) / 1e3)) : 60;
    if (ttl < 1) throw new BucketAccessError(404, "Share unavailable or expired");
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: share.bucket, Key: key, ResponseContentType: mime, ResponseContentDisposition: "inline" }), { expiresIn: ttl });
    res.redirect(303, url);
    return;
  }
  const kind = fileKind(name);
  const limit = kind === "text" || kind === "env" ? 1e6 : 20 * 1024 * 1024;
  if ((object.ContentLength || 0) > limit) throw new BucketAccessError(413, "File too large to preview. Download it instead.");
  const result = await s3.send(new GetObjectCommand({ Bucket: share.bucket, Key: key, Range: `bytes=0-${limit}` }));
  const chunks = [];
  let bytes = 0;
  if (result.Body) for await (const chunk of result.Body) {
    const data = Buffer.from(chunk);
    bytes += data.length;
    if (bytes > limit) throw new BucketAccessError(413, "File too large to preview. Download it instead.");
    chunks.push(data);
  }
  res.set({ "Content-Type": extOf(name) === "svg" ? "image/svg+xml" : "application/octet-stream", "Content-Disposition": "attachment", "Content-Security-Policy": "sandbox; default-src 'none'" });
  res.send(Buffer.concat(chunks));
}

// server/share-token.ts
import { createCipheriv, createDecipheriv, createHash as createHash3, randomBytes } from "node:crypto";
function encryptionKey() {
  const secret = process.env.SHARE_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("SHARE_TOKEN_SECRET or JWT_SECRET is required");
  return createHash3("sha256").update("vault:share-token:v1:").update(secret || "dev-insecure-secret-change-me").digest();
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
import { HeadObjectCommand as HeadObjectCommand2, ListObjectsV2Command, GetObjectCommand as GetObjectCommand2 } from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrl2 } from "@aws-sdk/s3-request-presigner";
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
    const { bucket, key, folder, duration, customHours } = req.body || {};
    if (typeof bucket !== "string" || !bucket || typeof key !== "string" || !key || !safeKey(key) || typeof folder !== "boolean" || folder !== key.endsWith("/")) throw new BucketAccessError(400, "Select a valid file or folder");
    const metadata = await protection.authorize(req, bucket);
    const hours = duration === "custom" ? customHours : { "1h": 1, "6h": 6, "24h": 24 }[duration];
    if (duration !== "permanent" && (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0 || hours > 87600)) throw new BucketAccessError(400, "Choose an expiry between 0 and 87,600 hours");
    if (folder) {
      const result = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key, MaxKeys: 1 }));
      if (!result.Contents?.length) throw new BucketAccessError(404, "Folder not found");
    } else await s3.send(new HeadObjectCommand2({ Bucket: bucket, Key: key }));
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
      expiresAt: duration === "permanent" ? null : new Date(Date.now() + hours * 36e5),
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
    res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src https: http:; media-src https: http:; frame-src https: http:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" });
    next();
  });
  publicRouter.get("/:token", asyncRoute(async (req, res) => {
    const token = String(req.params.token);
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new BucketAccessError(404, "Share unavailable or expired");
    const share = await store.findToken(hash(token));
    if (!share || share.revoked || share.expiresAt && share.expiresAt.getTime() <= Date.now()) throw new BucketAccessError(404, "Share unavailable or expired");
    const owner = await protection.store.find(share.bucket);
    if (share.privateOwner && (!owner || owner.state !== "active" || owner.ownerId !== share.privateOwner) || !share.privateOwner && (owner || share.bucket.startsWith(PRIVATE_BUCKET_PREFIX))) throw new BucketAccessError(404, "Share unavailable or expired");
    let requested = req.query.key === void 0 ? share.key : req.query.key;
    if (typeof requested !== "string" || !safeKey(requested) || (share.folder ? !requested.startsWith(share.key) : requested !== share.key)) throw new BucketAccessError(404, "Item not shared");
    if (req.query.download === "1") {
      if (requested.endsWith("/")) throw new BucketAccessError(400, "Choose a file to download");
      const ttl = share.expiresAt ? Math.min(60, Math.floor((share.expiresAt.getTime() - Date.now()) / 1e3)) : 60;
      if (ttl < 1) throw new BucketAccessError(404, "Share unavailable or expired");
      await s3.send(new HeadObjectCommand2({ Bucket: share.bucket, Key: requested }));
      const filename = encodeURIComponent(requested.split("/").pop() || "download");
      const url = await getSignedUrl2(s3, new GetObjectCommand2({ Bucket: share.bucket, Key: requested, ResponseContentDisposition: `attachment; filename="${filename}"; filename*=UTF-8''${filename}`, ResponseContentType: "application/octet-stream" }), { expiresIn: ttl });
      res.redirect(303, url);
      return;
    }
    if (req.query.preview === "1") {
      if (requested.endsWith("/")) throw new BucketAccessError(404, "Item not shared");
      res.redirect(303, `/share#${new URLSearchParams({ token, key: requested, preview: "1" })}`);
      return;
    }
    if (req.query.metadata === "1" || req.query.raw === "1") {
      await publicPreviewData(s3, share, requested, req, res);
      return;
    }
    if (req.query.view !== "1") {
      res.redirect(303, `/share#${new URLSearchParams({ token, key: requested })}`);
      return;
    }
    if (share.folder && !requested.endsWith("/")) requested = requested.slice(0, requested.lastIndexOf("/") + 1);
    const profile = await getSharer(share.ownerId);
    const sharer = profile?.name?.trim() || share.sharerName || profile?.email.split("@")[0] || "Vault member";
    let entries;
    let nextCursor;
    if (share.folder && requested.endsWith("/")) {
      const cursor = req.query.cursor;
      if (cursor !== void 0 && (typeof cursor !== "string" || cursor.length > 4096)) throw new BucketAccessError(400, "Invalid page");
      const result = await s3.send(new ListObjectsV2Command({ Bucket: share.bucket, Prefix: requested, Delimiter: "/", MaxKeys: 100, ContinuationToken: cursor }));
      if (!cursor && !result.Contents?.length && !result.CommonPrefixes?.length) {
        await s3.send(new HeadObjectCommand2({ Bucket: share.bucket, Key: requested }));
      }
      entries = [
        ...(result.CommonPrefixes || []).filter((p) => p.Prefix?.startsWith(requested)).map((p) => ({ key: p.Prefix, folder: true })),
        ...(result.Contents || []).filter((o) => o.Key && o.Key !== requested && o.Key.startsWith(requested)).map((o) => ({ key: o.Key, folder: false, size: o.Size, modified: o.LastModified }))
      ];
      nextCursor = result.IsTruncated ? result.NextContinuationToken : void 0;
    } else {
      const object = await s3.send(new HeadObjectCommand2({ Bucket: share.bucket, Key: requested }));
      entries = [{ key: requested, folder: false, size: object.ContentLength, modified: object.LastModified }];
    }
    res.json({
      root: share.key,
      requested,
      folder: share.folder,
      sharer,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      nextCursor,
      preferences: profile?.preferences,
      entries: entries.map((entry) => ({
        key: entry.key,
        name: entry.key.split("/").filter(Boolean).pop() || entry.key,
        isFolder: entry.folder,
        size: entry.size || 0,
        lastModified: entry.modified?.toISOString() || ""
      }))
    });
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
  publicRouter.use((_req, res) => {
    res.status(404).type("html").send(renderPublicError(404));
  });
  publicRouter.use((err, _req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const missing = ["NoSuchKey", "NotFound", "NoSuchBucket"].includes(err?.name);
    const status = err instanceof BucketAccessError ? err.status : missing ? 404 : 500;
    res.status(status).type("html").send(renderPublicError(status, status < 500));
  });
  return { management, publicRouter };
}

// server/uploads.ts
import { createHash as createHash5 } from "node:crypto";
import express4 from "express";
import jwt2 from "jsonwebtoken";
import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, ListPartsCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrl3 } from "@aws-sdk/s3-request-presigner";

// src/lib/uploadPolicy.ts
var UPLOAD_CHUNK_BYTES = 8 * 1024 * 1024;
var MAX_UPLOAD_BYTES = 5 * 1024 ** 4;
function uploadPartSize(size) {
  return Math.max(UPLOAD_CHUNK_BYTES, Math.ceil(size / 1e4 / (1024 * 1024)) * 1024 * 1024);
}

// server/uploads.ts
var audience = "vault:multipart:v1";
function ticketSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw Error("JWT_SECRET must be set in production");
  return createHash5("sha256").update(audience).update(secret || "dev-insecure-secret-change-me").digest();
}
function readTicket(req) {
  try {
    if (typeof req.body?.ticket !== "string" || req.body.ticket.length > 16384) throw Error();
    const value = jwt2.verify(req.body.ticket, ticketSecret(), { algorithms: ["HS256"], audience });
    if (value.owner !== bucketUser(req).id || value.session !== bucketSession(req)) throw Error();
    return value;
  } catch {
    throw new BucketAccessError(403, "This upload session is invalid or expired. Start the upload again.");
  }
}
function validUploadKey(value) {
  return typeof value === "string" && value.length > 0 && Buffer.byteLength(value) <= 1024 && !value.endsWith("/") && ![...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);
}
function createUploadRouter(s3, signer, protection, authenticate) {
  const router = express4.Router();
  router.use(authenticate, express4.json({ limit: "32kb" }));
  router.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  router.post("/start", async (req, res, next) => {
    try {
      const { bucket, key, size, contentType } = req.body || {};
      if (typeof bucket !== "string" || !bucket || !validUploadKey(key) || !Number.isSafeInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES || typeof contentType !== "string" || contentType.length > 255 || /[\r\n]/.test(contentType)) {
        throw new BucketAccessError(400, "Invalid upload details or unsupported file size");
      }
      await protection.authorize(req, bucket);
      const owner = bucketUser(req).id, session = bucketSession(req), secret = ticketSecret();
      const result = await s3.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType || "application/octet-stream" }));
      if (!result.UploadId) throw Error("Storage returned no upload ID");
      const ticket = { owner, session, bucket, key, uploadId: result.UploadId, size, partSize: uploadPartSize(size) };
      res.json({ ticket: jwt2.sign(ticket, secret, { audience, expiresIn: "24h", algorithm: "HS256" }), partSize: ticket.partSize, partCount: Math.ceil(size / ticket.partSize) });
    } catch (err) {
      next(err);
    }
  });
  router.post("/part", async (req, res, next) => {
    try {
      const ticket = readTicket(req);
      const metadata = await protection.authorize(req, ticket.bucket);
      const part = req.body.partNumber;
      if (!Number.isInteger(part) || part < 1 || part > Math.ceil(ticket.size / ticket.partSize)) throw new BucketAccessError(400, "Invalid upload part");
      const ttl = metadata ? Math.max(1, Math.min(PRIVATE_URL_SECONDS, Math.floor(((await protection.grantExpiry(req, metadata))?.getTime() || 0) / 1e3 - Date.now() / 1e3))) : 900;
      const uploadUrl = await getSignedUrl3(signer, new UploadPartCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId, PartNumber: part, ContentLength: Math.min(ticket.partSize, ticket.size - (part - 1) * ticket.partSize) }), { expiresIn: ttl });
      res.json({ uploadUrl });
    } catch (err) {
      next(err);
    }
  });
  router.post("/complete", async (req, res, next) => {
    try {
      const ticket = readTicket(req);
      await protection.authorize(req, ticket.bucket);
      const parts = [];
      let marker;
      do {
        const page = await s3.send(new ListPartsCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId, PartNumberMarker: marker, MaxParts: 1e3 }));
        for (const part of page.Parts || []) {
          const number = parts.length + 1;
          const expected = Math.min(ticket.partSize, ticket.size - (number - 1) * ticket.partSize);
          if (number > 1e4 || part.PartNumber !== number || expected <= 0 || part.Size !== expected || !part.ETag) throw new BucketAccessError(409, "Uploaded parts are incomplete or have the wrong size. Please retry the upload.");
          parts.push({ PartNumber: number, ETag: part.ETag });
        }
        if (page.IsTruncated && (!page.NextPartNumberMarker || page.NextPartNumberMarker === marker || !page.Parts?.length)) throw new BucketAccessError(502, "Storage returned invalid upload pagination");
        marker = page.IsTruncated ? page.NextPartNumberMarker : void 0;
      } while (marker);
      if (parts.length !== Math.ceil(ticket.size / ticket.partSize)) throw new BucketAccessError(409, "Some upload parts are missing. Please retry the upload.");
      await protection.authorize(req, ticket.bucket);
      await s3.send(new CompleteMultipartUploadCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId, MultipartUpload: { Parts: parts } }));
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });
  router.post("/abort", async (req, res, next) => {
    try {
      const ticket = readTicket(req);
      await s3.send(new AbortMultipartUploadCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId }));
      res.json({ success: true });
    } catch (err) {
      if (err?.name === "NoSuchUpload") {
        res.json({ success: true });
        return;
      }
      next(err);
    }
  });
  return router;
}

// server/object-metadata.ts
import { HeadObjectCommand as HeadObjectCommand3, ListObjectsV2Command as ListObjectsV2Command2 } from "@aws-sdk/client-s3";
async function getObjectMetadata(s3, bucket, key) {
  if (!key.endsWith("/")) {
    const object = await s3.send(new HeadObjectCommand3({ Bucket: bucket, Key: key }));
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
  let size = 0, fileCount = 0, latest = 0, pages = 0;
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
        size += object.Size || 0;
      }
    }
    cursor = page.IsTruncated ? page.NextContinuationToken : void 0;
    pages++;
  } while (cursor && pages < 10);
  return { key, isFolder: true, size, fileCount, folderCount: folders.size, lastModified: latest ? new Date(latest).toISOString() : void 0, partial: !!cursor };
}

// server/s3.ts
import express5 from "express";
import {
  S3Client as S3Client2,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command as ListObjectsV2Command3,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand as GetObjectCommand3,
  HeadBucketCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrl4 } from "@aws-sdk/s3-request-presigner";
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
function createStorageClient(publicEndpoint = false) {
  return new S3Client2({
    endpoint: publicEndpoint && process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || "http://localhost:9000",
    // Presigned browser PUTs have no body at signing time; avoid signing an empty-body CRC32.
    requestChecksumCalculation: "WHEN_REQUIRED",
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || "admin",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "password"
    },
    forcePathStyle: true
  });
}
function createS3Router(protection = new BucketProtection(), authenticate = (_req, _res, next) => next()) {
  const s3 = createStorageClient();
  const uploadSigner = createStorageClient(true);
  const defaultBucket = process.env.MINIO_BUCKET || "fruitms-public-local";
  const privateBucket = process.env.MINIO_PRIVATE_BUCKET || "shared-files";
  console.log(`[vault] S3 endpoint: ${process.env.MINIO_ENDPOINT || "http://localhost:9000"}`);
  console.log(`[vault] default bucket: ${defaultBucket} | private bucket: ${privateBucket}`);
  const router = express5.Router();
  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  router.use("/uploads", createUploadRouter(s3, uploadSigner, protection, authenticate));
  router.get("/health", authenticate, (_req, res) => {
    res.json({ status: "ok" });
  });
  router.get("/buckets", authenticate, wrap(async (req, res) => {
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
  router.post("/buckets", authenticate, express5.json(), wrap(async (req, res) => {
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
  router.post("/buckets/:name/unlock", authenticate, express5.json(), wrap(async (req, res) => {
    res.json({ details: await protection.unlock(req, String(req.params.name), req.body?.password) });
  }));
  router.post("/buckets/:name/lock", authenticate, wrap(async (req, res) => {
    const bucket = await protection.owned(req, String(req.params.name));
    await protection.store.revoke(bucket._id);
    res.json({ details: { name: bucket._id, label: bucket.label, isPrivate: true, locked: true } });
  }));
  router.patch("/buckets/:name/password", authenticate, express5.json(), wrap(async (req, res) => {
    const bucket = await protection.owned(req, String(req.params.name));
    const error = validateBucketPassword(req.body?.newPassword);
    if (error) throw new BucketAccessError(400, error);
    await protection.checkPassword(req, bucket, req.body?.currentPassword);
    const changed = await protection.store.changePassword(bucket._id, bucket.version, await bcrypt4.hash(req.body.newPassword, 12));
    if (!changed) throw new BucketAccessError(409, "Bucket changed. Please try again.");
    res.json({ details: { name: bucket._id, label: bucket.label, isPrivate: true, locked: true } });
  }));
  router.delete("/buckets/:name", authenticate, express5.json(), wrap(async (req, res) => {
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
  router.use("/folders", express5.json());
  const filePaths = /* @__PURE__ */ new Set(["/files", "/upload-url", "/upload", "/download", "/raw", "/folders", "/metadata"]);
  router.use((req, res, next) => {
    const routePath = req.path.toLowerCase().replace(/\/+$/, "");
    if (!filePaths.has(routePath)) {
      next();
      return;
    }
    authenticate(req, res, (authError) => {
      if (authError) {
        next(authError);
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
        let size = 0;
        let lastModified = "";
        try {
          const folderObjects = await s3.send(
            new ListObjectsV2Command3({ Bucket: bucket, Prefix: folderPrefix })
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
    const bucket = res.locals.bucket;
    const key = req.query.key || "";
    const contentType = req.query.contentType || "application/octet-stream";
    if (!validUploadKey(key)) {
      res.status(400).json({ error: "A valid file key is required" });
      return;
    }
    const uploadUrl = await getSignedUrl4(
      uploadSigner,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      }),
      { expiresIn: res.locals.urlTtl }
    );
    res.json({ uploadUrl, bucket, key });
  }));
  router.put("/upload", (_req, res) => {
    res.status(410).json({ error: "Proxy uploads are no longer supported. Refresh Vault to upload directly to storage." });
  });
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
    const signedUrl = await getSignedUrl4(
      s3,
      new GetObjectCommand3({ Bucket: bucket, Key: key }),
      { expiresIn: res.locals.urlTtl }
    );
    res.json({ url: signedUrl });
  }));
  router.get("/raw", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const key = req.query.key || "";
    const redirect = req.query.redirect === "true";
    const mediaType = mediaMime[key.split(".").pop()?.toLowerCase() || ""];
    const isMedia = /^(audio|video)\//.test(mediaType || "");
    const shouldRedirect = redirect || Boolean(process.env.VERCEL) && isMedia;
    if (shouldRedirect) {
      const signedUrl = await getSignedUrl4(
        s3,
        new GetObjectCommand3({ Bucket: bucket, Key: key, ...mediaType ? { ResponseContentType: mediaType, ResponseContentDisposition: "inline" } : {} }),
        { expiresIn: res.locals.urlTtl }
      );
      res.redirect(307, signedUrl);
      return;
    }
    const rangeHeader = req.headers.range;
    const object = await s3.send(
      new GetObjectCommand3({
        Bucket: bucket,
        Key: key,
        ...rangeHeader ? { Range: rangeHeader } : {}
      })
    );
    const filename = key.split("/").pop() || "file";
    const isPartial = !!rangeHeader && !!object.ContentRange;
    let mimeType = object.ContentType || "application/octet-stream";
    if (mediaType && mimeType === "application/octet-stream") {
      mimeType = mediaType;
    }
    const headers = {
      "Content-Type": mimeType,
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
  router.post("/folders", express5.json(), wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const path = req.body?.path || "";
    const folderPath = path.endsWith("/") ? path : path + "/";
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: folderPath, Body: Buffer.alloc(0) })
    );
    res.json({ success: true });
  }));
  router.post("/ensure-bucket", authenticate, requireAdmin, wrap(async (req, res) => {
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
var app = express6();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cookieParser());
var DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' blob: https: http:",
  "frame-src 'self' blob:",
  "frame-ancestors 'self'",
  "connect-src 'self' https: http: ws: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join("; ");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Content-Security-Policy", DEFAULT_CSP);
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
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
app.use("/api/auth", express6.json(), authRouter);
app.use("/api/users", requireAuth, requireAdmin, express6.json(), usersRouter);
var shares = createShareRouters(createStorageClient());
app.use("/api/public", shares.publicRouter);
app.use("/api/shares", requireAuth, shares.management);
app.use("/api", createS3Router(void 0, requireAuth));
app.use("/api", notFound);
app.use((err, req, res, next) => {
  if (!req.path.startsWith("/api")) return next(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[vault]", req.method, req.path.startsWith("/api/public/") ? "/api/public/[redacted]" : req.path, "\u2192", message);
  if (res.headersSent) return next(err);
  if (req.path.startsWith("/api/public")) {
    res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" });
    res.status(500).type("html").send(renderPublicError(500));
    return;
  }
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
