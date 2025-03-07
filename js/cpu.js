/**
    Ce module gère l'intelligence artificielle pour les adversaires contrôlés par ordinateur dans le jeu.
    Il implémente une logique de prise de décision pour les joueurs CPU, y compris la sélection de cartes, le jeu stratégique,
    et les niveaux de difficulté. Le CPU analyse l'état du jeu et prend des décisions basées sur
    des heuristiques et/ou des règles programmées.

    Prenons la denière théorie abordée dans le CPU Concept
    Voilà l'idée.
    
    Chacun des pions sur le plateau aura un coefficient d'attractivité, comme une sorte de chose qui pousserait l'IA a se dire il serait préférable de bouffer ce pion là plutot que celui ci.
    En fonction de la distance qui sépare nos pions le coefficient d'attractivité va être lui même divisé par la distance qui sépare un pion adverse d'un de nos pions.
    De là on peut calculer un coefficient d'attaque. C'est à dire prioriser les attaques sur tel ou tel pion.
    Ce coefficient, c'est celui d'attractivité divisé par la distance.
    
    Si aucune attaque n'est possible, on priorisera le coefficient de distance. Et si plusieurs pions ont la meme distance, on priorisera le coefficient d'attractivité.
    Ca donnera une IA aggressive. Plus qu'a trouver le bon équilibrage et les hyperparamètres.

    Les hyper paramètres ici ce seront les priorités des coefficients
    
    Préférera t'on s'approcher des pions, ou préférera t'on attaquer le plus puissant
    
    Et comme PacMan, on va pouvoir changer tout les 4 tours de type en changeant ces hyper paramètres.  
    Ca donnera pas une IA prédictible
*/

let COEFFICIENTS_IMPORTANCE = {
    "distance": 5,
    "attractiveness": 5
};

// les units sont décrits dans game. en fonction de leur dangerosité estimé, donner un coefficient qui se rapprochera entre 0 et 1 de la dangerosité d'un pion
const UNITS_ATTRACTIVENESS = {
    "oracle": 10, // Très important à protéger/attaquer
    "gobelin": 20, // Unité de base, peu menaçante individuellement
    "harpy": 50, // Peut faire des dégâts de zone, potentiellement dangereuse
    "naiad": 30, // Support, mais pioche des cartes, peut accélérer le jeu adverse
    "griffin": 60, // Mobilité et pioche, potentiellement embêtant
    "siren": 70, // Attaque en diagonale, peut surprendre
    "centaur": 60, // Peut attirer des unités, contrôle potentiel
    "archer": 70, // Attaque à distance, harcèlement
    "phoenix": 80, // Très puissant sur les cases sombres
    "shapeshifter": 90, // Peut échanger de place, très situationnel et dangereux
    "seer": 70, // Génère du mana, doit être éliminé rapidement
    "titan": 95 // Dévastateur, priorité absolue
};

class CPUPlayer {
    /**
     * Crée un nouveau joueur CPU pour le jeu donné.
     *
     * @param {Game} game Le jeu auquel le joueur CPU appartient.
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Calcule la distance euclidienne (à vol d'oiseau) entre deux points sur une grille.
     *
     * Cette fonction prend les coordonnées de deux points (x1, y1) et (x2, y2) et calcule la distance euclidienne
     * entre eux. La distance euclidienne est la longueur du segment de ligne entre les deux points.
     *
     * @param {number} x1 La coordonnée x du premier point.
     * @param {number} y1 La coordonnée y du premier point.
     * @param {number} x2 La coordonnée x du second point.
     * @param {number} y2 La coordonnée y du second point.
     * @returns {number} La distance euclidienne entre les deux points.
     *
     * Exemple :
     * calculateEuclideanDistance(0, 0, 3, 4) retourne 5 (car sqrt((0-3)^2 + (0-4)^2) = sqrt(9 + 16) = sqrt(25) = 5)
     */
    calculateEuclideanDistance(x1, y1, x2, y2) {
        // Calcule la différence au carré entre les coordonnées x.
        const deltaX = Math.pow(x1 - x2, 2);

        // Calcule la différence au carré entre les coordonnées y.
        const deltaY = Math.pow(y1 - y2, 2);

        // La distance euclidienne est la racine carrée de la somme de ces différences au carré.
        return Math.sqrt(deltaX + deltaY) * COEFFICIENTS_IMPORTANCE["distance"];
    }

