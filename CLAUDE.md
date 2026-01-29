# Ghallia - Idle Prestige Crafting Game

## Overview

Ghallia is an **idle game** inspired by Old School RuneScape (OSRS) and World of Warcraft's profession systems. Players grind skills to craft items, armor, and bags to sell for gold, reinvesting earnings to further their progression. The core loop revolves around skill leveling, crafting, and a prestige system that resets progress in exchange for powerful permanent upgrades.

---

## Core Game Loop

1. **Grind Skills** - Level up various gathering and crafting skills
2. **Craft Items** - Use gathered resources to craft items, armor, bags, etc.
3. **Sell for Gold** - Sell crafted goods for in-game currency
4. **Reinvest** - Use gold to buy better tools, unlock recipes, speed up training
5. **Prestige** - Once 5 skills reach level 99, unlock prestige for Chaos Points
6. **Upgrade Talents** - Spend Chaos Points on permanent progression bonuses
7. **Repeat** - Start fresh with talent advantages, grind to prestige again

---

## Skill System

### Skill Parameters
- **Level Range**: 1 to 999
- **Total Skills**: 20 skills
- **Prestige Requirement**: 5 skills at level 99+

### Skill List (20 Skills)

#### Gathering Skills
1. **Logging** - Chop trees for wood resources
2. **Mining** - Extract ores and gems from nodes
3. **Fishing** - Catch fish from various water sources
4. **Herbalism** - Gather herbs and plants
5. **Skinning** - Harvest leather and hides from creatures
6. **Foraging** - Collect wild ingredients and materials
7. **Hunting** - Track and capture wild game

#### Crafting/Production Skills
8. **Woodworking** - Craft bows, staves, furniture from wood
9. **Smithing** - Forge weapons and armor from metals
10. **Cooking** - Prepare food for buffs and sale
11. **Alchemy** - Brew potions and elixirs from herbs
12. **Leatherworking** - Craft leather armor and bags
13. **Tailoring** - Create cloth armor and containers
14. **Jewelcrafting** - Cut gems and create jewelry
15. **Enchanting** - Imbue items with magical properties
16. **Engineering** - Build gadgets and mechanical devices

#### Support Skills
17. **Trading** - Better prices when buying/selling
18. **Farming** - Grow crops and herbs passively
19. **Runecrafting** - Create magical runes for enchanting
20. **Archaeology** - Discover rare artifacts and blueprints

---

## Prestige System

### Chaos Points
- **Earned by**: Prestiging after reaching 5 skills at level 99+
- **Cost**: Lose all gold, skill levels, and crafted items
- **Scaling**: More Chaos Points earned based on:
  - Number of skills at 99+
  - Highest skill levels achieved
  - Total gold accumulated before prestige

### Talent System
Chaos Points are spent on a vast talent tree providing permanent bonuses:

#### Talent Categories
- **Skill XP Boosts** - Faster leveling in specific skills
- **Gold Multipliers** - Earn more from selling items
- **Crafting Speed** - Reduce time to craft items
- **Multi-Craft** - Chance to craft multiple items at once
- **Resource Efficiency** - Reduced material requirements
- **Rare Finds** - Increased chance for rare materials
- **Idle Efficiency** - Better offline progress
- **Prestige Bonuses** - More Chaos Points per prestige

---

## Technical Roadmap

### Phase 1: Foundation
- [ ] Project setup and architecture
- [ ] Core game state management
- [ ] Basic UI framework
- [ ] Save/load system (local storage)
- [ ] Idle time calculation

### Phase 2: Core Systems
- [ ] Skill system implementation
- [ ] Experience and leveling formulas
- [ ] Basic gathering mechanics
- [ ] Resource inventory system
- [ ] Gold economy

### Phase 3: Crafting
- [ ] Recipe system
- [ ] Crafting queue
- [ ] Item database
- [ ] Equipment slots
- [ ] Bag/storage expansion

### Phase 4: Prestige
- [ ] Prestige requirements check
- [ ] Chaos Points calculation
- [ ] Talent tree UI
- [ ] Talent effects application
- [ ] Reset mechanics

### Phase 5: Polish
- [ ] Statistics tracking
- [ ] Achievements system
- [ ] Settings and options
- [ ] Tutorial/onboarding
- [ ] Balancing pass

### Phase 6: Login & Cloud
- [ ] User authentication system
- [ ] Password hashing and security
- [ ] Session key management
- [ ] Cloud save synchronization
- [ ] Cross-device play

---

## Technology Stack (TBD)

### Considerations
- **Web-based** for accessibility (play anywhere)
- **TypeScript** for type safety and maintainability
- **React** or **Vue** for reactive UI
- **Local Storage** for offline saves
- **Backend** (Node.js/Python) for cloud saves and auth

### Modularity Requirements
- Skill system must be easily extensible
- Item/recipe data should be JSON-driven
- Talent system needs flexible node definitions
- Support for future DLC/expansions

---

## Future Expansion Ideas (DLC)

- New skill trees
- Seasonal events with limited-time crafting
- Multiplayer trading market
- Guild systems
- Prestige tiers (Prestige 2, 3, etc.)
- Rare legendary items
- Boss encounters (idle combat)
- Pet companions with bonuses

---

## TODO - Immediate Tasks

1. [ ] Finalize technology stack decision
2. [ ] Design XP curve formula (levels 1-999)
3. [ ] Create skill data structure
4. [ ] Design basic UI wireframes
5. [ ] Implement core game loop prototype
6. [ ] Create resource/item database schema
7. [ ] Design Chaos Point earning formula
8. [ ] Map out initial talent tree

---

## Design Notes

- **Idle Focus**: Game should progress meaningfully while away
- **Satisfying Numbers**: Big numbers feel good - levels to 999, lots of gold
- **Quick Early Game**: Fast initial progress to hook players
- **Deep Late Game**: Meaningful choices in talent builds
- **No Pay-to-Win**: If monetized, cosmetics only

---

*Last Updated: January 29, 2026*
