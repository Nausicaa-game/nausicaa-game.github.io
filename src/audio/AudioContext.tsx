import { createContext, useContext, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react'

interface AudioContextValue {
  loadSong: (name: string, url: string, loop?: boolean) => void
  playSound: (name: string, reset?: boolean) => void
  stopSound: (name: string) => void
  stopAllSounds: () => void
  setVolume: (name: string, volume: number) => void
  fadeSong: (name: string, fadeIn: boolean, duration?: number, callback?: () => void) => void
  transitionSong: (fromName: string, toName: string, reset?: boolean) => void
}

const AudioCtx = createContext<AudioContextValue | null>(null)

const SONG_REGISTRY: [string, string, boolean?][] = [
  ['menu', '/assets/songs/menu.mp3', true],
  ['menu_next', '/assets/songs/menu_next.mp3', true],
  ['buttonClick', '/assets/songs/button_click.mp3'],
  ['firstOracle', '/assets/songs/first-player-oracle.mp3'],
  ['secondOracle', '/assets/songs/second-player-oracle.mp3'],
  ['pop', '/assets/songs/pop.mp3'],
  ['clic', '/assets/songs/clic.mp3'],
  ['attack', '/assets/songs/attack.mp3'],
  ['oraclePut', '/assets/songs/oracle_put.mp3'],
  ['firstRound', '/assets/songs/first_round.mp3', true],
  ['announcer:allPick', '/assets/songs/all_pick.mp3'],
  ['announcer:battleBegins', '/assets/songs/battle_begins.mp3'],
  ['placed', '/assets/songs/placed.mp3'],
  ['victory', '/assets/songs/victory.mp3'],
  ['defeat', '/assets/songs/defeat.mp3'],
  ['yourTurn', '/assets/songs/your_turn.mp3'],
  ['notification', '/assets/songs/notification.mp3'],
  ['timer', '/assets/songs/timer.mp3'],
  ['manualEndTurn', '/assets/songs/manual_endturn.mp3'],
]

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<Record<string, HTMLAudioElement>>({})
  const playingRef = useRef<string[]>([])

  const stopSound = useCallback((name: string) => {
    const el = audioRef.current[name]
    if (el) {
      el.pause()
      el.currentTime = 0
      playingRef.current = playingRef.current.filter(s => s !== name)
    }
  }, [])

  const loadSong = useCallback((name: string, url: string, loop = false) => {
    if (!audioRef.current[name]) {
      const el = new Audio(url)
      el.loop = loop
      el.addEventListener('ended', () => {
        const e = audioRef.current[name]
        if (e) {
          e.pause()
          e.currentTime = 0
          playingRef.current = playingRef.current.filter(s => s !== name)
        }
      })
      audioRef.current[name] = el
    }
  }, [])

  const playSound = useCallback((name: string, reset = false) => {
    const el = audioRef.current[name]
    if (el) {
      if (reset) el.currentTime = 0
      el.play().catch(() => {})
      if (!playingRef.current.includes(name)) {
        playingRef.current.push(name)
      }
    }
  }, [])

  const stopAllSounds = useCallback(() => {
    playingRef.current.forEach(name => {
      const el = audioRef.current[name]
      if (el) {
        el.pause()
        el.currentTime = 0
      }
    })
    playingRef.current = []
  }, [])

  const setVolume = useCallback((name: string, volume: number) => {
    const el = audioRef.current[name]
    if (el) el.volume = volume
  }, [])

  const fadeSong = useCallback((name: string, fadeIn: boolean, duration = 1, callback?: () => void) => {
    const el = audioRef.current[name]
    if (!el) return
    const steps = 50
    let currentStep = 0
    el.volume = fadeIn ? 0 : 1
    if (fadeIn) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
    const interval = setInterval(() => {
      currentStep++
      el.volume = fadeIn
        ? Math.min(1, currentStep / steps)
        : Math.max(0, 1 - currentStep / steps)
      if (currentStep >= steps) {
        clearInterval(interval)
        el.volume = fadeIn ? 1 : 0
        if (!fadeIn) {
          el.pause()
          el.currentTime = 0
          playingRef.current = playingRef.current.filter(s => s !== name)
        }
        callback?.()
      }
    }, (duration * 1000) / steps)
  }, [])

  const transitionSong = useCallback((fromName: string, toName: string, reset = false) => {
    fadeSong(fromName, false, 1, () => {
      playSound(toName, reset)
      fadeSong(toName, true, 1)
    })
  }, [fadeSong, playSound])

  useEffect(() => {
    for (const [name, url, loop] of SONG_REGISTRY) {
      loadSong(name, url, loop)
    }
  }, [loadSong])

  const value = useMemo<AudioContextValue>(() => ({
    loadSong, playSound, stopSound, stopAllSounds, setVolume, fadeSong, transitionSong,
  }), [loadSong, playSound, stopSound, stopAllSounds, setVolume, fadeSong, transitionSong])

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
