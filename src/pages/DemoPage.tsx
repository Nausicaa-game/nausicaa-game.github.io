import { GameProvider } from '../hooks/useGame'
import Tutorial from '../components/Tutorial'
import { GameContent } from './GamePage'

export default function DemoPage() {
  return (
    <GameProvider>
      <div className="game-page">
        <GameContent />
        <Tutorial />
      </div>
    </GameProvider>
  )
}
