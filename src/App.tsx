import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import GamePage from './pages/GamePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<GamePage />} />
    </Routes>
  )
}
