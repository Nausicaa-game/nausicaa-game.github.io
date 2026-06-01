import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useI18n } from '../i18n/I18nContext'

export default function P2PControls() {
  const { p2pConnection, p2pStatus, hostGame, joinGame } = useGame()
  const { t } = useI18n()
  const [showJoin, setShowJoin] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [copied, setCopied] = useState(false)

  if (p2pStatus === 'connected') return null

  return (
    <div className="p2p-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {p2pStatus === 'connecting' ? (
        <span style={{ color: 'var(--accent-color)' }}>{t('connecting')}...</span>
      ) : p2pConnection?.gameId ? (
        <>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>
            {t('game_code')}: {p2pConnection.gameId}
          </span>
          <button
            className="btn secondary small"
            onClick={() => {
              const link = `${window.location.origin}${window.location.pathname}?gameId=${p2pConnection!.gameId}`
              navigator.clipboard.writeText(link)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            {copied ? t('copied') : t('copy_link')}
          </button>
        </>
      ) : (
        <>
          <button className="btn primary" onClick={hostGame}>
            {t('host_game')}
          </button>
          <button className="btn secondary" onClick={() => setShowJoin(!showJoin)}>
            {t('join_game')}
          </button>
        </>
      )}
      {showJoin && (
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            placeholder={t('enter_game_code')}
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            style={{
              padding: '0.3rem',
              fontFamily: 'Raleway, sans-serif',
              border: '1px solid var(--accent-color)',
              background: 'var(--background-light)',
              width: 200,
            }}
          />
          <button
            className="btn primary"
            onClick={() => { joinGame(joinId); setShowJoin(false) }}
          >
            {t('join')}
          </button>
        </div>
      )}
    </div>
  )
}
