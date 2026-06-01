export const BOARD_ROWS = 8
export const BOARD_COLS = 10
export const MAX_MANA = 6

export type UnitType =
  | 'oracle' | 'gobelin' | 'harpy' | 'naiad'
  | 'griffin' | 'siren' | 'centaur'
  | 'archer' | 'phoenix'
  | 'shapeshifter' | 'seer' | 'titan'

export type PlayerId = 1 | 2

export type MovementType =
  | 'king' | 'king1' | 'forward3' | 'lateral' | 'diagonal'
  | 'hop2' | 'knight' | 'none' | 'zombie_move'

export type AttackType =
  | 'none' | 'adjacent' | 'lateral4' | 'diagonal4' | 'diagonal3'
  | 'explosion' | 'area3' | 'zombie_attack'

export type AbilityType = 'pull' | 'swap' | 'extra_mana' | 'destroy_on_spawn'

export interface UnitStats {
  name: string
  nameKey: string
  cost: number
  movement: MovementType
  attack: AttackType
  health: number
  descriptionKey: string
  ability?: AbilityType
  manaCost?: { move: number; dash: number }
}

export interface Unit {
  type: UnitType
  player: PlayerId
  health: number
  maxHealth: number
  hasMoved: boolean
  hasAttacked: boolean
  usedAbility: boolean
  justSpawned: boolean
  hasDashed: boolean
  uuid: string
}

export interface Position {
  row: number
  col: number
}

export interface PlacedUnit {
  unit: Unit
  row: number
  col: number
  uuid: string
}

export interface PlayerState {
  mana: number
  maxMana: number
  deck: UnitType[]
  hand: UnitType[]
  units: PlacedUnit[]
  wins: number
}

export interface SelectedCard {
  type: UnitType
  cost: number
}

export interface SelectedUnit {
  row: number
  col: number
  unit: Unit
}

export type ActionType = 'move' | 'attack' | 'dash' | 'ability' | null

export interface GameEventMap {
  unitPlaced: { unit: Unit; row: number; col: number }
  unitMoved: { unit: Unit; from: Position; to: Position }
  unitAttacked: { unit: Unit; target: Position; damage: number }
  unitDestroyed: { unit: Unit; position: Position }
  turnChanged: { player: PlayerId; turn: number }
  gameOver: { winner: PlayerId }
  manaChanged: { player: PlayerId; mana: number; maxMana: number }
  cardDrawn: { player: PlayerId; card: UnitType }
  actionText: { player: PlayerId; text: string }
  abilityUsed: { unit: Unit; position: Position; ability: AbilityType }
  timerTick: { seconds: number }
  timerEnded: {}
}

export type GameEventCallback<E extends keyof GameEventMap> =
  (data: GameEventMap[E]) => void

export interface SerializableGameState {
  currentPlayer: PlayerId
  turn: number
  gameOver: boolean
  board: (Unit | null)[][]
  players: Record<PlayerId, {
    mana: number
    maxMana: number
    wins: number
    units: PlacedUnit[]
  }>
}
