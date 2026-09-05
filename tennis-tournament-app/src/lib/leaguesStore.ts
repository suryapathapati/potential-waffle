import { useEffect, useRef, useState } from 'react'
import type { League } from '../types'
import { loadLeagues, saveLeagues } from './storage'
import { supabase } from './supabaseClient'

const TABLE = 'leagues'

interface LeagueRow {
  id: string
  data: League
}

/**
 * Persists leagues to Supabase (survives across browsers, devices and
 * sessions, and syncs live between anyone viewing the same link) when a
 * project is configured via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 * Falls back to localStorage otherwise.
 */
export function useLeaguesStore() {
  const [leagues, setLeagues] = useState<League[]>(() => (supabase ? [] : loadLeagues()))
  const [ready, setReady] = useState(() => !supabase)
  const usingSupabase = useRef(!!supabase)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    supabase
      .from(TABLE)
      .select('id, data')
      .then(
        ({ data, error }) => {
          if (cancelled) return
          if (error) {
            console.error('Failed to load seasons from Supabase', error)
            setLeagues(loadLeagues())
          } else {
            setLeagues(((data ?? []) as LeagueRow[]).map((row) => row.data))
          }
          setReady(true)
        },
        (err) => {
          if (cancelled) return
          console.error('Failed to reach Supabase', err)
          setLeagues(loadLeagues())
          setReady(true)
        },
      )

    const channel = supabase
      .channel('leagues-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          setLeagues((prev) => {
            if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as Partial<LeagueRow>).id
              return prev.filter((l) => l.id !== deletedId)
            }
            const row = payload.new as LeagueRow
            const exists = prev.some((l) => l.id === row.id)
            return exists
              ? prev.map((l) => (l.id === row.id ? row.data : l))
              : [...prev, row.data]
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase?.removeChannel(channel)
    }
  }, [])

  function applyLocallyIfNoSupabase(updater: (prev: League[]) => League[]) {
    if (usingSupabase.current) return
    setLeagues((prev) => {
      const next = updater(prev)
      saveLeagues(next)
      return next
    })
  }

  function createLeague(league: League) {
    applyLocallyIfNoSupabase((prev) => [...prev, league])
    if (usingSupabase.current) {
      setLeagues((prev) => [...prev, league])
      supabase
        ?.from(TABLE)
        .insert({ id: league.id, data: league })
        .then(
          ({ error }) => error && console.error('Failed to save season', error),
          (err) => console.error('Failed to reach Supabase', err),
        )
    }
  }

  function updateLeague(updated: League) {
    applyLocallyIfNoSupabase((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    if (usingSupabase.current) {
      setLeagues((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      supabase
        ?.from(TABLE)
        .update({ data: updated })
        .eq('id', updated.id)
        .then(
          ({ error }) => error && console.error('Failed to save season', error),
          (err) => console.error('Failed to reach Supabase', err),
        )
    }
  }

  function deleteLeague(id: string) {
    applyLocallyIfNoSupabase((prev) => prev.filter((l) => l.id !== id))
    if (usingSupabase.current) {
      setLeagues((prev) => prev.filter((l) => l.id !== id))
      supabase
        ?.from(TABLE)
        .delete()
        .eq('id', id)
        .then(
          ({ error }) => error && console.error('Failed to delete season', error),
          (err) => console.error('Failed to reach Supabase', err),
        )
    }
  }

  return { leagues, ready, createLeague, updateLeague, deleteLeague }
}
