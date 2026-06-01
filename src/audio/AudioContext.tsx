import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

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

  const stopSound = (name: string) => {
    const el = audioRef.current[name]
    if (el) {
      el.pause()
      el.currentTime = 0
      playingRef.current = playingRef.current.filter(s => s !== name)
    }
  }

  const value: AudioContextValue = {
    loadSong(name, url, loop = false) {
      if (!audioRef.current[name]) {
        const el = new Audio(url)
        el.loop = loop
        el.addEventListener('ended', () => {
          stopSound(name)
        })
        audioRef.current[name] = el
      }
    },

    playSound(name, reset = false) {
      const el = audioRef.current[name]
      if (el) {
        el.play()
        if (reset) el.currentTime = 0
        if (!playingRef.current.includes(name)) {
          playingRef.current.push(name)
        }
      }
    },

    stopSound,

    stopAllSounds() {
      playingRef.current.forEach(name => {
        const el = audioRef.current[name]
        if (el) {
          el.pause()
          el.currentTime = 0
        }
      })
      playingRef.current = []
    },

    setVolume(name, volume) {
      const el = audioRef.current[name]
      if (el) el.volume = volume
    },

    fadeSong(name, fadeIn, duration = 1, callback) {
      const el = audioRef.current[name]
      if (!el) return
      const steps = 50
      let currentStep = 0
      el.volume = fadeIn ? 0 : 1
      if (fadeIn) value.playSound(name)
      const interval = setInterval(() => {
        currentStep++
        el.volume = fadeIn
          ? Math.min(1, currentStep / steps)
          : Math.max(0, 1 - currentStep / steps)
        if (currentStep >= steps) {
          clearInterval(interval)
          el.volume = fadeIn ? 1 : 0
          if (!fadeIn) stopSound(name)
          callback?.()
        }
      }, (duration * 1000) / steps)
    },

    transitionSong(fromName, toName, reset = false) {
      value.fadeSong(fromName, false, 1, () => {
        value.playSound(toName, reset)
        value.fadeSong(toName, true, 1)
      })
    },
  }

  useEffect(() => {
    for (const [name, url, loop] of SONG_REGISTRY) {
      value.loadSong(name, url, loop)
    }
  }, [])

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
