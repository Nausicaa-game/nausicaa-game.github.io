import { useGame } from '../hooks/useGame'
import { useI18n } from '../i18n/I18nContext'
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
  const { t } = useI18n()
  const hand = players[player].hand
  const mana = players[player].mana
  const isCurrent = currentPlayer === player && !gameOver

  const displayHand = hand.includes('oracle')
    ? hand.filter(t => t === 'oracle')
    : hand

  if (displayHand.length === 0 && player === 2) return null

  return (
    <div className="hand" id={`player-${player === 1 ? 'one' : 'two'}-hand`}>
      {displayHand.length === 0 ? (
        <div className="empty-hand-message">{t('empty_hand')}</div>
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
  const { t } = useI18n()

  const p = players[player]
  const isCurrent = currentPlayer === player && !gameOver
  const isPlayerOne = player === 1

  const actionText = () => {
    if (gameOver) return t('game_over')
    if (!isCurrent) return t('waiting')
    if (engine.selectedCard) return t('select_spawn')
    if (selectedUnit) {
      const action = selectedAction === 'attack' ? t('attack') :
                     selectedAction === 'move' ? t('move') :
                     selectedAction === 'dash' ? t('dash') : ''
      return action ? `${action}` : t('select_unit')
    }
    return t('select_unit')
  }

  return (
    <aside className={`player-area ${isPlayerOne ? 'player-one' : 'player-two'}`}>
      <div className="player-info">
        <h3 className={isCurrent ? 'current-turn' : ''}>
          {label}{isCPU ? ' (CPU)' : ''}
        </h3>
        <div className="mana-container">
          <span className="mana-label">{t('mana')} </span>
          <span className="mana-crystals" id={`player-${isPlayerOne ? 'one' : 'two'}-mana`}>
            {p.mana}/{p.maxMana}
          </span>
        </div>
      </div>

      <div className="hand-container">
        <h4>{isPlayerOne ? t('select_card') : t('waiting')}</h4>
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
          {t('end_turn')}
        </button>
      </div>
    </aside>
  )
}
