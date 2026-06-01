import { useGame } from '../hooks/useGame'
import { useI18n } from '../i18n/I18nContext'

export default function VictoryOverlay() {
  const { gameOver, currentPlayer, resetGame } = useGame()
  const { t } = useI18n()

  if (!gameOver) return null

  // currentPlayer at gameOver is the one who made the killing move
  const winner = currentPlayer
  const isVictory = (winner === 1)
  const winnerColor = winner === 1 ? 'var(--highlight-color)' : 'var(--primary-color)'

  return (
    <div
      className="victory-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
      }}
    >
      <div
        className="victory-message"
        style={{
          backgroundColor: winnerColor,
          color: 'white',
          padding: '2rem',
          borderRadius: 10,
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          maxWidth: '80%',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {isVictory ? t('victory') : t('defeat')}
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {t('player')} {winner} {t('wins')}
        </p>
        <p style={{ fontSize: '1.2rem' }}>
          {isVictory ? t('opponent_oracle_destroyed') : t('your_oracle_destroyed')}
        </p>
        <button
          id="new-game-btn"
          onClick={resetGame}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: 5,
            fontWeight: 'bold',
          }}
        >
          {t('new-game')}
        </button>
      </div>
    </div>
  )
}
