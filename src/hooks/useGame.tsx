import {
  createContext, useContext, useState, useRef, useMemo, useCallback, type ReactNode,
} from 'react'
import { GameEngine } from '../engine/GameEngine'
import { UNIT_STATS } from '../engine/units'
import type { PlayerId, UnitType, Unit, Position, ActionType, UnitStats } from '../types/game'

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

  selectCard: (type: UnitType) => void
  deselectCard: () => void
  clickCell: (row: number, col: number) => void
  endTurn: () => void
  resetGame: () => void
  setTimerMode: (v: boolean) => void
  getUnitStats: (type: UnitType) => Omit<UnitStats, 'name'>
}

const GameContext = createContext<GameContextValue | null>(null)

function makeEngine() {
  const engine = new GameEngine()
  engine.init()
  return engine
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
  // If a card is selected, try to spawn
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

    // Clicking on same unit -> deselect
    if (pos.row === row && pos.col === col) {
      engine.selectedUnit = null
      engine.selectedAction = null
      engine.validMoves = []
      engine.validAttacks = []
      return
    }

    // Clicking on another own unit -> switch selection
    const target = engine.board[row][col]
    if (target && target.player === engine.currentPlayer) {
      selectUnitWithDefaults(engine, row, col)
      return
    }

    // Try attack
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

    // Try move
    const moves = engine.getValidMoves(pos.row, pos.col)
    if (moves.some(m => m.row === row && m.col === col)) {
      engine.moveUnit(pos.row, pos.col, row, col)
      engine.selectedUnit = null
      engine.selectedAction = null
      engine.validMoves = []
      engine.validAttacks = []
      return
    }

    // Deselect
    engine.selectedUnit = null
    engine.selectedAction = null
    engine.validMoves = []
    engine.validAttacks = []
    return
  }

  // Nothing selected -> try selecting a unit
  selectUnitWithDefaults(engine, row, col)
}

export function GameProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(makeEngine, [])
  const [, forceRender] = useState(0)
  const bumpRef = useRef(0)

  const bump = useCallback(() => {
    bumpRef.current++
    forceRender(n => n + 1)
  }, [])

  // Subscribe to engine events once
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
    bump()
  }, [engine, bump])

  const endTurn = useCallback(() => {
    engine.endTurn()
    bump()
  }, [engine, bump])

  const resetGame = useCallback(() => {
    engine.init()
    bump()
  }, [engine, bump])

  const setTimerModeFn = useCallback((v: boolean) => {
    engine.setTimerMode(v)
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
    selectCard,
    deselectCard,
    clickCell,
    endTurn,
    resetGame,
    setTimerMode: setTimerModeFn,
    getUnitStats,
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
