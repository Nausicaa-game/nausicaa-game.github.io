/**
 * Nausicaa - Mythological Strategy Board Game
 * Core game mechanics implementation
 */

// Game state and constants
const BOARD_ROWS = 8;
const BOARD_COLS = 10;
const MAX_MANA = 6;

// Unit definitions with their properties
const UNITS = {
    oracle: {
        name: translations[preferredLanguage]['oracle_name'],
        cost: 0,
        movement: "king", // 8 surrounding squares
        attack: "none",
        health: 1,
        description: translations[preferredLanguage]['oracle_description'],
        manaCost: {
            move: 1,
            dash: 2
        }
    },
    gobelin: {
        name: translations[preferredLanguage]['gobelin_name'],
        cost: 1,
        movement: "forward3",
        attack: "lateral4",
        health: 1,
        description: translations[preferredLanguage]['gobelin_description']
    },
    harpy: {
        name: translations[preferredLanguage]['harpy_name'],
        cost: 1,
        movement: "king",
        attack: "explosion",
        health: 1,
        description: translations[preferredLanguage]['harpy_description']
    },
    naiad: {
        name: translations[preferredLanguage]['naiad_name'],
        cost: 1,
        movement: "diagonal",
        attack: "none",
        health: 1,
        description: translations[preferredLanguage]['naiad_description']
    },
    griffin: {
        name: translations[preferredLanguage]['griffin_name'],
        cost: 2,
        movement: "hop2",
        attack: "adjacent",
        health: 2,
        description: translations[preferredLanguage]['griffin_description']
    },
    siren: {
        name: translations[preferredLanguage]['siren_name'],
        cost: 2,
        movement: "lateral",
        attack: "diagonal4",
        health: 1,
        description: translations[preferredLanguage]['siren_description']
    },
    centaur: {
        name: translations[preferredLanguage]['centaur_name'],
        cost: 2,
        movement: "knight", // L-shape like chess knight
        attack: "adjacent",
        health: 2,
        ability: "pull",
        description: translations[preferredLanguage]['centaur_description']
    },
    archer: {
        name: translations[preferredLanguage]['archer_name'],
        cost: 3,
        movement: "lateral",
        attack: "diagonal3",
        health: 1,
        description: translations[preferredLanguage]['archer_description']
    },
    phoenix: {
        name: translations[preferredLanguage]['phoenix_name'],
        cost: 3,
        movement: "diagonal",
        attack: "adjacent",
        health: 2,
        special: "dark_tiles_only",
        description: translations[preferredLanguage]['phoenix_description']
    },
    shapeshifter: {
        name: translations[preferredLanguage]['shapeshifter_name'],
        cost: 4,
        movement: "king",
        attack: "adjacent",
        health: 2,
        ability: "swap",
        description: translations[preferredLanguage]['shapeshifter_description']
    },
    seer: {
        name: translations[preferredLanguage]['seer_name'],
        cost: 4,
        movement: "none",
        attack: "none",
        health: 1,
        ability: "extra_mana",
        description: translations[preferredLanguage]['seer_description']
    },
    titan: {
        name: translations[preferredLanguage]['titan_name'],
        cost: 6,
        movement: "king1", // Can move one square in all directions
        attack: "area3",
        health: 3,
        ability: "destroy_on_spawn",
        description: translations[preferredLanguage]['titan_description']
    }
};

// Preload unit images
const unitImages = {};
for (const unitType in UNITS) {
    unitImages[unitType] = new Image();
    unitImages[unitType].src = `/assets/pions/${unitType}.svg`;
}

class Game {
    constructor() {
        this.timerMode = false; // Default: timer mode off
        this.cpuMode = false; // Default: CPU mode off
        this.timerSeconds = 15;
        this.turnTimer = null;
        this.initializeUI();
        this.initializeGame();
        this.setupEventListeners();
        this.setupCardPreviewSystem();
        this.cpuPlayer = new CPUPlayer(this);
    }

    setTimerMode(enabled) {
        this.timerMode = enabled;
    }

    setCpuMode(enabled) {
        this.cpuMode = enabled;
    }

    startTurnTimer() {
        document.getElementById("timer-display").style.display = "block";
        this.stopTurnTimer(); // Clear any existing timer
        this.timerSeconds = 15; // Reset timer seconds
        this.updateTimerDisplay(); // Update display immediately
        this.turnTimer = setInterval(() => {
            this.timerSeconds -= 0.01;
            this.timerSeconds = parseFloat(this.timerSeconds.toFixed(2));
            this.updateTimerDisplay();
            if (this.timerSeconds <= 0 && !this.gameOver) {
                clearInterval(this.turnTimer); // Clear the interval
                this.endTurn();
                songManager.playSong('timer', true)
                this.triggerTimerEndEffect(); // ADD THIS LINE
            }
        }, 10);
    }

