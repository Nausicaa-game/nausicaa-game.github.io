# CPU Concept for Card Game

This document explores different algorithms for implementing a CPU player in our card game. We'll consider approaches like minimax, state machines, and potentially other AI techniques.

## Algorithms

### 1. Minimax

*   **Description:** A classic decision-making algorithm used in two-player games. It explores the game tree, trying to maximize the CPU's score while minimizing the opponent's score.  The algorithm recursively explores possible moves, alternating between maximizing the CPU's advantage and minimizing the opponent's.  The depth of the search can be limited to balance computation time and decision quality.
*   **Pros:**
    *   Guaranteed to find the optimal move (given enough time and memory).
    *   Well-understood and widely used.
*   **Cons:**
    *   Can be computationally expensive, especially for games with large branching factors.
    *   Requires a good evaluation function to estimate the value of game states.  This function needs to accurately reflect the relative strength of different board positions.
*   **Implementation Notes:**
    *   Alpha-beta pruning can be used to reduce the search space. This optimization technique eliminates branches of the search tree that are guaranteed to be worse than the best already found.
    *   Iterative deepening can be used to improve the quality of the move over time. Start with a shallow search and gradually increase the depth until a time limit is reached.

### 2. State Machines

*   **Description:** Define a set of states that the CPU can be in (e.g., "Attacking", "Defending", "Building"). Transitions between states are triggered by game events or conditions. Each state dictates the CPU's behavior, such as card selection and target prioritization.
*   **Pros:**
    *   Relatively simple to implement.
    *   Can create believable and strategic behavior.  By carefully designing the states and transitions, you can create a CPU opponent with a distinct personality and play style.
*   **Cons:**
    *   May not be as optimal as minimax.  The CPU's decisions are based on predefined rules rather than a comprehensive search of the game tree.
    *   Requires careful design of states and transitions.  Poorly designed states can lead to predictable or ineffective behavior.
*   **Implementation Notes:**
    *   Consider using a hierarchical state machine for more complex behavior. This allows you to organize states into a tree-like structure, with higher-level states controlling the overall strategy and lower-level states handling specific actions.
    *   Use probabilities to make the CPU's behavior less predictable.  Introduce randomness into the state transitions or action selection to make the CPU more challenging to play against.

### 3. Other Approaches

*   **Monte Carlo Tree Search (MCTS):** A more advanced algorithm that uses random simulations to estimate the value of game states. Good for games with large branching factors where minimax is too slow. MCTS iteratively builds a search tree by repeatedly selecting nodes, expanding them with random simulations, and updating their values based on the simulation results.
*   **Reinforcement Learning:** Train the CPU to play the game by rewarding it for good moves and punishing it for bad moves. Requires a lot of training data and careful tuning of the reward function. The CPU learns to play the game through trial and error, gradually improving its strategy over time.

### 3.1 Monte Carlo Tree Search (MCTS) Details

*   **Node Structure:** Each node in the MCTS tree represents a game state and stores:
    *   `wins`: Number of times this node has led to a win for the CPU.
    *   `visits`: Number of times this node has been visited during simulations.
    *   `children`: A list of child nodes, representing possible actions from this state.
*   **Algorithm Steps:**
    1.  **Selection:** Traverse the tree from the root node (current game state) to a leaf node using a selection policy (e.g., UCT - Upper Confidence Bound applied to Trees).  The UCT formula balances exploration (trying less visited nodes) and exploitation (choosing nodes that have led to good results).
    2.  **Expansion:** If the leaf node is not a terminal node (end of the game), expand it by creating child nodes for all possible actions from that state.
    3.  **Simulation:** From the newly created child node (or the selected leaf node if no expansion is needed), perform a random playout (simulation) until the end of the game.
    4.  **Backpropagation:** Update the `wins` and `visits` values of all nodes along the path from the leaf node back to the root node, based on the outcome of the simulation.
*   **Evaluation Function (for Simulations):**
    *   The simulation step requires a way to evaluate the game state at the end of the random playout. This can be a simple heuristic function that estimates the value of the state for the CPU.
    *   **Examples of Evaluation Criteria:**
        *   **Card Advantage:** Count the number of cards each player has.
        *   **Board Control:** Evaluate the strength of the CPU's units on the board compared to the opponent's.
        *   **Health Remaining:** Consider the remaining health of each player.
        *   **Resource Advantage:** Compare the amount of resources (e.g., mana) each player has.
    *   The evaluation function should return a score that represents the value of the game state for the CPU (e.g., 1 for a win, 0 for a loss, and a value between 0 and 1 for intermediate states).
*   **Pros:**
    *   Handles games with large branching factors better than minimax.
    *   Does not require a perfect evaluation function, as it learns through simulations.
