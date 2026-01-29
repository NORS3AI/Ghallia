# Ghallia - Development Roadmap

## Overview

This document outlines the development phases for Ghallia, from initial foundation to full release with cloud features.

---

## Phase 1: Foundation

**Goal:** Establish core project architecture and basic functionality

- [ ] Project setup and architecture
- [ ] Core game state management
- [ ] Basic UI framework
- [ ] Save/load system (local storage)
- [ ] Click/tap input handling

**Deliverable:** Playable shell with save/load functionality

---

## Phase 2: Core Systems

**Goal:** Implement the fundamental gameplay mechanics

- [ ] Skill system implementation (locked/unlocked states)
- [ ] Experience and leveling formulas (levels 1-999)
- [ ] Click-based gathering mechanics
- [ ] Resource inventory system
- [ ] Gold economy and skill purchase system
- [ ] Logging skill (free starter)
- [ ] Sawmill skill (1,000g unlock)

**Deliverable:** Players can gather resources, level up, and earn gold

---

## Phase 3: Crafting

**Goal:** Build out the idle crafting system

- [ ] Recipe system
- [ ] Crafting queue (idle progression)
- [ ] Item database
- [ ] Equipment slots
- [ ] Bag/storage expansion
- [ ] All crafting skills implemented

**Deliverable:** Full gathering → crafting → selling loop functional

---

## Phase 4: Prestige

**Goal:** Implement the prestige and talent systems

- [ ] Prestige requirements check (5 skills at 99+)
- [ ] Chaos Points calculation and awarding
- [ ] Talent tree UI
- [ ] Talent effects application
- [ ] Reset mechanics (gold, levels, items)
- [ ] Support Skills unlock (post-Prestige 1)

**Deliverable:** Complete progression loop with meaningful replayability

---

## Phase 5: Polish

**Goal:** Enhance player experience and game feel

- [ ] Statistics tracking (lifetime stats, records)
- [ ] Achievements system
- [ ] Settings and options menu
- [ ] Tutorial/onboarding flow
- [ ] Balancing pass (XP curves, gold rates, costs)
- [ ] Sound effects and feedback
- [ ] Visual polish and animations

**Deliverable:** Release-ready single-player experience

---

## Phase 6: Login & Cloud

**Goal:** Enable cross-device play and account persistence

- [ ] User authentication system
- [ ] Password hashing and security (bcrypt/argon2)
- [ ] Session key management
- [ ] Cloud save synchronization
- [ ] Cross-device play
- [ ] Account recovery options

**Deliverable:** Full online capability with secure accounts

---

## Future Phases (Post-Launch)

### Phase 7: Social Features
- [ ] Leaderboards
- [ ] Player profiles
- [ ] Friend system

### Phase 8: Expansions
- [ ] New skill trees
- [ ] Seasonal events
- [ ] Multiplayer trading market
- [ ] Guild systems

---

## Technology Stack (TBD)

### Frontend Considerations
- **Web-based** for accessibility (play anywhere, no download)
- **TypeScript** for type safety and maintainability
- **React** or **Vue** for reactive UI components
- **Local Storage** for offline saves

### Backend Considerations
- **Node.js** or **Python** for API server
- **PostgreSQL** or **MongoDB** for user data
- **Redis** for session management
- **JWT** for authentication tokens

### Modularity Requirements
- Skill system must be easily extensible (add new skills via config)
- Item/recipe data should be JSON-driven
- Talent system needs flexible node definitions
- Architecture must support future DLC/expansions

---

## Skill Tier Progression Design

Each skill has **tier unlocks every 20 levels** that provide new resources/tools, plus **purchasable mid-tier upgrades every 10 levels** for incremental bonuses.

### Mid-Tier Upgrades (Every 10 Levels)

At levels 10, 30, 50, 70, etc., players can purchase small upgrades with gold:

| Upgrade Type | Effect | Cost Scaling |
|--------------|--------|--------------|
| Speed Boost | +1% faster gathering/crafting | Base × Level |
| Yield Boost | +1% more resources | Base × Level |
| XP Boost | +1% more experience | Base × Level |
| Crit Chance | +0.5% chance for double | Base × Level |
| Quality Boost | +1% chance for rare variant | Base × Level |

