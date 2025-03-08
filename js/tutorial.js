document.addEventListener('DOMContentLoaded', () => {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const tutorialBox = document.getElementById('tutorial-box');
    const tutorialContent = document.getElementById('tutorial-content');
    const tutorialTitle = document.getElementById('tutorial-title');
    const tutorialText = document.getElementById('tutorial-text');
    const tutorialNextButton = document.getElementById('tutorial-next');
    const tutorialCloseButton = document.getElementById('tutorial-close');
    const gameBoard = document.getElementById('game-board');
    const playerOneHand = document.getElementById('player-one-hand');
    const playerTwoHand = document.getElementById('player-two-hand');
    const unitInfo = document.getElementById('unit-info');
    const endTurnOneButton = document.getElementById('end-turn-one');
    const endTurnTwoButton = document.getElementById('end-turn-two');
    const scoreDisplay = document.getElementById('score-display');
    // startGameTheme();

    let step = 0;
    const tutorialSteps = {
        'fr': [
            {
                title: 'Bienvenue dans Nausicaa !',
                text: 'Ce didacticiel vous guidera à travers les bases du jeu.',
                highlight: null,
            },
            {
                title: 'Votre Main',
                text: 'Ici, vous voyez les cartes dans votre main. Chaque carte représente une unité que vous pouvez invoquer sur le plateau.',
                highlight: playerOneHand,
            },
            {
                title: 'Le Plateau de Jeu',
                text: 'Ceci est le plateau de jeu. Vous pouvez placer vos unités dans votre zone de déploiement (les deux rangées du bas).',
                highlight: gameBoard,
            },
            {
                title: 'Information sur l\'unité',
                text: 'Cliquez sur une unité sur le plateau pour voir ses détails ici.',
                highlight: unitInfo,
            },
            {
                title: 'Mana',
                text: 'Le mana est nécessaire pour invoquer des unités et effectuer des actions. Il augmente de 1 à chaque tour, jusqu\'à un maximum de 6.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
            {
                title: 'Terminer le tour',
                text: 'Pour passer votre tour, cliquez sur ce bouton.',
                highlight: endTurnOneButton,
            },
             {
                title: 'Score',
                text: 'Le score est affiché ici. Il augmente lorsque vous détruisez des unités ennemies.',
                highlight: scoreDisplay,
            },
            {
                title: 'Terminer le tour',
                text: 'Pour passer votre tour, cliquez sur ce bouton.',
                highlight: endTurnOneButton,
            },
            {
                title: 'Objectif',
                text: 'L\'objectif du jeu est d\'éliminer l\'Oracle adverse. Bonne chance !',
                highlight: null,
            },
        ],
        'en': [
            {
                title: 'Welcome to Nausicaa!',
                text: 'This tutorial will guide you through the basics of the game.',
                highlight: null,
            },
            {
                title: 'Your Hand',
                text: 'Here you see the cards in your hand. Each card represents a unit you can summon onto the board.',
                highlight: playerOneHand,
            },
            {
                title: 'The Game Board',
                text: 'This is the game board. You can place your units in your deployment zone (the bottom two rows).',
                highlight: gameBoard,
            },
            {
                title: 'Unit Information',
                text: 'Click on a unit on the board to see its details here.',
                highlight: unitInfo,
            },
            {
                title: 'Mana',
                text: 'Mana is needed to summon units and perform actions. It increases by 1 each turn, up to a maximum of 6.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
            {
                title: 'Score',
                text: 'The score is displayed here. It increases when you destroy enemy units.',
                highlight: scoreDisplay,
            },
            {
                title: 'End Turn',
                text: 'To end your turn, click this button.',
                highlight: endTurnOneButton,
            },
            {
                title: 'Opponent\'s Turn',
                text: 'During your opponent\'s turn, you will have to wait.',
                highlight: endTurnTwoButton,
            },
            {
                title: 'Objective',
                text: 'The objective of the game is to eliminate the opposing Oracle. Good luck!',
                highlight: null,
            },
        ],
        'de': [
            {
                title: 'Willkommen bei Nausicaa!',
                text: 'Dieses Tutorial führt dich durch die Grundlagen des Spiels.',
                highlight: null,
            },
            {
                title: 'Deine Hand',
                text: 'Hier siehst du die Karten in deiner Hand. Jede Karte repräsentiert eine Einheit, die du auf das Spielbrett beschwören kannst.',
                highlight: playerOneHand,
            },
            {
                title: 'Das Spielbrett',
                text: 'Dies ist das Spielbrett. Du kannst deine Einheiten in deiner Aufstellungszone platzieren (die unteren beiden Reihen).',
                highlight: gameBoard,
            },
            {
                title: 'Einheiteninformationen',
                text: 'Klicke auf eine Einheit auf dem Spielbrett, um ihre Details hier anzuzeigen.',
                highlight: unitInfo,
            },
            {
                title: 'Mana',
                text: 'Mana wird benötigt, um Einheiten zu beschwören und Aktionen durchzuführen. Es steigt jede Runde um 1, bis zu einem Maximum von 6.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: 'Punktzahl',
                text: 'Die Punktzahl wird hier angezeigt. Sie erhöht sich, wenn du feindliche Einheiten zerstörst.',
                highlight: scoreDisplay,
            },
            {
                title: 'Zug beenden',
                text: 'Um deinen Zug zu beenden, klicke auf diese Schaltfläche.',
                highlight: endTurnOneButton,
            },
            {
                title: 'Gegnerischer Zug',
                text: 'Während des Zuges deines Gegners musst du warten.',
                highlight: endTurnTwoButton,
            },
            {
                title: 'Ziel',
                text: 'Das Ziel des Spiels ist es, das gegnerische Orakel zu eliminieren. Viel Glück!',
                highlight: null,
            },
        ],
        'es': [
            {
                title: '¡Bienvenido a Nausicaa!',
                text: 'Este tutorial te guiará a través de los conceptos básicos del juego.',
                highlight: null,
            },
            {
                title: 'Tu Mano',
                text: 'Aquí ves las cartas en tu mano. Cada carta representa una unidad que puedes invocar en el tablero.',
                highlight: playerOneHand,
            },
            {
                title: 'El Tablero de Juego',
                text: 'Este es el tablero de juego. Puedes colocar tus unidades en tu zona de despliegue (las dos filas inferiores).',
                highlight: gameBoard,
            },
            {
                title: 'Información de la Unidad',
                text: 'Haz clic en una unidad en el tablero para ver sus detalles aquí.',
                highlight: unitInfo,
            },
            {
                title: 'Maná',
                text: 'Se necesita maná para invocar unidades y realizar acciones. Aumenta en 1 cada turno, hasta un máximo de 6.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: 'Puntuación',
                text: 'La puntuación se muestra aquí. Aumenta cuando destruyes unidades enemigas.',
                highlight: scoreDisplay,
            },
            {
                title: 'Terminar Turno',
                text: 'Para terminar tu turno, haz clic en este botón.',
                highlight: endTurnOneButton,
            },
            {
                title: 'Turno del Oponente',
                text: 'Durante el turno de tu oponente, tendrás que esperar.',
                highlight: endTurnTwoButton,
            },
            {
                title: 'Objetivo',
                text: 'El objetivo del juego es eliminar al Oráculo contrario. ¡Buena suerte!',
                highlight: null,
            },
        ],
        'it': [
            {
                title: 'Benvenuto a Nausicaa!',
                text: 'Questo tutorial ti guiderà attraverso le basi del gioco.',
                highlight: null,
            },
            {
                title: 'La Tua Mano',
                text: 'Qui vedi le carte nella tua mano. Ogni carta rappresenta un\'unità che puoi evocare sul tabellone.',
                highlight: playerOneHand,
            },
            {
                title: 'Il Tabellone di Gioco',
                text: 'Questo è il tabellone di gioco. Puoi posizionare le tue unità nella tua zona di schieramento (le due file inferiori).',
                highlight: gameBoard,
            },
            {
                title: 'Informazioni sull\'Unità',
                text: 'Clicca su un\'unità sul tabellone per vedere i suoi dettagli qui.',
                highlight: unitInfo,
            },
            {
                title: 'Mana',
                text: 'Il mana è necessario per evocare unità ed eseguire azioni. Aumenta di 1 ogni turno, fino a un massimo di 6.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: 'Punteggio',
                text: 'Il punteggio viene visualizzato qui. Aumenta quando distruggi le unità nemiche.',
                highlight: scoreDisplay,
            },
            {
                title: 'Fine Turno',
                text: 'Per terminare il tuo turno, clicca su questo pulsante.',
                highlight: endTurnOneButton,
            },
            {
                title: 'Turno dell\'Avversario',
                text: 'Durante il turno del tuo avversario, dovrai aspettare.',
                highlight: endTurnTwoButton,
            },
            {
                title: 'Obiettivo',
                text: 'L\'obiettivo del gioco è eliminare l\'Oracolo avversario. Buona fortuna!',
                highlight: null,
            },
        ],
        'ja': [
            {
                title: 'ナウシカへようこそ！',
                text: 'このチュートリアルでは、ゲームの基本を説明します。',
                highlight: null,
            },
            {
                title: 'あなたの手札',
                text: 'ここでは、あなたの手札にあるカードを見ることができます。各カードは、ボードに召喚できるユニットを表しています。',
                highlight: playerOneHand,
            },
            {
                title: 'ゲームボード',
                text: 'これがゲームボードです。ユニットを配置ゾーン（下の2列）に配置できます。',
                highlight: gameBoard,
            },
            {
                title: 'ユニット情報',
                text: 'ボード上のユニットをクリックすると、詳細がここに表示されます。',
                highlight: unitInfo,
            },
            {
                title: 'マナ',
                text: 'マナは、ユニットを召喚したり、アクションを実行したりするために必要です。ターンごとに1ずつ増加し、最大6まで増加します。',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: 'スコア',
                text: 'スコアはここに表示されます。敵ユニットを破壊すると増加します。',
                highlight: scoreDisplay,
            },
            {
                title: 'ターン終了',
                text: 'ターンを終了するには、このボタンをクリックします。',
                highlight: endTurnOneButton,
            },
            {
                title: '対戦相手のターン',
                text: '対戦相手のターン中は、待つ必要があります。',
                highlight: endTurnTwoButton,
            },
            {
                title: '目標',
                text: 'ゲームの目標は、相手のオラクルを排除することです。頑張ってください！',
                highlight: null,
            },
        ],
        'zh': [
            {
                title: '欢迎来到娜乌西卡！',
                text: '本教程将引导您了解游戏的基础知识。',
                highlight: null,
            },
            {
                title: '你的手牌',
                text: '在这里，您可以看到手中的卡牌。每张卡牌代表一个您可以召唤到棋盘上的单位。',
                highlight: playerOneHand,
            },
            {
                title: '游戏棋盘',
                text: '这是游戏棋盘。您可以将您的单位放置在您的部署区域（底部两行）。',
                highlight: gameBoard,
            },
            {
                title: '单位信息',
                text: '单击棋盘上的单位以在此处查看其详细信息。',
                highlight: unitInfo,
            },
            {
                title: '法力',
                text: '召唤单位和执行动作需要法力。它每回合增加 1，最多增加到 6。',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: '分数',
                text: '分数显示在这里。当您摧毁敌方单位时，它会增加。',
                highlight: scoreDisplay,
            },
            {
                title: '结束回合',
                text: '要结束您的回合，请单击此按钮。',
                highlight: endTurnOneButton,
            },
            {
                title: '对手的回合',
                text: '在对手的回合中，您将需要等待。',
                highlight: endTurnTwoButton,
            },
            {
                title: '目标',
                text: '游戏的目标是消灭对方的预言者。祝你好运！',
                highlight: null,
            },
        ],
        'ar': [
            {
                title: 'مرحبا بكم في ناوسيكا!',
                text: 'سوف يرشدك هذا البرنامج التعليمي خلال أساسيات اللعبة.',
                highlight: null,
            },
            {
                title: 'يدك',
                text: 'هنا ترى البطاقات في يدك. تمثل كل بطاقة وحدة يمكنك استدعاؤها على اللوحة.',
                highlight: playerOneHand,
            },
            {
                title: 'لوحة اللعبة',
                text: 'هذه هي لوحة اللعبة. يمكنك وضع وحداتك في منطقة الانتشار الخاصة بك (الصفين السفليين).',
                highlight: gameBoard,
            },
            {
                title: 'معلومات الوحدة',
                text: 'انقر فوق وحدة على اللوحة لرؤية تفاصيلها هنا.',
                highlight: unitInfo,
            },
            {
                title: 'مانا',
                text: 'هناك حاجة إلى مانا لاستدعاء الوحدات وتنفيذ الإجراءات. يزيد بمقدار 1 في كل دور ، حتى 6 كحد أقصى.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: 'أحرز هدفا',
                text: 'يتم عرض النتيجة هنا. يزيد عندما تدمر وحدات العدو.',
                highlight: scoreDisplay,
            },
            {
                title: 'إنهاء الدور',
                text: 'لإنهاء دورك ، انقر فوق هذا الزر.',
                highlight: endTurnOneButton,
            },
            {
                title: 'دور الخصم',
                text: 'خلال دور خصمك ، سيكون عليك الانتظار.',
                highlight: endTurnTwoButton,
            },
            {
                title: 'هدف',
                text: 'الهدف من اللعبة هو القضاء على أوراكل المعارض. حظا سعيدا!',
                highlight: null,
            },
        ],
        'ru': [
            {
                title: 'Добро пожаловать в Навсикаю!',
                text: 'Этот учебник проведет вас по основам игры.',
                highlight: null,
            },
            {
                title: 'Ваша рука',
                text: 'Здесь вы видите карты в своей руке. Каждая карта представляет собой юнит, которого вы можете призвать на доску.',
                highlight: playerOneHand,
            },
            {
                title: 'Игровая доска',
                text: 'Это игровая доска. Вы можете размещать свои юниты в своей зоне развертывания (два нижних ряда).',
                highlight: gameBoard,
            },
            {
                title: 'Информация о юните',
                text: 'Щелкните юнит на доске, чтобы увидеть его детали здесь.',
                highlight: unitInfo,
            },
            {
                title: 'Мана',
                text: 'Мана необходима для вызова юнитов и выполнения действий. Она увеличивается на 1 каждый ход, до максимума 6.',
                highlight: document.querySelector('.player-one .mana-container'),
            },
             {
                title: 'Счет',
                text: 'Счет отображается здесь. Он увеличивается, когда вы уничтожаете вражеские юниты.',
                highlight: scoreDisplay,
            },
            {
                title: 'Конец хода',
                text: 'Чтобы закончить свой ход, нажмите эту кнопку.',
                highlight: endTurnOneButton,
            },
            {
                title: 'Ход противника',
                text: 'Во время хода вашего противника вам придется подождать.',
                highlight: endTurnTwoButton,
            },
            {
                title: 'Цель',
                text: 'Цель игры - уничтожить вражеского Оракула. Удачи!',
                highlight: null,
            },
        ]
    };

    function showTutorialStep(stepIndex) {
        const step = tutorialSteps[preferredLanguage][stepIndex];
        tutorialTitle.textContent = step.title;
        tutorialText.textContent = step.text;

        // Reset highlights
        gameBoard.classList.remove('tutorial-highlight');
        playerOneHand.classList.remove('tutorial-highlight');
        playerTwoHand.classList.remove('tutorial-highlight');
        unitInfo.classList.remove('tutorial-highlight');
        endTurnOneButton.classList.remove('tutorial-highlight');
        endTurnTwoButton.classList.remove('tutorial-highlight');
        scoreDisplay.classList.remove('tutorial-highlight');
        document.querySelectorAll('.player-one .mana-container').forEach(el => el.classList.remove('tutorial-highlight'));

        if (step.highlight) {
            step.highlight.classList.add('tutorial-highlight');
        }

        tutorialOverlay.style.display = 'flex';
    }

    tutorialNextButton.addEventListener('click', () => {
        step++;
        if (step < tutorialSteps[preferredLanguage].length) {
            showTutorialStep(step);
        } else {
            closeTutorial();
        }
    });

    tutorialCloseButton.addEventListener('click', () => {
        closeTutorial();
    });

    function closeTutorial() {
        tutorialOverlay.style.display = 'none';
        tutorialBox.style.display = 'none';
        // Remove all highlights
        gameBoard.classList.remove('tutorial-highlight');
        playerOneHand.classList.remove('tutorial-highlight');
        playerTwoHand.classList.remove('tutorial-highlight');
        unitInfo.classList.remove('tutorial-highlight');
        endTurnOneButton.classList.remove('tutorial-highlight');
        endTurnTwoButton.classList.remove('tutorial-highlight');
        scoreDisplay.classList.remove('tutorial-highlight');
        document.querySelectorAll('.player-one .mana-container').forEach(el => el.classList.remove('tutorial-highlight'));

        history.pushState({}, null, '/app');
    }

    // Start the tutorial automatically
    showTutorialStep(step);
    game.cpuMode = true;
});