/** Stable IDs shared by the picker and server allowlist. Artwork is bundled locally. */
export const AVATARS = [
  { id: 'initial', label: 'Your initial', group: 'Default' },
  { id: 'cat', label: 'Cosmic cat', group: 'Characters' },
  { id: 'fox', label: 'Forest fox', group: 'Characters' },
  { id: 'panda', label: 'Sleepy panda', group: 'Characters' },
  { id: 'frog', label: 'Happy frog', group: 'Characters' },
  { id: 'robot', label: 'Little robot', group: 'Gaming' },
  { id: 'ninja', label: 'Night ninja', group: 'Gaming' },
  { id: 'astronaut', label: 'Space explorer', group: 'Gaming' },
  { id: 'ghost', label: 'Friendly ghost', group: 'Gaming' },
  { id: 'gamepad', label: 'Player one', group: 'Gaming' },
  { id: 'yin-yang', label: 'Yin-yang', group: 'Symbols' },
  { id: 'lotus', label: 'Lotus', group: 'Symbols' },
  { id: 'star', label: 'Lucky star', group: 'Symbols' },
] as const
export type AvatarId = typeof AVATARS[number]['id']
export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === 'string' && AVATARS.some(avatar => avatar.id === value)
}
export function normalizeAvatar(value: unknown): AvatarId { return isAvatarId(value) ? value : 'initial' }