---

### Logging - Tree Tiers (Every 20 Levels)

| Levels | Tree Type | Notes |
|--------|-----------|-------|
| 1-20 | Maple | Starter tree, soft wood |
| 21-40 | Oak | Sturdy hardwood |
| 41-60 | Birch | Light, flexible wood |
| 61-80 | Pine | Resinous softwood |
| 81-100 | Willow | Bendy, good for bows |
| 101-120 | Cedar | Aromatic, rot-resistant |
| 121-140 | Ash | Strong, shock-resistant |
| 141-160 | Elm | Dense, water-resistant |
| 161-180 | Spruce | Tall, fast-growing |
| 181-200 | Redwood | Massive, ancient trees |
| 201-220 | Mahogany | Premium hardwood |
| 221-240 | Teak | Exotic, weather-proof |
| 241-260 | Ebony | Dark, extremely dense |
| 261-280 | Ironwood | Hard as metal |
| 281-300 | Bloodwood | Deep red, magical properties |
| 301-320 | Ghostwood | Pale, slightly translucent |
| 321-340 | Petrified Oak | Ancient fossilized wood |
| 341-360 | Crystalbark | Wood with crystal veins |
| 361-380 | Moonbark | Glows faintly at night |
| 381-400 | Sunwood | Warm to the touch, golden |
| 401-420 | Stormoak | Struck by lightning, charged |
| 421-440 | Frostpine | Ice-cold, never rots |
| 441-460 | Emberbark | Smolders but doesn't burn |
| 461-480 | Voidwood | Absorbs light around it |
| 481-500 | Mythril Birch | Metallic sheen, lightweight |
| 501-520 | Dragon Oak | Scales instead of bark |
| 521-540 | Phoenix Ash | Regenerates when cut |
| 541-560 | Titan Elm | Grows upside-down |
| 561-580 | Cosmic Cedar | Leaves show constellations |
| 581-600 | Nebula Maple | Swirling galaxy patterns |
| 601-620 | Starfall Willow | Drips liquid starlight |
| 621-640 | Quantum Pine | Exists in two places at once |
| 641-660 | Temporal Spruce | Rings show the future |
| 661-680 | Ethereal Redwood | Partially transparent |
| 681-700 | Celestial Teak | Hums with divine energy |
| 701-720 | Divine Mahogany | Blessed by the gods |
| 721-740 | Astral Ebony | From another dimension |
| 741-760 | Primal Ironwood | From the dawn of time |
| 761-780 | The Giving Tree | Apologizes when chopped |
| 781-800 | Infinity Oak | Somehow bigger on the inside |
| 801-820 | Schrödinger's Birch | May or may not be there |
| 821-840 | Meme Wood | Changes based on trends |
| 841-860 | Plot Armor Tree | Suspiciously durable |
| 861-880 | Lag Spike Pine | Freezes time briefly |
| 881-900 | Fourth Wall Willow | Knows it's in a game |
| 901-920 | Error 404 Cedar | Tree not found |
| 921-940 | Gigachad Oak | Impossibly perfect |
| 941-960 | Final Boss Elm | Has a health bar |
| 961-980 | Prestige Redwood | Resets when you chop it |
| 981-999 | The World Tree | Legendary, end-game |

---

### Sawmill - Saw Tiers (Every 20 Levels)

