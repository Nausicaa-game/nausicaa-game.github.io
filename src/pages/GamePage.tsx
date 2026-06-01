import Board from '../components/Board'
import PlayerPanel from '../components/PlayerPanel'
import { GameProvider, useGame } from '../hooks/useGame'
import '../css/style.css'
import '../css/game.css'
import '../css/app.css'
import '../css/fonts.css'

function GameHeader() {
  const { resetGame } = useGame()

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
        <button className="btn secondary" onClick={resetGame}>Nouvelle partie</button>
        <a href="/" className="btn secondary">Retour à l'accueil</a>
      </div>
    </header>
  )
}

function GameContent() {
  const { turn, currentPlayer } = useGame()

  return (
    <main className="game-container">
      <PlayerPanel player={1} label="Joueur 1" />

      <section className="board-container">
        <div className="turn-indicator" id="turn-indicator">
          Tour {turn} - Joueur {currentPlayer}
        </div>

        <div className="options">
          <div className="timer">
            Timer mode
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round" />
            </label>
          </div>
        </div>

        <Board />

        <div className="unit-info" id="unit-info">
          <h4>Information sur l'unité</h4>
          <div className="unit-details">Sélectionnez une unité pour voir ses détails</div>
        </div>
      </section>

      <PlayerPanel player={2} label="Joueur 2" />
    </main>
  )
}

export default function GamePage() {
  return (
    <GameProvider>
      <div className="game-page">
        <div className="overlay" />
        <GameHeader />
        <GameContent />
      </div>
    </GameProvider>
  )
}
