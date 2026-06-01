import Peer from 'peerjs'

export interface P2PAction {
  type: 'placeUnit' | 'moveUnit' | 'attackUnit' | 'useAbility' | 'endTurn' | 'endGame' | 'resetGame' | 'sendMessage'
  payload?: Record<string, unknown>
}

export interface P2PGameState {
  currentPlayer: number
  turn: number
  gameOver: boolean
  board: unknown[]
  players: Record<string, unknown>
  timestamp: number
}

export type P2PStatus = 'disconnected' | 'connecting' | 'connected'

export interface P2PMessage {
  type: 'action' | 'gameState' | 'requestGameState'
  action?: P2PAction
  state?: P2PGameState
}

type StatusCallback = (status: P2PStatus) => void
type MessageCallback = (msg: P2PMessage) => void
type PeerIdCallback = (id: string) => void

export class P2PConnection {
  private peer: Peer | null = null
  private conn: RTCPeerConnection | null = null
  private _isHost = false
  private _gameId: string | null = null
  private _status: P2PStatus = 'disconnected'

  private onStatusChange: StatusCallback | null = null
  private onMessage: MessageCallback | null = null
  private onPeerId: PeerIdCallback | null = null

  get isHost(): boolean { return this._isHost }
  get gameId(): string | null { return this._gameId }
  get status(): P2PStatus { return this._status }

  setStatusHandler(cb: StatusCallback): void { this.onStatusChange = cb }
  setMessageHandler(cb: MessageCallback): void { this.onMessage = cb }
  setPeerIdHandler(cb: PeerIdCallback): void { this.onPeerId = cb }

  private setStatus(s: P2PStatus): void {
    this._status = s
    this.onStatusChange?.(s)
  }

  hostGame(): void {
    this.setStatus('connecting')
    this._isHost = true
    this.peer = new Peer()

    this.peer.on('open', (id) => {
      this._gameId = id
      this.onPeerId?.(id)
    })

    this.peer.on('connection', (conn) => {
      if (this.conn) { conn.close(); return }
      this.conn = conn as unknown as RTCPeerConnection
      this.setupConnectionHandlers()
    })

    this.peer.on('error', () => this.setStatus('disconnected'))
  }

  joinGame(hostId: string): void {
    this.setStatus('connecting')
    this._isHost = false
    this._gameId = hostId
    this.peer = new Peer()

    this.peer.on('open', () => {
      this.conn = this.peer!.connect(hostId, { reliable: true }) as unknown as RTCPeerConnection
      this.setupConnectionHandlers()
    })

    this.peer.on('error', () => this.setStatus('disconnected'))
  }

  private setupConnectionHandlers(): void {
    const conn = this.conn as any
    if (!conn) return

    conn.on('open', () => {
      this.setStatus('connected')
    })

    conn.on('data', (data: P2PMessage) => {
      this.onMessage?.(data)
    })

    conn.on('close', () => {
      this.setStatus('disconnected')
    })

    conn.on('error', () => this.setStatus('disconnected'))
  }

  sendMessage(msg: P2PMessage): void {
    const conn = this.conn as any
    if (!conn) return
    try { conn.send(msg) } catch { /* ignore */ }
  }

  sendAction(action: P2PAction): void {
    this.sendMessage({ type: 'action', action })
  }

  requestGameState(): void {
    this.sendMessage({ type: 'requestGameState' })
  }

  disconnect(): void {
    const conn = this.conn as any
    if (conn) { try { conn.close() } catch { /* */ } }
    if (this.peer) { try { this.peer.destroy() } catch { /* */ } }
    this.peer = null
    this.conn = null
    this._isHost = false
    this._gameId = null
    this.setStatus('disconnected')
  }
}
