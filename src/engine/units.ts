import { UnitStats, UnitType } from '../types/game'

export const UNIT_STATS: Record<UnitType, Omit<UnitStats, 'name'>> = {
  oracle: {
    nameKey: 'oracle_name',
    cost: 0,
    movement: 'king',
    attack: 'none',
    health: 1,
    descriptionKey: 'oracle_description',
    manaCost: { move: 1, dash: 2 },
  },
  gobelin: {
    nameKey: 'gobelin_name',
    cost: 1,
    movement: 'forward3',
    attack: 'lateral4',
    health: 1,
    descriptionKey: 'gobelin_description',
  },
  harpy: {
    nameKey: 'harpy_name',
    cost: 1,
    movement: 'king',
    attack: 'explosion',
    health: 1,
    descriptionKey: 'harpy_description',
  },
  naiad: {
    nameKey: 'naiad_name',
    cost: 1,
    movement: 'diagonal',
    attack: 'none',
    health: 1,
    descriptionKey: 'naiad_description',
  },
  griffin: {
    nameKey: 'griffin_name',
    cost: 2,
    movement: 'hop2',
    attack: 'adjacent',
    health: 2,
    descriptionKey: 'griffin_description',
  },
  siren: {
    nameKey: 'siren_name',
    cost: 2,
    movement: 'lateral',
    attack: 'diagonal4',
    health: 1,
    descriptionKey: 'siren_description',
  },
  centaur: {
    nameKey: 'centaur_name',
    cost: 2,
    movement: 'knight',
    attack: 'adjacent',
    health: 2,
    ability: 'pull',
    descriptionKey: 'centaur_description',
  },
  archer: {
    nameKey: 'archer_name',
    cost: 3,
    movement: 'lateral',
    attack: 'diagonal3',
    health: 1,
    descriptionKey: 'archer_description',
  },
  phoenix: {
    nameKey: 'phoenix_name',
    cost: 3,
    movement: 'diagonal',
    attack: 'adjacent',
    health: 2,
    descriptionKey: 'phoenix_description',
  },
  shapeshifter: {
    nameKey: 'shapeshifter_name',
    cost: 4,
    movement: 'king',
    attack: 'adjacent',
    health: 2,
    ability: 'swap',
    descriptionKey: 'shapeshifter_description',
  },
  seer: {
    nameKey: 'seer_name',
    cost: 4,
    movement: 'none',
    attack: 'none',
    health: 1,
    ability: 'extra_mana',
    descriptionKey: 'seer_description',
  },
  titan: {
    nameKey: 'titan_name',
    cost: 6,
    movement: 'king1',
    attack: 'area3',
    health: 3,
    ability: 'destroy_on_spawn',
    descriptionKey: 'titan_description',
  },
}

export const DECK_COMPOSITION: UnitType[] = [
  'oracle',
  'gobelin', 'gobelin', 'gobelin',
  'harpy', 'harpy',
  'naiad', 'naiad',
  'griffin', 'griffin',
  'siren', 'siren',
  'centaur',
  'archer', 'archer',
  'phoenix',
  'shapeshifter',
  'seer',
  'titan',
]

export function getSpawnRows(player: 1 | 2): [number, number] {
  return player === 1 ? [6, 7] : [0, 1]
}

export function isValidSpawnPosition(
  player: 1 | 2,
  row: number,
  _col: number,
): boolean {
  const [r1, r2] = getSpawnRows(player)
  return row === r1 || row === r2
}

export function isDarkTile(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}
