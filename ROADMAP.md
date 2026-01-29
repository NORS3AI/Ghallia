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
