# Nausicaa: Mythological Strategy Board Game 🏹🔮

## Game Concept

Nausicaa is a turn-based, deck-building strategy game that brings mythological beings to life on a dynamic 10x8 battlefield. Inspired by chess and mythological warfare, players build decks, manage mana, and strategically deploy legendary creatures to defeat their opponent.

## Core Game Components

### The Board
- **Dimensions**: 10 x 8 checkerboard
- **Spawn Zones**: 
  - Bottom two rows (Red): Player 1's deployment area
  - Top two rows (Blue): Player 2's deployment area
- **Customizable Arena**: Players can modify board layout with obstacles, terrain, and special zones

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

## Detailed Unit Types

### Oracle (King Equivalent)
- **Cost**: Free to place
- **Movement**: 8 surrounding squares
- **Special Rule**: 1 mana to move (2 mana to dash)
- **Lose Condition**: Eliminating this unit wins the game

### Low-Cost Units (1 Mana)

#### Goblin
- **Movement**: Forward to 3 squares
- **Attack**: 4 lateral directions
- **Tactical Role**: Basic offensive unit

#### Harpy
- **Movement**: 8 surrounding squares
- **Special Ability**: One-time explosive attack
  - Destroys surrounding units
  - Self-destructs after attack
- **Caution**: Friendly fire possible

#### Naiad (Support)
- **Ability**: 
  - Draw a card on spawn
  - Draw a card when destroyed
- **Cannot Attack**

### Strategic Units (2 Mana)

#### Griffin
- **Movement**: Hop 2 squares laterally
- **Special Ability**: Draw a card if jumping over any unit

#### Siren
- **Movement**: Limited lateral
- **Attack**: Simultaneous 4 diagonal squares
- **Caution**: Friendly fire possible

#### Centaur
- **Ability**: Pull any unit 2 squares closer
- **Mana Cost**: 1 to use ability

### Ranged Units (3 Mana)

#### Archer
- **Movement**: Lateral
- **Attack**: 3-square diagonal range

#### Phoenix
- **Unique Mechanic**: Can only spawn/move/attack on specific (dark) tiles
- **Movement**: Diagonal

### Special Ability Units (4-6 Mana)

#### Shapeshifter
- **Ability**: Swap places with any unit
- **Restrictions**: 
  - Cannot swap with Oracle
  - Cannot attack same turn as teleporting

#### Seer
- **Ability**: Generates extra mana each turn
- **Limitation**: Cannot move or attack

#### Titan
- **Spawning Effect**: Destroys surrounding units
- **Attack**: Powerful ranged damage with area effect

## Advanced Game Mechanics

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

## Technical Considerations
- Recommended for web implementation
- Supports turn-based multiplayer
- Ideal for real-time and asynchronous play

## Contribution
Interested in expanding the game? Contribute by:
- Designing new units
- Creating unique arena layouts
- Balancing game mechanics

## License
- MIT License

**Created with ❤️ by fox3000foxy**