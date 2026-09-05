import type { Tournament } from '../types'

const STORAGE_KEY = 'tennis-tournaments'

export function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Tournament[]
  } catch {
    return []
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments))
  } catch {
    // Storage unavailable (private mode, quota exceeded) — state stays in memory only.
  }
}
