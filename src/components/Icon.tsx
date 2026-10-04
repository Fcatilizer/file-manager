/* ─── Inline SVG Icons (Feather-style, 24x24) ─────────── */

const PATHS: Record<string, string[]> = {
  folder: ['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z'],
  file: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6'],
  image: [
    'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z',
    'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    'M21 15l-5-5L5 21',
  ],
  video: [
    'M23 7l-7 5 7 5V7z',
    'M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z',
  ],
  music: [
    'M9 18V5l12-2v13',
    'M9 18a3 3 0 11-6 0 3 3 0 016 0z',
    'M21 16a3 3 0 11-6 0 3 3 0 016 0z',
  ],
  archive: ['M21 8v13H3V8', 'M1 3h22v5H1z', 'M10 12h4'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  trash: [
    'M3 6h18',
    'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
    'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  ],
  folderPlus: [
    'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
    'M12 11v6',
    'M9 14h6',
  ],
  back: ['M9 14L4 9l5-5', 'M20 20v-7a4 4 0 00-4-4H4'],
  sun: [
    'M12 7a5 5 0 100 10 5 5 0 000-10z',
    'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  ],
  moon: ['M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  chevronLeft: ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'],
  code: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  text: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h5'],
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const d = PATHS[name] || PATHS.file
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}