    stopTurnTimer() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
    }

    initializeUI() {
        // Initialize player info panels
        const playerOneInfo = document.querySelector('.player-area.player-one .player-info .mana-container');
        playerOneInfo.innerHTML = `
            <div class="mana-container">${translations[preferredLanguage]['mana']} <span id="player-one-mana">1/1</span></div>
        `;

        const playerTwoInfo = document.querySelector('.player-area.player-two .player-info .mana-container');
        playerTwoInfo.innerHTML = `
            <div class="mana-container">${translations[preferredLanguage]['mana']} <span id="player-two-mana">1/1</span></div>
        `;

        // Initialize hand containers
        const playerOneHandContainer = document.querySelector('.player-area.player-one .hand-container');
        playerOneHandContainer.innerHTML = '<div id="player-one-hand" class="hand"></div>';

        const playerTwoHandContainer = document.querySelector('.player-area.player-two .hand-container');
        playerTwoHandContainer.innerHTML = '<div id="player-two-hand" class="hand"></div>';

        // Initialize action panels
        const playerOneActionPanel = document.querySelector('.player-area.player-one .action-panel');
        playerOneActionPanel.innerHTML = `
            <div id="player-one-action" class="current-action">${translations[preferredLanguage]['select_card']}</div>
            <button id="end-turn-one" class="btn primary">${translations[preferredLanguage]['end_turn']}</button>
        `;

        const playerTwoActionPanel = document.querySelector('.player-area.player-two .action-panel');
        playerTwoActionPanel.innerHTML = `
            <div id="player-two-action" class="current-action">${translations[preferredLanguage]['waiting']}</div>
            <button id="end-turn-two" class="btn primary" disabled>${translations[preferredLanguage]['end_turn']}</button>
        `;

        // Initialize unit info panel
        const unitInfoPanel = document.getElementById('unit-info');
        unitInfoPanel.innerHTML = `<div class="unit-details">${translations[preferredLanguage]['select_unit']}</div>`;

        // Create the game board
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';

                // Add dark/light alternating pattern
                if ((row + col) % 2 === 1) {
                    cell.classList.add('dark');
                }

                // Highlight spawn areas
                if (row === 0) {
                    cell.classList.add('player-two-spawn');
                } else if (row === 1) {
                    cell.classList.add('player-two-spawn-bottom');
                } else if (row === 6) {
                    cell.classList.add('player-one-spawn');
                } else if (row === 7) {
                    cell.classList.add('player-one-spawn-bottom');
                }

                cell.dataset.row = row;
                cell.dataset.col = col;
                

                // Add event listeners for hover effect
                cell.addEventListener('mouseover', handleCellMouseOver);
                cell.addEventListener('mouseout', handleCellMouseOut);

                gameBoard.appendChild(cell);
            }
        }
    }

    initializeGame() {
        // Game state
        this.currentPlayer = 1; // 1 or 2
        this.turn = 1;
        this.gameOver = false;
        this.selectedCard = null;
        this.selectedUnit = null;
        this.selectedAction = null; // 'move', 'attack', 'ability'
        this.validMoves = [];
        this.validAttacks = [];
        this.movedUnitThisTurn = null; // Track which unit was moved this turn

        // Player state
        this.players = {
            1: {
                mana: 1,
                maxMana: 1,
                deck: this.generateDeck(),
                hand: [],
                units: []
            },
            2: {
                mana: 1,
                maxMana: 1,
                deck: this.generateDeck(),
                hand: [],
                units: []
            }
        };

        // Create the game board state (10x8 grid, empty)
        this.board = Array(BOARD_ROWS).fill().map(() => Array(BOARD_COLS).fill(null));

        // Draw initial hands, ensuring Oracle is present
        // if(qs.local=="true") {
        this.drawInitialHand(1);
        this.drawInitialHand(2);
        // }

        // Update UI
        this.updateGameUI();
    }

    generateDeck() {
        // Create a balanced deck according to the game rules
        const deck = [
            'oracle', // Add one oracle to the deck
            'gobelin', 'gobelin', 'gobelin',
            'harpy', 'harpy',
            'naiad', 'naiad',
            'griffin', 'griffin',
            'siren', 'siren',
            'centaur',
            'archer', 'archer',
            'phoenix',
            'shapeshifter',
            'seer',
            'titan'
        ];

        // Shuffle the deck
        return this.shuffleArray(deck);
    }

    drawInitialHand(player) {
        const playerState = this.players[player];

        // Draw cards until Oracle is in hand
        while (!playerState.hand.includes('oracle')) {
            playerState.hand = []; // Clear the hand
            playerState.deck = this.generateDeck(); // Regenerate and shuffle the deck
            this.drawCards(player, 3); // Draw 3 cards
        }
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    drawCards(player, count) {
        const playerState = this.players[player];
        for (let i = 0; i < count; i++) {
            if (playerState.deck.length > 0) {
                const card = playerState.deck.pop();
                playerState.hand.push(card);
            }
        }
    }

    placeUnit(unitType, player, row, col) {
        const randomUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        const uuid = randomUUID();
        const unit = {
            type: unitType,
            player: player,
            health: UNITS[unitType].health,
            hasMoved: false,
            hasAttacked: false,
            usedAbility: false,
            justSpawned: true,
            hasDashed: false, // ADDED: Flag to track if the unit has dashed
            uuid
        };

        songManager.playSong('placed', true)

        if (unitType === 'oracle') {
            //console.log("Player", player, "placed Oracle at", row, col);
            if (player === 1) {
                songManager.playSong('oraclePut', true);
                songManager.setVolume("oraclePut",0.3)
            }
            else {
                songManager.playSong('oraclePut', true);
                songManager.setVolume("oraclePut",0.3)
                songManager.playSong('announcer:battleBegins', true);
                songManager.transitionSong("firstRound", "menu_next", true)
                if (game.timerMode) {
                    game.startTurnTimer();
                }
            }
        }

        this.board[row][col] = unit;
        //console.log(`Placed ${unitType} for player ${player} at ${row}, ${col}`);
        //console.log(this.board);

        this.players[player].units.push({
            unit,
            row,
            col,
            uuid: uuid
        });
        // Remove card from hand
        const cardIndex = this.players[player].hand.indexOf(unitType);
        if (cardIndex !== -1) {
            this.players[player].hand.splice(cardIndex, 1);
        }

        // Create visual unit on the board
        this.createUnitElement(unit, row, col, true); // REMOVE THIS LINE
    }

    setupEventListeners() {
        // Board cell click events
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        // Card selection events
        document.getElementById('player-one-hand').addEventListener('click', (e) => {
            if (e.target.closest('.card')) {
                this.handleCardSelect(e.target.closest('.card'));
            }
        });

        document.getElementById('player-two-hand').addEventListener('click', (e) => {
            if (e.target.closest('.card')) {
                this.handleCardSelect(e.target.closest('.card'));
            }
        });

        // End turn buttons
        document.getElementById('end-turn-one').addEventListener('click', () => {
            if (this.currentPlayer === 1 && ((p2pConnection?.gameId && p2pConnection.isHost) || !p2pConnection?.gameId)) {
                if (this.turn === 1 && !this.hasPlacedOracle(1)) {
                    this.updateActionText(translations[preferredLanguage]['player_one_place_oracle']);
                    return;
                }
                this.endTurn();
            }
        });

        document.getElementById('end-turn-two').addEventListener('click', () => {
            if (this.currentPlayer === 2 && ((p2pConnection?.gameId && !p2pConnection.isHost) || !p2pConnection?.gameId)) {
                if (this.turn === 1 && !this.hasPlacedOracle(2)) {
                    this.updateActionText(translations[preferredLanguage]['player_two_place_oracle']);
                    return;
                }
                this.endTurn();
            }
        });

        // Reset game button
        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });
    }

    handleCellClick(event) {
        if (this.gameOver) return;
        // console.log("Cell clicked", this.currentPlayer, p2pConnection.isHost);
        // If it's the opponent's turn in multiplayer mode, do nothing
        if (p2pConnection?.gameId && ((this.currentPlayer === 1 && !p2pConnection.isHost) || (this.currentPlayer === 2 && p2pConnection.isHost))) {
            //console.log("Bruh what are ut trying bud")
            return;
        }

        if(this.currentPlayer === 2 && this.cpuMode) {
            return;
        }

        const cell = event.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // If it's the first turn and the player hasn't placed their Oracle yet
        if (this.turn === 1 && !this.hasPlacedOracle(this.currentPlayer)) {
            // console.log(this.selectedCard)
            if (this.selectedCard && this.selectedCard.type === 'oracle') {
                this.trySpawnUnit(row, col);
            } else {
                this.updateActionText(translations[preferredLanguage]['select_oracle']);
            }
            return;
        }

        // If a card is selected, try to spawn a unit
        if (this.selectedCard) {
            this.trySpawnUnit(row, col);
            // console.log("i tried to spawn a unit");
            return;
        }

        // If a unit is selected, handle movement or attack
        if (this.selectedUnit) {
            const unitElement = cell.querySelector('.unit');
            if (this.selectedUnit.element == unitElement) {
                this.deselectUnit();
                return;
            }

            // If clicking on another unit of same player, select that unit instead
            if (unitElement && unitElement.classList.contains(`player-${this.currentPlayer}`)) {
                this.selectUnit(unitElement, row, col);
                return;
            }

            // Handle attack if valid
            if (this.isValidAttack(row, col)) {
                //console.log("attacking on", row,col)
                songManager.playSong('attack');
                this.attackUnit(row, col);
                return;
            }

            // Handle dash if valid
            if (this.isValidMove(row, col)) {
                songManager.playSong('clic');
                this.moveUnit(row, col);
                if (this.selectedAction === 'dash') {
                    this.endTurn();
                }
                return;
            }

            // Handle ability if valid
            if (this.selectedAction === 'ability' && this.isValidAbilityTarget(row, col)) {
                this.useAbility(row, col);
                return;
            }

            // Deselect if clicking elsewhere
            this.deselectUnit();
            return;
        }

        // If nothing is selected, try to select a unit
        const unitElement = cell.querySelector('.unit');
        if (unitElement && unitElement.classList.contains(`player-${this.currentPlayer}`)) {
            this.selectUnit(unitElement, row, col);
            songManager.playSong('pop');
        }
    }

    handleCardSelect(cardElement) {
        if (this.gameOver) return;
        if (p2pConnection?.gameId && ((this.currentPlayer === 1 && !p2pConnection.isHost) || (this.currentPlayer === 2 && p2pConnection.isHost))) {
            //console.log("Bruh what are ut trying bud")
            return;
        }

        // Make sure the clicked card belongs to the current player
        const isPlayerOneCard = cardElement.closest('#player-one-hand') !== null;
        const isPlayerTwoCard = cardElement.closest('#player-two-hand') !== null;

        if ((this.currentPlayer === 1 && !isPlayerOneCard) ||
            (this.currentPlayer === 2 && !isPlayerTwoCard)) {
            this.updateActionText(translations[preferredLanguage]['select_own_card']);
            return;
        }

        if (cardElement == this.selectedCard?.element) {
            this.deselectCard();
            return;
        }

        // Deselect any unit
        this.deselectUnit();

        // Deselect previous card if any
        if (this.selectedCard) {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('selected');
            });
        }

        const unitType = cardElement.dataset.type;
        if (unitType === 'oracle') {
            startGameTheme()
            if (!p2pConnection.peer) {
                document.getElementById('p2p-controls').style.display = "none";
            }
        }
        // Select the card
        const manaCost = parseInt(cardElement.dataset.cost);

        // Check if player has enough mana
        if (this.players[this.currentPlayer].mana < manaCost) {
            this.updateActionText(translations[preferredLanguage]['not_enough_mana'] + ` ${UNITS[unitType].name}`);
            return;
        }

        // Select the card
        cardElement.classList.add('selected');
        this.selectedCard = {
            element: cardElement,
            type: unitType,
            cost: manaCost
        };

        // Highlight valid spawn locations
        this.highlightValidSpawnLocations();
        // console.log(unitType+"_name")
        this.updateActionText(translations[preferredLanguage]['select_spawn'] + ` ${translations[preferredLanguage][unitType+"_name"]}`);
    }

    selectUnit(unitElement, row, col) {
        // Deselect previous unit and card
        this.deselectAll();

        const unit = this.board[row][col];
        if (!unit || unit.player !== this.currentPlayer) return;

        // Check if another unit has already been moved this turn
        if (this.movedUnitThisTurn !== null && this.movedUnitThisTurn !== unit) {
            this.updateActionText(translations[preferredLanguage]['act_with_moved_unit']);
            return;
        }

        // Select the unit
        unitElement.classList.add('selected');
        this.selectedUnit = {
            element: unitElement,
            row,
            col,
            unit
        };

        // Determine available actions for this unit
        const canMove = !unit.hasMoved && !unit.justSpawned;
        const hasAbility = UNITS[unit.type].ability && !unit.usedAbility && this.players[this.currentPlayer].mana >= 1;
        const canDash = !unit.hasDashed && !unit.hasAttacked && unit.hasMoved && !unit.justSpawned && this.players[this.currentPlayer].mana >= 1; // ADDED: Check hasDashed

        // Only allow actions if this is the moved unit or no unit has been moved yet
        const canAct = (this.movedUnitThisTurn === null || this.movedUnitThisTurn === unit);

        // Modified: Allow attack without requiring movement first
        const canAttack = !unit.hasAttacked && UNITS[unit.type].attack !== 'none' && this.players[this.currentPlayer].mana >= 1;
        const canAttackFirstMove = !unit.hasAttacked && UNITS[unit.type].attack !== 'none' && this.players[this.currentPlayer].mana >= 1 && !unit.hasMoved;
        //console.log('canMove', canMove, 'canAttack', canAttack, 'hasAbility', hasAbility, 'canDash', canDash);

        // Default to move action if available and no unit has been moved yet
        if ((canMove || (canAttackFirstMove)) && this.movedUnitThisTurn === null) {
            this.validAttacks = this.getValidAttacks(row, col);
            this.validMoves = this.getValidMoves(row, col);
            if (this.validAttacks.length > 0) {
                this.selectedAction = 'attack';
                this.highlightValidAttacks(false);
            }
            if (this.validMoves.length > 0) {
                this.selectedAction = 'move';
                this.highlightValidMoves(false);
            }
        } else {
            this.validAttacks = this.getValidAttacks(row, col);
            this.validMoves = this.getValidMoves(row, col);
            //console.log("canAct",canAct, "canDash", canDash, this.validAttacks.length > 0, canAttack);
            if (this.validMoves.length > 0 && canDash && canAct) {
                this.selectedAction = 'dash';
                //console.log("validMoves",this.validMoves)
                this.highlightValidMoves(false);
            } else if (this.validAttacks.length > 0 && canAct) {
                this.selectedAction = 'attack';
                this.highlightValidAttacks(false);
            } else if (hasAbility && canAct) {
                this.selectedAction = 'ability';
                const abilityTargets = this.getValidAbilityTargets(row, col);
                this.highlightValidAbilityTargets(abilityTargets);
            } else {
                this.selectedAction = null;
            }
        }

        // Update unit info panel
        this.updateUnitInfoPanel(unit);

        // Update action text
        this.updateActionOptions(unit, canMove && this.movedUnitThisTurn === null, canAttack && canAct, hasAbility && canAct, canDash && canAct);
    }

    deselectAll() {
        this.deselectCard();
        this.deselectUnit();
    }

    deselectCard() {
        if (this.selectedCard) {
            this.selectedCard.element.classList.remove('selected');
            this.selectedCard = null;
        }

        // Clear spawn highlights
        document.querySelectorAll('.cell-highlight').forEach(highlight => highlight.remove());
    }

    deselectUnit() {
        if (this.selectedUnit) {
            this.selectedUnit.element.classList.remove('selected');
            this.selectedUnit = null;
            // this.selectedAction = null; // REMOVED: Do not reset selectedAction
        }

        // Clear highlights
        document.querySelectorAll('.cell-highlight').forEach(highlight => highlight.remove());

        // Reset unit info panel
        document.querySelector('#unit-info .unit-details').textContent = translations[preferredLanguage]['select_unit'];
    }

    highlightValidSpawnLocations(clear = true) {
        // Clear existing highlights
        if (clear)
            document.querySelectorAll('.cell-highlight').forEach(highlight => highlight.remove());

        // Define spawn area based on current player
        const spawnRows = this.currentPlayer === 1 ? [6, 7] : [0, 1];

        for (let row of spawnRows) {
            for (let col = 0; col < BOARD_COLS; col++) {
                // Only highlight empty cells
                if (!this.board[row][col]) {
                    const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        const highlight = document.createElement('div');
                        highlight.className = 'cell-highlight';
                        cell.appendChild(highlight);
                    }
                }
            }
        }
    }

    highlightValidMoves(clear = true) {
        // Clear existing highlights
        if (clear)
            document.querySelectorAll('.cell-highlight').forEach(highlight => highlight.remove());

        // Add highlights for valid moves
        this.validMoves.forEach(({
            row,
            col
        }) => {
            const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.remove('valid-move');

            if (cell) {
                const highlight = document.createElement('div');
                highlight.className = 'cell-highlight';
                cell.appendChild(highlight);
            }
        });
    }

    highlightValidAttacks(clear = true) {
        // Clear existing highlights
        if (clear)
            document.querySelectorAll('.cell-highlight').forEach(highlight => highlight.remove());

        // Add highlights for valid attacks
        this.validAttacks.forEach(({
            row,
            col
        }) => {
            const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.remove('valid-attack');

            if (cell) {
                const highlight = document.createElement('div');
                highlight.className = 'cell-highlight attack-highlight';
                highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                cell.appendChild(highlight);
            }
        });
    }

    highlightValidAbilityTargets(targets) {
        // Clear existing highlights
        document.querySelectorAll('.cell-highlight').forEach(highlight => highlight.remove());

        // Add highlights for valid ability targets
        targets.forEach(({
            row,
            col
        }) => {
            const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                const highlight = document.createElement('div');
                highlight.className = 'cell-highlight ability-highlight';
                highlight.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
                cell.appendChild(highlight);
            }
        });
    }

    getValidMoves(row, col) {
        const unit = this.board[row][col];
        if (!unit) return [];

        const movementType = UNITS[unit.type].movement;
        const validMoves = [];

        // Define movement patterns based on unit type
        switch (movementType) {
            case 'king': // 8 surrounding squares, one square at a time
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position

                        const newRow = row + r;
                        const newCol = col + c;

                        if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                            validMoves.push({
                                row: newRow,
                                col: newCol
                            });
                        }
                    }
                }
                break;

            case 'king1': // Same as king but only 1 square in all directions
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position

                        const newRow = row + r;
                        const newCol = col + c;

                        if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                            validMoves.push({
                                row: newRow,
                                col: newCol
                            });
                        }
                    }
                }
                break;

            case 'forward3': // Forward one square at a time
                const direction = unit.player === 1 ? -1 : 1; // Player 1 moves up, Player 2 moves down
                const newRow = row + direction;

                if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
                    validMoves.push({
                        row: newRow,
                        col
                    });
                }
                if (this.isValidPosition(newRow, col - 1) && !this.board[newRow][col - 1]) {
                    validMoves.push({
                        row: newRow,
                        col: col - 1
                    });
                }
                if (this.isValidPosition(newRow, col + 1) && !this.board[newRow][col + 1]) {
                    validMoves.push({
                        row: newRow,
                        col: col + 1
                    });
                }
                break;
            case 'zombie_move':
                const direction2 = unit.player === 1 ? -1 : 1;
                const attackDirections = [{
                        r: direction2,
                        c: -1
                    }, // Forward-Left
                    {
                        r: direction2,
                        c: 0
                    }, // Forward
                    {
                        r: direction2,
                        c: 1
                    }, // Forward-Right
                ];

                attackDirections.forEach(dir => {
                    const targetRow = row + dir.r;
                    const targetCol = col + dir.c;

                    if (this.isValidPosition(targetRow, targetCol) &&
                        this.board[targetRow][targetCol] &&
                        this.board[targetRow][targetCol].player !== this.currentPlayer) {
                        validAttacks.push({
                            row: targetRow,
                            col: targetCol
                        });
                    }
                });
                break;
            case 'lateral': // Horizontal and vertical movement, one square at a time
                // Check up
                if (row - 1 >= 0 && !this.board[row - 1][col]) {
                    validMoves.push({
                        row: row - 1,
                        col
                    });
                }

                // Check down
                if (row + 1 < BOARD_ROWS && !this.board[row + 1][col]) {
                    validMoves.push({
                        row: row + 1,
                        col
                    });
                }

                // Check left
                if (col - 1 >= 0 && !this.board[row][col - 1]) {
                    validMoves.push({
                        row,
                        col: col - 1
                    });
                }

                // Check right
                if (col + 1 < BOARD_COLS && !this.board[row][col + 1]) {
                    validMoves.push({
                        row,
                        col: col + 1
                    });
                }
                break;

            case 'diagonal': // Diagonal movement, one square at a time
                // Check top-left
                if (row - 1 >= 0 && col - 1 >= 0 && !this.board[row - 1][col - 1]) {
                    validMoves.push({
                        row: row - 1,
                        col: col - 1
                    });
                }

                // Check top-right
                if (row - 1 >= 0 && col + 1 < BOARD_COLS && !this.board[row - 1][col + 1]) {
                    validMoves.push({
                        row: row - 1,
                        col: col + 1
                    });
                }

                // Check bottom-left
                if (row + 1 < BOARD_ROWS && col - 1 >= 0 && !this.board[row + 1][col - 1]) {
                    validMoves.push({
                        row: row + 1,
                        col: col - 1
                    });
                }

                // Check bottom-right
                if (row + 1 < BOARD_ROWS && col + 1 < BOARD_COLS && !this.board[row + 1][col + 1]) {
                    validMoves.push({
                        row: row + 1,
                        col: col + 1
                    });
                }
                break;

            case 'hop2': // Griffin's 2-square hop
                const hopDirections = [{
                        r: -2,
                        c: 0
                    }, // Up 2
                    {
                        r: 2,
                        c: 0
                    }, // Down 2
                    {
                        r: 0,
                        c: -2
                    }, // Left 2
                    {
                        r: 0,
                        c: 2
                    } // Right 2
                ];

                hopDirections.forEach(dir => {
                    const newRow = row + dir.r;
                    const newCol = col + dir.c;

                    if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                        validMoves.push({
                            row: newRow,
                            col: newCol
                        });
                    }
                });
                break;

            case 'knight': // Chess knight L-shape
                const knightMoves = [{
                        r: -2,
                        c: -1
                    }, {
                        r: -2,
                        c: 1
                    },
                    {
                        r: -1,
                        c: -2
                    }, {
                        r: -1,
                        c: 2
                    },
                    {
                        r: 1,
                        c: -2
                    }, {
                        r: 1,
                        c: 2
                    },
                    {
                        r: 2,
                        c: -1
                    }, {
                        r: 2,
                        c: 1
                    }
                ];

                knightMoves.forEach(move => {
                    const newRow = row + move.r;
                    const newCol = col + move.c;

                    if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                        validMoves.push({
                            row: newRow,
                            col: newCol
                        });
                    }
                });
                break;

            case 'none': // Unit cannot move
                break;
        }

        // Special case for Phoenix - can only move to dark tiles
        if (unit.type === 'phoenix') {
            return validMoves.filter(move => (move.row + move.col) % 2 === 1);
        }

        return validMoves;
    }

    getValidAttacks(row, col) {
        const unit = this.board[row][col];
        if (!unit) return [];

        
        // console.log("getValidAttacks", unit);

        const attackType = UNITS[unit.type].attack;
        const validAttacks = [];

        // Check if player has enough mana for attack
        if (this.players[this.currentPlayer].mana < 1) return [];

        // Define attack patterns based on unit type
        switch (attackType) {
            case 'none': // Unit cannot attack
                break;

            case 'adjacent': // Attack adjacent squares
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position

                        const targetRow = row + r;
                        const targetCol = col + c;

                        if (this.isValidPosition(targetRow, targetCol) &&
                            this.board[targetRow][targetCol] &&
                            this.board[targetRow][targetCol].player !== this.currentPlayer) {
                            validAttacks.push({
                                row: targetRow,
                                col: targetCol
                            });
                        }
                    }
                }
                break;

            case 'lateral4': // Attack in 4 lateral directions
                const lateralDirections = [{
                        r: -1,
                        c: 0
                    }, // Up
                    {
                        r: 1,
                        c: 0
                    }, // Down
                    {
                        r: 0,
                        c: -1
                    }, // Left
                    {
                        r: 0,
                        c: 1
                    } // Right
                ];

                lateralDirections.forEach(dir => {
                    const targetRow = row + dir.r;
                    const targetCol = col + dir.c;

                    if (this.isValidPosition(targetRow, targetCol) &&
                        this.board[targetRow][targetCol] &&
                        this.board[targetRow][targetCol].player !== this.currentPlayer) {
                        validAttacks.push({
                            row: targetRow,
                            col: targetCol
                        });
                    }
                });
                break;

            case 'diagonal4': // Attack in 4 diagonal directions
                const diagonalDirections = [{
                        r: -1,
                        c: -1
                    }, // Top-left
                    {
                        r: -1,
                        c: 1
                    }, // Top-right
                    {
                        r: 1,
                        c: -1
                    }, // Bottom-left
                    {
                        r: 1,
                        c: 1
                    } // Bottom-right
                ];

                diagonalDirections.forEach(dir => {
                    const targetRow = row + dir.r;
                    const targetCol = col + dir.c;

                    if (this.isValidPosition(targetRow, targetCol) &&
                        this.board[targetRow][targetCol] &&
                        this.board[targetRow][targetCol].player !== this.currentPlayer) {
                        validAttacks.push({
                            row: targetRow,
                            col: targetCol
                        });
                    }
                });
                break;

            case 'diagonal3': // Archer's 3-square diagonal attack
                const arrowDirections = [{
                        r: -1,
                        c: -1
                    }, {
                        r: -1,
                        c: 1
                    },
                    {
                        r: 1,
                        c: -1
                    }, {
                        r: 1,
                        c: 1
                    }
                ];

                arrowDirections.forEach(dir => {
                    for (let i = 1; i <= 3; i++) {
                        const targetRow = row + (dir.r * i);
                        const targetCol = col + (dir.c * i);

                        if (!this.isValidPosition(targetRow, targetCol)) break;

                        if (this.board[targetRow][targetCol]) {
                            if (this.board[targetRow][targetCol].player !== this.currentPlayer) {
                                validAttacks.push({
                                    row: targetRow,
                                    col: targetCol
                                });
                            }
                            break; // Stop when hitting any unit
                        }
                    }
                });
                break;

            case 'explosion': // Harpy's explosive attack
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position

                        const targetRow = row + r;
                        const targetCol = col + c;

                        if (this.isValidPosition(targetRow, targetCol) && this.board[targetRow][targetCol]) {
                            // Explosive attack can hit allies too
                            validAttacks.push({
                                row: targetRow,
                                col: targetCol
                            });
                        }
                    }
                }
                break;

            case 'area3': // Titan's area attack within 3 squares
                for (let r = -3; r <= 3; r++) {
                    for (let c = -3; c <= 3; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position
                        if (Math.abs(r) + Math.abs(c) > 3) continue; // Limit to 3 squares distance

                        const targetRow = row + r;
                        const targetCol = col + c;

                        if (this.isValidPosition(targetRow, targetCol) &&
                            this.board[targetRow][targetCol] &&
                            this.board[targetRow][targetCol].player !== this.currentPlayer) {
                            validAttacks.push({
                                row: targetRow,
                                col: targetCol
                            });
                        }
                    }
                }
                break;
            case 'zombie_attack':
                const direction = unit.player === 1 ? -1 : 1;
                const attackDirections = [{
                        r: direction,
                        c: -1
                    }, // Forward-Left
                    {
                        r: direction,
                        c: 0
                    }, // Forward
                    {
                        r: direction,
                        c: 1
                    }, // Forward-Right
                ];

                attackDirections.forEach(dir => {
                    const targetRow = row + dir.r;
                    const targetCol = col + dir.c;

                    if (this.isValidPosition(targetRow, targetCol) &&
                        this.board[targetRow][targetCol] &&
                        this.board[targetRow][targetCol].player !== this.currentPlayer) {
                        validAttacks.push({
                            row: targetRow,
                            col: targetCol
                        });
                    }
                });
                break;
        }

        return validAttacks;
    }

    getValidAbilityTargets(row, col) {
        const unit = this.board[row][col];
        if (!unit) return [];

        // Check the ability type for this unit
        const ability = UNITS[unit.type].ability;
        if (!ability) return [];

        // Check if player has enough mana for ability use
        if (this.players[this.currentPlayer].mana < 1) return [];

        const validTargets = [];

        switch (ability) {
            case 'pull': // Centaur's ability to pull units
                // Look for units within 2 squares in any direction
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position
                        if (Math.abs(r) + Math.abs(c) > 2) continue; // Limit to 2 squares distance

                        const targetRow = row + r;
                        const targetCol = col + c;

                        if (this.isValidPosition(targetRow, targetCol) &&
                            this.board[targetRow][targetCol]) {
                            validTargets.push({
                                row: targetRow,
                                col: targetCol
                            });
                        }
                    }
                }
                break;

            case 'swap': // Shapeshifter's ability to swap places
                // Look for units anywhere on the board except Oracles
                for (let r = 0; r < BOARD_ROWS; r++) {
                    for (let c = 0; c < BOARD_COLS; c++) {
                        // Skip current position
                        if (r === row && c === col) continue;

                        const targetUnit = this.board[r][c];
                        // Can swap with any unit that's not an Oracle
                        if (targetUnit && targetUnit.type !== 'oracle') {
                            validTargets.push({
                                row: r,
                                col: c
                            });
                        }
                    }
                }
                break;

            case 'extra_mana': // Seer's passive ability
                // This is a passive ability, no targets needed
                break;

            case 'destroy_on_spawn': // Titan's spawn ability
                // This activates on spawn, no manual targeting needed
                break;
        }

        return validTargets;
    }

    isValidMove(row, col) {
        //console.log("valid moves",this.validMoves)
        return this.validMoves.some(move => move.row === row && move.col === col);
    }

    isValidAttack(row, col) {
        return this.validAttacks.some(attack => attack.row === row && attack.col === col);
    }

    isValidAbilityTarget(row, col) {
        return this.validAbilityTargets.some(target => target.row === row && target.col === col);
    }

    isValidPosition(row, col) {
        return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
    }

    trySpawnUnit(row, col) {
        if (this.selectedCard.type === 'phoenix') {
            if ((row + col) % 2 === 0) {
                this.updateActionText(translations[preferredLanguage]['phoenix_invalid_spawn']);
                return;
            }
        }
        // console.log('trySpawnUnit', row, col);
        if (this.p2pConnection && !this.p2pConnection.isHost) {
            // Guest: Send action to host
            this.p2pConnection.sendMessage({
                type: 'action',
                action: {
                    name: 'placeUnit',
                    unitType: this.selectedCard.type,
                    player: this.currentPlayer,
                    row: row,
                    col: col
                }
            });

            // Remove card from hand - GUEST
            const player = this.players[this.currentPlayer];
            const unitType = this.selectedCard.type;
            const cardIndex = player.hand.indexOf(unitType);
            if (cardIndex !== -1) {
                player.hand.splice(cardIndex, 1);
            }
            this.deselectCard();
            this.updateGameUI();
            return; // Guest does not execute the placement
        }

        if (!this.selectedCard) return;

        // Check if it's a valid spawn location
        const isValidSpawn = (this.currentPlayer === 1 && (row === 6 || row === 7)) ||
            (this.currentPlayer === 2 && (row === 0 || row === 1));

        if (!isValidSpawn || this.board[row][col]) {
            this.updateActionText(translations[preferredLanguage]['invalid_spawn_position']);
            return;
        }

        // Spend mana
        const player = this.players[this.currentPlayer];
        const cost = this.selectedCard.cost;

        if (player.mana < cost) {
            this.updateActionText(translations[preferredLanguage]['insufficient_mana']);
            return;
        }

        player.mana -= cost;
        player.mana = Math.max(player.mana, 0);

        // Get unit type and place it on the board
        const unitType = this.selectedCard.type;

        // Place the unit with justSpawned flag
        this.placeUnit(unitType, this.currentPlayer, row, col);
        // Handle special spawn effects
        if (unitType === 'titan') {
            this.triggerTitanSpawnEffect(row, col);
        } else if (unitType === 'naiad') {
            this.drawCards(this.currentPlayer, 1);
            this.updateActionText(translations[preferredLanguage]['naiad_invocation_text']);
        }

        // Clear selection and update UI
        this.deselectCard();
        this.updateGameUI();
        this.updateActionText(`${UNITS[unitType].name} ${translations[preferredLanguage]['summoned']}`);

        // End turn after placing unit
        this.endTurn();
    }

    moveUnit(newRow, newCol, id = null, selectedAction = null) {
        if (!this.selectedUnit && !id) return;

        let unit;
        if (id) {
            unit = this.findUnitByUUID(id);
            if (!unit) {
                console.error("Unit with ID", id, "not found!");
                return;
            }
        } else {
            unit = this.selectedUnit.unit;
        }

        const {
            row,
            col
        } = this.getUnitPosition(unit);
        const unitProperties = unit;
        this.validMoves = this.getValidMoves(row, col);
        if (!this.isValidMove(newRow, newCol)) return;

        // Clear the previous position in the game board state
        this.board[row][col] = null;

        // Update the unit's position in the game board state
        this.board[newRow][newCol] = unitProperties;

        // Update the unit's hasMoved status
        unitProperties.hasMoved = true;

        // Update the game state
        this.updateUnitPosition(unitProperties.player, row, col, newRow, newCol);

        // Update UI - Animate the unit movement
        this.animateUnitMovement(unit, row, col, newRow, newCol);

        if (this.selectedAction === 'dash') {
            this.players[this.currentPlayer].mana--;
            this.players[this.currentPlayer].mana = Math.max(this.players[this.currentPlayer].mana, 0);
        }

        // Deselect the unit
        this.deselectUnit();
        return {
            moveType: this.selectedAction
        };
    }

    animateUnitMovement(unit, oldRow, oldCol, newRow, newCol) {
        const unitElement = document.querySelector(`.board-cell[data-row="${oldRow}"][data-col="${oldCol}"] .unit`);
        const newCell = document.querySelector(`.board-cell[data-row="${newRow}"][data-col="${newCol}"]`);

        if (!unitElement || !newCell) {
            console.error("Unit element or new cell not found for animation");
            this.refreshBoardDisplay(); // Fallback: Refresh the board to ensure the unit is in the correct place
            return;
        }

        // Temporarily remove the unit from the old cell
        unitElement.remove();

        // Add the unit to the new cell immediately
        newCell.appendChild(unitElement);

        // Optionally, add a class to trigger a CSS transition
        unitElement.classList.add('unit-move-animation');

        // After the animation, remove the class
        unitElement.addEventListener('animationend', () => {
            unitElement.classList.remove('unit-move-animation');
            this.refreshBoardDisplay();
        }, {
            once: true
        });
    }

    attackUnit(targetRow, targetCol, id = null) {
        if (!this.selectedUnit && !id) return;

        let unit;
        if (id) {
            unit = this.findUnitByUUID(id);
            if (!unit) {
                console.error("Unit with ID", id, "not found!");
                return;
            }
        } else {
            unit = this.selectedUnit.unit;
        }
        // console.log("Atteck unit", unit);
        const {
            row,
            col
        } = {
            row: targetRow,
            col: targetCol
        };
        const targetUnit = this.board[targetRow][targetCol];

        if (!targetUnit) return;

        // Spend mana for attack
        this.players[this.currentPlayer].mana--;
        this.players[this.currentPlayer].mana = Math.max(this.players[this.currentPlayer].mana, 0);

        // Handle special attack types
        if (UNITS[unit.type].attack === 'explosion') {
            this.performExplosiveAttack(row, col);
        } else {
            // Regular attack - reduce target health
            targetUnit.health--;

            // Check if unit is destroyed
            if (targetUnit.health <= 0) {
                this.destroyUnit(targetRow, targetCol);
            } else {
                // Update health indicator
                this.updateUnitHealthDisplay(targetRow, targetCol);
            }
        }

        // Mark unit as attacked
        unit.hasAttacked = true;

        // Deselect and update UI
        this.deselectUnit();
        this.updateGameUI();
        this.updateActionText(`Attaque effectuée`);

        // End turn automatically after attacking
        if (!p2pConnection || !p2pConnection?.gameId) {
            this.endTurn();
        }
        if (p2pConnection && p2pConnection.isHost) this.endTurn();
    }

    useAbility(targetRow, targetCol) {
        if (!this.selectedUnit) return;

        const {
            row,
            col,
            unit
        } = this.selectedUnit;
        const targetUnit = this.board[targetRow][targetCol];

        // Spend mana for ability
        this.players[this.currentPlayer].mana--;
        this.players[this.currentPlayer].mana = Math.max(this.players[this.currentPlayer].mana, 0);

        // Handle different abilities
        switch (UNITS[unit.type].ability) {
            case 'pull': // Centaur's pull ability
                this.pullUnitTowards(targetRow, targetCol, row, col);
                break;

            case 'swap': // Shapeshifter's swap ability
                this.swapUnits(row, col, targetRow, targetCol);
                break;
        }

        // Mark ability as used
        unit.usedAbility = true;

        // Deselect and update UI
        this.deselectUnit();
        this.updateGameUI();
        this.updateActionText(`${translations[preferredLanguage]['ability_used']}`);

        // End turn automatically after using ability
        setTimeout(() => this.checkAutoEndTurn(), 500);
    }

    // Add this new method to check if the turn should automatically end
    checkAutoEndTurn() {
        // If game is over, don't auto-end turn
        if (this.gameOver) return;

        // First check if the player has any units that can still act
        const player = this.players[this.currentPlayer];
        let canStillAct = false;

        // If we have a moved unit this turn, check if it can still attack or use ability
        if (this.movedUnitThisTurn) {
            const movedUnitInfo = player.units.find(info => info.unit === this.movedUnitThisTurn);
            if (movedUnitInfo) {
                const unit = movedUnitInfo.unit;
                const canAttack = !unit.hasAttacked && UNITS[unit.type].attack !== 'none' && player.mana >= 1;
                const hasAbility = UNITS[unit.type].ability && !unit.usedAbility && player.mana >= 1;

                if (UNITS[unit.type].ability) {
                    canStillAct = canAttack || hasAbility;
                } else {
                    canStillAct = canAttack;
                }
            }
        } else {
            // No unit moved yet, check if any unit can move
            canStillAct = player.units.some(unitInfo => {
                const unit = unitInfo.unit;
                return !unit.hasMoved && !unit.justSpawned && UNITS[unit.type].movement !== 'none';
            });
        }

        // Also check if player has enough mana to play any cards
        const hasPlayableCards = player.hand.some(card => {
            return UNITS[card].cost <= player.mana;
        });

        // If no more actions are possible, end the turn
        if (!canStillAct && !hasPlayableCards) {
            this.updateActionText(translations[preferredLanguage]['no_actions_possible']);

            // Use bind to ensure 'this' refers to the Game instance
            setTimeout(this.endTurn.bind(this), 1000);
        }
    }

    destroyUnit(row, col) {
        //console.log(row, col, this.board, this.board[row])
        const unit = this.board[row][col];
        if (!unit) return;

        // Handle special effects on death
        if (unit.type === 'naiad') {
            this.drawCards(unit.player, 1);
        }

        // Remove unit from board
        this.board[row][col] = null;

        // Remove unit element from cell
        const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            const unitElement = cell.querySelector('.unit');
            if (unitElement) {
                cell.removeChild(unitElement);
            }
        }

        // Remove from player units list
        const playerIndex = unit.player;
        const playerUnits = this.players[playerIndex].units;
        const unitIndex = playerUnits.findIndex(u => u.row === row && u.col === col);

        if (unitIndex !== -1) {
            playerUnits.splice(unitIndex, 1);
        }

        // Check if it's an Oracle (game over condition)
        if (unit.type === 'oracle') {
            const winner = unit.player === 1 ? 2 : 1;
            this.endGame(winner);
        }

    }

    endTurn() {
        this.stopTurnTimer();
        // Reset unit flags for the current player
        this.players[this.currentPlayer].units.forEach(unitInfo => {
            const unit = unitInfo.unit;
            unit.hasMoved = false;
            unit.hasAttacked = false;
            unit.usedAbility = false;
            unit.justSpawned = false;
            unit.hasDashed = false; // ADDED: Reset hasDashed flag
        });

        // Reset moved unit tracker
        this.movedUnitThisTurn = null;

        if (p2pConnection?.gameId) {
            if (this.currentPlayer === 1 && !p2pConnection.isHost) {
                songManager.playSong("yourTurn")
                // this.endTurn();
            } else if (this.currentPlayer === 2 && p2pConnection.isHost) {
                songManager.playSong("yourTurn")
                // this.endTurn();
            }
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

        // Increment turn if Player 1 is next
        if (this.currentPlayer === 1) {
            this.turn++;
        }

        // Update mana for new player
        const player = this.players[this.currentPlayer];
        player.maxMana = Math.min(MAX_MANA, this.turn);
        player.mana = Math.max(0, Math.min(player.mana + 1, player.maxMana));

        // Add extra mana from Seer units
        const seerCount = player.units.filter(u => u.unit.type === 'seer').length;
        player.mana += seerCount;

        // Draw card for new player
        this.drawCards(this.currentPlayer, 1);

        // Deselect any selection
        this.deselectAll();

        // Update UI
        this.updateGameUI();
        this.updateActionText(`${translations[preferredLanguage]['turn_player']} ${this.currentPlayer}`);

        // Update turn indicator
        document.getElementById('turn-indicator').textContent = `${translations[preferredLanguage]['turn']} ${this.turn} - ${translations[preferredLanguage]['player']} ${this.currentPlayer}`;
        this.highlightCurrentPlayer();
        if (this.timerMode && !this.gameOver) {
            if(this.players[2].units.find(u=>u.unit.type=="oracle")) {
                // check both of oracles are present before starting timer
                this.startTurnTimer();
                console.log("oracle2 is present, starting timer")
            }
        }
    }

    resetGame() {
        songManager.stopSong("menu_next")
        songManager.stopSong("victory")
        songManager.stopSong("defeat")

        songManager.playSong("announcer:allPick", true)
        songManager.playSong("firstRound", true)
        songManager.setVolume("firstRound",0.2)
        // songManager.transitionSong("victory","firstRound", true)

        // Reinitialize the game
        this.initializeGame();

        // Clear the board UI
        document.querySelectorAll('.board-cell').forEach(cell => {
            const unitElement = cell.querySelector('.unit');
            if (unitElement) {
                cell.removeChild(unitElement);
            }
        });

        // Clear card containers
        document.getElementById('player-one-hand').innerHTML = '';
        document.getElementById('player-two-hand').innerHTML = '';

        // Update UI
        this.updateGameUI();
        this.updateActionText(translations[preferredLanguage]['new_game_started']);
        if (this.timerMode) {
            this.startTurnTimer();
        }
    }

    endGame(winner) {
        this.stopTurnTimer();
        this.gameOver = true;
        this.updateActionText(`${translations[preferredLanguage]['player_wins'].replace('{player}', winner)}`);
        document.getElementById('turn-indicator').textContent = `${translations[preferredLanguage]['player']} ${winner} ${translations[preferredLanguage]['wins']}!`;
        document.getElementById('turn-indicator').style.backgroundColor = winner === 1 ? 'var(--highlight-color)' : 'var(--primary-color)';

        // Remove any existing victory overlay
        const existingOverlay = document.querySelector('.victory-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create victory overlay
        const gameBoard = document.getElementById('game-board');
        const victoryOverlay = document.createElement('div');
        victoryOverlay.className = 'victory-overlay';

        // Style the overlay
        Object.assign(victoryOverlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: '1000'
        });

        // Create the victory message box
        const victoryMessage = document.createElement('div');
        victoryMessage.className = 'victory-message';

        // Set color based on winner
        const winnerColor = winner === 1 ? 'var(--highlight-color)' : 'var(--primary-color)';

        // Style the message box
        Object.assign(victoryMessage.style, {
            backgroundColor: winnerColor,
            color: 'white',
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            maxWidth: '80%'
        });

        let subliminalText = translations[preferredLanguage]['game_over'];
        let subliminalText2 = translations[preferredLanguage]['opponent_oracle_destroyed'];
        if (p2pConnection.gameId && winner === 1 && p2pConnection.isHost) {
            subliminalText = translations[preferredLanguage]['victory'];
            subliminalText2 = translations[preferredLanguage]['opponent_oracle_destroyed'];
            songManager.transitionSong("menu_next", "victory", true)
        } else if (p2pConnection.gameId && winner === 2 && !p2pConnection.isHost) {
            subliminalText = translations[preferredLanguage]['victory'];
            subliminalText2 = translations[preferredLanguage]['opponent_oracle_destroyed'];
            songManager.transitionSong("menu_next", "victory", true)
        } else if (p2pConnection.gameId && winner === 2 && p2pConnection.isHost) {
            subliminalText = translations[preferredLanguage]['defeat'];
            subliminalText2 = translations[preferredLanguage]['your_oracle_destroyed'];
            songManager.transitionSong("menu_next", "defeat", true)
        } else if (p2pConnection.gameId && winner === 1 && !p2pConnection.isHost) {
            subliminalText = translations[preferredLanguage]['defeat'];
            subliminalText2 = translations[preferredLanguage]['your_oracle_destroyed'];
            songManager.transitionSong("menu_next", "defeat", true)
        } else if (!p2pConnection.gameId) {
            songManager.transitionSong("menu_next", "victory", true)
        }

        // Set the message content
        victoryMessage.innerHTML = `
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${subliminalText}</h1>
            <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">${translations[preferredLanguage]['player']} ${winner} ${translations[preferredLanguage]['wins']}</p>
            <p style="font-size: 1.2rem;">${subliminalText2}</p>
            <button id="new-game-btn" style="margin-top: 1.5rem; padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; background-color: white; border: none; border-radius: 5px; font-weight: bold;">${translations[preferredLanguage]['new-game']}</button>
        `;

        // Add message to overlay and overlay to board
        victoryOverlay.appendChild(victoryMessage);

        // Ensure proper positioning
        if (window.getComputedStyle(gameBoard).position === 'static') {
            gameBoard.style.position = 'relative';
        }

        gameBoard.appendChild(victoryOverlay);

        // Add event listener for new game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.resetGame();
            victoryOverlay.remove();
        });
    }

    // Helper methods for specific abilities and attacks

    pullUnitTowards(fromRow, fromCol, toRow, toCol) {
        const unit = this.board[fromRow][fromCol];
        if (!unit) return;

        // Calculate direction to pull
        const rowDir = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
        const colDir = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);

        // Calculate new position (one square closer)
        const newRow = fromRow + rowDir;
        const newCol = fromCol + colDir;

        // Make sure the new position is valid and empty
        if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
            // Move the unit
            this.board[newRow][newCol] = unit;
            this.board[fromRow][fromCol] = null;

            // Update UI representation
            const fromCell = document.querySelector(`.board-cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const toCell = document.querySelector(`.board-cell[data-row="${newRow}"][data-col="${newCol}"]`);

            if (fromCell && toCell) {
                const unitElement = fromCell.querySelector('.unit');
                fromCell.removeChild(unitElement);
                toCell.appendChild(unitElement);
            }

            // Update unit position in player's units list
            const playerIndex = unit.player;
            const playerUnits = this.players[playerIndex].units;
            const unitInfo = playerUnits.find(u => u.row === fromRow && u.col === fromCol);

            if (unitInfo) {
                unitInfo.row = newRow;
                unitInfo.col = newCol;
            }
        }
    }

    swapUnits(row1, col1, row2, col2) {
        const unit1 = this.board[row1][col1];
        const unit2 = this.board[row2][col2];

        if (!unit1 || !unit2) return;

        // Swap units on board
        this.board[row1][col1] = unit2;
        this.board[row2][col2] = unit1;

        // Update UI representation
        const cell1 = document.querySelector(`.board-cell[data-row="${row1}"][data-col="${col1}"]`);
        const cell2 = document.querySelector(`.board-cell[data-row="${row2}"][data-col="${col2}"]`);

        if (cell1 && cell2) {
            const unitElement1 = cell1.querySelector('.unit');
            const unitElement2 = cell2.querySelector('.unit');

            cell1.removeChild(unitElement1);
            cell2.removeChild(unitElement2);

            cell1.appendChild(unitElement2);
            cell2.appendChild(unitElement1);
        }

        // Update unit positions in players' units lists
        this.updateUnitPosition(unit1.player, row1, col1, row2, col2);
        this.updateUnitPosition(unit2.player, row2, col2, row1, col1);
    }

    updateUnitPosition(playerIndex, oldRow, oldCol, newRow, newCol) {
        // console.log("updateUnitPosition", playerIndex, oldRow, oldCol, newRow, newCol);
        const playerUnits = this.players[playerIndex].units;
        const unitInfo = playerUnits.find(u => u.row === oldRow && u.col === oldCol);

        if (unitInfo) {
            unitInfo.row = newRow;
            unitInfo.col = newCol;
        }
    }

    performExplosiveAttack(row, col) {
        //console.log("Performing explosive attack at", row,col)
        // Apply explosive attack to all surrounding squares
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue; // Skip attacker's position

                const targetRow = row + r;
                const targetCol = col + c;
                //console.log("targetRow",targetRow, "targetCol", targetCol)

                if (this.isValidPosition(targetRow, targetCol) && this.board[targetRow][targetCol]) {
                    const targetUnit = this.board[targetRow][targetCol];

                    // Reduce target health
                    targetUnit.health--;

                    // Check if unit is destroyed
                    if (targetUnit.health <= 0) {
                        this.destroyUnit(targetRow, targetCol);
                    } else {
                        this.updateUnitHealthDisplay(targetRow, targetCol);
                    }
                }
            }
        }

        // Harpy self-destructs after explosive attack
        this.destroyUnit(row, col);
    }

    triggerTitanSpawnEffect(row, col) {
        // Apply damage to all surrounding squares
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue; // Skip Titan's position

                const targetRow = row + r;
                const targetCol = col + c;

                if (this.isValidPosition(targetRow, targetCol) && this.board[targetRow][targetCol]) {
                    this.destroyUnit(targetRow, targetCol);
                }
            }
        }

        this.updateActionText(translations[preferredLanguage]['titan_spawn_effect']);
    }

    // UI update methods

    updateGameUI() {
        // Update mana displays
        document.getElementById('player-one-mana').textContent = `${this.players[1].mana}/${this.players[1].maxMana}`;
        document.getElementById('player-two-mana').textContent = `${this.players[2].mana}/${this.players[2].maxMana}`;

        // Update player hands
        this.updateHandDisplay(1);
        this.updateHandDisplay(2);

        // Enable/disable end turn buttons
        document.getElementById('end-turn-one').disabled = this.currentPlayer !== 1 || this.gameOver;
        document.getElementById('end-turn-two').disabled = this.currentPlayer !== 2 || this.gameOver;
        this.highlightCurrentPlayer();
    }

    highlightCurrentPlayer() {
        const playerOneHeader = document.querySelector('.player-area.player-one .player-info h3');
        const playerTwoHeader = document.querySelector('.player-area.player-two .player-info h3');

        if (this.currentPlayer === 1) {
            playerOneHeader.classList.add('current-turn');
            playerTwoHeader.classList.remove('current-turn');
        } else {
            playerTwoHeader.classList.add('current-turn');
            playerOneHeader.classList.remove('current-turn');
        }
    }

    updateTimerDisplay() {
        // You'll need an element in your HTML to display the timer
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${this.timerSeconds}`;
        }
    }

    updateHandDisplay(playerIndex) {
        const handContainer = document.getElementById(`player-${playerIndex === 1 ? 'one' : 'two'}-hand`);
        handContainer.innerHTML = '';

        const player = this.players[playerIndex] || Object.values(this.players).find(p => p.uuid === playerIndex);
        // console.log(this.players,player)
        const hand = player.hand.includes("oracle") ? player.hand.filter(unitType => unitType === "oracle") : player.hand;
        hand.forEach(unitType => {
            const unitData = UNITS[unitType];

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.type = unitType;
            card.dataset.cost = unitData.cost;

            const cardImage = document.createElement('div');
            cardImage.className = 'card-image';
            cardImage.style.backgroundImage = `url('/assets/pions/${unitType}.svg')`;

            const cardDetails = document.createElement('div');
            cardDetails.className = 'card-details';

            const cardName = document.createElement('div');
            cardName.className = 'card-name';
            cardName.textContent = unitData.name;

            const cardCost = document.createElement('div');
            cardCost.className = 'card-cost';
            cardCost.textContent = `${unitData.cost} Mana`;

            const cardDescription = document.createElement('div');
            cardDescription.className = 'card-description';
            // cardDescription.textContent = unitData.description;

            cardDetails.appendChild(cardName);
            cardDetails.appendChild(cardCost);
            cardDetails.appendChild(cardDescription);

            card.appendChild(cardImage);
            card.appendChild(cardDetails);

            handContainer.appendChild(card);

            // Add hover functionality for each card
            let hoverTimer = null;
            let hoverDelay = 750;
            
            card.addEventListener('mouseover', (e) => {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                    this.showUnitCardPreview(unitType, e.clientX, e.clientY);
                }, hoverDelay);
            });
            
            card.addEventListener('mouseout', () => {
                clearTimeout(hoverTimer);
                this.hideUnitCardPreview();
            });
        });

        // If hand is empty, show message
        if (player.hand.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-hand-message';
            emptyMessage.textContent = translations[preferredLanguage]['empty_hand'];
            handContainer.appendChild(emptyMessage);
        }
    }

    updateUnitInfoPanel(unit) {
        const unitInfo = document.querySelector('#unit-info .unit-details');
        if (!unit) {
            unitInfo.textContent = translations[preferredLanguage]['select_unit_info'];
            return;
        }

        const unitData = UNITS[unit.type];

        let infoHTML = `
            <div class="unit-info-name">${unitData.name} (${translations[preferredLanguage]["player"]} ${unit.player})</div>
            <div class="unit-info-health">${translations[preferredLanguage]['health']}: ${unit.health}/${unitData.health}</div>
            <div class="unit-info-desc">${unitData.description}</div>
            <div class="unit-status">`;

        if (unit.justSpawned) {
            infoHTML += `<span class="status-tag">${translations[preferredLanguage]['just_spawned']}</span>`;
        }
        if (unit.hasMoved) {
            infoHTML += `<span class="status-tag">${translations[preferredLanguage]['has_moved']}</span>`;
        }
        if (unit.hasAttacked) {
            infoHTML += `<span class="status-tag">${translations[preferredLanguage]['has_attacked']}</span>`;
        }
        if (unit.usedAbility) {
            infoHTML += `<span class="status-tag">${translations[preferredLanguage]['ability_used']}</span>`;
        }

        infoHTML += `</div>`;

        unitInfo.innerHTML = infoHTML;
    }

    updateUnitHealthDisplay(row, col) {
        const unit = this.board[row][col];
        if (!unit) return;

        const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        const unitElement = cell.querySelector('.unit');
        if (!unitElement) return;

        // Update or add health indicator if health > 1
        let healthIndicator = unitElement.querySelector('.health-indicator');

        if (unit.health > 1) {
            if (!healthIndicator) {
                healthIndicator = document.createElement('div');
                healthIndicator.className = 'health-indicator';
                unitElement.appendChild(healthIndicator);
            }
            healthIndicator.textContent = unit.health;
        } else if (healthIndicator) {
            unitElement.removeChild(healthIndicator);
        }
    }

    updateActionText(message) {
        document.getElementById(`player-${this.currentPlayer === 1 ? 'one' : 'two'}-action`).textContent = message;
    }

    updateActionOptions(unit, canMove, canAttack, hasAbility, canDash) {
        let actionText = '';

        if (unit.justSpawned) {
            actionText = `${UNITS[unit.type].name} ${translations[preferredLanguage]['cant_act_this_turn']}.`;
        } else if (this.movedUnitThisTurn && this.movedUnitThisTurn !== unit) {
            actionText = `${translations[preferredLanguage]['act_with_moved_unit']}`;
        } else {
            const actions = [];
            if (canMove) actions.push(translations[preferredLanguage]['move']);
            if (canDash) actions.push(translations[preferredLanguage]['dash']);
            if (canAttack) actions.push(translations[preferredLanguage]['attack']);
            if (hasAbility) actions.push(translations[preferredLanguage]['use_ability']);

            if (actions.length > 0) {
                actionText = `${UNITS[unit.type].name} ${translations[preferredLanguage]['can']} ` + actions.join(" " + translations[preferredLanguage]['or'] + " ") + '.';
            } else { 
                actionText = `${UNITS[unit.type].name} ${translations[preferredLanguage]['has_acted_this_turn']}.`;
            }
        }

        this.updateActionText(actionText);
    }

    hasPlacedOracle(player) {
        return this.players[player].units.some(unitInfo => unitInfo.unit.type === 'oracle');
    }

    getValidDash(row, col) {
        const unit = this.board[row][col];
        if (!unit) return [];

        const movementType = UNITS[unit.type].movement;
        const validMoves = [];

        // Define movement patterns based on unit type
        switch (movementType) {
            case 'king': // 8 surrounding squares, one square at a time
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position

                        const newRow = row + r;
                        const newCol = col + c;

                        if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                            validMoves.push({
                                row: newRow,
                                col: newCol
                            });
                        }
                    }
                }
                break;
            case 'king1': // Same as king but only 1 square in all directions
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (r === 0 && c === 0) continue; // Skip current position

                        const newRow = row + r;
                        const newCol = col + c;

                        if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                            validMoves.push({
                                row: newRow,
                                col: newCol
                            });
                        }
                    }
                }
                break;

            case 'forward3': // Forward one square at a time
                const direction = unit.player === 1 ? -1 : 1; // Player 1 moves up, Player 2 moves down
                const newRow = row + direction;

                if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
                    validMoves.push({
                        row: newRow,
                        col
                    });
                }
                break;

            case 'lateral': // Horizontal and vertical movement, one square at a time
                // Check up
                if (row - 1 >= 0 && !this.board[row - 1][col]) {
                    validMoves.push({
                        row: row - 1,
                        col
                    });
                }

                // Check down
                if (row + 1 < BOARD_ROWS && !this.board[row + 1][col]) {
                    validMoves.push({
                        row: row + 1,
                        col
                    });
                }

                // Check left
                if (col - 1 >= 0 && !this.board[row][col - 1]) {
                    validMoves.push({
                        row,
                        col: col - 1
                    });
                }

                // Check right
                if (col + 1 < BOARD_COLS && !this.board[row][col + 1]) {
                    validMoves.push({
                        row,
                        col: col + 1
                    });
                }
                break;

            case 'diagonal': // Diagonal movement, one square at a time
                // Check top-left
                if (row - 1 >= 0 && col - 1 >= 0 && !this.board[row - 1][col - 1]) {
                    validMoves.push({
                        row: row - 1,
                        col: col - 1
                    });
                }

                // Check top-right
                if (row - 1 >= 0 && col + 1 < BOARD_COLS && !this.board[row - 1][col + 1]) {
                    validMoves.push({
                        row: row - 1,
                        col: col + 1
                    });
                }

                // Check bottom-left
                if (row + 1 < BOARD_ROWS && col - 1 >= 0 && !this.board[row + 1][col - 1]) {
                    validMoves.push({
                        row: row + 1,
                        col: col - 1
                    });
                }

                // Check bottom-right
                if (row + 1 < BOARD_ROWS && col + 1 < BOARD_COLS && !this.board[row + 1][col + 1]) {
                    validMoves.push({
                        row: row + 1,
                        col: col + 1
                    });
                }
                break;

            case 'hop2': // Griffin's 2-square hop
                const hopDirections = [{
                        r: -2,
                        c: 0
                    }, // Up 2
                    {
                        r: 2,
                        c: 0
                    }, // Down 2
                    {
                        r: 0,
                        c: -2
                    }, // Left 2
                    {
                        r: 0,
                        c: 2
                    } // Right 2
                ];

                hopDirections.forEach(dir => {
                    const newRow = row + dir.r;
                    const newCol = col + dir.c;

                    if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                        validMoves.push({
                            row: newRow,
                            col: newCol
                        });
                    }
                });
                break;

            case 'knight': // Chess knight L-shape
                const knightMoves = [{
                        r: -2,
                        c: -1
                    }, {
                        r: -2,
                        c: 1
                    },
                    {
                        r: -1,
                        c: -2
                    }, {
                        r: -1,
                        c: 2
                    },
                    {
                        r: 1,
                        c: -2
                    }, {
                        r: 1,
                        c: 2
                    },
                    {
                        r: 2,
                        c: -1
                    }, {
                        r: 2,
                        c: 1
                    }
                ];

                knightMoves.forEach(move => {
                    const newRow = row + move.r;
                    const newCol = col + move.c;

                    if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                        validMoves.push({
                            row: newRow,
                            col: newCol
                        });
                    }
                });
                break;

            case 'none': // Unit cannot move
                break;
        }

        // Special case for Phoenix - can only move to dark tiles
        if (unit.type === 'phoenix') {
            return validMoves.filter(move => (move.row + move.col) % 2 === 1);
        }

        return validMoves;
    }

    updateFromState(gameState) {
        if (!gameState) return;

        this.currentPlayer = gameState.currentPlayer;
        this.turn = gameState.turn;
        this.gameOver = gameState.gameOver;

        // console.log(gameState);

        // Update the board with a deep copy
        this.board = gameState.board.map(row => {
            return row.map(cell => {
                return cell ? {
                    ...cell
                } : null; // Copy the cell object
            });
        });

        // Refresh the board visually
        this.refreshBoardDisplay();
    }

    refreshBoardDisplay() {
        // console.log('refreshBoardDisplay');
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;

        // Clear the board
        boardElement.innerHTML = '';

        // console.log("Game board passing throug refresh display:", this.board)
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');

                // Add dark/light alternating pattern
                if ((row + col) % 2 === 1) {
                    cell.classList.add('dark');
                }

                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                
                boardElement.appendChild(cell);

                const unit = this.board[row][col];
                if (unit) {
                    this.createUnitElement(unit, row, col, unit.justSpawned); // ADD THIS LINE
                }
            }
        }
    }

    createUnitElement(unit, row, col, animated = false) {
        const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        let unitElement = cell.querySelector('.unit');

        if (!unitElement) {
            // Create new unit element only if it doesn't exist
            unitElement = document.createElement('div');
            unitElement.className = `unit player-${unit.player}`;
            unitElement.dataset.type = unit.type;
            unitElement.style.backgroundImage = `url('/assets/pions/${unit.type}.svg')`;

            // Add colored border based on player
            if (unit.player === 1) {
                unitElement.style.borderRadius = '6px';
                unitElement.style.boxShadow = '0 0 5px #1e88e5'; // Blue glow
            } else {
                unitElement.style.borderRadius = '6px';
                unitElement.style.boxShadow = '0 0 5px #e53935'; // Red glow
            }

            cell.appendChild(unitElement);
        } else {
            // Update existing unit element's class and style
            unitElement.className = `unit player-${unit.player}`;
            unitElement.dataset.type = unit.type;
            unitElement.style.backgroundImage = `url('/assets/pions/${unit.type}.svg')`;

            // Update colored border based on player
            if (unit.player === 1) {
                unitElement.style.borderRadius = '6px';
                unitElement.style.boxShadow = '0 0 5px #1e88e5'; // Blue glow
            } else {
                unitElement.style.borderRadius = '6px';
                unitElement.style.boxShadow = '0 0 5px #e53935'; // Red glow
            }
        }

        // Add health indicator if health > 1
        let healthIndicator = unitElement.querySelector('.health-indicator');
        if (unit.health > 1) {
            if (!healthIndicator) {
                healthIndicator = document.createElement('div');
                healthIndicator.className = 'health-indicator';
                unitElement.appendChild(healthIndicator);
            }
            healthIndicator.textContent = unit.health;
        } else if (healthIndicator) {
            healthIndicator.remove();
        }

        if (animated) {
            unitElement.classList.add('unit-spawn-animation');
            unitElement.addEventListener('animationend', () => {
                unitElement.classList.remove('unit-spawn-animation');
            }, {
                once: true
            });
        }
    }

    setTurnAndPlayer(turn, player) {
        this.turn = turn;
        this.currentPlayer = player;

        // Update UI
        this.updateGameUI();
        this.updateActionText(`${translations[preferredLanguage]['turn_player']} ${this.currentPlayer}`);

        // Update turn indicator
        document.getElementById('turn-indicator').textContent = `${translations[preferredLanguage]['turn']} ${this.turn} - ${translations[preferredLanguage]['player']} ${this.currentPlayer}`;
    }

    findUnitByUUID(uuid) {
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const unit = this.board[row][col];
                if (unit && unit.uuid === uuid) {
                    return unit;
                }
            }
        }
        return null; // Or throw an error if you prefer
    }

    getUnitPosition(unit) {
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                // console.log(this.board[row][col], unit.uuid)
                if (this.board[row][col]?.uuid === unit.uuid) {
                    return {
                        row,
                        col
                    };
                }
            }
        }
        return null; // Or throw an error if you prefer
    }

    // Add this code to your Game class in game.js
    setupCardPreviewSystem() {
        // Variables to track hover state
        const hoverDelay = 750; // 2 seconds
        const hoverTimers = new Map(); // Map to store timers for different elements
        
        // Use a single document-level event listener for efficiency
        // document.addEventListener('mouseover', (e) => {
        //     // Check if we're hovering over a unit on the board
        //     const unitElement = e.target.closest('.unit');
        //     if (unitElement) {
        //         const unitType = unitElement.dataset.type;
        //         if (unitType) {
        //             // Clear any existing timer for this element
        //             const elementId = unitElement.dataset.uuid || `unit-${unitType}-${Date.now()}`;
        //             if (hoverTimers.has(elementId)) {
        //                 clearTimeout(hoverTimers.get(elementId));
        //             }
                    
        //             // Set new timer
        //             const timer = setTimeout(() => {
        //                 this.showUnitCardPreview(unitType, e.clientX, e.clientY);
        //             }, hoverDelay);
                    
        //             hoverTimers.set(elementId, timer);
        //         }
        //         return;
        //     }
            
        //     // Check if we're hovering over a card in a player's hand
        //     const cardElement = e.target.closest('.card');
        //     if (cardElement) {
        //         const unitType = cardElement.dataset.type;
        //         if (unitType) {
        //             // Clear any existing timer for this element
        //             const elementId = cardElement.dataset.uuid || `card-${unitType}-${Date.now()}`;
        //             if (hoverTimers.has(elementId)) {
        //                 clearTimeout(hoverTimers.get(elementId));
        //             }
                    
        //             // Set new timer
        //             const timer = setTimeout(() => {
        //                 this.showUnitCardPreview(unitType, e.clientX, e.clientY);
        //             }, hoverDelay);
                    
        //             hoverTimers.set(elementId, timer);
        //         }
        //     }
        // });
        
        // Clear timers when mouse leaves elements
        // document.addEventListener('mouseout', (e) => {
        //     const unitElement = e.target.closest('.unit');
        //     const cardElement = e.target.closest('.card');
            
        //     if (unitElement) {
        //         const elementId = unitElement.dataset.uuid || `unit-${unitElement.dataset.type}-${Date.now()}`;
        //         if (hoverTimers.has(elementId)) {
        //             clearTimeout(hoverTimers.get(elementId));
        //             hoverTimers.delete(elementId);
        //         }
                
        //         // Only hide preview if we're not moving to another unit or card
        //         const relatedTarget = e.relatedTarget;
        //         if (!relatedTarget || (!relatedTarget.closest('.unit') && !relatedTarget.closest('.card'))) {
        //             this.hideUnitCardPreview();
        //         }
        //     }
            
        //     if (cardElement) {
        //         const elementId = cardElement.dataset.uuid || `card-${cardElement.dataset.type}-${Date.now()}`;
        //         if (hoverTimers.has(elementId)) {
        //             clearTimeout(hoverTimers.get(elementId));
        //             hoverTimers.delete(elementId);
        //         }
                
        //         // Only hide preview if we're not moving to another unit or card
        //         const relatedTarget = e.relatedTarget;
        //         if (!relatedTarget || (!relatedTarget.closest('.unit') && !relatedTarget.closest('.card'))) {
        //             this.hideUnitCardPreview();
        //         }
        //     }
        // });
    }

    showUnitCardPreview(unitType, x, y) {
        const unitData = UNITS[unitType];
        if (!unitData) return;
    
        // Remove any existing preview
        this.hideUnitCardPreview();
        
        // Create card preview container
        const preview = document.createElement('div');
        preview.id = 'unit-card-preview';
        preview.className = 'unit-card';
        
        // Get translated movement and attack types
        const movementText = translations[preferredLanguage][`${unitData.movement}_movement`] || unitData.movement;
        const attackText = translations[preferredLanguage][`${unitData.attack}_attack`] || unitData.attack;
        let abilityText = '';
        
        if (unitData.ability) {
            abilityText = translations[preferredLanguage][`${unitData.ability}_ability`] || unitData.ability;
        }
        
        // Add card content
        preview.innerHTML = `
            <div class="unit-image">
                <img src="/assets/pions/${unitType}.svg" alt="${unitData.name}">
            </div>
            <h3>${unitData.name}</h3>
            <div class="unit-stats">
                <p><strong>${translations[preferredLanguage]['health']}:</strong> ${unitData.health}</p>
                ${unitData.ability ? `<p><strong>${translations[preferredLanguage]['ability'] || "Capacité"}:</strong> ${abilityText}</p>` : ''}
            </div>
            <p class="unit-desc">${unitData.description}</p>
        `;
        
        // Add styling
        Object.assign(preview.style, {
            backgroundColor: 'var(--background-light)',
            color: 'var(--text-color)',
            padding: '1.5rem',
            border: 'var(--border-ornate)',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            maxWidth: '300px',
            width: '280px',
            textAlign: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            position: 'fixed',
            zIndex: '1000', 
            // top: y +'5',
            // left: 5 + '5',
            pointerEvents: 'none'
        });
        
        // Add to document
        document.body.appendChild(preview);
        
        // Position the preview to avoid being cut off by viewport edges
        const rect = preview.getBoundingClientRect();
        
        // Check left edge
        if (x - rect.width / 2 < 0) {
            preview.style.left = '10px'; // Stick to the left edge with a small margin
        } else if (x + rect.width / 2 > window.innerWidth) {
            preview.style.left = `${window.innerWidth - rect.width - 10}px`; // Stick to the right edge with a small margin
        } else {
            preview.style.left = `${x - rect.width / 2}px`; // Center the preview
        }

        // Check top edge
        if (y - rect.height / 2 < 0) {
            preview.style.top = '10px'; // Stick to the top edge with a small margin
        } else if (y + rect.height > window.innerHeight) {
            preview.style.top = `${window.innerHeight - rect.height - 10}px`; // Stick to the bottom edge with a small margin
        } else {
            preview.style.top = `${y - rect.height / 2}px`; // Center the preview vertically
        }
        
        // Fade in effect
        requestAnimationFrame(() => {
            preview.style.opacity = '1';
        });
    }

    hideUnitCardPreview() {
        const existingPreview = document.getElementById('unit-card-preview');
        if (existingPreview) {
            existingPreview.style.opacity = '0';
            setTimeout(() => {
                if (existingPreview.parentNode) {
                    existingPreview.parentNode.removeChild(existingPreview);
                }
            }, 300);
        }
    }

    triggerTimerEndEffect() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 0, 0, 0.3);
            pointer-events: none;
            z-index: 1001;
            opacity: 1; /* Start with full opacity */
            transition: opacity 1s ease; /* Adjust duration as needed */
        `;
        document.body.appendChild(overlay);

        // Trigger the fade-out effect after a short delay
        setTimeout(() => {
            overlay.style.opacity = '0'; /* Fade to 0 opacity */
        }, 100); // Small delay before fade-out

        // Remove the overlay after the transition completes
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 1100); // Transition duration + initial delay
    }
}