import {
  createContext, useContext, useState, useRef, useMemo, useCallback, type ReactNode,
} from 'react'
import { GameEngine } from '../engine/GameEngine'
import { UNIT_STATS } from '../engine/units'
import { P2PConnection } from '../engine/P2PConnection'
import type { P2PStatus, P2PMessage } from '../engine/P2PConnection'
import type { PlayerId, UnitType, Unit, Position, ActionType, UnitStats } from '../types/game'
import { useAudio } from '../audio/AudioContext'

interface GameContextValue {
  engine: GameEngine
  board: (Unit | null)[][]
  currentPlayer: PlayerId
  turn: number
  gameOver: boolean
  players: GameEngine['players']
  selectedCard: GameEngine['selectedCard']
  selectedUnit: GameEngine['selectedUnit']
  selectedAction: ActionType
  validMoves: Position[]
  validAttacks: Position[]
  timerMode: boolean
  movedUnitThisTurn: Unit | null
  timerSeconds: number
  cpuMode: boolean
  chatMessages: { player: number; text: string }[]
  addChatMessage: (player: number, text: string) => void
  hoveredUnit: Unit | null
  setHoveredUnit: (u: Unit | null) => void

  selectCard: (type: UnitType) => void
  deselectCard: () => void
  clickCell: (row: number, col: number) => void
  endTurn: () => void
  resetGame: () => void
  setTimerMode: (v: boolean) => void
  setCpuMode: (v: boolean) => void
  getUnitStats: (type: UnitType) => Omit<UnitStats, 'name'>

  p2pConnection: P2PConnection | null
  p2pStatus: P2PStatus
  hostGame: () => void
  joinGame: (id: string) => void
}

const GameContext = createContext<GameContextValue | null>(null)

function makeEngine() {
  return new GameEngine()
}

function selectUnitWithDefaults(engine: GameEngine, row: number, col: number) {
  const unit = engine.board[row][col]
  if (!unit || unit.player !== engine.currentPlayer || unit.justSpawned) return

  engine.selectedUnit = { row, col, unit }
  const attacks = engine.getValidAttacks(row, col)
  const moves = engine.getValidMoves(row, col)

  if (attacks.length > 0) {
    engine.selectedAction = 'attack'
    engine.validAttacks = attacks
  } else if (moves.length > 0 && !unit.hasMoved) {
    engine.selectedAction = 'move'
    engine.validMoves = moves
  }
}

function handleSpawnOrMove(engine: GameEngine, row: number, col: number) {
  if (engine.selectedCard) {
    const ok = engine.placeUnit(engine.selectedCard.type, engine.currentPlayer, row, col)
    if (ok) {
      engine.selectedCard = null
      engine.endTurn()
    }
    return
  }

  if (engine.selectedUnit) {
    const unit = engine.selectedUnit.unit
    const pos = engine.getUnitPosition(unit)
    if (!pos) return

    if (pos.row === row && pos.col === col) {
      engine.selectedUnit = null
      engine.selectedAction = null
      engine.validMoves = []
      engine.validAttacks = []
      return
    }

    const target = engine.board[row][col]
    if (target && target.player === engine.currentPlayer) {
      selectUnitWithDefaults(engine, row, col)
      return
    }

    const attacks = engine.getValidAttacks(pos.row, pos.col)
    if (attacks.some(a => a.row === row && a.col === col)) {
      engine.attackUnit(pos.row, pos.col, row, col)
      engine.selectedUnit = null
      engine.selectedAction = null
      engine.validMoves = []
      engine.validAttacks = []
      if (!engine.gameOver) engine.endTurn()
      return
    }

    const moves = engine.getValidMoves(pos.row, pos.col)
    if (moves.some(m => m.row === row && m.col === col)) {
      engine.moveUnit(pos.row, pos.col, row, col)
      engine.selectedUnit = null
      engine.selectedAction = null
      engine.validMoves = []
      engine.validAttacks = []
      return
    }

    engine.selectedUnit = null
    engine.selectedAction = null
    engine.validMoves = []
    engine.validAttacks = []
    return
  }

  selectUnitWithDefaults(engine, row, col)
}

