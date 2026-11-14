// src/lib/iconPaths.ts
var ICON_PATHS = {
  dashboard: ["M3 3h7v7H3z", "M14 3h7v11h-7z", "M3 14h7v7H3z", "M14 18h7v3h-7z"],
  pin: [
    "M12 17v5",
    "M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V5h1a1 1 0 000-2H8a1 1 0 000 2h1v5.76z"
  ],
  info: ["M12 22a10 10 0 100-20 10 10 0 000 20", "M12 11v6", "M12 7h.01"],
  link: ["M10 13a5 5 0 007 .5l3-3a5 5 0 00-7-7l-1.7 1.7", "M14 11a5 5 0 00-7-.5l-3 3a5 5 0 007 7l1.7-1.7"],
  list: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
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
  minus: ["M5 12h14"],
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
  edit: [
    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7",
    "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
  ],
  pencil: [
    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7",
    "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
  ],
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
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  // Media & Audio Playback
  play: ["M6 4l14 8-14 8V4z"],
  pause: ["M6 4h4v16H6z", "M14 4h4v16h-4z"],
  skipBack: ["M19 20L9 12l10-8v16z", "M5 19V5"],
  skipForward: ["M5 4l10 8-10 8V4z", "M19 5v14"],
  repeat: [
    "M17 1l4 4-4 4",
    "M3 11V9a4 4 0 014-4h14",
    "M7 23l-4-4 4-4",
    "M21 13v2a4 4 0 01-4 4H3"
  ],
  repeatOne: [
    "M17 1l4 4-4 4",
    "M3 11V9a4 4 0 014-4h14",
    "M7 23l-4-4 4-4",
    "M21 13v2a4 4 0 01-4 4H3",
    "M11 10h1v4",
    "M10 14h3"
  ],
  shuffle: [
    "M16 3h5v5",
    "M4 20l5.5-5.5",
    "M21 3l-7 7",
    "M4 4l7 7",
    "M14.5 14.5L21 21",
    "M21 21h-5v-5"
  ],
  volumeLow: [
    "M11 5L6 9H2v6h4l5 4V5z",
    "M15.54 8.46a5 5 0 010 7.07"
  ],
  volumeHigh: [
    "M11 5L6 9H2v6h4l5 4V5z",
    "M15.54 8.46a5 5 0 010 7.07",
    "M19.07 4.93a10 10 0 010 14.14"
  ],
  volumeMute: [
    "M11 5L6 9H2v6h4l5 4V5z",
    "M23 9l-6 6",
    "M17 9l6 6"
  ],
  fullscreen: [
    "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
  ],
  minimize: [
    "M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"
  ],
  pip: [
    "M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z",
    "M13 11h6v6h-6z"
  ]
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
  return ANIMATION_DIRECTIONS.some((option) => option.value === settings.direction) && ANIMATION_DENSITIES.some((option) => option.value === settings.density) && Object.entries(limits).every(([key2, range]) => typeof settings[key2] === "number" && Number.isFinite(settings[key2]) && settings[key2] >= range.min && settings[key2] <= range.max) && typeof settings.color === "string" && (settings.color === "theme" || /^#[0-9a-f]{6}$/i.test(settings.color));
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
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_RAIN, key2)) && isAnimationAppearance(settings, RAIN_LIMITS) && typeof settings.splash === "boolean";
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
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_LEAVES, key2)) && isAnimationAppearance(settings, LEAF_LIMITS) && typeof settings.breeze === "boolean";
}

// src/lib/zen.ts
var ZEN_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 2, max: 6, step: 0.5 },
  width: { min: 2, max: 6, step: 0.5 }
};
var ZEN_SCENE_LIMITS = { min: 90, max: 240, step: 10 };
var DEFAULT_ZEN = {
  direction: "down",
  density: "balanced",
  speed: 1,
  height: 3,
  width: 3,
  color: "theme",
  bonsai: true,
  sand: true,
  rocks: true,
  lantern: true,
  motes: true,
  sceneHeight: 170
};
function isZenSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_ZEN, key2)) && isAnimationAppearance(settings, ZEN_LIMITS) && ["bonsai", "sand", "rocks", "lantern", "motes"].every((key2) => typeof settings[key2] === "boolean") && typeof settings.sceneHeight === "number" && Number.isFinite(settings.sceneHeight) && settings.sceneHeight >= ZEN_SCENE_LIMITS.min && settings.sceneHeight <= ZEN_SCENE_LIMITS.max;
}

// src/lib/water.ts
var WATER_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 8, max: 30, step: 1 },
  width: { min: 6, max: 24, step: 1 }
};
var RIPPLE_SIZE_LIMITS = { min: 40, max: 180, step: 5 };
var DEFAULT_WATER = {
  direction: "down",
  density: "balanced",
  speed: 1,
  height: 18,
  width: 12,
  color: "theme",
  petals: true,
  rippleSize: 100
};
function isWaterSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_WATER, key2)) && isAnimationAppearance(settings, WATER_LIMITS) && typeof settings.petals === "boolean" && typeof settings.rippleSize === "number" && Number.isFinite(settings.rippleSize) && settings.rippleSize >= RIPPLE_SIZE_LIMITS.min && settings.rippleSize <= RIPPLE_SIZE_LIMITS.max;
}

// src/lib/snow.ts
var SNOW_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 2, max: 10, step: 0.5 },
  width: { min: 2, max: 10, step: 0.5 }
};
var FROST_HEIGHT_LIMITS = { min: 8, max: 48, step: 1 };
var DEFAULT_SNOW = {
  direction: "down",
  density: "balanced",
  speed: 1,
  height: 5,
  width: 5,
  color: "theme",
  accumulation: true,
  glisten: true,
  frostHeight: 24
};
function isSnowSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_SNOW, key2)) && isAnimationAppearance(settings, SNOW_LIMITS) && typeof settings.accumulation === "boolean" && typeof settings.glisten === "boolean" && typeof settings.frostHeight === "number" && Number.isFinite(settings.frostHeight) && settings.frostHeight >= FROST_HEIGHT_LIMITS.min && settings.frostHeight <= FROST_HEIGHT_LIMITS.max;
}

// src/lib/starfield.ts
var STARFIELD_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 1, max: 4, step: 0.25 },
  width: { min: 1, max: 4, step: 0.25 }
};
var STARFIELD_EXTRA_LIMITS = {
  parallax: { min: 0, max: 2, step: 0.1 },
  meteorFrequency: { min: 1, max: 12, step: 1 },
  meteorSpeed: { min: 0.5, max: 2, step: 0.1 }
};
var DEFAULT_STARFIELD = {
  direction: "down-right",
  density: "balanced",
  speed: 1,
  height: 2,
  width: 2,
  color: "theme",
  parallax: 0.7,
  shootingStars: true,
  meteorFrequency: 4,
  meteorSpeed: 1
};
function isStarfieldSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_STARFIELD, key2)) && isAnimationAppearance(settings, STARFIELD_LIMITS) && typeof settings.shootingStars === "boolean" && Object.entries(STARFIELD_EXTRA_LIMITS).every(([key2, range]) => typeof settings[key2] === "number" && Number.isFinite(settings[key2]) && settings[key2] >= range.min && settings[key2] <= range.max);
}

// src/lib/autumn.ts
var AUTUMN_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 14, max: 48, step: 1 },
  width: { min: 14, max: 48, step: 1 }
};
var DEFAULT_AUTUMN = {
  direction: "down-right",
  density: "balanced",
  speed: 1,
  height: 26,
  width: 28,
  breeze: true,
  pile: true,
  color: "#c98236"
};
function isAutumnSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value;
  return Object.keys(settings).every((key2) => Object.hasOwn(DEFAULT_AUTUMN, key2)) && isAnimationAppearance(settings, AUTUMN_LIMITS) && typeof settings.breeze === "boolean" && typeof settings.pile === "boolean";
}

