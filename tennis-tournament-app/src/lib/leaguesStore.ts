import { useEffect, useRef, useState } from 'react'
import type { League } from '../types'
import { loadLeagues, saveLeagues } from './storage'

interface DbDocSnapshot {
  data(): Record<string, unknown> | undefined
}

interface DbCollectionQuerySnapshot {
  docs: DbDocSnapshot[]
}

interface DbDocumentReference {
  set(data: Record<string, unknown>): Promise<void>
  delete(): Promise<void>
}

interface DbCollectionReference {
  doc(id?: string): DbDocumentReference
  onSnapshot(
    next: (snap: DbCollectionQuerySnapshot) => void,
    error?: (e: unknown) => void,
  ): () => void
}

interface Db {
  collection(path: string): DbCollectionReference
}

const LEAGUES_COLLECTION = 'leagues'

/**
 * Persists leagues to the Artifact `db` capability when this page is running as
 * a published Artifact (survives reloads and separate browser sessions), and
 * falls back to localStorage otherwise (e.g. self-hosted outside claude.ai).
 */
export function useLeaguesStore() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [ready, setReady] = useState(false)
  const dbRef = useRef<Db | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function init() {
      const claude = window.claude
      const db = claude ? ((await claude.use('db').catch(() => null)) as Db | null) : null
      if (cancelled) return

      if (db) {
        dbRef.current = db
        unsubscribe = db.collection(LEAGUES_COLLECTION).onSnapshot(
          (snap) => {
            setLeagues(snap.docs.map((d) => d.data() as unknown as League))
            setReady(true)
          },
          () => setReady(true),
        )
      } else {
        setLeagues(loadLeagues())
        setReady(true)
      }
    }

    init()
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  function applyLocally(updater: (prev: League[]) => League[]) {
    setLeagues((prev) => {
      const next = updater(prev)
      if (!dbRef.current) saveLeagues(next)
      return next
    })
  }

  function createLeague(league: League) {
    applyLocally((prev) => [...prev, league])
    dbRef.current
      ?.collection(LEAGUES_COLLECTION)
      .doc(league.id)
      .set(league as unknown as Record<string, unknown>)
      .catch((err) => console.error('Failed to save season', err))
  }

  function updateLeague(updated: League) {
    applyLocally((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    dbRef.current
      ?.collection(LEAGUES_COLLECTION)
      .doc(updated.id)
      .set(updated as unknown as Record<string, unknown>)
      .catch((err) => console.error('Failed to save season', err))
  }

  function deleteLeague(id: string) {
    applyLocally((prev) => prev.filter((l) => l.id !== id))
    dbRef.current
      ?.collection(LEAGUES_COLLECTION)
      .doc(id)
      .delete()
      .catch((err) => console.error('Failed to delete season', err))
  }

  return { leagues, ready, createLeague, updateLeague, deleteLeague }
}
