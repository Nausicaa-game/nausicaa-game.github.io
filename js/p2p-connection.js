/**
 * P2P Connection handler for card game
 * Uses WebRTC for direct browser-to-browser communication, with host-authority
 */
class P2PGameConnection {

    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connection = null;
        this.isHost = false;
        this.gameId = null;
        this.connectionStatus = "disconnected"; // disconnected, connecting, connected
        this.lastSyncTimestamp = 0;
        this.syncInterval = null; // Pour la synchronisation périodique

        this.setupUI();
    }

    setupUI() {
        const container = document.createElement('div');
        container.id = 'p2p-controls';
        container.innerHTML = `
            <div class="p2p-actions">
            <div class="connection-status">Statut: <span id="connection-status">Déconnecté</span></div>
                <button id="host-game-btn" class="btn primary">Héberger une partie</button>
                <button id="game-code-display" class="btn primary small copy-code-btn" style="display:none;">Copier le lien</button>
                <button id="get-link-btn" class="btn"  style="display:none">Obtenir le lien</button>
                <div class="game-code" style="display:none"></div>
            </div>
        `;

        document.querySelector('.game-header').appendChild(container);

        // Add event listeners
        document.getElementById('host-game-btn').addEventListener('click', () => this.hostGame());
        document.getElementById('get-link-btn').addEventListener('click', () => this.openLinkPopup());
        document.querySelector('.copy-code-btn').addEventListener('click', () => this.copyGameLink());

        // Check for gameId in URL parameters on load
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('gameId');
        if (gameId) {
            this.joinGame(gameId);
        }

        // Initially hide the game-code-display
        document.getElementById('game-code-display').style.display = 'none';
    }

    openLinkPopup() {
        if (!this.gameId) {
            alert('Vous devez héberger une partie d\'abord.');
            return;
        }
        nt.getElementById('host-game-btn').addEventListener('click', () => this.hostGame());
        docum

        const gameLink = `${window.location.origin}${window.location.pathname}?gameId=${this.gameId}`;
        // const popupContent = `
        //     <p>Partagez ce lien pour rejoindre la partie :</p>
        //     <a href="${gameLink}" target="_blank">${gameLink}</a>
        // `;

        // Create a simple popup window
        const popupWindow = window.open('', '_blank', 'width=600,height=200');
        popupWindow.document.write(`
            <html>
            <head>
                <title>Lien de la partie</title>
            </head>
            <body>
                ${popupContent}
            </body>
            </html>
        `);
        popupWindow.document.close();
    }

    updateConnectionStatus(status) {
        this.connectionStatus = status;
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = {
                'disconnected': 'Déconnecté',
                'connecting': 'Connexion en cours...',
                'connected': 'Connecté'
            } [status] || status;

            statusElement.className = status;
        }
    }

    displayGameCode(id) {
        this.gameId = id; // Store the game ID
        const codeDisplay = document.getElementById('game-code-display');
        const hostButton = document.getElementById('host-game-btn');
        const codeElement = document.querySelector('.game-code');

        codeElement.textContent = id;
        codeDisplay.style.display = 'inline-block';
        hostButton.style.display = 'none';
    }

    copyGameLink() {
        const codeElement = document.querySelector('.game-code');
        const code = codeElement.textContent;
        const gameLink = `${window.location.origin}${window.location.pathname}?p2p=true&gameId=${code}`;

        navigator.clipboard.writeText(gameLink).then(() => {
            // alert('Lien copié!');
        }).catch(err => {
            console.error('Erreur lors de la copie du lien:', err);
        });
    }

    copyGameCode() {
        const codeElement = document.querySelector('.game-code');
        const code = codeElement.textContent;

        navigator.clipboard.writeText(code).then(() => {
            // alert('Code copié!');
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
        });
    }

    hostGame() {
        if (!window.Peer) {
            this.loadPeerJS(() => this.hostGame());
            return;
        }

        this.updateConnectionStatus('connecting');
        this.isHost = true;

        this.peer = new Peer();

        this.peer.on('open', (id) => {
            this.gameId = id;
            this.displayGameCode(id);
            console.log('Hosting game with ID:', id);
        });

        this.peer.on('connection', (conn) => {
            console.log('Received connection from peer');
            if (this.connection) {
                // Already have a connection, reject new ones
                conn.close();
                return;
            }

            this.connection = conn;
            this.setupConnectionHandlers();
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            this.updateConnectionStatus('disconnected');
        });
    }

    joinGame(hostId) {
        if (!window.Peer) {
            this.loadPeerJS(() => this.joinGame(hostId));
            return;
        }

        this.updateConnectionStatus('connecting');
        this.isHost = false;
        this.gameId = hostId;

        this.peer = new Peer();

        this.peer.on('open', (myId) => {
            console.log('My peer ID:', myId);
            console.log('Connecting to host:', hostId);

            this.connection = this.peer.connect(hostId, {
                reliable: true
            });

            this.setupConnectionHandlers();
        });

        history.pushState({}, null, window.location.href.split('?')[0]);


        this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            this.updateConnectionStatus('disconnected');
        });
    }

    joinGameFromLink() {
        // Display a prompt or an input field to get the game link from the user
        const gameLink = prompt("Entrez le lien de la partie:");
        if (gameLink) {
            try {
                const url = new URL(gameLink);
                const gameId = url.searchParams.get('gameId');
                if (gameId) {
                    this.joinGame(gameId);
                } else {
                    alert("Lien de partie invalide.");
                }
            } catch (error) {
                alert("Lien de partie invalide.");
                console.error("Error parsing game link:", error);
            }
        }
    }

    setupConnectionHandlers() {
        if (!this.connection) return;

        this.connection.on('open', () => {
            console.log('Connection established');
            this.updateConnectionStatus('connected');
            startGameTheme();
            document.getElementById('host-game-btn').style.display = 'none';
            document.getElementById('get-link-btn').style.display = 'none';
            document.getElementById('game-code-display').style.display = 'none';
            document.querySelector(".chat-toggle").style.display = '';

            if (this.isHost) {
                // Host initialise une nouvelle partie
                // this.game.reset
                // Game();
                this.sendGameState();
            } else {
                // Guest demande l'état initial et configure la synchro périodique
                this.requestGameState();
                // this.syncInterval = setInterval(() => this.requestGameState(), 500);
            }
        });

        this.connection.on('data', (data) => {
            console.log('Received data:', data);
            this.handleIncomingData(data);
        });

        this.connection.on('close', () => {
            console.log('Connection closed');
            this.updateConnectionStatus('disconnected');

            const hostButton = document.getElementById('host-game-btn');
            const codeDisplay = document.getElementById('game-code-display');

            if (hostButton) {
                hostButton.style.display = 'inline-block';
            }
            if (codeDisplay) {
                codeDisplay.style.display = 'none';
            }
        });

        this.connection.on('error', (err) => {
            console.error('Connection error:', err);
            this.updateConnectionStatus('disconnected');
        });
    }

    handleIncomingData(data) {
        // console.log('Received data:', data);
        if (!data || !data.type) return;

        switch (data.type) {
            case 'gameState':
                if (!this.isHost) {
                    this.updateGameFromState(data.state);
                }
                break;

            case 'action':
                if (this.isHost) {
                    this.handleRemoteAction(data.action);
                } else if (data.action.name === 'endGame' || data.action.name === 'resetGame' || data.action.name === 'sendMessage') {
                    this.handleRemoteAction(data.action, false);
                }
                break;

            case 'requestGameState':
                if (this.isHost) {
                    this.sendGameState();
                }
                break;
        }
    }

    handleRemoteAction(action, replay = true) {
        console.log('Received remote action:', action);
        if (!action) return;

        switch (action.name) {
            case 'placeUnit':
                this.game.placeUnit(action.unitType, action.player, action.row, action.col);
                break;

            case 'moveUnit':
                this.game.moveUnit(action.toRow, action.toCol, action.id, action.selectedAction);
                break;

            case 'attackUnit':
                this.game.attackUnit(action.targetRow, action.targetCol, action.id);
                break;

            case 'useAbility':
                this.game.useAbility(action.targetRow, action.targetCol);
                break;

            case 'endTurn':
                this.game.endTurn();
                break;

            case 'endGame':
                if (!this.isHost || replay)
                    this.game.endGame(action.winner, false);
                break;

            case 'resetGame':
                if (!this.isHost || replay)
                    this.game.resetGame(false);
                break;

            case 'sendMessage':
                console.log("Revieved message from peer: ", action.message);
                handleIncomingMessage(action.player, action.message);
                break;
        }
        this.sendGameState();
    }

    updateGameFromState(gameState) {
        if (this.game.selectedUnit || this.game.selectedCard) {
            return
        }
        if (!gameState || gameState.timestamp <= this.lastSyncTimestamp) return;

        this.lastSyncTimestamp = gameState.timestamp;
        console.log('Updating game state from peer:', gameState);
        // Mise à jour complète de l'état côté guest

        let oldUnitsId = this.game.board.map(row => row.map(cell => cell ? cell.uuid : null));

        this.game.currentPlayer = gameState.currentPlayer;
        this.game.turn = gameState.turn;
        this.game.gameOver = gameState.gameOver;
        this.game.board = [...gameState.board];
        this.game.players = {
            ...gameState.players
        };
        this.game.selectedAction = gameState.selectedAction; // ADDED: Update selectedAction

        let newUnitsId = this.game.board.map(row => row.map(cell => cell ? cell.uuid : null));
        // console.log('Old units:', oldUnitsId);
        // console.log('New units:', newUnitsId);
        //compare oldUnitsId and newUnitsId length

        if (oldUnitsId.flat().filter(u => !!u).length < newUnitsId.flat().filter(u => !!u).length) {
            for (let oldUnitsIdRow in oldUnitsId) {
                for (let oldUnitsIdCell in oldUnitsId[oldUnitsIdRow]) {
                    if (oldUnitsId[oldUnitsIdRow][oldUnitsIdCell] != newUnitsId[oldUnitsIdRow][oldUnitsIdCell]) {
                        // this.game.board[oldUnitsIdRow][oldUnitsIdCell].justSpawned = true;
                        let unit = this.game.board[oldUnitsIdRow][oldUnitsIdCell];
                        if (unit.type == 'oracle') {
                            songManager.playSong('oraclePut');
                        } else {
                            songManager.playSong('placed');
                        }
                    }
                }
            }
        }

        if (oldUnitsId.flat().filter(u => !!u).length > newUnitsId.flat().filter(u => !!u).length) {
            //check for the player 1 oracle if he exists
            if (!this.game.players[1].units.find(u => u.unit.type == 'oracle')) {
                this.game.endGame(2);
                return;
            }
        }

        if (this.game.currentPlayer == 2) {
            songManager.playSong('yourTurn');
        }

        if (this.game.gameOver) {
            this.game.endGame(this.game.currentPlayer === 1 ? 2 : 1, false);
            return;
        }

        // console.log("Game board updated:", this.game.board);
        // Rafraîchir l'interface
        this.game.updateGameUI();
        this.game.refreshBoardDisplay();
        this.game.setTurnAndPlayer(gameState.turn, gameState.currentPlayer);

        // After updating the game state, re-apply board cell styles
        if (gameState.boardColors) {
            this.applyBoardColors(gameState.boardColors);
        }

        console.log('Game state updated at:', new Date(gameState.timestamp));
    }

    applyBoardColors(boardColors) {
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;

        // Iterate through the board colors and apply them to the cells
        boardColors.forEach((rowColors, row) => {
            rowColors.forEach((cellColors, col) => {
                const cell = boardElement.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    // Apply the class name
                    cell.className = cellColors.className || 'board-cell';

                    // Apply the background color
                    cell.style.backgroundColor = cellColors.backgroundColor || '';
                }
            });
        });
    }

    isMyTurn() {
        // In P2P, host is player 1, guest is player 2
        return (this.isHost && this.game.currentPlayer === 1) ||
            (!this.isHost && this.game.currentPlayer === 2);
    }

    // Methods for synchronizing game state

    sendGameState() {
        if (!this.connection) return;

        const gameState = this.getSerializableGameState();

        this.sendMessage({
            type: 'gameState',
            state: gameState
        });
    }

    getSerializableGameState() {
        // Create a simplified version of the game state for transmission
        const state = {
            currentPlayer: this.game.currentPlayer,
            turn: this.game.turn,
            gameOver: this.game.gameOver,
            timestamp: Date.now(),
            selectedAction: this.game.selectedAction, // ADDED: Include selectedAction
            players: {
                1: {
                    mana: this.game.players[1].mana,
                    maxMana: this.game.players[1].maxMana,
                    hand: this.game.players[1].hand, // Host sends full hand
                    deck: this.game.players[1].deck, // Include full deck if host
                    deckSize: this.game.players[1].deck.length,
                    units: this.game.players[1].units
                },
                2: {
                    mana: this.game.players[2].mana,
                    maxMana: this.game.players[2].maxMana,
                    hand: this.game.players[2].hand, // Guest sends full hand
                    deck: this.game.players[2].deck, // Include full deck if guest
                    deckSize: this.game.players[2].deck.length,
                    units: this.game.players[2].units
                }
            },
            board: this.serializeBoard(),
            boardColors: this.serializeBoardColors() // Add colors information
        };
        // console.log('Serializable game state:', state);
        return state;
    }

    serializeBoard() {
        const serialBoard = [];

        for (let row = 0; row < this.game.board.length; row++) {
            serialBoard[row] = [];
            for (let col = 0; col < this.game.board[row].length; col++) {
                const unit = this.game.board[row][col];
                if (unit) {
                    serialBoard[row][col] = {
                        type: unit.type,
                        player: unit.player,
                        health: unit.health,
                        hasMoved: unit.hasMoved,
                        hasAttacked: unit.hasAttacked,
                        usedAbility: unit.usedAbility,
                        justSpawned: unit.justSpawned,
                        hasDashed: unit.hasDashed,
                        uuid: unit.uuid
                    };
                } else {
                    serialBoard[row][col] = null;
                }
            }
            // console.log('Serialized board:', serialBoard[row]);
        }

        return serialBoard;
    }

    // Add a method to serialize board colors
    serializeBoardColors() {
        const colors = [];
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return colors;

        // Get all cells from the board
        const cells = boardElement.querySelectorAll('.board-cell');

        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (!colors[row]) colors[row] = [];

            // Store classes and background color
            colors[row][col] = {
                className: cell.className, // Store the entire class name
                backgroundColor: cell.style.backgroundColor || ''
            };
        });

        return colors;
    }

    // Intercept game actions to sync with peer

    interceptGameActions() {
        // Sauvegarde des méthodes originales
        const originalMethods = {
            placeUnit: this.game.placeUnit,
            moveUnit: this.game.moveUnit,
            attackUnit: this.game.attackUnit,
            endTurn: this.game.endTurn,
            useAbility: this.game.useAbility,
            endGame: this.game.endGame,
            resetGame: this.game.resetGame
        };

        this.game.endGame = (winner, sendMessageBack = true) => {

            if (sendMessageBack) {
                this.sendMessage({
                    type: 'action',
                    action: {
                        name: 'endGame',
                        winner
                    }
                });
            }
            originalMethods.endGame.call(this.game, winner);
            // this.requestGameState();
        };

        this.game.resetGame = (sendMessageBack = true) => {
            if (sendMessageBack) {
                this.sendMessage({
                    type: 'action',
                    action: {
                        name: 'resetGame'
                    }
                });
            }

            originalMethods.resetGame.call(this.game);
            this.requestGameState();
        };

        if (this.isHost) return; // L'host garde le comportement normal

        // Remplacement par des versions qui envoient l'action à l'host
        this.game.placeUnit = (unitType, player, row, col) => {
            this.sendMessage({
                type: 'action',
                action: {
                    name: 'placeUnit',
                    unitType,
                    row,
                    col,
                    player
                }
            });
            return originalMethods.placeUnit.call(this.game, unitType, player, row, col);
        };

        this.game.moveUnit = (toRow, toCol, id = null, selectedAction = null) => {
            if (!id && this.game.selectedUnit) {
                id = this.game.selectedUnit.unit.uuid;
            }
            if (!selectedAction && this.game.selectedAction) {
                selectedAction = this.game.selectedAction;
            }
            this.sendMessage({
                type: 'action',
                action: {
                    name: 'moveUnit',
                    toRow,
                    toCol,
                    id: id,
                    selectedAction: selectedAction // ADDED: Send selectedAction
                }
            });
            return originalMethods.moveUnit.call(this.game, toRow, toCol, id, selectedAction);
        };

        this.game.attackUnit = (targetRow, targetCol, id = null) => {
            if (!id && this.game.selectedUnit) {
                id = this.game.selectedUnit.unit.uuid;
            }
            this.sendMessage({
                type: 'action',
                action: {
                    name: 'attackUnit',
                    targetRow,
                    targetCol,
                    id
                }
            });
            return originalMethods.attackUnit.call(this.game, targetRow, targetCol, id);
        };

        this.game.useAbility = (targetRow, targetCol) => {
            this.sendMessage({
                type: 'action',
                action: {
                    name: 'useAbility',
                    targetRow,
                    targetCol
                }
            });
            return originalMethods.useAbility.call(this.game, targetRow, targetCol);
        };

        this.game.endTurn = () => {
            this.sendMessage({
                type: 'action',
                action: {
                    name: 'endTurn'
                }
            });
            originalMethods.endTurn.call(this.game);
            this.sendGameState();
        };
    }

    sendMessage(data) {
        if (!this.connection) return;

        try {
            this.connection.send(data);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    }

    // Helper to load PeerJS dynamically
    loadPeerJS(callback) {
        const script = document.createElement('script');
        script.src = '/js/peerjs.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    reconcileGuestState(guestState) {
        // if (!this.isHost) return;

        // Update guest player's hand and deck (player 2)
        if (guestState.players && guestState.players[2]) {
            // Update hand
            if (guestState.players[2].hand) {
                this.game.players[2].hand = guestState.players[2].hand;
            }

            // Update deck
            if (guestState.players[2].deck) {
                this.game.players[2].deck = guestState.players[2].deck;
            }
        }

        console.log('Host reconciled guest state');
    }

    sendGuestState() {
        if (this.isHost || !this.connection) return;

        // Create a simplified state focusing on guest-specific info
        const guestState = {
            players: {
                2: {
                    hand: this.game.players[2].hand,
                    deck: this.game.players[2].deck, // Include the full deck
                    // Add any other player-specific state that host should know
                    unitsPlaced: this.game.players[2].units ? this.game.players[2].units.length : 0
                }
            },
            timestamp: Date.now()
        };

        if (!this.game.gameOver)
            this.sendMessage({
                type: 'guestStateUpdate',
                state: guestState
            });
    }

    requestGameState() {
        this.sendMessage({
            type: 'requestGameState'
        });
    }
}