// src/lib/animationCatalog.ts
function defineAnimation(definition) {
  return definition;
}
var ANIMATION_CATALOG = {
  rain: defineAnimation({
    label: "Rain",
    description: "Soft, flowing streaks",
    particle: "Drop",
    defaults: DEFAULT_RAIN,
    limits: RAIN_LIMITS,
    validate: isRainSettings,
    switches: [{ key: "splash", label: "Splash", description: "Small ripples where drops meet the bottom edge." }]
  }),
  leaves: defineAnimation({
    label: "Falling leaves",
    description: "Leaves on a gentle breeze",
    particle: "Leaf",
    defaults: DEFAULT_LEAVES,
    limits: LEAF_LIMITS,
    validate: isLeafSettings,
    switches: [{ key: "breeze", label: "Breeze", description: "Delicate wind trails drift between the falling leaves." }]
  }),
  autumn: defineAnimation({
    label: "Autumn",
    description: "Maple leaves, a soft pile, a sweeping wind",
    particle: "Leaf",
    defaults: DEFAULT_AUTUMN,
    limits: AUTUMN_LIMITS,
    validate: isAutumnSettings,
    switches: [
      { key: "pile", label: "Leaf pile", description: "Leaves gradually gather along the bottom edge." },
      { key: "breeze", label: "Wind sweep", description: "An occasional swirl clears the pile, making room for new leaves." }
    ],
    hint: "With wind off, the pile fills and stays. Previews cycle faster so you can see the sweep."
  }),
  snow: defineAnimation({
    label: "Snow",
    description: "Glistening flakes and a soft frost layer",
    particle: "Flake",
    defaults: DEFAULT_SNOW,
    limits: SNOW_LIMITS,
    validate: isSnowSettings,
    controls: { uniformSize: true },
    switches: [
      { key: "accumulation", label: "Frost layer", description: "Snow settles into a soft, glowing bank along the bottom edge." },
      { key: "glisten", label: "Glisten", description: "Brighter flakes softly twinkle as they fall." }
    ],
    ranges: [{ key: "frostHeight", label: "Frost height", ...FROST_HEIGHT_LIMITS, unit: " px", enabledBy: "accumulation" }],
    hint: "The frost builds gradually and stays shallow. Previews accumulate faster."
  }),
  water: defineAnimation({
    label: "Water Ripple",
    description: "Gentle ripples and floating blossom petals",
    particle: "Petal",
    defaults: DEFAULT_WATER,
    limits: WATER_LIMITS,
    validate: isWaterSettings,
    controls: { direction: false, speedLabel: "Flow speed" },
    switches: [{ key: "petals", label: "Floating petals", description: "Cherry blossom petals gently bob and sway with the ripples." }],
    ranges: [{ key: "rippleSize", label: "Ripple size", ...RIPPLE_SIZE_LIMITS, unit: " px" }],
    hint: "A quiet water surface with slow currents. Turn petals off for ripples alone."
  }),
  zen: defineAnimation({
    label: "Zen Garden",
    description: "Growing bonsai, wind-carried leaves and lantern light",
    particle: "Particle",
    defaults: DEFAULT_ZEN,
    limits: ZEN_LIMITS,
    validate: isZenSettings,
    controls: { direction: false, speedLabel: "Garden speed", uniformSize: true },
    switches: [
      { key: "bonsai", label: "Bonsai", description: "A repeating growth, bloom and falling-leaf cycle, with leaves carried across the sky." },
      { key: "sand", label: "Raked sand", description: "Flowing rake patterns and expanding rings around the stones." },
      { key: "rocks", label: "Garden rocks", description: "A small cluster of weathered stones." },
      { key: "lantern", label: "Lantern", description: "A warm light that softly brightens and dims." },
      { key: "motes", label: "Breeze and motes", description: "Visible wind trails and drifting specks throughout the background." }
    ],
    ranges: [{ key: "sceneHeight", label: "Garden height", ...ZEN_SCENE_LIMITS, unit: " px" }],
    hint: "Speed controls every motion, including tree growth and lantern flicker. Size and density affect airborne leaves and motes. Garden height scales the ground scene; previews and mobile screens use a smaller scale."
  }),
  starfield: defineAnimation({
    label: "Starfield",
    description: "Twinkling stars and passing meteors",
    particle: "Star",
    defaults: DEFAULT_STARFIELD,
    limits: STARFIELD_LIMITS,
    validate: isStarfieldSettings,
    controls: { direction: false, speedLabel: "Twinkle speed", uniformSize: true },
    switches: [{ key: "shootingStars", label: "Shooting stars", description: "Occasional diagonal meteors with softly fading trails." }],
    ranges: [
      { key: "parallax", label: "Parallax strength", ...STARFIELD_EXTRA_LIMITS.parallax, unit: "\xD7" },
      { key: "meteorFrequency", label: "Meteor frequency", ...STARFIELD_EXTRA_LIMITS.meteorFrequency, unit: "/min", enabledBy: "shootingStars" },
      { key: "meteorSpeed", label: "Meteor speed", ...STARFIELD_EXTRA_LIMITS.meteorSpeed, unit: "\xD7", enabledBy: "shootingStars" }
    ],
    hint: "Parallax follows scrolling. Meteor timing varies; previews show them more often. Set parallax to zero for a still starfield."
  })
};
var ANIMATION_EFFECTS = Object.keys(ANIMATION_CATALOG);
var ANIMATIONS = [
  { value: "none", label: "Off", description: "A quiet background" },
  ...ANIMATION_EFFECTS.map((value) => ({ value, label: ANIMATION_CATALOG[value].label, description: ANIMATION_CATALOG[value].description }))
];
function defaultAnimationSettings() {
  return Object.fromEntries(ANIMATION_EFFECTS.map((kind) => [kind, { ...ANIMATION_CATALOG[kind].defaults }]));
}
function normalizeAnimationSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const settings = value;
  if (Object.keys(settings).some((key2) => !Object.hasOwn(ANIMATION_CATALOG, key2))) return void 0;
  for (const kind of ANIMATION_EFFECTS) {
    if (Object.hasOwn(settings, kind) && !ANIMATION_CATALOG[kind].validate(settings[kind])) return void 0;
  }
  return { ...defaultAnimationSettings(), ...settings };
}
function isAnimationSettingsMap(value) {
  const normalized = normalizeAnimationSettings(value);
  return !!normalized && ANIMATION_EFFECTS.every((kind) => Object.hasOwn(value, kind));
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
var DEFAULT_ANIMATIONS = {
  type: "none",
  settings: defaultAnimationSettings()
};
function record(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function appearanceValid(p) {
  return (p.theme === "light" || p.theme === "dark") && typeof p.font === "string" && Object.hasOwn(FONTS, p.font) && typeof p.accent === "string" && Object.hasOwn(ACCENTS, p.accent);
}
function isPreferences(value) {
  if (!record(value) || !appearanceValid(value)) return false;
  const a = value.animations;
  return Object.keys(value).every((key2) => ["theme", "font", "accent", "animations"].includes(key2)) && record(a) && Object.keys(a).every((key2) => ["type", "settings"].includes(key2)) && ANIMATIONS.some((option) => option.value === a.type) && isAnimationSettingsMap(a.settings);
}
function normalizePreferences(value) {
  if (isPreferences(value)) return value;
  const animations = record(value) ? value.animations : void 0;
  if (record(value) && appearanceValid(value) && record(animations) && Object.keys(value).every((key2) => ["theme", "font", "accent", "animations"].includes(key2)) && Object.keys(animations).every((key2) => ["type", "settings"].includes(key2)) && ANIMATIONS.some((option) => option.value === animations.type)) {
    const settings = normalizeAnimationSettings(animations.settings);
    if (settings) return {
      theme: value.theme,
      font: value.font,
      accent: value.accent,
      animations: { type: animations.type, settings }
    };
  }
  if (!record(value) || !appearanceValid(value) || typeof value.rain !== "boolean" || !Object.keys(value).every((key2) => ["theme", "font", "accent", "rain", "rainSettings", "animation", "leafSettings"].includes(key2)) || "rainSettings" in value && !isRainSettings(value.rainSettings) || "leafSettings" in value && !isLeafSettings(value.leafSettings) || "animation" in value && !ANIMATIONS.some((option) => option.value === value.animation)) return void 0;
  return {
    theme: value.theme,
    font: value.font,
    accent: value.accent,
    animations: {
      type: value.animation ?? (value.rain ? "rain" : "none"),
      settings: { ...defaultAnimationSettings(), rain: value.rainSettings || { ...DEFAULT_RAIN }, leaves: value.leafSettings || { ...DEFAULT_LEAVES } }
    }
  };
}

// src/lib/publicShareStyle.ts
var publicShareStyle = `
.public-share-preview .modal-overlay,
.public-share-details .modal-overlay,
.public-share-download .modal-overlay {
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
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  border-radius:50%;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,white);
  color:var(--accent);
  font-weight:600;
  font-size:14px;
  line-height:1}:where(.public-share) .avatar svg {
  display:block;
  width:100%;
  height:100%}:where(.public-share) .value {
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
:where(.public-share) nav .folder-download-button {margin-left:auto;display:inline-flex;align-items:center;gap:7px;border:1px solid #e0e4eb;background:#fff;border-radius:8px;padding:7px 12px;color:var(--accent);font:inherit;font-size:12px;font-weight:550;cursor:pointer}:where(.public-share) nav .folder-download-button:hover:not(:disabled) {background:color-mix(in srgb,var(--accent) 6%,white)}:where(.public-share) nav .folder-download-button:disabled {opacity:.55;cursor:default}:where(.public-share) nav .folder-download-button:focus-visible {outline:2px solid var(--accent);outline-offset:2px}
.folder-download .dialog__title {overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.folder-download .dialog__message svg {color:var(--success);vertical-align:-2px}
.folder-download__options {display:grid;gap:10px;margin-top:10px}
.folder-download__option {display:flex;gap:12px;align-items:flex-start;text-align:left;width:100%;padding:13px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-1);color:var(--text-1);font:inherit;cursor:pointer}
.folder-download__option svg {color:var(--accent);margin-top:1px}
.folder-download__option span {display:grid;gap:4px;min-width:0}
.folder-download__option strong {font-size:13px;font-weight:600}
.folder-download__option small {font-size:12px;line-height:1.5;color:var(--text-2)}
.folder-download__option:hover:not(:disabled) {border-color:var(--accent);background:color-mix(in srgb,var(--accent) 5%,var(--bg-1))}
.folder-download__option:focus-visible {outline:2px solid var(--accent);outline-offset:2px}
.folder-download__option:disabled {opacity:.55;cursor:not-allowed}
.folder-download__progress {display:grid;gap:6px;margin-top:8px;font-size:12px;color:var(--text-2)}
.folder-download__progress progress {width:100%;height:6px;accent-color:var(--accent)}
.folder-download__progress small {color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

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

// src/lib/avatars.ts
var AVATARS = [
  { id: "initial", label: "Your initial", group: "Default" },
  { id: "cat", label: "Cosmic cat", group: "Characters" },
  { id: "fox", label: "Forest fox", group: "Characters" },
  { id: "panda", label: "Sleepy panda", group: "Characters" },
  { id: "frog", label: "Happy frog", group: "Characters" },
  { id: "robot", label: "Little robot", group: "Gaming" },
  { id: "ninja", label: "Night ninja", group: "Gaming" },
  { id: "astronaut", label: "Space explorer", group: "Gaming" },
  { id: "ghost", label: "Friendly ghost", group: "Gaming" },
  { id: "gamepad", label: "Player one", group: "Gaming" },
  { id: "yin-yang", label: "Yin-yang", group: "Symbols" },
  { id: "lotus", label: "Lotus", group: "Symbols" },
  { id: "star", label: "Lucky star", group: "Symbols" }
];
function isAvatarId(value) {
  return typeof value === "string" && AVATARS.some((avatar) => avatar.id === value);
}
function normalizeAvatar(value) {
  return isAvatarId(value) ? value : "initial";
}

// server/db.ts
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
var db;
var users;
var pins;
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
  pins = db.collection("file_pins");
  if (!initialized) {
    try {
      await users.createIndex({ email: 1 }, { unique: true });
      await users.updateMany({ role: { $exists: false } }, { $set: { role: "admin" } });
      await pins.createIndex({ bucket: 1, key: 1, scope: 1, userId: 1 });
      await pins.createIndex({ bucket: 1, scope: 1 });
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
    avatar: normalizeAvatar(user.avatar),
    preferences: normalizePreferences(user.preferences),
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
function getPinsCollection() {
  if (!pins) {
    if (db) pins = db.collection("file_pins");
    else throw new Error("Database not connected");
  }
  return pins;
}
function toPublicPin(doc) {
  return {
    id: String(doc._id),
    bucket: doc.bucket,
    key: doc.key,
    scope: doc.scope,
    userId: doc.userId,
    userEmail: doc.userEmail,
    userName: doc.userName || "",
    userAvatar: normalizeAvatar(doc.userAvatar),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date(doc.createdAt).toISOString()
  };
}
async function listFilePins(bucket, userId) {
  if (!db) return [];
  const docs = await getPinsCollection().find({
    bucket,
    $or: [{ scope: "global" }, { scope: "personal", userId }]
  }).sort({ createdAt: -1 }).toArray();
  return docs.map(toPublicPin);
}
async function addFilePin(params) {
  const filter = params.scope === "global" ? { bucket: params.bucket, key: params.key, scope: "global" } : { bucket: params.bucket, key: params.key, scope: "personal", userId: params.userId };
  const doc = await getPinsCollection().findOneAndUpdate(
    filter,
    {
      $set: {
        bucket: params.bucket,
        key: params.key,
        scope: params.scope,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName || "",
        userAvatar: normalizeAvatar(params.userAvatar)
      },
      $setOnInsert: { createdAt: /* @__PURE__ */ new Date() }
    },
    { upsert: true, returnDocument: "after" }
  );
  return toPublicPin(doc);
}
async function removeFilePin(params) {
  if (!db) return false;
  const filter = params.scope === "global" ? { bucket: params.bucket, key: params.key, scope: "global", ...params.isAdmin ? {} : { userId: params.userId } } : { bucket: params.bucket, key: params.key, scope: "personal", userId: params.userId };
  const result = await getPinsCollection().deleteOne(filter);
  return result.deletedCount > 0;
}
async function deletePinsForFile(bucket, key2) {
  if (!db) return 0;
  const isPrefix = key2.endsWith("/");
  const filter = isPrefix ? { bucket, key: { $regex: "^" + key2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") } } : { bucket, key: key2 };
  const result = await getPinsCollection().deleteMany(filter);
  return result.deletedCount;
}
async function deletePinsForBucket(bucket) {
  if (!db) return 0;
  const result = await getPinsCollection().deleteMany({ bucket });
  return result.deletedCount;
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
  async reserve(record2) {
    await (await collections()).buckets.insertOne(record2);
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
  if (!body || typeof body !== "object" || Array.isArray(body) || !Object.keys(body).length || Object.keys(body).some((key2) => !["name", "preferences", "avatar"].includes(key2))) {
    res.status(400).json({ error: "Provide a name, avatar, or preferences to update" });
    return;
  }
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 80 || Array.from(body.name).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))) {
    res.status(400).json({ error: "Name must contain 1\u201380 characters without control characters" });
    return;
  }
  if ("avatar" in body && (typeof body.avatar !== "string" || !isAvatarId(body.avatar))) {
    res.status(400).json({ error: "Invalid avatar selection" });
    return;
  }
  const preferences = "preferences" in body ? normalizePreferences(body.preferences) : void 0;
  if ("preferences" in body && !preferences) {
    res.status(400).json({ error: "Invalid preferences" });
    return;
  }
  const updated = await updateUserProfile(user.id, {
    ..."name" in body ? { name: body.name.trim() } : {},
    ..."avatar" in body ? { avatar: body.avatar } : {},
    ...preferences ? { preferences } : {}
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

// src/lib/archivePolicy.ts
var ARCHIVE_RANGE_BYTES = 1024 * 1024;
function isInspectableArchive(name) {
  return /\.(zip|tar\.gz|tgz)$/i.test(name);
}
function parseArchiveRange(value) {
  if (typeof value !== "string") return null;
  const match = /^bytes=(\d+)-(\d+)$/.exec(value);
  if (!match) return null;
  const start = Number(match[1]), end = Number(match[2]);
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start && end - start < ARCHIVE_RANGE_BYTES ? { start, end } : null;
}

// server/archive-range.ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
async function sendArchiveRange(s3, bucket, key2, req, res) {
  const range = parseArchiveRange(req.headers.range);
  if (!range) {
    res.status(416).json({ error: "Archive previews require a byte range of at most 1 MB." });
    return;
  }
  const object = await s3.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key2,
    Range: `bytes=${range.start}-${range.end}`,
    IfMatch: req.headers["if-match"]
  }));
  const limit = range.end - range.start + 1;
  if (!object.ContentRange || (object.ContentLength || 0) > limit) {
    object.Body?.destroy?.();
    res.status(502).json({ error: "Storage did not honor the requested byte range." });
    return;
  }
  const chunks = [];
  let count = 0;
  const body = object.Body;
  const close = () => body?.destroy?.();
  res.on("close", close);
  try {
    if (body) for await (const chunk of body) {
      count += chunk.length;
      if (count > limit) throw new Error("Archive response exceeds the requested range");
      chunks.push(Buffer.from(chunk));
    }
    res.status(206).set({
      "Content-Type": "application/octet-stream",
      "Content-Range": object.ContentRange,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment",
      ...object.ETag ? { ETag: object.ETag } : {}
    }).send(Buffer.concat(chunks));
  } finally {
    res.off("close", close);
    body?.destroy?.();
  }
}

// server/public-preview-data.ts
import { GetObjectCommand as GetObjectCommand2, HeadObjectCommand } from "@aws-sdk/client-s3";
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
  "bat",
  "cmd",
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
  "proto",
  // Source and config formats that open as text (most get syntax highlighting).
  "mjs",
  "cjs",
  "mts",
  "cts",
  "jsonc",
  "json5",
  "xsl",
  "plist",
  "cc",
  "cxx",
  "hh",
  "hxx",
  "kt",
  "kts",
  "swift",
  "lua",
  "r",
  "dart",
  "scala",
  "sc",
  "sbt",
  "groovy",
  "pl",
  "pm",
  "ex",
  "exs",
  "erl",
  "hrl",
  "hs",
  "clj",
  "cljs",
  "fs",
  "fsx",
  "vb",
  "vbs",
  "ps1",
  "psm1",
  "mm",
  "nim",
  "zig",
  "sol",
  "asm",
  "s",
  "mk",
  "cmake",
  "nix",
  "tex",
  "rst",
  "adoc",
  "elm",
  "ml",
  "mli",
  "coffee",
  "cr",
  "d",
  "pas",
  "f90",
  "vhdl",
  "v",
  "sv",
  "tcl",
  "awk",
  "ahk",
  "ino",
  "fish",
  "hx",
  "jl",
  "rkt",
  "scm",
  "lisp",
  "hcl",
  "gql",
  "diff",
  "patch"
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
  async describe(req, names2) {
    const owned = await this.store.listOwned(bucketUser(req).id);
    const shared = names2.filter((name) => !name.startsWith(PRIVATE_BUCKET_PREFIX));
    const visible = [];
    for (const name of shared) {
      if (!await this.store.find(name)) visible.push({ name, label: name, isPrivate: false, locked: false });
    }
    for (const bucket of owned) {
      if (!names2.includes(bucket._id)) continue;
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
async function publicPreviewData(s3, share, key2, req, res) {
  if (key2.endsWith("/")) throw new BucketAccessError(404, "Item not shared");
  const object = await s3.send(new HeadObjectCommand({ Bucket: share.bucket, Key: key2 }));
  const name = key2.split("/").pop() || "File";
  if (req.query.metadata === "1") {
    res.json({ file: { key: key2, name, isFolder: false, size: object.ContentLength || 0, lastModified: object.LastModified?.toISOString() || "" }, root: share.key, expiresAt: share.expiresAt });
    return;
  }
  if (isInspectableArchive(name)) {
    await sendArchiveRange(s3, share.bucket, key2, req, res);
    return;
  }
  const mime = mediaMime[extOf(name)];
  if (mime) {
    const ttl = share.expiresAt ? Math.min(60, Math.floor((share.expiresAt.getTime() - Date.now()) / 1e3)) : 60;
    if (ttl < 1) throw new BucketAccessError(404, "Share unavailable or expired");
    const url = await getSignedUrl(s3, new GetObjectCommand2({ Bucket: share.bucket, Key: key2, ResponseContentType: mime, ResponseContentDisposition: "inline" }), { expiresIn: ttl });
    res.redirect(303, url);
    return;
  }
  const kind = fileKind(name);
  const limit = kind === "text" || kind === "env" ? 1e6 : 20 * 1024 * 1024;
  if ((object.ContentLength || 0) > limit) throw new BucketAccessError(413, "File too large to preview. Download it instead.");
  const result = await s3.send(new GetObjectCommand2({ Bucket: share.bucket, Key: key2, Range: `bytes=0-${limit}` }));
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
import { HeadObjectCommand as HeadObjectCommand2, ListObjectsV2Command, GetObjectCommand as GetObjectCommand3 } from "@aws-sdk/client-s3";
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
  async insert(record2) {
    await (await indexedCollection()).insertOne(record2);
  },
  async findToken(tokenHash) {
    return (await indexedCollection()).findOne({ tokenHash });
  },
  async list(ownerId, bucket, key2) {
    return (await indexedCollection()).find({ ownerId, bucket, key: key2, revoked: false }).sort({ createdAt: -1 }).toArray();
  },
  async revoke(_id, ownerId) {
    await (await indexedCollection()).updateOne({ _id, ownerId }, { $set: { revoked: true } });
  }
};
var MAX_FOLDER_DOWNLOAD_ENTRIES = 5e3;
async function addFolderDates(s3, bucket, entries) {
  const folders = entries.filter((entry) => entry.folder);
  let next = 0;
  const worker = async () => {
    for (let entry = folders[next++]; entry; entry = folders[next++]) {
      try {
        const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: entry.key, MaxKeys: 1e3 }));
        for (const object of page.Contents || []) if (object.LastModified && (!entry.modified || object.LastModified > entry.modified)) entry.modified = object.LastModified;
      } catch {
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, folders.length) }, worker));
}
var hash = (token) => createHash4("sha256").update(token).digest("hex");
var asyncRoute = (fn) => (req, res, next) => {
  void fn(req, res).catch(next);
};
var safeKey = (key2) => !key2.split("/").some((part) => part === "." || part === "..") && ![...key2].some((char) => char.charCodeAt(0) < 32 || char === "\\");
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
    const { bucket, key: key2, folder, duration, customHours } = req.body || {};
    if (typeof bucket !== "string" || !bucket || typeof key2 !== "string" || !key2 || !safeKey(key2) || typeof folder !== "boolean" || folder !== key2.endsWith("/")) throw new BucketAccessError(400, "Select a valid file or folder");
    const metadata = await protection.authorize(req, bucket);
    const hours = duration === "custom" ? customHours : { "1h": 1, "6h": 6, "24h": 24 }[duration];
    if (duration !== "permanent" && (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0 || hours > 87600)) throw new BucketAccessError(400, "Choose an expiry between 0 and 87,600 hours");
    if (folder) {
      const result = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key2, MaxKeys: 1 }));
      if (!result.Contents?.length) throw new BucketAccessError(404, "Folder not found");
    } else await s3.send(new HeadObjectCommand2({ Bucket: bucket, Key: key2 }));
    const profile = await getSharer(bucketUser(req).id);
    const sharerName = profile?.name?.trim() || bucketUser(req).email.split("@")[0];
    const sharerAvatar = normalizeAvatar(profile?.avatar);
    const token = randomBytes2(32).toString("base64url");
    const record2 = {
      _id: randomUUID3(),
      tokenHash: hash(token),
      encryptedToken: encryptShareToken(token),
      ownerId: bucketUser(req).id,
      sharerName,
      sharerAvatar,
      bucket,
      key: key2,
      folder,
      privateOwner: metadata?.ownerId,
      expiresAt: duration === "permanent" ? null : new Date(Date.now() + hours * 36e5),
      createdAt: /* @__PURE__ */ new Date(),
      revoked: false
    };
    await store.insert(record2);
    res.status(201).json({ ...summary(record2), path: `/api/public/${token}` });
  }));
  management.get("/", asyncRoute(async (req, res) => {
    const { bucket, key: key2 } = req.query;
    if (typeof bucket !== "string" || typeof key2 !== "string") throw new BucketAccessError(400, "Bucket and key required");
    const records = await store.list(bucketUser(req).id, bucket, key2);
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
      const url = await getSignedUrl2(s3, new GetObjectCommand3({ Bucket: share.bucket, Key: requested, ResponseContentDisposition: `attachment; filename="${filename}"; filename*=UTF-8''${filename}`, ResponseContentType: "application/octet-stream" }), { expiresIn: ttl });
      res.redirect(303, url);
      return;
    }
    if (req.query.manifest === "1") {
      if (!share.folder || !requested.endsWith("/")) throw new BucketAccessError(400, "Choose a folder to download");
      const files = [];
      const folders = [];
      let cursor;
      do {
        const page = await s3.send(new ListObjectsV2Command({ Bucket: share.bucket, Prefix: requested, MaxKeys: 1e3, ContinuationToken: cursor }));
        for (const object of page.Contents || []) {
          const key2 = object.Key;
          if (!key2 || key2 === requested || !key2.startsWith(requested) || !safeKey(key2)) continue;
          const path = key2.slice(requested.length).split("/").filter(Boolean).join("/");
          if (!path) continue;
          if (key2.endsWith("/")) folders.push(path + "/");
          else files.push({ path, key: key2, size: object.Size || 0, modified: object.LastModified?.toISOString() || "" });
        }
        if (files.length + folders.length > MAX_FOLDER_DOWNLOAD_ENTRIES) throw new BucketAccessError(413, `Folders with more than ${MAX_FOLDER_DOWNLOAD_ENTRIES.toLocaleString("en-US")} items cannot be downloaded at once`);
        cursor = page.IsTruncated ? page.NextContinuationToken : void 0;
      } while (cursor);
      if (!files.length && !folders.length) await s3.send(new HeadObjectCommand2({ Bucket: share.bucket, Key: requested }));
      res.json({ name: requested.split("/").filter(Boolean).pop() || "Shared folder", files, folders, totalBytes: files.reduce((sum, file) => sum + file.size, 0) });
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
    const sharerAvatar = normalizeAvatar(profile?.avatar || share.sharerAvatar);
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
      await addFolderDates(s3, share.bucket, entries);
    } else {
      const object = await s3.send(new HeadObjectCommand2({ Bucket: share.bucket, Key: requested }));
      entries = [{ key: requested, folder: false, size: object.ContentLength, modified: object.LastModified }];
    }
    res.json({
      root: share.key,
      requested,
      folder: share.folder,
      sharer,
      sharerAvatar,
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

// server/scratchpad.ts
import { GetObjectCommand as GetObjectCommand4, PutObjectCommand } from "@aws-sdk/client-s3";
var SCRATCHPAD_LIMIT = 64 * 1024;
var key = "scratchpad.md";
async function readScratchpad(s3, bucket) {
  try {
    const object = await s3.send(new GetObjectCommand4({ Bucket: bucket, Key: key }));
    if (!object.ETag) throw new Error("Storage did not return a revision for this note.");
    if ((object.ContentLength || 0) > SCRATCHPAD_LIMIT) {
      object.Body?.destroy?.();
      throw Object.assign(new Error("scratchpad.md exceeds the 64 KB note limit. Open it in Notebook instead."), { status: 413 });
    }
    const chunks = [];
    let count = 0;
    const body = object.Body;
    try {
      if (body) for await (const chunk of body) {
        count += chunk.length;
        if (count > SCRATCHPAD_LIMIT) throw Object.assign(new Error("scratchpad.md exceeds the 64 KB note limit. Open it in Notebook instead."), { status: 413 });
        chunks.push(Buffer.from(chunk));
      }
      return { content: new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)), etag: object.ETag };
    } finally {
      body?.destroy?.();
    }
  } catch (err) {
    if (["NoSuchKey", "NotFound"].includes(err.name)) return { content: "", etag: null };
    throw err;
  }
}
async function writeScratchpad(s3, bucket, body) {
  const value = body;
  if (!value || typeof value.content !== "string" || Buffer.byteLength(value.content) > SCRATCHPAD_LIMIT || !(value.etag === null || typeof value.etag === "string" && value.etag.length > 0 && value.etag.length <= 256)) {
    throw Object.assign(new Error("A note up to 64 KB and its current revision are required."), { status: 400 });
  }
  try {
    const result = await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: value.content,
      ContentType: "text/markdown; charset=utf-8",
      ...value.etag === null ? { IfNoneMatch: "*" } : { IfMatch: value.etag }
    }));
    if (!result.ETag) throw new Error("Storage did not confirm the saved revision. Reload the note before retrying.");
    return { content: value.content, etag: result.ETag };
  } catch (err) {
    const status = err.$metadata?.httpStatusCode;
    if (status === 412 || status === 409 || err.name === "PreconditionFailed") throw Object.assign(new Error("This note changed elsewhere. Review the latest version before saving."), { status: 409 });
    throw err;
  }
}
async function scratchpadRoute(s3, req, res) {
  try {
    const note = req.method === "GET" ? await readScratchpad(s3, res.locals.bucket) : await writeScratchpad(s3, res.locals.bucket, req.body);
    res.json(note);
  } catch (err) {
    const status = err.status;
    if (status) {
      res.status(status).json({ error: err.message });
      return;
    }
    throw err;
  }
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
      const { bucket, key: key2, size, contentType } = req.body || {};
      if (typeof bucket !== "string" || !bucket || !validUploadKey(key2) || !Number.isSafeInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES || typeof contentType !== "string" || contentType.length > 255 || /[\r\n]/.test(contentType)) {
        throw new BucketAccessError(400, "Invalid upload details or unsupported file size");
      }
      await protection.authorize(req, bucket);
      const owner = bucketUser(req).id, session = bucketSession(req), secret = ticketSecret();
      const result = await s3.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key2, ContentType: contentType || "application/octet-stream" }));
      if (!result.UploadId) throw Error("Storage returned no upload ID");
      const ticket = { owner, session, bucket, key: key2, uploadId: result.UploadId, size, partSize: uploadPartSize(size) };
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
async function getObjectMetadata(s3, bucket, key2) {
  if (!key2.endsWith("/")) {
    const object = await s3.send(new HeadObjectCommand3({ Bucket: bucket, Key: key2 }));
    return {
      key: key2,
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
    const page = await s3.send(new ListObjectsV2Command2({ Bucket: bucket, Prefix: key2, MaxKeys: 1e3, ContinuationToken: cursor }));
    for (const object of page.Contents || []) {
      if (!object.Key?.startsWith(key2)) continue;
      if (object.LastModified) latest = Math.max(latest, object.LastModified.getTime());
      const relative = object.Key.slice(key2.length);
      const parts = relative.split("/");
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join("/"));
      if (object.Key !== key2 && !object.Key.endsWith("/")) {
        fileCount++;
        size += object.Size || 0;
      }
    }
    cursor = page.IsTruncated ? page.NextContinuationToken : void 0;
    pages++;
  } while (cursor && pages < 10);
  return { key: key2, isFolder: true, size, fileCount, folderCount: folders.size, lastModified: latest ? new Date(latest).toISOString() : void 0, partial: !!cursor };
}

// server/s3.ts
import express5 from "express";
import {
  S3Client as S3Client2,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command as ListObjectsV2Command3,
  PutObjectCommand as PutObjectCommand2,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand as GetObjectCommand5,
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
      const record2 = await protection.reserve(req, name, req.body?.password);
      try {
        await s3.send(new HeadBucketCommand({ Bucket: record2._id }));
      } catch (err) {
        const failure = err;
        if (failure.name !== "NotFound" && failure.name !== "NoSuchBucket" && failure.$metadata?.httpStatusCode !== 404) throw err;
        await s3.send(new CreateBucketCommand({ Bucket: record2._id }));
      }
      await protection.store.activate(record2._id);
      const details = await protection.unlock(req, record2._id, req.body?.password);
      res.status(201).json({ success: true, bucket: record2._id, details });
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
    await deletePinsForBucket(name);
    res.json({ success: true });
  }));
  router.use("/folders", express5.json());
  const filePaths = /* @__PURE__ */ new Set(["/files", "/pins", "/upload-url", "/upload", "/download", "/raw", "/folders", "/metadata", "/scratchpad"]);
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
  router.get("/scratchpad", wrap((req, res) => scratchpadRoute(s3, req, res)));
  router.put("/scratchpad", express5.json({ limit: "128kb" }), wrap((req, res) => scratchpadRoute(s3, req, res)));
  router.get("/metadata", wrap(async (req, res) => {
    const key2 = req.query.key;
    if (typeof key2 !== "string" || !key2) {
      res.status(400).json({ error: "A file or folder key is required" });
      return;
    }
    try {
      res.json(await getObjectMetadata(s3, res.locals.bucket, key2));
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
  router.get("/pins", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const user = req.user;
    const pins2 = await listFilePins(bucket, user.id);
    res.json({ pins: pins2 });
  }));
  router.post("/pins", express5.json(), wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const user = req.user;
    const key2 = req.body?.key;
    const scope = req.body?.scope;
    if (typeof key2 !== "string" || !key2) {
      res.status(400).json({ error: "A valid file key is required" });
      return;
    }
    if (scope !== "global" && scope !== "personal") {
      res.status(400).json({ error: 'Scope must be either "global" or "personal"' });
      return;
    }
    if (res.locals.privateBucket && scope === "global") {
      res.status(400).json({ error: "Private buckets only support personal pins" });
      return;
    }
    const fullUser = await getUserById(user.id);
    const pin = await addFilePin({
      bucket,
      key: key2,
      scope,
      userId: user.id,
      userEmail: user.email,
      userName: fullUser?.name || user.email.split("@")[0],
      userAvatar: fullUser?.avatar || "initial"
    });
    res.status(201).json({ pin });
  }));
  router.delete("/pins", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const user = req.user;
    const key2 = req.query.key;
    const scope = req.query.scope;
    if (typeof key2 !== "string" || !key2) {
      res.status(400).json({ error: "A valid file key is required" });
      return;
    }
    if (scope !== "global" && scope !== "personal") {
      res.status(400).json({ error: 'Scope must be either "global" or "personal"' });
      return;
    }
    const removed = await removeFilePin({
      bucket,
      key: key2,
      scope,
      userId: user.id,
      isAdmin: user.role === "admin"
    });
    if (!removed) {
      res.status(404).json({ error: "Pin not found or not permitted to unpin" });
      return;
    }
    res.json({ success: true });
  }));
  router.get("/upload-url", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const key2 = req.query.key || "";
    const contentType = req.query.contentType || "application/octet-stream";
    if (!validUploadKey(key2)) {
      res.status(400).json({ error: "A valid file key is required" });
      return;
    }
    const uploadUrl = await getSignedUrl4(
      uploadSigner,
      new PutObjectCommand2({
        Bucket: bucket,
        Key: key2,
        ContentType: contentType
      }),
      { expiresIn: res.locals.urlTtl }
    );
    res.json({ uploadUrl, bucket, key: key2 });
  }));
  router.put("/upload", (_req, res) => {
    res.status(410).json({ error: "Proxy uploads are no longer supported. Refresh Vault to upload directly to storage." });
  });
  router.delete("/files", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const key2 = req.query.key || "";
    if (key2.endsWith("/")) {
      const list = await s3.send(new ListObjectsV2Command3({ Bucket: bucket, Prefix: key2 }));
      if (list.Contents && list.Contents.length > 0) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: list.Contents.map((o) => ({ Key: o.Key })) }
          })
        );
      }
    } else {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key2 }));
    }
    await deletePinsForFile(bucket, key2);
    res.json({ success: true });
  }));
  router.get("/download", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const key2 = req.query.key || "";
    const signedUrl = await getSignedUrl4(
      s3,
      new GetObjectCommand5({ Bucket: bucket, Key: key2 }),
      { expiresIn: res.locals.urlTtl }
    );
    res.json({ url: signedUrl });
  }));
  router.get("/raw", wrap(async (req, res) => {
    const bucket = res.locals.bucket;
    const key2 = req.query.key || "";
    if (isInspectableArchive(key2) && req.headers.range) {
      await sendArchiveRange(s3, bucket, key2, req, res);
      return;
    }
    const redirect = req.query.redirect === "true";
    const mediaType = mediaMime[key2.split(".").pop()?.toLowerCase() || ""];
    const isMedia = /^(audio|video)\//.test(mediaType || "");
    const shouldRedirect = redirect || Boolean(process.env.VERCEL) && isMedia;
    if (shouldRedirect) {
      const signedUrl = await getSignedUrl4(
        s3,
        new GetObjectCommand5({ Bucket: bucket, Key: key2, ...mediaType ? { ResponseContentType: mediaType, ResponseContentDisposition: "inline" } : {} }),
        { expiresIn: res.locals.urlTtl }
      );
      res.redirect(307, signedUrl);
      return;
    }
    const rangeHeader = req.headers.range;
    const object = await s3.send(
      new GetObjectCommand5({
        Bucket: bucket,
        Key: key2,
        ...rangeHeader ? { Range: rangeHeader } : {}
      })
    );
    const filename = key2.split("/").pop() || "file";
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
      new PutObjectCommand2({ Bucket: bucket, Key: folderPath, Body: Buffer.alloc(0) })
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

// server/system/router.ts
import { Router } from "express";

// server/system/metrics.ts
import os from "node:os";
import { join as join3 } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// server/system/linux.ts
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
async function readText(path) {
  try {
    return (await readFile(path, "utf8")).trim();
  } catch {
    return null;
  }
}
async function names(path) {
  try {
    return (await readdir(path)).sort().slice(0, 256);
  } catch {
    return [];
  }
}
function numeric(value) {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
async function readNumber(path) {
  return numeric(await readText(path));
}
var percent = (value) => Math.min(100, Math.max(0, value));
function memoryMetric(total, available) {
  if (total === null || available === null || total < 0) return null;
  const free = Math.min(total, Math.max(0, available));
  return { total, available: free, used: total - free };
}
function parseMemory(text) {
  const values = new Map(Array.from(text.matchAll(/^(\w+):\s+(\d+) kB$/gm), (m) => [m[1], Number(m[2]) * 1024]));
  const get = (key2) => values.get(key2) ?? null;
  return { memory: memoryMetric(get("MemTotal"), get("MemAvailable")), swap: memoryMetric(get("SwapTotal"), get("SwapFree")) };
}
function parseCpu(text) {
  return text.split("\n").filter((line) => /^cpu(?:\d+)?\s/.test(line)).flatMap((line) => {
    const [id, ...parts] = line.trim().split(/\s+/);
    const fields = parts.slice(0, 8).map(Number);
    if (fields.length < 4 || fields.some((v) => !Number.isFinite(v) || v < 0)) return [];
    return [{ id, total: fields.reduce((a, b) => a + b, 0), idle: fields[3] + (fields[4] || 0) }];
  });
}
function cpuUsage(before, after) {
  const previous = new Map(before.map((cpu) => [cpu.id, cpu]));
  return after.map((cpu) => {
    const old = previous.get(cpu.id);
    const elapsed = old ? cpu.total - old.total : 0;
    const idle = old ? cpu.idle - old.idle : 0;
    return { id: cpu.id, usage: elapsed > 0 && idle >= 0 ? percent(100 * (1 - idle / elapsed)) : null };
  });
}
async function temperatures(sysRoot) {
  const result = [];
  const root = join(sysRoot, "class/hwmon");
  for (const chip of await names(root)) {
    const base = join(root, chip);
    const chipName = await readText(join(base, "name")) || chip;
    for (const input of (await names(base)).filter((name) => /^temp\d+_input$/.test(name))) {
      const value = await readNumber(join(base, input));
      if (value === null || value < -5e4 || value > 2e5) continue;
      const label = await readText(join(base, input.replace("_input", "_label"))) || input.replace("_input", "");
      result.push({ id: `${chip}/${input}`, label: `${chipName} \xB7 ${label}`, celsius: value / 1e3 });
    }
  }
  if (result.length) return result;
  const thermal = join(sysRoot, "class/thermal");
  for (const zone of (await names(thermal)).filter((name) => /^thermal_zone\d+$/.test(name))) {
    const value = await readNumber(join(thermal, zone, "temp"));
    if (value !== null && value >= -5e4 && value <= 2e5) result.push({ id: zone, label: await readText(join(thermal, zone, "type")) || zone, celsius: value / 1e3 });
  }
  return result;
}
async function batteries(sysRoot) {
  const root = join(sysRoot, "class/power_supply");
  const result = [];
  for (const id of await names(root)) {
    const base = join(root, id);
    if (await readText(join(base, "type")) !== "Battery" || await readText(join(base, "present")) === "0") continue;
    const [capacity, status, model, power, current, voltage, energyFull, energyDesign, chargeFull, chargeDesign] = await Promise.all([
      readNumber(join(base, "capacity")),
      readText(join(base, "status")),
      readText(join(base, "model_name")),
      readNumber(join(base, "power_now")),
      readNumber(join(base, "current_now")),
      readNumber(join(base, "voltage_now")),
      readNumber(join(base, "energy_full")),
      readNumber(join(base, "energy_full_design")),
      readNumber(join(base, "charge_full")),
      readNumber(join(base, "charge_full_design"))
    ]);
    const full = energyFull ?? chargeFull, design = energyFull !== null ? energyDesign : chargeDesign;
    result.push({
      id,
      name: model || id,
      percent: capacity === null ? null : percent(capacity),
      status: status || "Unknown",
      watts: power !== null ? Math.abs(power) / 1e6 : current !== null && voltage !== null ? Math.abs(current * voltage) / 1e12 : null,
      healthPercent: full !== null && design !== null && design > 0 ? percent(full / design * 100) : null
    });
  }
  return result;
}

// server/system/gpu.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join as join2 } from "node:path";
var exec = promisify(execFile);
var pciId = (value) => value.toLowerCase().replace(/^00000000:/, "0000:");
function gpuLabels(value) {
  try {
    const parsed = JSON.parse(value || "{}");
    return Object.fromEntries(Object.entries(parsed).flatMap(([key2, label]) => {
      if (!label || typeof label !== "object") return [];
      const data = label;
      return [[pciId(key2), {
        name: typeof data.name === "string" ? data.name.slice(0, 120) : void 0,
        kind: ["integrated", "discrete", "unknown"].includes(data.kind || "") ? data.kind : void 0
      }]];
    }));
  } catch {
    return {};
  }
}
function parseNvidia(output) {
  return output.trim().split("\n").flatMap((line) => {
    const [bus, name, load, total, used, temperature] = line.split(",").map((s) => s.trim());
    if (!bus || !name || !/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+\.[0-9]+$/i.test(bus)) return [];
    const capacity = numeric(total), occupied = numeric(used), utilization = numeric(load);
    return [{
      id: pciId(bus),
      name,
      kind: /tegra|orin|jetson/i.test(name) ? "integrated" : "discrete",
      driver: "nvidia",
      utilization: utilization === null ? null : percent(utilization),
      temperature: numeric(temperature),
      memory: capacity !== null && occupied !== null ? memoryMetric(capacity * 1024 ** 2, (capacity - occupied) * 1024 ** 2) : null
    }];
  });
}
async function nvidiaMetrics() {
  try {
    const { stdout } = await exec("nvidia-smi", ["--query-gpu=pci.bus_id,name,utilization.gpu,memory.total,memory.used,temperature.gpu", "--format=csv,noheader,nounits"], { timeout: 1200, maxBuffer: 32 * 1024 });
    return parseNvidia(stdout);
  } catch {
    return [];
  }
}
async function graphics(sysRoot, labels, nvidia = nvidiaMetrics) {
  const root = join2(sysRoot, "class/drm");
  const result = [];
  for (const card of (await names(root)).filter((name) => /^card\d+$/.test(name))) {
    const base = join2(root, card, "device");
    const uevent = await readText(join2(base, "uevent")) || "";
    const id = pciId(/^PCI_SLOT_NAME=(.+)$/m.exec(uevent)?.[1] || card);
    const driver = /^DRIVER=(.+)$/m.exec(uevent)?.[1] || null;
    const [vendor, device, load, total, used] = await Promise.all([
      readText(join2(base, "vendor")),
      readText(join2(base, "device")),
      readNumber(join2(base, "gpu_busy_percent")),
      readNumber(join2(base, "mem_info_vram_total")),
      readNumber(join2(base, "mem_info_vram_used"))
    ]);
    const brand = vendor === "0x8086" ? "Intel" : vendor === "0x1002" ? "AMD" : vendor === "0x10de" ? "NVIDIA" : "Graphics adapter";
    const integrated = vendor === "0x8086" && ["0x0102", "0x0112", "0x0122", "0x0106", "0x0116", "0x0126", "0x0152", "0x0162", "0x0156", "0x0166"].includes(device || "");
    let temperature = null;
    for (const hwmon of await names(join2(base, "hwmon"))) {
      const value = await readNumber(join2(base, "hwmon", hwmon, "temp1_input"));
      if (value !== null && value >= -5e4 && value <= 2e5) {
        temperature = value / 1e3;
        break;
      }
    }
    result.push({
      id,
      name: `${brand}${device ? ` ${device}` : ""}`,
      kind: integrated ? "integrated" : "unknown",
      driver,
      utilization: load === null ? null : percent(load),
      memory: total !== null && used !== null ? memoryMetric(total, total - used) : null,
      temperature
    });
  }
  for (const gpu of await nvidia()) {
    const index = result.findIndex((item) => item.id === gpu.id);
    if (index >= 0) result[index] = gpu;
    else result.push(gpu);
  }
  return result.map((gpu) => ({ ...gpu, name: labels[gpu.id]?.name || gpu.name, kind: labels[gpu.id]?.kind || gpu.kind }));
}

// server/system/macos.ts
import { execFile as execFile2 } from "node:child_process";
import { promisify as promisify2 } from "node:util";
var exec2 = promisify2(execFile2);
async function command(file, args) {
  try {
    return (await exec2(file, args, { timeout: 1800, maxBuffer: 1024 * 1024, env: { ...process.env, LC_ALL: "C", LANG: "C" } })).stdout;
  } catch {
    return "";
  }
}
function parseMacMemory(text, total) {
  const pageSize = Number(/page size of (\d+) bytes/.exec(text)?.[1]);
  const counts = new Map(Array.from(text.matchAll(/^([^:\n]+):\s+(\d+)\./gm), (m) => [m[1].trim(), Number(m[2])]));
  const free = counts.get("Pages free"), cached = counts.get("File-backed pages"), purgeable = counts.get("Pages purgeable");
  if (!pageSize || free === void 0 || cached === void 0 || purgeable === void 0) return null;
  return memoryMetric(total, (free + cached + purgeable) * pageSize);
}
function parseMacSwap(text) {
  const amount = (key2) => {
    const match = new RegExp(`${key2}\\s*=\\s*([\\d.]+)([KMGT]?)`, "i").exec(text);
    if (!match) return null;
    const value = Number(match[1]) * 1024 ** ({ "": 0, K: 1, M: 2, G: 3, T: 4 }[match[2].toUpperCase()] ?? 0);
    return Number.isFinite(value) ? value : null;
  };
  const total = amount("total"), used = amount("used");
  return total !== null && used !== null ? memoryMetric(total, total - used) : null;
}
function parseMacBattery(text) {
  return text.split("\n").flatMap((line) => {
    const match = /-([^\t]+?)\s+\(id=[^)]+\)\s+(\d+)%;\s*([^;]+)/.exec(line);
    if (!match || /present:\s*false/i.test(line)) return [];
    return [{ id: match[1], name: match[1].replace(/-\d+$/, ""), percent: percent(Number(match[2])), status: match[3].trim(), watts: null, healthPercent: null }];
  });
}
function parseAppleGpu(text) {
  return text.split(/(?=\+-o )/).flatMap((block) => {
    const model = /"model"\s*=\s*"([^"]+)"/.exec(block)?.[1];
    if (!model || !/^Apple\s/.test(model)) return [];
    const load = /"Device Utilization %"\s*=\s*(\d+(?:\.\d+)?)/.exec(block);
    const id = /\+-o\s+(\S+)/.exec(block)?.[1] || model;
    return [{ id, name: model, kind: "integrated", driver: "Apple AGX", utilization: load ? percent(Number(load[1])) : null, memory: null, temperature: null }];
  });
}
async function macMetrics(totalMemory) {
  const [vm, swap, battery, gpu] = await Promise.all([
    command("/usr/bin/vm_stat", []),
    command("/usr/sbin/sysctl", ["vm.swapusage"]),
    command("/usr/bin/pmset", ["-g", "batt"]),
    command("/usr/sbin/ioreg", ["-r", "-c", "AGXAccelerator", "-d", "1", "-l"])
  ]);
  return { memory: parseMacMemory(vm, totalMemory), swap: parseMacSwap(swap), batteries: parseMacBattery(battery), gpus: parseAppleGpu(gpu) };
}

// server/system/storage.ts
import { statfs } from "node:fs/promises";
import { isAbsolute } from "node:path";
function storagePaths(config) {
  if (!config?.trim()) return [{ path: "/", label: "System filesystem" }];
  try {
    const parsed = JSON.parse(config);
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > 12) return [];
    if (!parsed.every((item) => item && typeof item.path === "string" && isAbsolute(item.path) && !item.path.includes("\0") && typeof item.label === "string" && item.label.trim())) return [];
    return parsed.map((item) => ({ path: item.path, label: item.label.slice(0, 120) }));
  } catch {
    return [];
  }
}
function storageNumbers(s) {
  const total = s.blocks * s.bsize;
  if (![total, s.bfree, s.bavail, s.bsize].every(Number.isFinite) || total <= 0 || s.bsize <= 0) return null;
  const free = Math.min(total, Math.max(0, s.bfree * s.bsize));
  const available = Math.min(free, Math.max(0, s.bavail * s.bsize));
  return { total, used: total - free, available, reserved: free - available };
}
function createStorageCollector(paths) {
  let cache = null;
  let sampled = 0;
  let pending = null;
  return async () => {
    if (cache && performance.now() - sampled < 3e4) return cache;
    if (pending) return pending;
    pending = Promise.all(paths.map(async ({ path, label }) => {
      try {
        const usage = storageNumbers(await statfs(path));
        return { path, label, usage, sampledAt: (/* @__PURE__ */ new Date()).toISOString(), error: usage ? null : "Filesystem capacity is unavailable." };
      } catch {
        return { path, label, usage: null, sampledAt: (/* @__PURE__ */ new Date()).toISOString(), error: "Filesystem is not mounted or cannot be read." };
      }
    })).then((value) => {
      cache = value;
      sampled = performance.now();
      return value;
    }).finally(() => {
      pending = null;
    });
    return pending;
  };
}

// server/system/metrics.ts
function createSystemCollector(options = {}) {
  const procRoot = options.procRoot || process.env.VAULT_PROC_ROOT || "/proc";
  const sysRoot = options.sysRoot || process.env.VAULT_SYS_ROOT || "/sys";
  const platform = options.platform || os.platform();
  const serverless = options.serverless ?? !!process.env.VERCEL;
  const labels = gpuLabels(options.labels ?? process.env.VAULT_GPU_LABELS);
  const paths = storagePaths(options.storage ?? process.env.VAULT_STORAGE_PATHS);
  const collectStorage = createStorageCollector(paths);
  let previous = [];
  let lastCpuSample = 0;
  let cached = null;
  let cachedAt = 0;
  let pending = null;
  async function cpuCounters() {
    if (platform === "linux") return parseCpu(await readText(join3(procRoot, "stat")) || "");
    const cores = os.cpus().map((cpu, i) => ({ id: `cpu${i}`, total: Object.values(cpu.times).reduce((a, b) => a + b, 0), idle: cpu.times.idle }));
    return [{ id: "cpu", total: cores.reduce((sum, cpu) => sum + cpu.total, 0), idle: cores.reduce((sum, cpu) => sum + cpu.idle, 0) }, ...cores];
  }
  async function collect() {
    const result = {
      sampledAt: (/* @__PURE__ */ new Date()).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform,
      machine: serverless ? "Serverless runtime" : process.env.VAULT_MACHINE_LABEL || os.hostname(),
      environment: serverless ? "serverless" : "host",
      uptimeSeconds: null,
      cpu: { model: "", usage: null, cores: [] },
      memory: null,
      swap: null,
      containerMemory: null,
      temperatures: [],
      gpus: [],
      batteries: [],
      storage: [],
      notes: []
    };
    if (serverless) {
      result.notes.push("This deployment runs on Vercel. Home-server hardware metrics are not available from a serverless function.");
      return result;
    }
    if (platform === "linux") {
      const container = await readText("/.dockerenv") !== null || /docker|containerd|kubepods|libpod/.test(await readText(join3(procRoot, "1/cgroup")) || "");
      result.environment = container ? "container" : "host";
      const [mem, uptime, cpuinfo, sensors, gpus, battery, limit, used] = await Promise.all([
        readText(join3(procRoot, "meminfo")),
        readText(join3(procRoot, "uptime")),
        readText(join3(procRoot, "cpuinfo")),
        temperatures(sysRoot),
        graphics(sysRoot, labels),
        batteries(sysRoot),
        readNumber("/sys/fs/cgroup/memory.max"),
        readNumber("/sys/fs/cgroup/memory.current")
      ]);
      Object.assign(result, parseMemory(mem || ""));
      result.uptimeSeconds = uptime ? Number(uptime.split(" ")[0]) : null;
      result.cpu.model = /^model name\s*:\s*(.+)$/m.exec(cpuinfo || "")?.[1] || os.cpus()[0]?.model || "CPU";
      result.temperatures = sensors;
      result.gpus = gpus;
      result.batteries = battery;
      if (container && limit !== null && used !== null) result.containerMemory = memoryMetric(limit, limit - used);
      if (container) result.notes.push("CPU, RAM and swap are kernel counters visible to Vault, normally host-wide in Docker. They are not this app\u2019s usage. Sensors depend on host driver and container access.");
      if (!result.memory) result.notes.push("Memory counters are unavailable. Check access to the configured proc filesystem.");
    } else if (platform === "darwin") {
      Object.assign(result, await macMetrics(os.totalmem()));
      result.uptimeSeconds = os.uptime();
      result.cpu.model = os.cpus()[0]?.model || "CPU";
      result.notes.push("Monitoring this Mac running the Vault backend, not your remote Fedora server or RustFS endpoint. Open Vault on your home-server domain to see that server.");
      result.notes.push("Mac RAM availability includes reclaimable file cache (an estimate, not a memory-pressure reading). CPU temperatures are not exposed by this unprivileged collector. Apple GPU load is shown when the driver reports it.");
    } else {
      result.memory = memoryMetric(os.totalmem(), os.freemem());
      result.uptimeSeconds = os.uptime();
      result.cpu.model = os.cpus()[0]?.model || "CPU";
      result.notes.push("Basic OS CPU and memory counters are shown. Swap and hardware sensors are supported on Linux hosts; memory on this platform includes cached pages.");
    }
    result.storage = await collectStorage();
    if (!paths.length) result.notes.push("Storage configuration is invalid. VAULT_STORAGE_PATHS must contain 1\u201312 labelled absolute paths.");
    if (!previous.length || performance.now() - lastCpuSample > 15e3) {
      previous = await cpuCounters();
      await delay(options.sampleDelay ?? 250);
    }
    const next = await cpuCounters();
    const usage = cpuUsage(previous, next);
    previous = next;
    lastCpuSample = performance.now();
    result.cpu.usage = usage.find((cpu) => cpu.id === "cpu")?.usage ?? null;
    result.cpu.cores = usage.filter((cpu) => cpu.id !== "cpu");
    result.sampledAt = (/* @__PURE__ */ new Date()).toISOString();
    return result;
  }
  return async () => {
    if (cached && performance.now() - cachedAt < 2500) return cached;
    if (pending) return pending;
    pending = collect().then((value) => {
      cached = value;
      cachedAt = performance.now();
      return value;
    }).finally(() => {
      pending = null;
    });
    return pending;
  };
}

// server/system/router.ts
function createSystemRouter(collect = createSystemCollector(), authenticate = requireAuth) {
  const router = Router();
  router.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  router.get("/metrics", authenticate, requireAdmin, async (_req, res) => {
    try {
      res.json(await collect());
    } catch {
      res.status(503).json({ error: "Server metrics are temporarily unavailable." });
    }
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
  "font-src 'self' blob: data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' blob: https: http:",
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "frame-ancestors 'self'",
  "connect-src 'self' https: http: ws: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join("; ");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
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
app.use("/api/system", createSystemRouter());
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
