import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const GamePage = lazy(() => import('./pages/GamePage'))
const DemoPage = lazy(() => import('./pages/DemoPage'))

export default function App() {
  return (
    <I18nProvider>
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/app" element={<GamePage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Routes>
      </Suspense>
    </I18nProvider>
  )
}
