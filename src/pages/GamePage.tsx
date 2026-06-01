import { useState } from 'react'
import { Link } from 'react-router-dom'
import Board from '../components/Board'
import Chat from '../components/Chat'
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
    <header className="game-header">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
        <h1 style={{ marginLeft: 8 }}>Nausicaa</h1>
      </div>
      <button className="header-toggle-button" id="header-toggle-button">☰</button>
      <div className="game-controls">
        <button className="btn secondary" onClick={resetGame}>{t('new-game')}</button>
        <button className="btn secondary" onClick={() => {}}>{t('rules')}</button>
        <Link to="/" className="btn secondary">{t('back-home')}</Link>
        <select
          value={locale}
          onChange={e => setLocale(e.target.value as any)}
        >
          {available.map(l => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>
    </header>
  )
}

export function GameContent() {
  const { turn, currentPlayer, timerMode, setTimerMode, cpuMode, setCpuMode } = useGame()
  const { t } = useI18n()
  const [showRules, setShowRules] = useState(false)

  return (
    <>
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
            <div className="timer">
              CPU mode
              <label className="switch">
                <input type="checkbox" checked={cpuMode} onChange={e => setCpuMode(e.target.checked)} />
                <span className="slider round" />
              </label>
            </div>
            <div id="timer-display" style={{ display: timerMode ? 'block' : 'none', width: 200, textAlign: 'center' }}>
              15
            </div>
            <button className="btn secondary" onClick={() => setShowRules(true)} style={{ marginTop: 8 }}>
              Règles
            </button>
          </div>

          <Board />
          <UnitInfoPanel />
          <VictoryOverlay />
        </section>

        <PlayerPanel player={2} label={cpuMode ? 'CPU' : t('player') + ' 2'} isCPU={cpuMode} />
      </main>

      {showRules && (
        <div className="rules-panel" style={{ display: 'flex' }}>
          <div className="rules-content">
            <h2>Règles Rapides</h2>
            <button className="close-btn" onClick={() => setShowRules(false)}>×</button>
            <div className="rules-section">
              <h3>Objectif</h3>
              <p>Éliminer l'Oracle adverse pour gagner la partie.</p>
            </div>
            <div className="rules-section">
              <h3>Mana</h3>
              <p>Commence à 1, augmente de 1 chaque tour (max. 6). Utilisé pour invoquer des unités, attaquer et utiliser des capacités.</p>
            </div>
            <div className="rules-section">
              <h3>Actions</h3>
              <ul>
                <li>Invoquer une unité depuis votre main</li>
                <li>Déplacer une unité (gratuit)</li>
                <li>Dash (1 mana, pas d'attaque ce tour)</li>
                <li>Attaquer (1 mana)</li>
              </ul>
            </div>
            <div className="rules-section">
              <h3>Restrictions</h3>
              <p>Les unités fraîchement invoquées ne peuvent ni se déplacer ni attaquer ce tour.</p>
            </div>
          </div>
        </div>
      )}

      <Chat />
    </>
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
