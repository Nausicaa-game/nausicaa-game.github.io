import { useGame } from '../hooks/useGame'
import { isDarkTile, getSpawnRows } from '../engine/units'
import { BOARD_ROWS, BOARD_COLS } from '../types/game'

export default function Board() {
  const {
    board, clickCell, selectedUnit,
    validMoves, validAttacks, currentPlayer,
    setHoveredUnit,
  } = useGame()

  const isValidTarget = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col) ||
    validAttacks.some(a => a.row === row && a.col === col)

  const isAttackTarget = (row: number, col: number) =>
    validAttacks.some(a => a.row === row && a.col === col)

  return (
    <div className="game-board" id="game-board">
      {Array.from({ length: BOARD_ROWS }, (_, row) =>
        Array.from({ length: BOARD_COLS }, (_, col) => {
          const unit = board[row][col]
          const classes = ['board-cell']
          if (isDarkTile(row, col)) classes.push('dark')
          {
            const [r1, r2] = getSpawnRows(1)
            if (row === r1) classes.push('player-one-spawn')
            if (row === r2) classes.push('player-one-spawn-bottom')
          }
          {
            const [r1, r2] = getSpawnRows(2)
            if (row === r1) classes.push('player-two-spawn')
            if (row === r2) classes.push('player-two-spawn-bottom')
          }
          if (isValidTarget(row, col)) classes.push(isAttackTarget(row, col) ? 'valid-attack' : 'valid-move')

          return (
            <div
              key={`${row}-${col}`}
              className={classes.join(' ')}
              data-row={row}
              data-col={col}
              onClick={() => clickCell(row, col)}
              onMouseEnter={() => {
                const u = board[row][col]
                setHoveredUnit(u ? { ...u } : null)
              }}
              onMouseLeave={() => setHoveredUnit(null)}
            >
              {unit && (
                <div
                  className={`unit player-${unit.player}${selectedUnit?.unit.uuid === unit.uuid ? ' selected' : ''}`}
                  data-type={unit.type}
                  draggable={false}
                  style={{
                    backgroundImage: `url('/assets/pions/${unit.type}.svg')`,
                    boxShadow: unit.player === 1
                      ? '0 0 5px #1e88e5'
                      : '0 0 5px #e53935',
                    cursor: unit.player === currentPlayer && !unit.justSpawned
                      ? 'pointer'
                      : 'default',
                  }}
                >
                  {unit.health > 1 && (
                    <div className="health-indicator">{unit.health}</div>
                  )}
                </div>
              )}
            </div>
          )
        }),
      )}
    </div>
  )
}
