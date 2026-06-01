import { useState } from 'react'
import { Link } from 'react-router-dom'
import Board from '../components/Board'
import PlayerPanel from '../components/PlayerPanel'
import UnitInfoPanel from '../components/UnitInfoPanel'
import VictoryOverlay from '../components/VictoryOverlay'
import { GameProvider, useGame } from '../hooks/useGame'
import { useI18n } from '../i18n/I18nContext'
import '../css/style.css'
import '../css/game.css'
import '../css/app.css'
import '../css/fonts.css'

function GameHeader() {
  const { resetGame } = useGame()
  const { t, locale, setLocale, available } = useI18n()

  return (
    <header className="game-header retracted">
      <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', top: 16 }}>
        <div
          className="logo"
          style={{
            background: "url('/assets/icon.png'),beige",
            width: 48,
            height: 48,
            backgroundSize: 'contain',
            borderRadius: '50%',
          }}
        />
        <h1 style={{ position: 'relative', left: 8, top: -4 }}>Nausicaa</h1>
      </div>
      <button className="header-toggle-button" id="header-toggle-button">☰</button>
      <div className="game-controls">
        <select
          value={locale}
          onChange={e => setLocale(e.target.value as any)}
          style={{ marginRight: 8 }}
        >
          {available.map(l => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
        <button className="btn secondary" onClick={resetGame}>{t('end_turn')}</button>
        <Link to="/" className="btn secondary">{t('accueil')}</Link>
      </div>
    </header>
  )
}

function GameContent() {
  const { turn, currentPlayer, timerMode, setTimerMode } = useGame()
  const { t } = useI18n()

  return (
    <main className="game-container">
      <PlayerPanel player={1} label={t('player') + ' 1'} />

      <section className="board-container" style={{ position: 'relative' }}>
        <div className="turn-indicator" id="turn-indicator" style={{ backgroundColor: currentPlayer === 1 ? 'var(--highlight-color)' : 'var(--primary-color)' }}>
          {t('turn')} {turn} - {t('player')} {currentPlayer}
        </div>

        <div className="options">
          <div className="timer">
            Timer mode
            <label className="switch">
              <input type="checkbox" checked={timerMode} onChange={e => setTimerMode(e.target.checked)} />
              <span className="slider round" />
            </label>
          </div>
          <div id="timer-display" style={{ display: timerMode ? 'block' : 'none', width: 200, textAlign: 'center' }}>
            15
          </div>
        </div>

        <Board />
        <UnitInfoPanel />
        <VictoryOverlay />
      </section>

      <PlayerPanel player={2} label={t('player') + ' 2'} />
    </main>
  )
}

function Overlay() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div
      className="overlay"
      style={{ animation: 'overlayAnimation 0.8s forwards' }}
      onAnimationEnd={() => setVisible(false)}
    />
  )
}

export default function GamePage() {
  return (
    <GameProvider>
      <div className="game-page">
        <Overlay />
        <GameHeader />
        <GameContent />
      </div>
    </GameProvider>
  )
}
