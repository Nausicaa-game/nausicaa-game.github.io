function addchatMessage(player, messageText, sendEvent = true) {
    console.log("Adding chat message", player, messageText);
    if (messageText.trim() !== '') {
        const messageElement = document.createElement('span');
        messageElement.textContent = "Joueur " + player + ": " + messageText;
        $(messageElement).profanityFilter({
            customSwears: window.swears
        });
        messageElement.style.color = "black";
        messageElement.style.textTransform = "none";
        chatMessages.prepend(messageElement);
        if (sendEvent)
            p2pConnection.sendMessage({
                type: 'action',
                action: {
                    name: "sendMessage",
                    player: player,
                    message: messageText,
                }
            });

        // Scroll to the bottom to show the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Chat functionality
const chatContainer = document.getElementById('chat-container');
const chatToggle = document.getElementById('chat-toggle');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatNotificationBadge = document.getElementById('chat-notification-badge');

chatToggle.addEventListener('click', function() {
    chatContainer.classList.toggle('hidden');
    // Clear notification when chat is opened
    chatNotificationBadge.style.display = 'none';
    if (!chatContainer.classList.contains('hidden')) {
        chatInput.focus(); // Set focus to the chat input when chat is opened
    }
});

chatSend.addEventListener('click', () => {
    if (p2pConnection?.gameId) {
        let player = p2pConnection.isHost ? 1 : 2;
        addchatMessage(player, chatInput.value);
        chatInput.value = '';
        chatInput.focus(); // Set focus to the chat input after sending
    }
});

chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        chatSend.click();
        event.preventDefault(); // Prevents the addition of a new line in the input field
    }
});

// New function to handle incoming chat messages
function handleIncomingMessage(player, messageText) {
    addchatMessage(player, messageText, false); // Add message to chat

    // Check if chat is closed
    if (chatContainer.classList.contains('hidden') || !document.hasFocus()) {
        // Play sound
        songManager.playSong('notification', true); // Replace 'notification' with your sound key
        // Show notification badge
        chatNotificationBadge.style.display = 'inline-block';
    }
}

