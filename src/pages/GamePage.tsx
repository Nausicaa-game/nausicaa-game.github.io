import { useEffect, useRef } from 'react'
import '../css/style.css'
import '../css/game.css'
import '../css/app.css'
import '../css/fonts.css'

export default function GamePage() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const scripts = [
      '/js/jquery-3.7.1.js',
      '/js/jquery.profanityfilter.js',
      '/js/p2p-connection.js',
      '/js/main.js',
      '/js/songManager.js',
      '/js/translations.js',
      '/js/cpu.js',
      '/js/game.js',
      '/js/app.js',
    ]

    function loadScripts(index: number) {
      if (index >= scripts.length) return
      const script = document.createElement('script')
      script.src = scripts[index]
      script.onload = () => loadScripts(index + 1)
      document.body.appendChild(script)
    }

    loadScripts(0)

    return () => {
      const game = (window as any).game
      if (game) {
        game.gameOver = true
      }
    }
  }, [])

  return (
    <body className="game-page">
      <div className="overlay" />
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
          <button id="reset-game" className="btn secondary">Nouvelle partie</button>
          <button id="rules-toggle" className="btn secondary">Règles</button>
          <a href="/" className="btn secondary">Retour à l'accueil</a>
        </div>
      </header>

      <main className="game-container">
        <aside className="player-area player-one">
          <div className="player-info">
            <h3>Joueur 1</h3>
            <div className="mana-container">
              <div className="mana-label">Mana: </div>
              <div className="mana-crystals" id="player-one-mana">1/1</div>
            </div>
          </div>
          <div className="hand-container">
            <h4>Votre main</h4>
            <div className="hand" id="player-one-hand" />
          </div>
          <div className="action-panel">
            <div className="current-action" id="player-one-action">Sélectionnez une unité</div>
            <button id="end-turn-one" className="btn primary">Terminer le tour</button>
          </div>
        </aside>

        <section className="board-container">
          <div className="turn-indicator" id="turn-indicator">Tour du Joueur 1</div>
          <div className="options">
            <div className="timer">
              Timer mode
              <label className="switch">
                <input type="checkbox" id="timerMode" />
                <span className="slider round" />
              </label>
            </div>
            <div className="cpu-mode">
              CPU mode
              <label className="switch">
                <input type="checkbox" id="cpuMode" />
                <span className="slider round" />
              </label>
            </div>
            <div id="timer-display" style={{ display: 'none', width: 200, textAlign: 'center' }}>15</div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <span id="score-display" style={{ textAlign: 'center' }}>0 - 0</span>
              <span id="score-reset" style={{ cursor: 'pointer', marginLeft: 8, opacity: 0.6 }}>↺</span>
            </div>
          </div>
          <div className="game-board" id="game-board" />
          <div className="unit-info" id="unit-info">
            <h4>Information sur l'unité</h4>
            <div className="unit-details">Sélectionnez une unité pour voir ses détails</div>
          </div>
        </section>

        <aside className="player-area player-two">
          <div className="player-info">
            <h3>Joueur 2</h3>
            <div className="mana-container">
              <div className="mana-label">Mana: </div>
              <div className="mana-crystals" id="player-two-mana">1/1</div>
            </div>
          </div>
          <div className="hand-container">
            <h4>Main adverse</h4>
            <div className="hand" id="player-two-hand" />
          </div>
          <div className="action-panel">
            <div className="current-action" id="player-two-action">En attente...</div>
            <button id="end-turn-two" className="btn primary" disabled>Terminer le tour</button>
          </div>
        </aside>
      </main>

      <div className="rules-panel" id="rules-panel">
        <div className="rules-content">
          <h2>Règles Rapides</h2>
          <button id="close-rules" className="close-btn">×</button>
          <div className="rules-section">
            <h3>Objectif</h3>
            <p>Éliminer l'Oracle adverse pour gagner la partie.</p>
          </div>
          <div className="rules-section">
            <h3>Mana</h3>
            <p>Commence à 1, augmente de 1 chaque tour (max. 6).</p>
          </div>
          <div className="rules-section">
            <h3>Actions</h3>
            <ul>
              <li><strong>Invoquer:</strong> Placez des unités dans votre zone de déploiement.</li>
              <li><strong>Déplacer:</strong> 1 case gratuitement par tour.</li>
              <li><strong>Dash:</strong> 1 mana pour un mouvement supplémentaire.</li>
              <li><strong>Attaquer:</strong> 1 mana par attaque.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="chat-toggle" id="chat-toggle" style={{ display: 'none' }}>
        💬<span className="notification-badge" id="chat-notification-badge" />
      </div>

      <div className="chat-container hidden" id="chat-container">
        <div id="chat-messages" className="chat-messages" />
        <div className="chat-input-area">
          <input type="text" id="chat-input" autoComplete="off" placeholder="Entrez votre message..." />
          <button id="chat-send" className="btn primary">Send</button>
        </div>
      </div>
    </body>
  )
}
