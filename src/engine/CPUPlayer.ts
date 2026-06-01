import type { GameEngine } from './GameEngine'
import { UNIT_STATS } from './units'
import type { UnitType } from '../types/game'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let COEFFICIENTS_IMPORTANCE = {
  distance: 5,
  attractiveness: 5,
}

const UNITS_ATTRACTIVENESS: Record<string, number> = {
  oracle: 100,
  gobelin: 20,
  harpy: 50,
  naiad: 30,
  griffin: 60,
  siren: 70,
  centaur: 60,
  archer: 70,
  phoenix: 80,
  shapeshifter: 90,
  seer: 70,
  titan: 95,
}

export class CPUPlayer {
  private engine: GameEngine
  private turnCount = 0

  constructor(engine: GameEngine) {
    this.engine = engine
  }

  private calculateEuclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
    const deltaX = Math.pow(x1 - x2, 2)
    const deltaY = Math.pow(y1 - y2, 2)
    return Math.sqrt(deltaX + deltaY) * COEFFICIENTS_IMPORTANCE.distance
  }

  private calculateAttackCoefficient(x1: number, y1: number, x2: number, y2: number): number {
    const distance = this.calculateEuclideanDistance(x1, y1, x2, y2)
    if (distance === 0) return Infinity
    const boardUnit = this.engine.board[y2][x2]
    if (!boardUnit) return 0
    return (UNITS_ATTRACTIVENESS[boardUnit.type] * COEFFICIENTS_IMPORTANCE.attractiveness) / distance
  }

  private calculateUnitPriority(botUuid: string, targetUuid: string): number {
    const botUnit = this.engine.players[2].units.find(u => u.uuid === botUuid)
    if (!botUnit) return 0
    const targetUnit = this.engine.players[1].units.find(u => u.uuid === targetUuid)
    if (!targetUnit) return 0
    return this.calculateAttackCoefficient(botUnit.col, botUnit.row, targetUnit.col, targetUnit.row)
  }

  private regulateImportanceCoefficients(distance: number, attractiveness: number): void {
    COEFFICIENTS_IMPORTANCE.distance = distance
    COEFFICIENTS_IMPORTANCE.attractiveness = attractiveness
  }

  private iterateBoard(botUuid: string): Record<string, number> {
    const coefficients: Record<string, number> = {}
    for (const targetUnit of this.engine.players[1].units) {
      coefficients[targetUnit.uuid] = this.calculateUnitPriority(botUuid, targetUnit.uuid)
    }
    return coefficients
  }

  private getBestUnitToAttack(botUuid: string): { unit: string; coefficient: number } {
    const coefficients = this.iterateBoard(botUuid)
    const uuids = Object.keys(coefficients)
    if (uuids.length === 0) return { unit: '', coefficient: 0 }
    const bestUuid = uuids.reduce((a, b) => coefficients[a] > coefficients[b] ? a : b)
    return { unit: bestUuid, coefficient: coefficients[bestUuid] }
  }

  private getBestTargets(): Record<string, { unit: string; coefficient: number }> {
    const best: Record<string, { unit: string; coefficient: number }> = {}
    for (const unitElement of this.engine.players[2].units) {
      best[unitElement.uuid] = this.getBestUnitToAttack(unitElement.uuid)
    }
    return best
  }

  private makeDecision(): { id: string; targetId: string; coefficient: number } {
    const bestMoves = this.getBestTargets()
    const botUnitIds = Object.keys(bestMoves)
    const bestMove = { id: '', targetId: '', coefficient: 0 }
    for (const unitId of botUnitIds) {
      const coefficient = bestMoves[unitId].coefficient
      if (coefficient > bestMove.coefficient) {
        bestMove.id = unitId
        bestMove.targetId = bestMoves[unitId].unit
        bestMove.coefficient = coefficient
      }
    }
    return bestMove
  }

  private findNearestMoveCase(): { row: number; col: number } | null {
    const decision = this.makeDecision()
    if (!decision.id) return null
    const botUnitElement = this.engine.players[2].units.find(u => u.uuid === decision.id)
    const targetUnitElement = this.engine.players[1].units.find(u => u.uuid === decision.targetId)
    if (!botUnitElement || !targetUnitElement) return null

    const validMoves = this.engine.getValidMoves(botUnitElement.row, botUnitElement.col)
    if (validMoves.length === 0) return null

    const distances = validMoves.map(move =>
      this.calculateEuclideanDistance(move.row, move.col, targetUnitElement.row, targetUnitElement.col),
    )
    const minDistance = Math.min(...distances)
    const bestCase = validMoves.find(move =>
      this.calculateEuclideanDistance(move.row, move.col, targetUnitElement.row, targetUnitElement.col) === minDistance,
    )
    return bestCase || null
  }

  private getUnitPosition(uuid: string): { row: number; col: number } | null {
    for (const u of this.engine.players[2].units) {
      if (u.uuid === uuid) return { row: u.row, col: u.col }
    }
    return null
  }

  async makeAction(dash = false): Promise<void> {
    const botPlayer = this.engine.players[2]
    const botUnits = botPlayer.units

    if (!botUnits.find(u => u.unit.type === 'oracle')) {
      const firstPlayerOracle = this.engine.players[1].units.find(u => u.unit.type === 'oracle')
      if (firstPlayerOracle) {
        const col = 10 - firstPlayerOracle.col - 1
        this.engine.placeUnit('oracle', 2, 0, col)
      }
      this.engine.endTurn()
      return
    }

    const decision = this.makeDecision()
    if (!decision.id) {
      this.engine.endTurn()
      return
    }

    const botUnitElement = botUnits.find(u => u.uuid === decision.id)
    const targetUnitElement = this.engine.players[1].units.find(u => u.uuid === decision.targetId)
    if (!botUnitElement || !targetUnitElement) {
      this.engine.endTurn()
      return
    }

    const { row, col } = targetUnitElement
    const bestCase = this.findNearestMoveCase()

    const validAttacks = this.engine.getValidAttacks(botUnitElement.row, botUnitElement.col)
    if (validAttacks.find(a => a.row === row && a.col === col)) {
      this.engine.attackUnit(botUnitElement.row, botUnitElement.col, row, col)
      return
    }

    if (botUnits.length < 4) {
      const spawnable = botPlayer.hand
        .filter(t => UNIT_STATS[t].cost <= botPlayer.mana && t !== 'naiad')
        .sort((a, b) => UNIT_STATS[a].cost - UNIT_STATS[b].cost)
      const unitType = spawnable[0]
      if (unitType) {
        let nearestColumn = col
        let distance = 0
        while (this.engine.board[1][nearestColumn] !== null) {
          distance++
          if (col - distance >= 0 && this.engine.board[1][col - distance] === null) {
            nearestColumn = col - distance
            break
          }
          if (col + distance < this.engine.board[1].length && this.engine.board[1][col + distance] === null) {
            nearestColumn = col + distance
            break
          }
          if (distance > 5) {
            this.engine.endTurn()
            return
          }
        }
        this.engine.placeUnit(unitType as UnitType, 2, 1, nearestColumn)
        this.engine.endTurn()
        return
      }
    }

    const botPos = this.getUnitPosition(decision.id)
    if (!botPos) {
      this.engine.endTurn()
      return
    }

    const botUnit = this.engine.board[botPos.row][botPos.col]
    if (botUnit && botUnit.type !== 'oracle') {
      const attacks = this.engine.getValidAttacks(botPos.row, botPos.col)
      if (attacks.find(a => a.row === row && a.col === col)) {
        this.engine.attackUnit(botPos.row, botPos.col, row, col)
      } else if (bestCase) {
        this.engine.moveUnit(botPos.row, botPos.col, bestCase.row, bestCase.col)
        if (dash) {
          return
        }
        if (botPlayer.mana > 2) {
          await this.makeAction(true)
        }
        this.engine.endTurn()
      } else {
        this.engine.endTurn()
      }
    } else if (botPos) {
      const awayFromTarget = {
        row: Math.max(0, Math.min(7, botPos.row + (botPos.row - targetUnitElement.row))),
        col: Math.max(0, Math.min(9, botPos.col + (botPos.col - targetUnitElement.col))),
      }
      const validMoves = this.engine.getValidMoves(botPos.row, botPos.col)
      let bestMoveAway: { row: number; col: number } | null = null
      let bestDistance = Infinity
      for (const move of validMoves) {
        const dist = this.calculateEuclideanDistance(move.row, move.col, awayFromTarget.row, awayFromTarget.col)
        if (dist < bestDistance) {
          bestDistance = dist
          bestMoveAway = move
        }
      }
      if (bestMoveAway) {
        this.engine.moveUnit(botPos.row, botPos.col, bestMoveAway.row, bestMoveAway.col)
      }
      this.engine.endTurn()
    }
  }

  onEndTurn(): void {
    if (!this.engine.gameOver && this.engine.currentPlayer === 2) {
      setTimeout(async () => {
        await sleep(Math.random() * 2000 + 1000)
        await this.makeAction()
      }, 100)
    }
    this.turnCount++
    if (this.turnCount % 5 === 0) {
      const distanceCoefficient = parseInt(String(Math.random() * 100))
      const attractivenessCoefficient = parseInt(String(Math.random() * 100))
      this.regulateImportanceCoefficients(distanceCoefficient, attractivenessCoefficient)
    }
  }

  reset(): void {
    this.turnCount = 0
  }
}