export function GameProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(makeEngine, [])
  const [, forceRender] = useState(0)
  const bumpRef = useRef(0)
  const audio = useAudio()

  const bump = useCallback(() => {
    bumpRef.current++
    forceRender(n => n + 1)
  }, [])

  // Wire sound hooks
  useMemo(() => {
    engine.onPlaySound = (sound, reset) => audio.playSound(sound, reset)
    engine.onStopSound = (sound) => audio.stopSound(sound)
    engine.onTransitionSong = (from, to, restart) => audio.transitionSong(from, to, restart)
    engine.onSetVolume = (sound, vol) => audio.setVolume(sound, vol)
  }, [engine, audio])

  // Init engine after hooks are wired and audio is loaded
  useMemo(() => {
    engine.init()
  }, [engine])

  // Subscribe to engine events
  useMemo(() => {
    const events: (keyof import('../types/game').GameEventMap)[] = [
      'unitPlaced', 'unitMoved', 'unitAttacked', 'unitDestroyed',
      'turnChanged', 'gameOver', 'manaChanged', 'cardDrawn',
      'abilityUsed', 'timerTick', 'timerEnded',
    ]
    for (const ev of events) {
      engine.on(ev as any, bump)
    }
  }, [engine, bump])

  // ── Hover ────────────────────────────────────────────────────

  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null)

  // ── Chat ─────────────────────────────────────────────────────

  const [chatMessages, setChatMessages] = useState<{ player: number; text: string }[]>([])

  const addChatMessage = useCallback((player: number, text: string) => {
    setChatMessages(prev => [{ player, text }, ...prev])
  }, [])

  // ── P2P ──────────────────────────────────────────────────────

  const p2pRef = useRef<P2PConnection | null>(null)
  const [p2pStatus, setP2pStatus] = useState<P2PStatus>('disconnected')
  const applyingState = useRef(false)

  if (!p2pRef.current) {
    const p2p = new P2PConnection()
    p2pRef.current = p2p

    p2p.setStatusHandler((s) => {
      setP2pStatus(s)
    })

    p2p.setPeerIdHandler(() => {
      bump()
    })

    p2p.setMessageHandler((msg: P2PMessage) => {
      handleP2PMessage(msg)
    })
  }

  const p2p = p2pRef.current

  const hostGame = useCallback(() => {
    p2p.hostGame()
    bump()
  }, [p2p, bump])

  const joinGame = useCallback((id: string) => {
    p2p.joinGame(id)
    bump()
  }, [p2p, bump])

  function handleP2PMessage(msg: P2PMessage) {
    if (msg.type === 'action' && msg.action) {
      const action = msg.action
      // SendMessage handled by both host and guest
      if (action.type === 'sendMessage') {
        addChatMessage(action.payload?.player as number, action.payload?.message as string)
        return
      }
      // Host receives and executes guest actions
      if (p2p.isHost) {
        switch (action.type) {
          case 'endTurn':
            engine.endTurn()
            break
          case 'endGame':
            engine.gameOver = true
            engine.emit('gameOver', { winner: (action.payload?.winner as number) as PlayerId })
            break
          case 'resetGame':
            engine.init()
            break
        }
        // Send state back to guest after executing
        const state = engine.getSerializableState()
        p2p.sendMessage({ type: 'gameState', state: { ...state, timestamp: Date.now() } as any })
        bump()
      }
    } else if (msg.type === 'gameState' && msg.state && !p2p.isHost) {
      // Guest receives state from host
      applyingState.current = true
      engine.applySerializedState(msg.state as any)
      applyingState.current = false
      bump()
    }
  }

  // After engine actions, sync state to peer
  function syncToPeer() {
    if (p2p.status !== 'connected') return
    if (applyingState.current) return

    if (p2p.isHost) {
      const state = engine.getSerializableState()
      p2p.sendMessage({ type: 'gameState', state: { ...state, timestamp: Date.now() } as any })
    } else {
      // Guest sends endTurn to host
      // (placeUnit, moveUnit, attackUnit are not forwarded individually for now)
    }
  }

  // ── Game actions ─────────────────────────────────────────────

  const selectCard = useCallback((type: UnitType) => {
    if (engine.gameOver) return
    engine.selectedCard = { type, cost: UNIT_STATS[type].cost }
    bump()
  }, [engine, bump])

  const deselectCard = useCallback(() => {
    engine.selectedCard = null
    bump()
  }, [engine, bump])

  const clickCell = useCallback((row: number, col: number) => {
    handleSpawnOrMove(engine, row, col)
    if (engine.selectedUnit) {
      audio.playSound('pop')
    }
    bump()
    syncToPeer()
  }, [engine, bump, audio])

  const endTurn = useCallback(() => {
    engine.endTurn()
    bump()
    syncToPeer()
  }, [engine, bump])

  const resetGame = useCallback(() => {
    engine.init()
    bump()
    if (p2p.status === 'connected' && p2p.isHost) {
      const state = engine.getSerializableState()
      p2p.sendMessage({ type: 'gameState', state: { ...state, timestamp: Date.now() } as any })
    }
  }, [engine, bump, p2p])

  const setTimerModeFn = useCallback((v: boolean) => {
    engine.setTimerMode(v)
    bump()
  }, [engine, bump])

  const setCpuModeFn = useCallback((v: boolean) => {
    engine.setCpuMode(v)
    bump()
  }, [engine, bump])

  const getUnitStats = useCallback((type: UnitType) => UNIT_STATS[type], [])

  const value: GameContextValue = {
    engine,
    board: engine.board,
    currentPlayer: engine.currentPlayer,
    turn: engine.turn,
    gameOver: engine.gameOver,
    players: engine.players,
    selectedCard: engine.selectedCard,
    selectedUnit: engine.selectedUnit,
    selectedAction: engine.selectedAction,
    validMoves: engine.validMoves,
    validAttacks: engine.validAttacks,
    timerMode: engine.timerMode,
    movedUnitThisTurn: engine.movedUnitThisTurn,
    timerSeconds: engine.timerSeconds,
    cpuMode: engine.cpuMode,
    selectCard,
    deselectCard,
    clickCell,
    endTurn,
    resetGame,
    setTimerMode: setTimerModeFn,
    setCpuMode: setCpuModeFn,
    getUnitStats,
    p2pConnection: p2p,
    p2pStatus,
    hostGame,
    joinGame,
    chatMessages,
    addChatMessage,
    hoveredUnit,
    setHoveredUnit,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