    /**
     * Calcule le coefficient d'attaque entre deux points sur une grille.
     *
     * Cette fonction prend les coordonnées de deux points (x1, y1) et (x2, y2) et calcule le coefficient d'attaque
     * entre eux. Le coefficient d'attaque est une valeur qui représente la priorité d'attaquer un point par rapport à un autre.
     * Plus le coefficient est élevé, plus le point est prioritaire.
     * Le coefficient d'attaque est calculé en divisant le coefficient d'attractivité du point attaqué par la distance euclidienne
     * entre les deux points.
     * Si la distance est nulle, la fonction retourne Infinity pour éviter une division par zéro.
     *
     */  
    calculateAttackCoefficient(x1, y1, x2, y2) {
        // Calcule la distance euclidienne entre les deux points.
        const distance = calculateEuclideanDistance(x1, y1, x2, y2);

        // Si la distance est nulle, retourne Infinity pour éviter une division par zéro.
        if (distance === 0) {
            return Infinity;
        }

        // Calcule le coefficient d'attaque en divisant le coefficient d'attractivité par la distance.
        return (UNITS_ATTRACTIVENESS[game.board[y2][x2].unit.type] * COEFFICIENTS_IMPORTANCE["attractiveness"]) / distance;
    }

    /**
     * Calcule le coefficient de priorité d'une unité par rapport à une autre.
     * 
     * Cette fonction prend deux unités, une unité bot et une unité cible, et calcule le coefficient de priorité
     * de l'unité bot par rapport à l'unité cible. Le coefficient de priorité est une valeur qui représente la priorité
     */
    calculateUnitPriority(botUnit, targetUnit) {
        const botX = botUnit.x;
        const botY = botUnit.y;

        const targetX = targetUnit.x;
        const targetY = targetUnit.y;

        return calculateAttackCoefficient(botX, botY, targetX, targetY);
    }

    /** 
     * Itère sur le plateau de jeu et exécute une fonction de rappel pour chaque unité du joueur 1.
     */
    iterateBoard(botUnit) {
        const board = this.game.board;
        const unitsCoefficients = {};
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                let unit = board[y][x].unit;
                if (unit && unit.player === 1) {
                    unitsCoefficients[unit.id] = calculateUnitPriority(botUnit, unit);
                }
            }
        }
        return unitsCoefficients;
    }

    /* 
    * Retourne l'unité la plus prioritaire à attaquer pour une unité donnée.
    */
    getBestUnitToAttack(botUnit) {
        const unitsCoefficients = iterateBoard(botUnit);
        const bestUnit = Object.keys(unitsCoefficients).reduce((a, b) => unitsCoefficients[a] > unitsCoefficients[b] ? a : b);
        return {unit: bestUnit, coefficient: unitsCoefficients[bestUnit]};
    }

    /**
     * Retourne les meilleures actions pour chaque unité du joueur 2.
     */
    getBestMove() {
        const bestMoves = {};
        this.game.players[2].units.forEach((unitElement) => {
            const unit = {...unitElement.unit, x: unitElement.x, y: unitElement.y};
            bestMoves[unit.id] = getBestUnitToAttack(unit);
        });
        return bestMoves;
    }

    /**
     * A implémenter
     * WORK IN PROGRESS:
     * - Fonction de prise de décision pour le joueur CPU a chaque tour.
     * - Régulation des coefficients d'importance pour les heuristiques.
     * - Implémentation de la logique de jeu pour le CPU.
     * - Calculer par distance euclidienne le meilleure mouvement valide ou attaque valide possible. 
     *   Attaque prioritaire au mouvement:
     *    - Si il existe une attaque possible, attaquer.
     *    - Si il n'existe pas d'attaque possible, se déplacer au plus proche de la cible en checkant quel est le validMove le plus proche.
     */
}