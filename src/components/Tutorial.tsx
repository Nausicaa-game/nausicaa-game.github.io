import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { useAudio } from '../audio/AudioContext'
import { TUTORIAL_STEPS } from '../data/tutorialSteps'
import { useGame } from '../hooks/useGame'
import '../css/tutorial.css'

export default function Tutorial() {
  const { locale } = useI18n()
  const audio = useAudio()
  const navigate = useNavigate()
  const { setCpuMode } = useGame()
  const [step, setStep] = useState(0)

  const steps = TUTORIAL_STEPS[locale] ?? TUTORIAL_STEPS.en

  useEffect(() => {
    setCpuMode(true)
    audio.playSound('menu_next')
  }, [])

  const current = steps[step] ?? null

  useEffect(() => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'))
    if (current?.highlightId) {
      const el = document.getElementById(current.highlightId)
      if (el) el.classList.add('tutorial-highlight')
    }
  }, [step, current])

  const next = useCallback(() => {
    audio.playSound('buttonClick')
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      close()
    }
  }, [step, steps.length, audio])

  const close = useCallback(() => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'))
    navigate('/app')
  }, [navigate])

  if (!current) return null

  return (
    <div className="tutorial-overlay" style={{ display: 'flex' }}>
      <div className="tutorial-box">
        <div className="tutorial-content">
          <h2>{current.title}</h2>
          <p>{current.text}</p>
          <button id="tutorial-next" className="btn primary" onClick={next}>
            {step < steps.length - 1 ? 'Suivant' : 'Terminer'}
          </button>
          <button className="btn secondary" onClick={close} style={{ marginLeft: 8 }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
