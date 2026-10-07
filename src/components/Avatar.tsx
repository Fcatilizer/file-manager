import { normalizeAvatar, type AvatarId } from '../lib/avatars'
import '../styles/avatar.css'

/** Original SVG characters: no external images, tracking requests, or uploads. */
function Artwork({ id }: { id: AvatarId }) {
  switch (id) {
    case 'cat': return <><circle cx="32" cy="32" r="32" fill="#ddd7fa" /><path d="M14 29V12L27 21H38L50 12V31" fill="#7462b7" /><ellipse cx="32" cy="36" rx="22" ry="19" fill="#9a86cf" /><path d="M21 34h3m16 0h3M28 43q4 5 8 0" stroke="#302443" strokeWidth="3" strokeLinecap="round" /><path d="m28 38 4 4 4-4" fill="#f7c4d2" /><path d="M5 39l13 2M46 41l13-2" stroke="#7462b7" strokeWidth="2" /></>
    case 'fox': return <><circle cx="32" cy="32" r="32" fill="#fce5ca" /><path d="M11 10L30 22L51 10L54 39L32 57L10 39Z" fill="#e88a45" /><path d="M11 31L32 45L53 31L46 48L32 57L18 48Z" fill="#fff0d9" /><path d="m27 43 5 6 5-6" fill="#493329" /><circle cx="22" cy="32" r="2.5" fill="#493329" /><circle cx="42" cy="32" r="2.5" fill="#493329" /></>
    case 'panda': return <><circle cx="32" cy="32" r="32" fill="#cbe7dd" /><g fill="#35444b"><circle cx="17" cy="18" r="10" /><circle cx="47" cy="18" r="10" /></g><ellipse cx="32" cy="36" rx="24" ry="23" fill="#fff9eb" /><g fill="#35444b"><ellipse cx="22" cy="33" rx="7" ry="9" transform="rotate(25 22 33)" /><ellipse cx="42" cy="33" rx="7" ry="9" transform="rotate(-25 42 33)" /><path d="m27 44 5 5 5-5Z" /></g><path d="M19 33h6m14 0h6" stroke="#fff9eb" strokeWidth="2" strokeLinecap="round" /></>
    case 'frog': return <><circle cx="32" cy="32" r="32" fill="#d9edc7" /><ellipse cx="32" cy="39" rx="25" ry="18" fill="#77b68a" /><g fill="#77b68a"><circle cx="18" cy="23" r="11" /><circle cx="46" cy="23" r="11" /></g><g fill="#fffce4"><circle cx="18" cy="23" r="7" /><circle cx="46" cy="23" r="7" /></g><g fill="#244d3b"><circle cx="19" cy="23" r="3" /><circle cx="45" cy="23" r="3" /></g><path d="M21 40q11 12 22 0" fill="none" stroke="#244d3b" strokeWidth="3" strokeLinecap="round" /></>
    case 'robot': return <><circle cx="32" cy="32" r="32" fill="#cce8f4" /><path d="M32 11v9" stroke="#426a89" strokeWidth="3" /><circle cx="32" cy="10" r="4" fill="#f0ac64" /><rect x="10" y="20" width="44" height="34" rx="10" fill="#638bac" /><rect x="16" y="26" width="32" height="15" rx="6" fill="#203c56" /><g fill="#9df4ed"><circle cx="24" cy="33" r="3" /><circle cx="40" cy="33" r="3" /></g><path d="M25 47h14" stroke="#cce8f4" strokeWidth="3" strokeLinecap="round" /></>
    case 'ninja': return <><circle cx="32" cy="32" r="32" fill="#ddd9ed" /><ellipse cx="32" cy="35" rx="23" ry="26" fill="#3b3b54" /><path d="M9 25h46v15H9Z" fill="#f4cfad" /><path d="M8 22h48v6H8Z" fill="#ae607e" /><path d="m53 24 10-6-2 14Z" fill="#ae607e" /><path d="M20 32l6 2m12 0 6-2" stroke="#3b3b54" strokeWidth="3" strokeLinecap="round" /></>
    case 'astronaut': return <><circle cx="32" cy="32" r="32" fill="#cdd5f6" /><path d="m10 9 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="#fff1b5" /><path d="M12 64V49q20-16 40 0v15" fill="#f5f0e8" /><circle cx="32" cy="30" r="22" fill="#f5f0e8" /><rect x="15" y="17" width="34" height="26" rx="13" fill="#4b557e" /><path d="M22 26q4-5 10-5" fill="none" stroke="#a4c6e7" strokeWidth="3" strokeLinecap="round" /><path d="M29 56h6" stroke="#d28c6e" strokeWidth="4" /></>
    case 'ghost': return <><circle cx="32" cy="32" r="32" fill="#d9cef1" /><path d="M13 54V30a19 19 0 0 1 38 0v24l-9-5-10 6-10-6Z" fill="#fff9f0" /><ellipse cx="25" cy="31" rx="3" ry="5" fill="#5c537c" /><ellipse cx="39" cy="31" rx="3" ry="5" fill="#5c537c" /><ellipse cx="32" cy="42" rx="4" ry="3" fill="#d599b1" /></>
    case 'gamepad': return <><circle cx="32" cy="32" r="32" fill="#d3e8dc" /><path d="M18 20h28q7 0 10 22t-13 5l-5-5H26l-5 5q-16 17-13-5t10-22Z" fill="#497765" /><path d="M20 27v12m-6-6h12" stroke="#e9f5de" strokeWidth="4" strokeLinecap="round" /><circle cx="43" cy="29" r="3" fill="#f4d37c" /><circle cx="49" cy="36" r="3" fill="#e6a1ad" /></>
    case 'yin-yang': return <><circle cx="32" cy="32" r="32" fill="#e5dfd3" /><circle cx="32" cy="32" r="24" fill="#fcfaf3" /><path d="M32 8a24 24 0 0 1 0 48 12 12 0 0 1 0-24 12 12 0 0 0 0-24Z" fill="#34454b" /><circle cx="32" cy="20" r="4" fill="#34454b" /><circle cx="32" cy="44" r="4" fill="#fcfaf3" /></>
    case 'lotus': return <><circle cx="32" cy="32" r="32" fill="#f5dce4" /><path d="M32 51Q6 50 7 25q16 0 25 15Q41 25 57 25q1 25-25 26" fill="#af7396" /><path d="M32 51Q12 29 32 10q20 19 0 41" fill="#d59ab4" /><path d="M32 49V25" stroke="#fcebf0" strokeWidth="2" strokeLinecap="round" /></>
    case 'star': return <><circle cx="32" cy="32" r="32" fill="#dbe4f7" /><path d="m32 8 7 15 17 2-12 12 3 18-15-8-15 8 3-18L8 25l17-2Z" fill="#f0c368" stroke="#c99a43" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="27" cy="32" r="2" fill="#6b542f" /><circle cx="37" cy="32" r="2" fill="#6b542f" /><path d="M28 38q4 4 8 0" fill="none" stroke="#6b542f" strokeWidth="2" strokeLinecap="round" /></>
    default: return null
  }
}

export default function Avatar({ avatar, name, className = '' }: { avatar?: string; name: string; className?: string }) {
  const id = normalizeAvatar(avatar)
  return <span className={`vault-avatar ${className}`} aria-hidden="true" data-avatar={id}>
    {id === 'initial' ? Array.from(name.trim())[0]?.toUpperCase() || '?' : <svg viewBox="0 0 64 64" focusable="false"><Artwork id={id} /></svg>}
  </span>
}
