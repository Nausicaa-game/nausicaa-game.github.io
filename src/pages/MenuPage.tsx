import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WobbleCorner from '../components/WobbleCorner'
import type { WobbleHandle } from '../components/WobbleCorner'
import { useAudio } from '../audio/AudioContext'
import '../css/style.css'
import '../css/game.css'
import '../css/menu.css'

function RulesPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="rules-panel" style={{ display: 'flex' }}>
      <div className="rules-content">
        <h2>Règles Rapides</h2>
        <button className="close-btn" onClick={onClose}>×</button>
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
  )
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="rules-panel" style={{ display: 'flex' }}>
      <div className="rules-content">
        <h2>About Nausicaa</h2>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="rules-section">
          <h3>Team</h3>
          <p>Nausicaa Card Game is created by a team of passionate developers and designers composed by only me.</p>
        </div>
        <div className="rules-section">
          <h3>Inspiration</h3>
          <p>Inspired by myths and legends from around the world, and chess game board, also CHEGG concept by gerg.</p>
        </div>
        <div className="rules-section">
          <h3>Contact</h3>
          <p>Email me at fox3000foxy@gmail.com</p>
        </div>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const navigate = useNavigate()
  const wobbleRef = useRef<WobbleHandle>(null)
  const [showRules, setShowRules] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const audio = useAudio()

  useEffect(() => {
    audio.playSound('menu')
  }, [])

  const handlePlay = useCallback(() => {
    audio.playSound('buttonClick')
    audio.fadeSong('menu', false, 0.2, () => {
      wobbleRef.current?.expand()
    })
  }, [audio])

  const onExpandComplete = useCallback(() => {
    navigate('/app?animation=true')
  }, [navigate])

  const clickOption = useCallback((fn?: () => void) => {
    audio.playSound('buttonClick')
    fn?.()
  }, [audio])

  return (
    <div className="menu-page">
      <WobbleCorner ref={wobbleRef} onExpandComplete={onExpandComplete} />
      <div className="card-decoration card1" />
      <div className="card-decoration card2" />
      <div className="card-decoration card3" />
      <div className="game-container">
        <div className="logo-container" style={{ zIndex: 10 }}>
          <h1>NAUSICAA</h1>
          <div className="tagline">Card Game of Myths & Legends</div>
        </div>
        <div className="menu-container">
          <button className="menu-option" onClick={handlePlay}>
            <div className="menu-icon">▶</div>
            <div className="menu-text"><h3>PLAY</h3></div>
          </button>
          <button className="menu-option" onClick={() => clickOption(() => setShowRules(true))}>
            <div className="menu-icon">?</div>
            <div className="menu-text"><h3>RULES</h3></div>
          </button>
          <button className="menu-option" style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <div className="menu-icon">⚙</div>
            <div className="menu-text"><h3>SETTINGS</h3></div>
          </button>
          <button className="menu-option" onClick={() => clickOption(() => setShowAbout(true))}>
            <div className="menu-icon">i</div>
            <div className="menu-text"><h3>ABOUT</h3></div>
          </button>
        </div>
        <div className="footer" style={{ backgroundColor: 'transparent' }}>
          <span>© 2025 Nausicaa Card Game</span>
        </div>
      </div>
      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}
      {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}
    </div>
  )
}
