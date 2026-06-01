import { Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext'
import LandingPage from './pages/LandingPage'
import GamePage from './pages/GamePage'

export default function App() {
  return (
    <I18nProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<GamePage />} />
      </Routes>
    </I18nProvider>
  )
}
