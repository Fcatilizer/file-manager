/* ─── Inline SVG Icons (Feather-style, 24x24) ─────────── */

const PATHS: Record<string, string[]> = {
  folder: [
    'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  ],
  folderPlus: [
    'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
    'M12 11v6',
    'M9 14h6',
  ],
  back: ['M9 14L4 9l5-5', 'M20 20v-7a4 4 0 00-4-4H4'],

  // Standard File
  file: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
  ],

  // Word / Document (.doc, .docx, .odt)
  fileDoc: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
    'M8 12h8',
    'M8 15h8',
    'M8 18h5',
  ],

  // PDF Document (.pdf)
  filePdf: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
    'M9 17v-5h2a1.5 1.5 0 010 3H9',
    'M13.5 12h1.5a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5h-1.5z',
  ],

  // Spreadsheet (.xlsx, .xls, .csv)
  fileSheet: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
    'M8 13h8',
    'M8 17h8',
    'M12 11v8',
  ],

  // Presentation (.pptx, .ppt, .key)
  fileSlide: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
    'M8 12h8v5H8z',
    'M10 19h4',
  ],

  // Code & Config (.json, .ts, .js, .py, etc.)
  fileCode: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
    'M10 13l-2 2 2 2',
    'M14 13l2 2-2 2',
  ],

  // Plain Text / Notes (.txt, .md, .log)
  fileText: [
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'M14 2v6h6',
    'M8 12h8',
    'M8 15h8',
  ],

  // Image (.jpg, .png, .webp, .svg)
  fileImage: [
    'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z',
    'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    'M21 15l-5-5L5 21',
  ],
  image: [
    'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z',
    'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    'M21 15l-5-5L5 21',
  ],

  // Video (.mp4, .mov, .webm)
  fileVideo: [
    'M23 7l-7 5 7 5V7z',
    'M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z',
  ],
  video: [
    'M23 7l-7 5 7 5V7z',
    'M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z',
  ],

  // Audio (.mp3, .wav, .flac)
  fileAudio: [
    'M9 18V5l12-2v13',
    'M9 18a3 3 0 11-6 0 3 3 0 016 0z',
    'M21 16a3 3 0 11-6 0 3 3 0 016 0z',
  ],
  music: [
    'M9 18V5l12-2v13',
    'M9 18a3 3 0 11-6 0 3 3 0 016 0z',
    'M21 16a3 3 0 11-6 0 3 3 0 016 0z',
  ],

  // Archive (.zip, .tar, .rar)
  fileArchive: [
    'M21 8v13H3V8',
    'M1 3h22v5H1z',
    'M10 12h4',
    'M12 11v6',
  ],
  archive: [
    'M21 8v13H3V8',
    'M1 3h22v5H1z',
    'M10 12h4',
    'M12 11v6',
  ],

  rain: ['M7 14H6a4 4 0 110-8 6 6 0 0111.6-1A4.5 4.5 0 1120 14h-1', 'M9 14l-2 4', 'M14 14l-2 4', 'M19 14l-2 4', 'M10 20l-1 2'],

  // Actions & Controls
  plus: ['M12 5v14', 'M5 12h14'],
  chevronDown: ['M6 9l6 6 6-6'],
  refresh: ['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0114.85-3.36L23 10', 'M1 14l4.64 4.36A9 9 0 0020.49 15'],
  database: ['M20 6c0 2.2-3.6 4-8 4S4 8.2 4 6s3.6-4 8-4 8 1.8 8 4z', 'M4 6v12c0 2.2 3.6 4 8 4s8-1.8 8-4V6', 'M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  trash: [
    'M3 6h18',
    'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
    'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  ],
  sun: [
    'M12 7a5 5 0 100 10 5 5 0 000-10z',
    'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  ],
  moon: ['M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  chevronLeft: ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'],
  eyeOff: [
    'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94',
    'M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19',
    'M14.12 14.12a3 3 0 11-4.24-4.24',
    'M1 1l22 22',
  ],
  lock: [
    'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z',
    'M7 11V7a5 5 0 0110 0v4',
  ],
  key: [
    'M7.5 15.5m-5.5 0a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0',
    'M21 2l-9.6 9.6',
    'M15.5 7.5l3 3L22 7l-3-3',
  ],
  search: ['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35'],
  code: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  text: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h5'],
  copy: [
    'M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2',
    'M16 4h2a2 2 0 012 2v4',
    'M21 14H11a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z',
  ],
  check: ['M20 6L9 17l-5-5'],
  externalLink: [
    'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6',
    'M15 3h6v6',
    'M10 14L21 3',
  ],

  // Users / Accounts
  users: [
    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
    'M9 11a4 4 0 100-8 4 4 0 000 8z',
    'M23 21v-2a4 4 0 00-3-3.87',
    'M16 3.13a4 4 0 010 7.75',
  ],
  userPlus: [
    'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
    'M8.5 11a4 4 0 100-8 4 4 0 000 8z',
    'M20 8v6',
    'M23 11h-6',
  ],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
}

export function Icon({
  name,
  size = 18,
  color,
  className,
}: {
  name: string
  size?: number
  color?: string
  className?: string
}) {
  const d = PATHS[name] || PATHS.file
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}