// On focus, if chat opened, hide notification badge
window.addEventListener('focus', function() {
    if (!chatContainer.classList.contains('hidden')) {
        chatNotificationBadge.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Create the game board (10x8)
    const gameBoard = document.getElementById('game-board');

    for (let row = 0; row < 8; row++) {
        for (let col = 1; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Add checkerboard pattern
            if ((row + col) % 2 === 1) {
                cell.classList.add('dark');
            }

            // Add spawn zone indicators
            if (row < 2) {
                cell.classList.add('player-two-spawn');
            } else if (row >= 6) {
                cell.classList.add('player-one-spawn');
            }

            gameBoard.appendChild(cell);

            // Add event listeners for hover effect
            cell.addEventListener('mouseenter', handleCellMouseOver);
            cell.addEventListener('mouseleave', handleCellMouseOut);

            // Add event listeners to the cell itself to handle unit hovering
            cell.addEventListener('mouseover', handleCellMouseOver);
            cell.addEventListener('mouseout', handleCellMouseOut);
        }
    }

    // Toggle rules panel
    const rulesToggle = document.getElementById('rules-toggle');
    const rulesPanel = document.getElementById('rules-panel');
    const closeRules = document.getElementById('close-rules');

    rulesToggle.addEventListener('click', function() {
        rulesPanel.style.display = 'flex';
    });

    closeRules.addEventListener('click', function() {
        rulesPanel.style.display = 'none';
    });

    // IMPORTANT: Remove the example card and unit creation from hereom here
    // This will now be handled by the game.js scriptript
});

let backgroundThemePlaying = false;
// document.addEventListener('click', function() {
// document.querySelector(".overlay").style.display = 'none';
function startGameTheme() {
    if (!backgroundThemePlaying) {
        if(!window.demoMode)
            songManager.playSong('firstRound');
        songManager.setVolume("firstRound",0.3)
        songManager.playSong('announcer:allPick');
        backgroundThemePlaying = true;
    }
    document.querySelector(".timer").style.display = 'none';
    document.querySelector(".cpu-mode").style.display = 'none';
    if(game.cpuMode) game.cpuPlayer.enableCPU();
}

document.querySelector('.game-container').addEventListener('click', function() {
    if (!chatContainer.classList.contains('hidden')) {
        chatToggle.click();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.overlay');
    if (qs.animation) {
        overlay.style.animation = 'overlayAnimation 1.5s forwards';
        history.pushState({}, '', '/app');
    } else
        overlay.style.display = 'none';

    const header = document.querySelector('.game-header');
    const headerToggleButton = document.getElementById('header-toggle-button');
  
    headerToggleButton.addEventListener('click', () => {
      header.classList.toggle('retracted');
    });

    // Check if the header is initially retracted and click the toggle button
    // This is to ensure the header is retracted on page load if it was retracted previously
    header.addEventListener('click', (event) => {  
      if(event.target === headerToggleButton) return;
      if (header.classList.contains('retracted')) {
        header.classList.remove('retracted');
      }
    });

    const timerModeCheckbox = document.getElementById('timerMode');
    timerModeCheckbox.addEventListener('change', function() {
        console.log("Enabling timer mode:",this.checked);
        game.setTimerMode(this.checked);
    });
    const cpuModeCheckbox = document.getElementById('cpuMode');
    cpuModeCheckbox.addEventListener('change', function() {
        console.log("Enabling CPU mode:",this.checked);
        game.setCpuMode(this.checked);
    });
  });

let game = null;
let p2pConnection = null;


function queryStringToJSON(qs) {
    qs = qs || location.search.slice(1);

    var pairs = qs.split('&');
    var result = {};
    pairs.forEach(function(p) {
        var pair = p.split('=');
        var key = pair[0];
        var value = decodeURIComponent(pair[1] || '');

        if (result[key]) {
            if (Object.prototype.toString.call(result[key]) === '[object Array]') {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    });

    return JSON.parse(JSON.stringify(result));
};
const qs = queryStringToJSON();
let socketServer = null;

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    p2pConnection = new P2PGameConnection(game);
    p2pConnection.interceptGameActions();
});

function handleCellMouseOver(event, targetElement=null) {
    const cell = targetElement || event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if((!row && row !== 0) || (!col && col !== 0)) return;

    // Assuming you have a method in your Game class to get the unit at a specific location
    const unit = game.board[row][col];
    if(unit){
        game.updateUnitInfoPanel(unit);
        if(unit.player === game.currentPlayer) {
            // Assuming you have methods in your Game class to calculate valid moves and attacks
            const validMoves = game.getValidMoves(row, col);
            const validAttacks = game.getValidAttacks(row, col)
            // Highlight valid moves
            validMoves.forEach(move => {
                const moveCell = document.querySelector(`.board-cell[data-row="${move.row}"][data-col="${move.col}"]`);
                if (moveCell && !game.selectedUnit) {
                    moveCell.classList.add('valid-move');
                }
            });

            // Highlight valid attacks
            validAttacks.forEach(attack => {
                const attackCell = document.querySelector(`.board-cell[data-row="${attack.row}"][data-col="${attack.col}"]`);
                if (attackCell && !game.selectedUnit) {
                    attackCell.classList.add('valid-attack');
                }
            });
        }
    } else {
        document.querySelector('#unit-info .unit-details').textContent = translations[preferredLanguage]['select_unit'];
    }
}

function handleCellMouseOut(event) {
    // Remove highlighting from all cells
    const cells = document.querySelectorAll('.board-cell');
    cells.forEach(cell => {
        cell.classList.remove('valid-move', 'valid-attack');
    });
}

async function getSwears(language) {
    const response = await fetch("/js/swearList/"+language+".json");
    const data = await response.json();
    console.log("Swear list "+language+" loaded");
    // console.log(data);
    return data;
}

async function loadAllSwearsList() {
    let swears = [];
    swearsEn = await getSwears("en");
    swearsFr = await getSwears("fr")
    swearsDe = await getSwears("de")
    swearsEs = await getSwears("es")
    swearsIt = await getSwears("it")
    swearsPt = await getSwears("pt")
    swearsRu = await getSwears("ru")
    swears = [...swearsEn, ...swearsFr, ...swearsDe, ...swearsEs, ...swearsIt, ...swearsPt, ...swearsRu];
    window.swears = swears;
    return swears;
}

loadAllSwearsList();

window.firstGame = true;