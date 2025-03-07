<div align="center">
  <img src="./assets/icon-white.png" width="150" alt="Nausicaa Game Logo">
  <h1>🏹 NAUSICAA 🔮</h1>
  <h3>Mythological Strategy Board Game</h3>
  
  [![GitHub](https://img.shields.io/badge/GitHub-Nausicaa--game-blue?style=flat-square&logo=github)](https://github.com/Nausicaa-game/nausicaa-game.github.io)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Discord](https://img.shields.io/badge/Discord-Join-7289DA?style=flat-square&logo=discord)](https://discord.gg/fox3000foxy)
  
  <p>
    <a href="#game-concept">Game Concept</a> •
    <a href="#core-components">Core Components</a> •
    <a href="#units">Units</a> •
    <a href="#game-mechanics">Game Mechanics</a> •
    <a href="#technical">Technical</a>
  </p>
</div>

---

## Game Concept

Nausicaa is a turn-based, deck-building strategy game that brings mythological beings to life on a dynamic 10x8 battlefield. Inspired by chess and mythological warfare, players build decks, manage mana, and strategically deploy legendary creatures to defeat their opponent.

<p align="center">
  <img src="./assets/gameplay.gif" width="500" alt="Nausicaa Gameplay">
</p>

## Core Components

### The Board
- **Dimensions**: 10 x 8 checkerboard
- **Spawn Zones**: 
  - Bottom two rows (Blue): Player 1's deployment area
  - Top two rows (Red): Player 2's deployment area

<p align="center">
  <img src="./assets/board.svg" width="400" alt="Nausicaa Game Board">
</p>

### Objective
Eliminate the opponent's **Oracle** (King equivalent) to win the game.

## Deck Building and Card Mechanics

### Deck Composition
- **Total Units**: 15 mythological beings
- **Deck Preparation**: 
  - Shuffle entire deck at game start
  - Initial draw: 3 units
  - Draw 1 unit at the beginning of each turn

### Mana System

#### Mana Management
- **Mana Range**: 0 - 6 points
- **Mana Progression**:
  - Start with 1 mana
  - Increase by 1 each turn
  - Maximum of 6 mana
  - Mana resets at turn start
  - Unused mana is discarded

#### Mana Spending
1. **Spawning Units**: Each unit has a mana cost
2. **Attacking**: 1 mana per attack
3. **Dashing**: 1 mana for extra movement
4. **Special Abilities**: Varies by unit

## Units

<div align="center">
  <h3>🔮 Royal Unit</h3>
</div>

<table>
  <tr>
    <th colspan="3">Royal Unit</th>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/oracle.svg" width="60" alt="Oracle"></td>
    <td width="120"><strong>Oracle</strong><br><span style="color:#c9a01c">Cost: Free</span></td>
    <td>The royal unit that must be protected. Moves to 8 surrounding squares for 1 mana (2 mana to dash). Losing this unit results in defeat.</td>
  </tr>
</table>

<div align="center">
  <h3>💰 Low-Cost Units (1 Mana)</h3>
</div>

<table>
  <tr>
    <th colspan="3">Low-Cost Units (1 Mana)</th>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/gobelin.svg" width="60" alt="Goblin"></td>
    <td width="120"><strong>Goblin</strong><br><span style="color:#c9a01c">Cost: 1 Mana</span></td>
    <td>Basic offensive unit. Moves forward up to 3 squares and attacks in 4 lateral directions.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/harpy.svg" width="60" alt="Harpy"></td>
    <td width="120"><strong>Harpy</strong><br><span style="color:#c9a01c">Cost: 1 Mana</span></td>
    <td>Moves in 8 surrounding squares. Special ability: One-time explosive attack that destroys surrounding units and itself. Caution: Friendly fire possible.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/naiad.svg" width="60" alt="Naiad"></td>
    <td width="120"><strong>Naiad</strong><br><span style="color:#c9a01c">Cost: 1 Mana</span></td>
    <td>Support unit. Draw a card on spawn and when destroyed. Cannot attack.</td>
  </tr>
</table>

<div align="center">
  <h3>⚔️ Strategic Units (2 Mana)</h3>
</div>

<table>
  <tr>
    <th colspan="3">Strategic Units (2 Mana)</th>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/griffin.svg" width="60" alt="Griffin"></td>
    <td width="120"><strong>Griffin</strong><br><span style="color:#c9a01c">Cost: 2 Mana</span></td>
    <td>Hops 2 squares laterally. Draw a card if jumping over any unit.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/siren.svg" width="60" alt="Siren"></td>
    <td width="120"><strong>Siren</strong><br><span style="color:#c9a01c">Cost: 2 Mana</span></td>
    <td>Limited lateral movement. Attacks simultaneously in 4 diagonal squares. Caution: Friendly fire possible.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/centaur.svg" width="60" alt="Centaur"></td>
    <td width="120"><strong>Centaur</strong><br><span style="color:#c9a01c">Cost: 2 Mana</span></td>
    <td>Can pull any unit 2 squares closer. Uses 1 mana to activate this ability.</td>
  </tr>
</table>

<div align="center">
  <h3>🏹 Ranged Units (3 Mana)</h3>
</div>

<table>
  <tr>
    <th colspan="3">Ranged Units (3 Mana)</th>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/archer.svg" width="60" alt="Archer"></td>
    <td width="120"><strong>Archer</strong><br><span style="color:#c9a01c">Cost: 3 Mana</span></td>
    <td>Moves laterally. Attacks with 3-square diagonal range.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/phoenix.svg" width="60" alt="Phoenix"></td>
    <td width="120"><strong>Phoenix</strong><br><span style="color:#c9a01c">Cost: 3 Mana</span></td>
    <td>Can only spawn/move/attack on specific (dark) tiles. Diagonal movement.</td>
  </tr>
</table>

<div align="center">
  <h3>✨ Special Ability Units (4-6 Mana)</h3>
</div>

<table>
  <tr>
    <th colspan="3">Special Ability Units (4-6 Mana)</th>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/shapeshifter.svg" width="60" alt="Shapeshifter"></td>
    <td width="120"><strong>Shapeshifter</strong><br><span style="color:#c9a01c">Cost: 4 Mana</span></td>
    <td>Can swap places with any unit. Cannot swap with Oracle or attack during the same turn.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/seer.svg" width="60" alt="Seer"></td>
    <td width="120"><strong>Seer</strong><br><span style="color:#c9a01c">Cost: 4 Mana</span></td>
    <td>Generates extra mana each turn. Cannot move or attack.</td>
  </tr>
  <tr>
    <td width="80" align="center"><img src="./assets/pions/titan.svg" width="60" alt="Titan"></td>
    <td width="120"><strong>Titan</strong><br><span style="color:#c9a01c">Cost: 6 Mana</span></td>
    <td>Destroys surrounding units on spawn. Powerful ranged attack with area effect.</td>
  </tr>
</table>

## Game Mechanics

### Movement Rules
- **Free Movement**: 1 square per turn
- **Dashing**: 
  - Costs 1 mana
  - Additional movement
  - Cannot dash and attack in same turn
- **Spawn Restriction**: Units cannot move/attack on turn of spawning

### Attack Mechanics
- **Base Cost**: 1 mana per attack
- **Restriction**: One attack per turn per unit
- **Friendly Fire**: Enabled by default

<!-- <p align="center">
  <img src="./assets/hero.png" width="500" alt="Nausicaa Hero Image">
</p> -->

## ✨ Feature Highlights

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <h3>🎮 Strategic Gameplay</h3>
        <p>Deep tactical decisions with multiple paths to victory</p>
      </td>
      <td align="center" width="33%">
        <h3>🃏 Deck Building</h3>
        <p>Create custom decks with mythological beings</p>
      </td>
      <td align="center" width="33%">
        <h3>⚔️ Unique Units</h3>
        <p>Each unit offers special abilities and play styles</p>
      </td>
    </tr>
  </table>
</div>

## Technical

### Implementation
- Web-based implementation with HTML, CSS, and JavaScript
- Supports turn-based multiplayer
- Ideal for real-time and asynchronous play

### Multiplayer Architecture
- **Peer-to-Peer Connectivity**: Built using WebRTC technology for direct player connections
- **PeerJS Framework**: Simplifies WebRTC implementation with easy-to-use API
- **Connection Flow**:
  1. Host generates unique room code
  2. Joining player enters code to establish direct connection
  3. No central server required for gameplay after initial matchmaking
- **Game State Synchronization**:
  - Turn-based actions transmitted directly between players
  - Automatic state verification to prevent desynchronization
  - ~~Reconnection capabilities for dropped connections~~
- **Benefits**:
  - Low latency gameplay
  - Reduced server costs
  - Privacy-focused design
  - Scales easily with player base

### CPU Concept
  For details on the CPU concept and AI implementation, see the [CPU Concept document](./CPU-concept.md). This document outlines the algorithms and strategies used to create a challenging and engaging AI opponent.

### Code Repository
[![GitHub](https://img.shields.io/badge/GitHub-Nausicaa--game-blue?style=flat-square&logo=github)](https://github.com/Nausicaa-game/nausicaa-game.github.io)

### License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Contribution
Interested in expanding the game? Contribute by:
- Designing new units
- Creating unique arena layouts
- Balancing game mechanics

---

<div align="center">
  <p><strong>Created with ❤️ by <a href="https://instagram.com/fox3000foxy">fox3000foxy</a></strong></p>
  
  <a href="https://discord.gg/fox3000foxy"><img src="https://img.shields.io/badge/Discord-Join-7289DA?style=for-the-badge&logo=discord" alt="Discord"></a>&nbsp;
  <a href="https://instagram.com/fox3000foxy"><img src="https://img.shields.io/badge/Instagram-Follow-E4405F?style=for-the-badge&logo=instagram" alt="Instagram"></a>
</div>