import type { FileItem } from './api'
import type { Preferences } from './preferences'

export interface PublicShareView {
  root: string
  requested: string
  folder: boolean
  sharer: string
  createdAt: string
  expiresAt: string | null
  entries: FileItem[]
  nextCursor?: string
  preferences?: Preferences
}
export function shareDuration(milliseconds: number) {
  const minutes = Math.max(1, Math.ceil(milliseconds / 60000))
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? '' : 's'}`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}