*   **Cons:**
    *   Can be computationally expensive, especially for complex games.
    *   Performance depends on the quality of the simulation policy and evaluation function.
*   **Implementation Notes:**
    *   Experiment with different selection policies (e.g., UCT with different exploration parameters).
    *   Optimize the simulation step to improve performance.
    *   Consider using domain knowledge to guide the simulations and improve the accuracy of the evaluation.


## Training the AI and Web Libraries

### Training the AI

Training a card game AI, especially with techniques like Reinforcement Learning, involves these key steps:

1.  **Define the Environment:** This is your card game. You need a way to simulate the game, including all the rules, cards, and possible actions.

2.  **Choose a Reinforcement Learning Algorithm:** Common choices include:

    *   **Q-Learning:**  A classic algorithm that learns a Q-function, which estimates the value of taking a specific action in a specific state.
    *   **Deep Q-Network (DQN):**  Uses a neural network to approximate the Q-function, allowing it to handle more complex game states.
    *   **Policy Gradients (e.g., REINFORCE, PPO, A2C):** Directly learns a policy that maps states to actions.  Often more stable than Q-learning for complex environments.

3.  **Design the Reward Function:** This is crucial. The reward function tells the AI what is good and bad. Examples:

    *   Winning the game: +1
    *   Losing the game: -1
    *   Dealing damage to the opponent: +0.1
    *   Having a strong board presence: +0.05
    *   Playing an invalid move: -0.5

4.  **Implement the Training Loop:**

    *   Initialize the AI agent (e.g., the neural network for DQN).
    *   For each episode:
        *   Reset the game environment to a starting state.
        *   While the game is not over:
            *   The AI agent observes the current game state.
            *   The AI agent chooses an action based on its policy (or Q-function).  Exploration strategies (e.g., epsilon-greedy) are important to encourage the AI to try new things.
            *   The AI agent executes the action in the game environment.
            *   The AI agent receives a reward from the environment.
            *   The AI agent updates its policy (or Q-function) based on the reward and the new game state.
        *   Evaluate the AI's performance (e.g., win rate).
        *   Adjust hyperparameters or the reward function as needed.

5.  **Exploration vs. Exploitation:**  The AI needs to explore the game space to discover new strategies, but it also needs to exploit its current knowledge to win games.  Techniques like epsilon-greedy (randomly choosing actions with probability epsilon) are commonly used.

6.  **Hyperparameter Tuning:**  Reinforcement learning algorithms have many hyperparameters (e.g., learning rate, discount factor, exploration rate).  Tuning these parameters is essential for good performance.

## The actual concept: coefficients state machines
This approach involves assigning an "attractiveness coefficient" to each piece on the board. This coefficient represents the desirability of targeting that piece.

*   **Attractiveness Coefficient:** Each piece has a base attractiveness score. Factors influencing this score could include:
    *   Piece type (e.g., a high-value piece has a higher coefficient).
    *   Current health.
    *   Abilities.
*   **Distance Modifier:** The attractiveness coefficient is then divided by the distance between the CPU's pieces and the target piece. This prioritizes closer targets.
*   **Attack Coefficient:** The final attack coefficient is calculated as: `Attractiveness Coefficient / Distance`. The CPU will prioritize attacking pieces with the highest attack coefficient.
*   **Movement Prioritization:** If no attacks are possible, the CPU will prioritize moving towards the closest enemy piece. If multiple pieces are at the same distance, the CPU will prioritize moving towards the piece with the highest attractiveness coefficient.

This approach should create an aggressive AI. The key will be finding the right balance and tuning the hyperparameters (e.g., the base attractiveness coefficients for different piece types).

This system allows for dynamic adjustments to the AI's behavior. By tweaking the base attractiveness coefficients and the distance modifier, we can control whether the CPU prioritizes attacking high-value targets or focusing on closer, weaker enemies.

Furthermore, we can introduce variability by periodically changing these hyperparameters (e.g., every 4 turns). This would prevent the AI from becoming predictable and force the player to adapt to its shifting priorities. This is similar to how the ghosts in Pac-Man change their behavior patterns.

*   **Placing Units:** When the CPU has the opportunity to place units on the board, it should consider the following:
    *   **Strategic Locations:** Identify key locations on the board that provide a tactical advantage (e.g., high ground, chokepoints).
    *   **Unit Synergy:** Place units that complement each other's abilities.
    *   **Resource Management:** Balance unit placement with resource availability.
    *   **Threat Assessment:** Anticipate the opponent's moves and place units to counter them.

The AI will place an unit when it will calculate than his oracle is in a weaker position.
