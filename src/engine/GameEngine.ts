import {
  BOARD_ROWS, BOARD_COLS, MAX_MANA,
  PlayerId, UnitType, Unit, PlayerState,
  Position, SelectedCard, ActionType,
  GameEventMap, GameEventCallback,
  SerializableGameState,
} from '../types/game'
import { UNIT_STATS, DECK_COMPOSITION, isValidSpawnPosition, isDarkTile } from './units'
import { CPUPlayer } from './CPUPlayer'

type Listener = { event: keyof GameEventMap; callback: (...args: any[]) => void }

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export class GameEngine {
  // Event system
  private listeners: Listener[] = []

  // Game state
  board: (Unit | null)[][] = []
  currentPlayer: PlayerId = 1
  turn = 1
  gameOver = false
  players: Record<PlayerId, PlayerState> = {} as Record<PlayerId, PlayerState>

  // CPU
  cpuMode = false
  cpuPlayer = new CPUPlayer(this)

  // Selection state
  selectedCard: SelectedCard | null = null
  selectedUnit: { row: number; col: number; unit: Unit } | null = null
  selectedAction: ActionType = null
  validMoves: Position[] = []
  validAttacks: Position[] = []
  movedUnitThisTurn: Unit | null = null

  // Timer
  timerMode = false
  timerSeconds = 15
  private turnTimer: ReturnType<typeof setInterval> | null = null

  // Sound hooks (overridable by UI layer)
  onPlaySound: ((sound: string) => void) | null = null
  onStopSound: ((sound: string) => void) | null = null
  onTransitionSong: ((from: string, to: string, restart: boolean) => void) | null = null
  onSetVolume: ((sound: string, volume: number) => void) | null = null

  // ── Event system ──────────────────────────────────────────────

  on<E extends keyof GameEventMap>(
    event: E,
    callback: GameEventCallback<E>,
  ): () => void {
    const listener = { event, callback }
    this.listeners.push(listener as Listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  emit<E extends keyof GameEventMap>(
    event: E,
    data: GameEventMap[E],
  ): void {
    for (const l of this.listeners) {
      if (l.event === event) {
        ;(l.callback as (data: GameEventMap[E]) => void)(data)
      }
    }
  }

  // ── Initialization ───────────────────────────────────────────

  init(): void {
    this.currentPlayer = 1
    this.turn = 1
    this.gameOver = false
    this.cpuPlayer.reset()
    this.selectedCard = null
    this.selectedUnit = null
    this.selectedAction = null
    this.validMoves = []
    this.validAttacks = []
    this.movedUnitThisTurn = null
    this.stopTurnTimer()

    this.players = {
      1: this.createPlayerState(),
      2: this.createPlayerState(),
    }

    this.board = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => null),
    )

    this.drawInitialHand(1)
    this.drawInitialHand(2)
  }

  private createPlayerState(): PlayerState {
    return {
      mana: 1,
      maxMana: 1,
      deck: this.shuffleArray([...DECK_COMPOSITION]),
      hand: [],
      units: [],
      wins: 0,
    }
  }

  // ── Deck & Cards ─────────────────────────────────────────────

  private shuffleArray<T>(array: T[]): T[] {
    const a = [...array]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  private drawInitialHand(player: PlayerId): void {
    const p = this.players[player]
    while (!p.hand.includes('oracle')) {
      p.hand = []
      p.deck = this.shuffleArray([...DECK_COMPOSITION])
      this.drawCards(player, 3)
    }
  }

  drawCards(player: PlayerId, count: number): void {
    const p = this.players[player]
    for (let i = 0; i < count; i++) {
      const card = p.deck.pop()
      if (card) {
        p.hand.push(card)
        this.emit('cardDrawn', { player, card })
      }
    }
  }

  // ── Unit Factory ─────────────────────────────────────────────

  private createUnit(type: UnitType, player: PlayerId): Unit {
    return {
      type,
      player,
      health: UNIT_STATS[type].health,
      maxHealth: UNIT_STATS[type].health,
      hasMoved: false,
      hasAttacked: false,
      usedAbility: false,
      justSpawned: true,
      hasDashed: false,
      uuid: generateUUID(),
    }
  }

  // ── Spawning ─────────────────────────────────────────────────

  canPlaceUnitAt(unitType: UnitType, player: PlayerId, row: number, col: number): string | null {
    if (this.gameOver) return 'game_over'
    if (!isValidSpawnPosition(player, row, col)) return 'invalid_spawn_position'
    if (this.board[row][col]) return 'cell_occupied'
    const cost = UNIT_STATS[unitType].cost
    if (this.players[player].mana < cost) return 'insufficient_mana'
    if (unitType === 'phoenix' && !isDarkTile(row, col)) return 'phoenix_invalid_spawn'
    return null
  }

  placeUnit(unitType: UnitType, player: PlayerId, row: number, col: number): boolean {
    const error = this.canPlaceUnitAt(unitType, player, row, col)
    if (error) return false

    const cost = UNIT_STATS[unitType].cost
    this.players[player].mana -= cost
    if (this.players[player].mana < 0) this.players[player].mana = 0

    const unit = this.createUnit(unitType, player)
    this.board[row][col] = unit
    this.players[player].units.push({ unit, row, col, uuid: unit.uuid })

    const cardIndex = this.players[player].hand.indexOf(unitType)
    if (cardIndex !== -1) {
      this.players[player].hand.splice(cardIndex, 1)
    }

    this.emit('manaChanged', { player, mana: this.players[player].mana, maxMana: this.players[player].maxMana })
    this.emit('unitPlaced', { unit, row, col })

    // Special spawn effects
    if (unitType === 'titan') {
      this.triggerTitanSpawnEffect(row, col)
    }
    if (unitType === 'naiad') {
      this.drawCards(player, 1)
    }

    return true
  }

  // ── Movement ─────────────────────────────────────────────────

  getValidMoves(row: number, col: number): Position[] {
    const unit = this.board[row][col]
    if (!unit) return []

    const movementType = UNIT_STATS[unit.type].movement
    const validMoves: Position[] = []

    const addIfEmpty = (r: number, c: number) => {
      if (this.isValidPosition(r, c) && !this.board[r][c]) {
        validMoves.push({ row: r, col: c })
      }
    }

    switch (movementType) {
      case 'king':
      case 'king1':
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue
            addIfEmpty(row + r, col + c)
          }
        }
        break

      case 'forward3': {
        const dir = unit.player === 1 ? -1 : 1
        const nr = row + dir
        addIfEmpty(nr, col)
        addIfEmpty(nr, col - 1)
        addIfEmpty(nr, col + 1)
        break
      }

      case 'lateral':
        addIfEmpty(row - 1, col)
        addIfEmpty(row + 1, col)
        addIfEmpty(row, col - 1)
        addIfEmpty(row, col + 1)
        break

      case 'diagonal':
        addIfEmpty(row - 1, col - 1)
        addIfEmpty(row - 1, col + 1)
        addIfEmpty(row + 1, col - 1)
        addIfEmpty(row + 1, col + 1)
        break

      case 'hop2':
        for (const { r, c } of [{ r: -2, c: 0 }, { r: 2, c: 0 }, { r: 0, c: -2 }, { r: 0, c: 2 }]) {
          addIfEmpty(row + r, col + c)
        }
        break

      case 'knight':
        for (const { r, c } of [
          { r: -2, c: -1 }, { r: -2, c: 1 },
          { r: -1, c: -2 }, { r: -1, c: 2 },
          { r: 1, c: -2 }, { r: 1, c: 2 },
          { r: 2, c: -1 }, { r: 2, c: 1 },
        ]) {
          addIfEmpty(row + r, col + c)
        }
        break

      case 'none':
        break
    }

    if (unit.type === 'phoenix') {
      return validMoves.filter(m => isDarkTile(m.row, m.col))
    }

    return validMoves
  }

  getValidDash(row: number, col: number): Position[] {
    return this.getValidMoves(row, col)
  }

  moveUnit(row: number, col: number, newRow: number, newCol: number): boolean {
    const unit = this.board[row][col]
    if (!unit) return false

    this.board[newRow][newCol] = unit
    this.board[row][col] = null
    unit.hasMoved = true

    const pUnit = this.players[unit.player].units.find(u => u.uuid === unit.uuid)
    if (pUnit) {
      pUnit.row = newRow
      pUnit.col = newCol
    }

    if (this.selectedAction === 'dash') {
      this.players[this.currentPlayer].mana--
      if (this.players[this.currentPlayer].mana < 0) this.players[this.currentPlayer].mana = 0
      unit.hasDashed = true
    }

    this.emit('unitMoved', { unit, from: { row, col }, to: { row: newRow, col: newCol } })
    return true
  }

  // ── Attacks ──────────────────────────────────────────────────

  getValidAttacks(row: number, col: number): Position[] {
    const unit = this.board[row][col]
    if (!unit) return []
    if (this.players[this.currentPlayer].mana < 1) return []

    const attackType = UNIT_STATS[unit.type].attack
    const validAttacks: Position[] = []

    const addEnemy = (r: number, c: number) => {
      if (this.isValidPosition(r, c) && this.board[r][c] && this.board[r][c]!.player !== this.currentPlayer) {
        validAttacks.push({ row: r, col: c })
      }
    }

    const addAnyUnit = (r: number, c: number) => {
      if (this.isValidPosition(r, c) && this.board[r][c]) {
        validAttacks.push({ row: r, col: c })
      }
    }

    switch (attackType) {
      case 'none':
        break

      case 'adjacent':
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue
            addEnemy(row + r, col + c)
          }
        }
        break

      case 'lateral4':
        for (const { r, c } of [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }]) {
          addEnemy(row + r, col + c)
        }
        break

      case 'diagonal4':
        for (const { r, c } of [{ r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }]) {
          addEnemy(row + r, col + c)
        }
        break

      case 'diagonal3':
        for (const { r, c } of [{ r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }]) {
          for (let i = 1; i <= 3; i++) {
            const tr = row + r * i
            const tc = col + c * i
            if (!this.isValidPosition(tr, tc)) break
            if (this.board[tr][tc]) {
              if (this.board[tr][tc]!.player !== this.currentPlayer) {
                validAttacks.push({ row: tr, col: tc })
              }
              break
            }
          }
        }
        break

      case 'explosion':
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue
            addAnyUnit(row + r, col + c)
          }
        }
        break

      case 'area3':
        for (let r = -3; r <= 3; r++) {
          for (let c = -3; c <= 3; c++) {
            if (r === 0 && c === 0) continue
            if (Math.abs(r) + Math.abs(c) > 3) continue
            addEnemy(row + r, col + c)
          }
        }
        break
    }

    return validAttacks
  }

  attackUnit(row: number, col: number, targetRow: number, targetCol: number): boolean {
    const attacker = this.board[row][col]
    const target = this.board[targetRow][targetCol]
    if (!attacker || !target) return false

    this.players[this.currentPlayer].mana--
    if (this.players[this.currentPlayer].mana < 0) this.players[this.currentPlayer].mana = 0

    const attackType = UNIT_STATS[attacker.type].attack

    if (attackType === 'explosion') {
      this.performExplosiveAttack(row, col)
    } else {
      target.health--
      if (target.health <= 0) {
        this.destroyUnit(targetRow, targetCol)
      }
    }

    this.emit('unitAttacked', { unit: attacker, target: { row: targetRow, col: targetCol }, damage: 1 })

    attacker.hasAttacked = true
    return true
  }

  private performExplosiveAttack(row: number, col: number): void {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue
        const tr = row + r
        const tc = col + c
        if (this.isValidPosition(tr, tc) && this.board[tr][tc]) {
          this.board[tr][tc]!.health--
          if (this.board[tr][tc]!.health <= 0) {
            this.destroyUnit(tr, tc)
          }
        }
      }
    }
    this.destroyUnit(row, col)
  }

  // ── Abilities ────────────────────────────────────────────────

  getValidAbilityTargets(row: number, col: number): Position[] {
    const unit = this.board[row][col]
    if (!unit) return []
    const ability = UNIT_STATS[unit.type].ability
    if (!ability) return []
    if (this.players[this.currentPlayer].mana < 1) return []

    const targets: Position[] = []

    switch (ability) {
      case 'pull':
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === 0 && c === 0) continue
            if (Math.abs(r) + Math.abs(c) > 2) continue
            const tr = row + r
            const tc = col + c
            if (this.isValidPosition(tr, tc) && this.board[tr][tc]) {
              targets.push({ row: tr, col: tc })
            }
          }
        }
        break

      case 'swap':
        for (let r = 0; r < BOARD_ROWS; r++) {
          for (let c = 0; c < BOARD_COLS; c++) {
            if (r === row && c === col) continue
            if (this.board[r][c] && this.board[r][c]!.type !== 'oracle') {
              targets.push({ row: r, col: c })
            }
          }
        }
        break

      case 'extra_mana':
      case 'destroy_on_spawn':
        break
    }

    return targets
  }

  useAbility(unitRow: number, unitCol: number, targetRow: number, targetCol: number): boolean {
    const unit = this.board[unitRow][unitCol]
    if (!unit) return false
    const ability = UNIT_STATS[unit.type].ability
    if (!ability || unit.usedAbility) return false

    this.players[this.currentPlayer].mana--
    if (this.players[this.currentPlayer].mana < 0) this.players[this.currentPlayer].mana = 0

    switch (ability) {
      case 'pull':
        this.pullUnitTowards(targetRow, targetCol, unitRow, unitCol)
        break
      case 'swap':
        this.swapUnits(unitRow, unitCol, targetRow, targetCol)
        break
    }

    unit.usedAbility = true
    this.emit('abilityUsed', { unit, position: { row: unitRow, col: unitCol }, ability })
    return true
  }

  private pullUnitTowards(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
    const unit = this.board[fromRow][fromCol]
    if (!unit) return

    const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0
    const newRow = fromRow + rowDir
    const newCol = fromCol + colDir

    if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
      this.board[newRow][newCol] = unit
      this.board[fromRow][fromCol] = null
      this.updatePlacedUnitPosition(unit, newRow, newCol)
    }
  }

  private swapUnits(row1: number, col1: number, row2: number, col2: number): void {
    const u1 = this.board[row1][col1]
    const u2 = this.board[row2][col2]
    if (!u1 || !u2) return

    this.board[row1][col1] = u2
    this.board[row2][col2] = u1
    this.updatePlacedUnitPosition(u1, row2, col2)
    this.updatePlacedUnitPosition(u2, row1, col1)
  }

  private updatePlacedUnitPosition(unit: Unit, newRow: number, newCol: number): void {
    const pUnit = this.players[unit.player].units.find(u => u.uuid === unit.uuid)
    if (pUnit) {
      pUnit.row = newRow
      pUnit.col = newCol
    }
  }

  // ─── Titan spawn effect ───────────────────────────────────────

  private triggerTitanSpawnEffect(row: number, col: number): void {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue
        const tr = row + r
        const tc = col + c
        if (this.isValidPosition(tr, tc) && this.board[tr][tc]) {
          this.destroyUnit(tr, tc)
        }
      }
    }
  }

  // ─── Destroy unit ─────────────────────────────────────────────

  destroyUnit(row: number, col: number): void {
    const unit = this.board[row][col]
    if (!unit) return

    if (unit.type === 'naiad') {
      this.drawCards(unit.player, 1)
    }

    this.board[row][col] = null

    const pUnits = this.players[unit.player].units
    const idx = pUnits.findIndex(u => u.uuid === unit.uuid)
    if (idx !== -1) pUnits.splice(idx, 1)

    this.emit('unitDestroyed', { unit, position: { row, col } })

    if (unit.type === 'oracle') {
      const winner: PlayerId = unit.player === 1 ? 2 : 1
      this.gameOver = true
      this.emit('gameOver', { winner })
    }
  }

  // ─── Turn management ──────────────────────────────────────────

  endTurn(): void {
    this.stopTurnTimer()

    for (const pu of this.players[this.currentPlayer].units) {
      const u = pu.unit
      u.hasMoved = false
      u.hasAttacked = false
      u.usedAbility = false
      u.justSpawned = false
      u.hasDashed = false
    }

    this.movedUnitThisTurn = null
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1

    if (this.currentPlayer === 1) {
      this.turn++
    }

    const p = this.players[this.currentPlayer]
    p.maxMana = Math.min(MAX_MANA, this.turn)
    p.mana = Math.max(0, Math.min(p.mana + 1, p.maxMana))

    const seerCount = p.units.filter(u => u.unit.type === 'seer').length
    p.mana += seerCount

    this.drawCards(this.currentPlayer, 1)
    this.selectedCard = null
    this.selectedUnit = null
    this.selectedAction = null
    this.validMoves = []
    this.validAttacks = []

    this.emit('turnChanged', { player: this.currentPlayer, turn: this.turn })
    this.emit('manaChanged', { player: this.currentPlayer, mana: p.mana, maxMana: p.maxMana })

    if (this.timerMode && !this.gameOver) {
      if (this.players[2].units.some(u => u.unit.type === 'oracle')) {
        this.startTurnTimer()
      }
    }

    this.triggerCPUIfNeeded()
  }

  checkAutoEndTurn(): void {
    if (this.gameOver) return

    const p = this.players[this.currentPlayer]
    let canStillAct = false

    if (this.movedUnitThisTurn) {
      const movedInfo = p.units.find(u => u.unit === this.movedUnitThisTurn)
      if (movedInfo) {
        const u = movedInfo.unit
        const canAttack = !u.hasAttacked && UNIT_STATS[u.type].attack !== 'none' && p.mana >= 1
        const hasAbility = !!UNIT_STATS[u.type].ability && !u.usedAbility && p.mana >= 1
        canStillAct = canAttack || hasAbility
      }
    } else {
      canStillAct = p.units.some(ui => {
        const u = ui.unit
        return !u.hasMoved && !u.justSpawned && UNIT_STATS[u.type].movement !== 'none'
      })
    }

    const hasPlayableCards = p.hand.some(card => UNIT_STATS[card].cost <= p.mana)

    if (!canStillAct && !hasPlayableCards) {
      setTimeout(() => this.endTurn(), 1000)
    }
  }

  // ─── Timer ────────────────────────────────────────────────────

  setTimerMode(enabled: boolean): void {
    this.timerMode = enabled
  }

  startTurnTimer(): void {
    this.stopTurnTimer()
    this.timerSeconds = 15
    this.emit('timerTick', { seconds: this.timerSeconds })
    this.turnTimer = setInterval(() => {
      this.timerSeconds -= 0.01
      this.timerSeconds = parseFloat(this.timerSeconds.toFixed(2))
      this.emit('timerTick', { seconds: this.timerSeconds })
      if (this.timerSeconds <= 0 && !this.gameOver) {
        this.stopTurnTimer()
        this.emit('timerEnded', {})
        this.endTurn()
      }
    }, 10)
  }

  stopTurnTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer)
      this.turnTimer = null
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────

  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS
  }

  hasPlacedOracle(player: PlayerId): boolean {
    return this.players[player].units.some(u => u.unit.type === 'oracle')
  }

  isEnemyAt(row: number, col: number, player: PlayerId): boolean {
    return !!this.board[row][col] && this.board[row][col]!.player !== player
  }

  getUnitAt(row: number, col: number): Unit | null {
    return this.board[row][col]
  }

  findUnitByUUID(uuid: string): Unit | null {
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (this.board[r][c]?.uuid === uuid) return this.board[r][c]
      }
    }
    return null
  }

  getUnitPosition(unit: Unit): Position | null {
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (this.board[r][c]?.uuid === unit.uuid) return { row: r, col: c }
      }
    }
    return null
  }

  // ─── CPU mode ──────────────────────────────────────────────────

  setCpuMode(enabled: boolean): void {
    this.cpuMode = enabled
  }

  private triggerCPUIfNeeded(): void {
    if (this.cpuMode && this.currentPlayer === 2 && !this.gameOver) {
      this.cpuPlayer.onEndTurn()
    }
  }

  // ─── Serialization (for P2P sync) ────────────────────────────

  getSerializableState(): SerializableGameState {
    return {
      currentPlayer: this.currentPlayer,
      turn: this.turn,
      gameOver: this.gameOver,
      board: this.board.map(row => row.map(cell => (cell ? { ...cell } : null))),
      players: {
        1: {
          mana: this.players[1].mana,
          maxMana: this.players[1].maxMana,
          wins: this.players[1].wins,
          units: this.players[1].units.map(u => ({ ...u, unit: { ...u.unit } })),
        },
        2: {
          mana: this.players[2].mana,
          maxMana: this.players[2].maxMana,
          wins: this.players[2].wins,
          units: this.players[2].units.map(u => ({ ...u, unit: { ...u.unit } })),
        },
      },
    }
  }

  applySerializedState(state: SerializableGameState): void {
    this.currentPlayer = state.currentPlayer
    this.turn = state.turn
    this.gameOver = state.gameOver
    this.board = state.board.map(row =>
      row.map(cell => (cell ? { ...cell } : null)),
    )
    this.players = {
      1: {
        ...state.players[1],
        units: state.players[1].units.map(u => ({ ...u, unit: { ...u.unit } })),
      },
      2: {
        ...state.players[2],
        units: state.players[2].units.map(u => ({ ...u, unit: { ...u.unit } })),
      },
    } as Record<PlayerId, PlayerState>
  }

  // ─── Reset ───────────────────────────────────────────────────

  resetScore(): void {
    this.players[1].wins = 0
    this.players[2].wins = 0
  }
}
