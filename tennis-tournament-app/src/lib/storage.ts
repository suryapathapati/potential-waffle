import type { League } from '../types'

const STORAGE_KEY = 'ttl-leagues'

export function loadLeagues(): League[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as League[]
  } catch {
    return []
  }
}

export function saveLeagues(leagues: League[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leagues))
  } catch {
    // Storage unavailable (private mode, quota exceeded) — state stays in memory only.
  }
}
