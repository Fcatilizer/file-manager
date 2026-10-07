import { useId } from 'react'

/** Independent decorative pieces keep the garden easy to extend. */
export function Bonsai() {
  return <svg className="zen-bonsai" preserveAspectRatio="xMidYMax meet" viewBox="0 0 300 230" fill="none">
    <ellipse cx="146" cy="218" rx="86" ry="7" className="zen-shadow" />
    <path d="M102 204H191L177 221H119Z" className="zen-pot" />
    <path d="M96 202Q145 194 197 202L193 208H100Z" className="zen-pot-rim" />
    <g className="zen-growth">
    <path d="M132 201C149 183 131 170 147 152C164 134 139 119 150 104C161 89 181 93 186 73" className="zen-trunk" strokeWidth="13" strokeLinecap="round" />
    <path d="M147 153Q115 157 99 133M152 136Q187 131 207 113M147 113Q117 111 116 92M171 91Q154 72 153 62" className="zen-trunk" strokeWidth="5" strokeLinecap="round" />
    <path d="M132 201Q119 199 115 203M137 198Q158 194 171 203" className="zen-trunk" strokeWidth="4" strokeLinecap="round" />
    <g className="zen-canopy">
      <g className="zen-leaf-pad">
        <path d="M65 132Q55 122 72 116Q71 100 93 102Q101 88 120 101Q140 99 143 113Q157 131 135 137Q96 143 65 132Z" className="zen-leaf" />
        <path d="M78 118Q99 109 125 117M91 132l8-3m18 3 6-3" className="zen-leaf-highlight" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="zen-leaf-pad">
        <path d="M172 113Q159 102 178 94Q175 79 196 80Q207 69 222 81Q244 78 245 96Q262 111 244 118Q200 126 172 113Z" className="zen-leaf" />
        <path d="M187 96Q208 87 232 97M195 113l7-3m18 4 7-3" className="zen-leaf-highlight" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="zen-leaf-pad">
        <path d="M113 80Q101 68 119 60Q117 46 139 46Q150 33 167 44Q190 36 195 54Q214 58 207 75Q182 88 113 80Z" className="zen-leaf" />
        <path d="M127 62Q154 51 188 63M136 74l7-3m18 3 7-3" className="zen-leaf-highlight" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </g>
    </g>
    <g className="zen-shedding" fill="none">
      {[0, 1, 2, 3, 4].map(index => <g key={index} transform={`translate(${95 + index * 28} ${85 + index % 3 * 16})`}>
        <path className={`zen-shed-leaf zen-shed-leaf--${index}`} d="M0 0Q14-9 17 1Q9 10 0 0Z" />
      </g>)}
    </g>
  </svg>
}
export function GardenRocks() {
  return <svg className="zen-rocks" preserveAspectRatio="xMidYMax meet" viewBox="0 0 180 90">
    <ellipse cx="89" cy="80" rx="79" ry="8" className="zen-shadow" />
    <path d="M41 71L51 31L73 17L98 27L121 68L100 79H59Z" className="zen-stone" />
    <path d="M52 33L73 19L97 28L110 55L84 44Z" className="zen-stone-light" />
    <path d="M96 76L113 48L138 44L159 64L160 78L130 83Z" className="zen-stone" />
    <path d="M111 53L139 46L154 64L131 61Z" className="zen-stone-light" />
    <path d="M18 77L26 60L42 56L57 74L48 82H28Z" className="zen-stone" />
    <path d="M32 70Q45 66 53 76M105 72Q123 66 133 77" className="zen-moss" fill="none" strokeWidth="3" strokeLinecap="round" />
  </svg>
}
export function GardenLantern() {
  const glow = useId()
  return <svg className="zen-lantern" preserveAspectRatio="xMidYMax meet" viewBox="0 0 120 190">
    <defs><radialGradient id={glow}><stop stopColor="#efb64f" stopOpacity=".8" /><stop offset="1" stopColor="#efb64f" stopOpacity="0" /></radialGradient></defs>
    <ellipse cx="60" cy="176" rx="45" ry="7" className="zen-shadow" />
    <g className="zen-lantern-light"><ellipse cx="60" cy="103" rx="57" ry="70" fill={`url(#${glow})`} /><rect x="43" y="78" width="34" height="43" rx="3" fill="#efcb88" opacity=".75" /></g>
    <path className="zen-flame" d="M60 88C47 101 51 113 60 113C70 113 72 104 65 98Q61 96 60 88Z" fill="#fff2b4" stroke="#ce8e2e" strokeWidth="1.5" />
    <path d="M51 29Q60 18 69 29L66 42H54ZM26 171L34 158H86L94 171ZM51 153L53 126H67L69 153Z" className="zen-stone" />
    <path d="M30 68L45 48H75L90 68L103 73Q60 85 17 73ZM33 122H87L80 133H40Z" className="zen-stone" />
    <path d="M43 81V119M77 81V119M60 81V118" className="zen-lantern-frame" fill="none" strokeWidth="5" />
    <path d="M33 68L47 51H73L87 68Q60 64 33 68Z" className="zen-stone-light" />
    <path d="M36 160H84" className="zen-lantern-frame" fill="none" strokeWidth="3" />
  </svg>
}
export function RakedSand() {
  return <svg className="zen-sand" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none">
    <path d="M0 39Q180 10 355 46T685 43T1000 30V100H0Z" className="zen-sand-bed" />
    {[0, 1, 2, 3, 4].map(line => <path key={line} pathLength="100" d={`M-20 ${52 + line * 9}Q130 ${20 + line * 9} 310 ${54 + line * 8}T635 ${54 + line * 8}T1020 ${37 + line * 9}`} className="zen-sand-line" />)}
    <g className="zen-sand-rings">{[0, 1, 2].map(ring => <ellipse key={ring} cx="676" cy="72" rx={65 + ring * 16} ry={9 + ring * 6} />)}</g>
  </svg>
}