| Levels | Saw Type | Notes |
|--------|----------|-------|
| 1-20 | Wood Saw | Basic hand saw |
| 21-40 | Paper Saw | Finer teeth, cleaner cuts |
| 41-60 | Hacksaw | Metal frame, versatile |
| 61-80 | Crosscut Saw | Two-person efficiency |
| 81-100 | Ripsaw | Aggressive teeth pattern |
| 101-120 | Circular Saw | First power tool |
| 121-140 | Jigsaw | Precision cutting |
| 141-160 | Bandsaw | Continuous blade |
| 161-180 | Table Saw | Industrial upgrade |
| 181-200 | Chainsaw | Portable power |
| 201-220 | Power Saw | Heavy duty |
| 221-240 | Laser Saw | Burns through wood |
| 241-260 | Plasma Cutter | Superheated precision |
| 261-280 | Diamond Blade | Cuts anything |
| 281-300 | Obsidian Edge | Volcanic glass blade |
| 301-320 | The Chopinator | Aggressively efficient |
| 321-340 | Sawzilla | Comically oversized |
| 341-360 | Buzzmaster 3000 | Loud and proud |
| 361-380 | The Divorce Lawyer | Takes half of everything |
| 381-400 | Oops All Teeth | It's just teeth |
| 401-420 | Sir Saws-a-Lot | Knighted for service |
| 421-440 | Blade Runner | Runs on blades |
| 441-460 | The Compensator | Unnecessarily large |
| 461-480 | Grandpa's Revenge | Old but deadly |
| 481-500 | Mythril Saw | Lightweight, unbreakable |
| 501-520 | Dragon Fang | Tooth of a dragon |
| 521-540 | Phoenix Feather Blade | Self-sharpening |
| 541-560 | The Existential Cutter | Questions why it cuts |
| 561-580 | Cosmic Cutter | Cuts through spacetime |
| 581-600 | Nebula Slicer | Star-powered |
| 601-620 | Quantum Saw | Cuts all possibilities |
| 621-640 | One Saw to Rule Them All | Precious |
| 641-660 | Temporal Blade | Cuts yesterday's wood |
| 661-680 | The Tax Collector | Takes a little extra |
| 681-700 | Celestial Cutter | Angels cry when used |
| 701-720 | Divine Divider | Blessed cuts |
| 721-740 | Astral Edge | Interdimensional blade |
| 741-760 | Primal Saw | First saw ever made |
| 761-780 | The Overachiever | Does too much |
| 781-800 | Legendary Lumberjacker | Has its own lore |
| 801-820 | Mythic Mulcher | Stuff of legends |
| 821-840 | God Saw | Omnipotent cutting |
| 841-860 | Infinity Edge | Cuts forever |
| 861-880 | "Is This Even Legal?" | Probably not |
| 881-900 | Transcendent Teeth | Beyond comprehension |
| 901-920 | Ascended Arbor-Annihilator | Peak performance |
| 921-940 | Perfect Precision | Never misses |
| 941-960 | Ultimate Undercutter | The penultimate saw |
| 961-980 | Supreme Slicer | Second only to... |
| 981-999 | The World Ender | Final saw, end-game |

---

### Other Skills - Tier Framework

All skills follow the same pattern. Examples:

**Mining (Ore Types):**
- Copper → Iron → Silver → Gold → Platinum → Mythril → Adamantite → Dragon Ore → Cosmic Ore → etc.

**Fishing (Fish Types):**
- Minnow → Trout → Salmon → Tuna → Swordfish → Shark → Kraken Tentacle → Void Fish → etc.

**Herbalism (Plant Types):**
- Dandelion → Lavender → Sage → Moonpetal → Sunbloom → Dragonthorn → Voidroot → etc.

**Smithing (Forge Types):**
- Stone Forge → Iron Forge → Steel Forge → Mythril Forge → Dragon Forge → Star Forge → etc.

**Cooking (Kitchen Types):**
- Campfire → Stone Oven → Brick Oven → Industrial Kitchen → Magic Cauldron → etc.

> **TODO:** Complete tier lists for all 20 skills with similar progression and humor.

---

## Immediate TODO

Priority tasks for the next development sprint:

1. [ ] Finalize technology stack decision
2. [ ] Design XP curve formula (levels 1-999)
3. [ ] Create skill data structure
4. [ ] Design basic UI wireframes
5. [ ] Implement core game loop prototype
6. [ ] Create resource/item database schema
7. [ ] Design Chaos Point earning formula
8. [ ] Map out initial talent tree
9. [ ] Complete tier lists for all 20 skills (every 20 levels)
10. [ ] Design mid-tier upgrade costs and scaling formula
11. [ ] Balance tier unlock requirements vs rewards

---

## Milestones

| Milestone | Description | Target |
|-----------|-------------|--------|
| Alpha | Core loop playable (gather, craft, sell) | TBD |
| Beta | Prestige system complete | TBD |
| Release | Full polish, achievements, tutorial | TBD |
| Cloud | Account system and cloud saves | TBD |

---

*Last Updated: January 29, 2026*
