import { useGame } from '../hooks/useGame'
import type { PlayerId } from '../types/game'
import { UNIT_STATS } from '../engine/units'
import UnitCard from './UnitCard'

interface PlayerPanelProps {
  player: PlayerId
  label: string
  isCPU?: boolean
}

function Hand({ player }: { player: PlayerId }) {
  const { players, selectedCard, selectCard, deselectCard, currentPlayer, gameOver } = useGame()
  const hand = players[player].hand
  const mana = players[player].mana
  const isCurrent = currentPlayer === player && !gameOver

  const displayHand = hand.includes('oracle')
    ? hand.filter(t => t === 'oracle')
    : hand

  return (
    <div className="hand" id={`player-${player === 1 ? 'one' : 'two'}-hand`}>
      {displayHand.length === 0 ? (
        <div className="empty-hand-message"></div>
      ) : (
        displayHand.map((type, i) => {
          const stats = UNIT_STATS[type]
          const isSelected = selectedCard?.type === type
          const canAfford = mana >= stats.cost
          return (
            <UnitCard
              key={`${type}-${i}`}
              type={type}
              selected={isSelected}
              disabled={!isCurrent || !canAfford}
              onClick={() => {
                if (!isCurrent) return
                if (isSelected) deselectCard()
                else selectCard(type)
              }}
            />
          )
        })
      )}
    </div>
  )
}

export default function PlayerPanel({ player, label, isCPU }: PlayerPanelProps) {
  const {
    players, currentPlayer, gameOver, selectedAction,
    selectedUnit, endTurn, engine,
  } = useGame()

  const p = players[player]
  const isCurrent = currentPlayer === player && !gameOver
  const isPlayerOne = player === 1

  const actionText = () => {
    if (gameOver) return 'Partie terminée'
    if (!isCurrent) return 'En attente...'
    if (engine.selectedCard) return 'Placez l\'unité sur le plateau'
    if (selectedUnit) {
      const action = selectedAction === 'attack' ? 'Attaquez' :
                     selectedAction === 'move' ? 'Déplacez' :
                     selectedAction === 'dash' ? 'Dash' : 'Sélectionné'
      return `${action} l'unité`
    }
    return 'Sélectionnez une unité ou une carte'
  }

  return (
    <aside className={`player-area ${isPlayerOne ? 'player-one' : 'player-two'}`}>
      <div className="player-info">
        <h3 className={isCurrent ? 'current-turn' : ''}>
          {label}{isCPU ? ' (CPU)' : ''}
        </h3>
        <div className="mana-container">
          <span className="mana-label">Mana: </span>
          <span className="mana-crystals" id={`player-${isPlayerOne ? 'one' : 'two'}-mana`}>
            {p.mana}/{p.maxMana}
          </span>
        </div>
      </div>

      <div className="hand-container">
        <h4>{isPlayerOne ? 'Votre main' : 'Main adverse'}</h4>
        <Hand player={player} />
      </div>

      <div className="action-panel">
        <div
          className="current-action"
          id={`player-${isPlayerOne ? 'one' : 'two'}-action`}
        >
          {actionText()}
        </div>
        <button
          id={`end-turn-${isPlayerOne ? 'one' : 'two'}`}
          className="btn primary"
          disabled={!isCurrent}
          onClick={endTurn}
        >
          Terminer le tour
        </button>
      </div>
    </aside>
  )
}
