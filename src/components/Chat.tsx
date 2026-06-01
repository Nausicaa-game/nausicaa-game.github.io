import { useState, useRef, useCallback } from 'react'
import { useGame } from '../hooks/useGame'

export default function Chat() {
  const { p2pConnection, chatMessages, addChatMessage } = useGame()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [notification, setNotification] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggle = useCallback(() => {
    setOpen(o => {
      const next = !o
      if (next) {
        setNotification(false)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      return next
    })
  }, [])

  const send = useCallback(() => {
    const msg = text.trim()
    if (!msg || !p2pConnection?.gameId) return
    const player = p2pConnection.isHost ? 1 : 2
    addChatMessage(player, msg)
    p2pConnection.sendMessage({
      type: 'action',
      action: { type: 'sendMessage', payload: { player, message: msg } },
    })
    setText('')
    inputRef.current?.focus()
  }, [text, p2pConnection, addChatMessage])

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') send()
  }, [send])

  const incoming = chatMessages.length > 0
  if (incoming && !open && !notification) {
    setNotification(true)
  }

  return (
    <>
      <button className="chat-toggle" onClick={toggle} title="Chat">
        💬
        {notification && <span className="notification-badge" style={{ display: 'inline-block' }} />}
      </button>
      <div className={`chat-container${open ? '' : ' hidden'}`}>
        <div className="chat-messages">
          {chatMessages.map((m, i) => (
            <span key={i} style={{ color: 'black', textTransform: 'none' }}>
              Joueur {m.player}: {m.text}
            </span>
          ))}
        </div>
        <div className="chat-input-area">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Message..."
          />
          <button onClick={send}>Envoyer</button>
        </div>
      </div>
    </>
  )
}
