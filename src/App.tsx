import { Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext'
import LandingPage from './pages/LandingPage'
import MenuPage from './pages/MenuPage'
import GamePage from './pages/GamePage'
import DemoPage from './pages/DemoPage'

export default function App() {
  return (
    <I18nProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/app" element={<GamePage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </I18nProvider>
  )
}
