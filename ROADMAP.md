# Ghallia - Development Roadmap

## Overview

This document outlines the development phases for Ghallia, from initial foundation to full release with cloud features.

---

## Phase 1: Foundation

**Goal:** Establish core project architecture and basic functionality

- [x] Project setup and architecture (TypeScript + React + Vite)
- [ ] Core game state management
- [ ] Basic UI framework
- [ ] Save/load system (local storage)
- [ ] Click/tap input handling

**Deliverable:** Playable shell with save/load functionality

---

## Phase 2: Core Systems

**Goal:** Implement the fundamental gameplay mechanics

- [x] Skill system implementation (locked/unlocked states)
- [x] Experience and leveling formulas (levels 1-999)
- [x] Click-based gathering mechanics
- [x] Resource inventory system
- [x] Gold economy and skill purchase system
- [x] Logging skill (free starter)
- [x] Sawmill skill (1,000g unlock)
- [x] Stats tab with player statistics
- [x] Upgrades tab with 40+ purchasable upgrades
- [x] Spells tab with mana system
- [ ] Inventory tab (centralized item view)
- [ ] Character tab (equipment system)

**Deliverable:** Players can gather resources, level up, earn gold, and manage inventory

---

## Phase 2.5: Inventory & Character

**Goal:** Implement item management and equipment systems

- [ ] Inventory panel with all gathered resources
- [ ] Item data structures (weapons, armor, jewelry)
- [ ] Material tier system (Copper → Dragon)
- [ ] Rarity system (Common → Legendary)
- [ ] Character panel with equipment slots
- [ ] Stat system (Strength, Intellect, Agility, Stamina)
- [ ] Equipment stat calculations
- [ ] Foraging equipment drops
- [ ] Mining ore tiers implementation
- [ ] Fishing fish tiers implementation
- [ ] Herbalism herb tiers implementation
- [ ] Skinning hide tiers implementation

**Deliverable:** Full inventory management and character equipment system

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

### Mining - Ore Tiers (Every 20 Levels)

| Levels | Ore Type | Notes |
|--------|----------|-------|
| 1-20 | Copper Ore | Soft, beginner metal |
| 21-40 | Tin Ore | Alloy component |
| 41-60 | Bronze Ore | Classic alloy |
| 61-80 | Iron Ore | Industrial staple |
| 81-100 | Coal | Fuel for forges |
| 101-120 | Silver Ore | Precious, conductive |
| 121-140 | Gold Ore | Valuable, malleable |
| 141-160 | Platinum Ore | Dense, rare |
| 161-180 | Mythril Ore | Lightweight magic metal |
| 181-200 | Adamantite | Nearly unbreakable |
| 201-220 | Obsidian | Volcanic glass |
| 221-240 | Orichalcum | Lost metal of Atlantis |
| 241-260 | Star Metal | Fallen from the sky |
| 261-280 | Dragon Ore | Scales crystallized |
| 281-300 | Phoenix Stone | Warm to the touch |
| 301-320 | Void Crystal | Absorbs light |
| 321-340 | Titan's Blood | Petrified ichor |
| 341-360 | Cosmic Shard | Fragment of a star |
| 361-380 | Quantum Ore | Exists in superposition |
| 381-400 | Celestite | Heaven's metal |
| 401-420 | Netherstone | From the underworld |
| 421-440 | Primal Core | Heart of the earth |
| 441-460 | Chronostone | Frozen time |
| 461-480 | Ethereal Gem | Barely physical |
| 481-500 | Divine Ingot | Blessed by gods |
| 501-520 | Worldbreaker Ore | Dangerously unstable |
| 521-540 | Infinity Shard | Never depletes |
| 541-560 | Paradox Metal | Shouldn't exist |
| 561-580 | Genesis Stone | First ore ever |
| 581-600 | Omega Crystal | Last ore ever |
| 601-620 | Meme Ore | Updates with trends |
| 621-640 | Bitcoin Ore | Value fluctuates wildly |
| 641-660 | Error Crystal | Texture missing |
| 661-680 | Meta Ore | Knows it's in a game |
| 681-700 | Plot Ore | Suspiciously convenient |
| 701-720 | Legendary Lump | Has its own theme music |
| 721-740 | Gigachad Gold | Perfectly sculpted |
| 741-760 | Sigma Stone | Grinds on its own |
| 761-780 | Ultra Instinct Ore | Dodges your pickaxe |
| 781-800 | God Tier Gem | Omnipotent sparkle |
| 801-820 | Transcendent Crystal | Beyond comprehension |
| 821-840 | Ascended Ore | Achieved enlightenment |
| 841-860 | Perfect Prism | Flawless |
| 861-880 | Supreme Shard | Second to none |
| 881-900 | Ultimate Ore | The penultimate |
| 901-920 | Apex Crystal | Peak mining |
| 921-940 | Zenith Gem | Highest point |
| 941-960 | Final Form Ore | This isn't even... |
| 961-980 | Endgame Stone | Credits roll when mined |
| 981-999 | The Motherload | Legendary, end-game |

---

### Fishing - Fish Tiers (Every 20 Levels)

| Levels | Fish Type | Notes |
|--------|-----------|-------|
| 1-20 | Minnow | Tiny starter fish |
| 21-40 | Perch | Common pond fish |
| 41-60 | Trout | Stream dweller |
| 61-80 | Bass | Popular sport fish |
| 81-100 | Catfish | Bottom feeder |
| 101-120 | Salmon | Upstream swimmer |
| 121-140 | Pike | Aggressive predator |
| 141-160 | Tuna | Ocean speedster |
| 161-180 | Swordfish | Armed and dangerous |
| 181-200 | Marlin | Deep sea trophy |
| 201-220 | Barracuda | Razor-toothed |
| 221-240 | Shark | Apex predator |
| 241-260 | Manta Ray | Graceful glider |
| 261-280 | Giant Squid | Tentacled terror |
| 281-300 | Kraken Spawn | Baby monster |
| 301-320 | Sea Serpent | Legendary creature |
| 321-340 | Leviathan Fry | Young leviathan |
| 341-360 | Abyssal Angler | Deep dark dweller |
| 361-380 | Ghost Fish | Spectral swimmer |
| 381-400 | Phoenix Koi | Reborn from scales |
| 401-420 | Dragon Eel | Breathes underwater fire |
| 421-440 | Void Carp | From the abyss |
| 441-460 | Cosmic Goldfish | Contains galaxies |
| 461-480 | Time Trout | Swims backward in time |
| 481-500 | Quantum Salmon | In all streams at once |
| 501-520 | Celestial Tuna | Heavenly catch |
| 521-540 | Divine Dolphin | Not technically a fish |
| 541-560 | Primordial Pike | Ancient as the seas |
| 561-580 | Eternal Eel | Never dies |
| 581-600 | Infinity Sturgeon | Endless caviar |
| 601-620 | Meme Fish | Goes viral |
| 621-640 | Sus Fish | Among the waters |
| 641-660 | Nyan Fish | Rainbow trail |
| 661-680 | Pogfish | Impressive catch |
| 681-700 | Big Chungus Bass | Absolute unit |
| 701-720 | Sigma Salmon | Lone swimmer |
| 721-740 | Chad Carp | Jaw-droppingly buff |
| 741-760 | Based Bass | Speaks truth |
| 761-780 | Legendary Lunker | Trophy of trophies |
| 781-800 | Mythic Marlin | Stuff of legends |
| 801-820 | Godfish | Worshipped by minnows |
| 821-840 | Ultra Fish | Super Saiyan scales |
| 841-860 | Perfect Perch | No flaws |
| 861-880 | Supreme Swordfish | Cuts water itself |
| 881-900 | Ultimate Tuna | The peak fish |
| 901-920 | Apex Angler | Top of food chain |
| 921-940 | Zenith Zander | Highest tier |
| 941-960 | Final Catch | Credits roll |
| 961-980 | The Big One | Every fisher's dream |
| 981-999 | The World Fish | Legendary, end-game |

---

### Herbalism - Herb Tiers (Every 20 Levels)

| Levels | Herb Type | Notes |
|--------|-----------|-------|
| 1-20 | Dandelion | Common weed |
| 21-40 | Chamomile | Calming tea herb |
| 41-60 | Lavender | Fragrant purple |
| 61-80 | Sage | Culinary classic |
| 81-100 | Rosemary | Memory enhancer |
| 101-120 | Thyme | Aromatic leaves |
| 121-140 | Mint | Cool and refreshing |
| 141-160 | Basil | Sweet and peppery |
| 161-180 | Ginseng | Energy root |
| 181-200 | Echinacea | Immune booster |
| 201-220 | Valerian | Sleep inducer |
| 221-240 | Moonpetal | Blooms at night |
| 241-260 | Sunbloom | Glows in daylight |
| 261-280 | Starleaf | Constellation patterns |
| 281-300 | Dragonthorn | Tough and spiky |
| 301-320 | Phoenix Fern | Regrows instantly |
| 321-340 | Ghostmoss | Slightly transparent |
| 341-360 | Voidroot | Absorbs darkness |
| 361-380 | Titan's Grasp | Enormous leaves |
| 381-400 | Celestial Sage | Divine aroma |
| 401-420 | Netherbloom | From the underworld |
| 421-440 | Time Thyme | Pun intended |
| 441-460 | Quantum Leaf | Exists in probabilities |
| 461-480 | Cosmic Clover | Four-leafed always |
| 481-500 | Ethereal Mint | Barely there flavor |
| 501-520 | Divine Daisy | Holy petals |
| 521-540 | Primal Herb | First plant ever |
| 541-560 | Genesis Greenery | Origin species |
| 561-580 | Omega Orchid | Final flower |
| 581-600 | Infinity Ivy | Never stops growing |
| 601-620 | Meme Weed | Dangerously dank |
| 621-640 | Touch Grass | Essential |
| 641-660 | Grass Type | Super effective |
| 661-680 | Pogplant | Impressive specimen |
| 681-700 | Based Basil | Speaks facts |
| 701-720 | Gigaleaf | Absolutely massive |
| 721-740 | Sigma Sage | Grinds alone |
| 741-760 | Chad Chamomile | Supremely chill |
| 761-780 | Legendary Lotus | Enlightenment flower |
| 781-800 | Mythic Moss | Stories told of it |
| 801-820 | God's Garden | Divine cultivation |
| 821-840 | Ultra Herb | Super Saiyan green |
| 841-860 | Perfect Petal | Flawless specimen |
| 861-880 | Supreme Sprout | Peak growth |
| 881-900 | Ultimate Umbel | The pinnacle |
| 901-920 | Apex Aloe | Top tier healing |
| 921-940 | Zenith Zinnia | Highest bloom |
| 941-960 | Final Fern | Game almost over |
| 961-980 | The World Root | Connected to all |
| 981-999 | Yggdrasil Leaf | Legendary, end-game |

---

### Skinning - Hide Tiers (Every 20 Levels)

| Levels | Hide Type | Notes |
|--------|-----------|-------|
| 1-20 | Rabbit Hide | Soft starter leather |
| 21-40 | Squirrel Pelt | Fluffy and light |
| 41-60 | Fox Fur | Warm and luxurious |
| 61-80 | Deer Hide | Common game leather |
| 81-100 | Wolf Pelt | Rugged and durable |
| 101-120 | Bear Hide | Thick and protective |
| 121-140 | Boar Leather | Tough bristled hide |
| 141-160 | Elk Hide | Large and supple |
| 161-180 | Mountain Lion Pelt | Rare predator |
| 181-200 | Tiger Skin | Striped excellence |
| 201-220 | Crocodile Leather | Scaly armor |
| 221-240 | Hippo Hide | Incredibly thick |
| 241-260 | Rhino Leather | Nearly impenetrable |
| 261-280 | Elephant Hide | Massive sheets |
| 281-300 | Wyvern Scale | Flying beast |
| 301-320 | Griffin Pelt | Majestic creature |
| 321-340 | Manticore Hide | Chimera leather |
| 341-360 | Basilisk Skin | Petrifying scales |
| 361-380 | Hydra Leather | Regenerates slightly |
| 381-400 | Phoenix Feather | Warm forever |
| 401-420 | Dragon Scale | Legendary protection |
| 421-440 | Void Beast Hide | Darkness manifest |
| 441-460 | Titan Skin | Enormous sheets |
| 461-480 | Celestial Fur | Heavenly texture |
| 481-500 | Cosmic Hide | Star patterns |
| 501-520 | Ethereal Membrane | Partially transparent |
| 521-540 | Divine Leather | God-touched |
| 541-560 | Primal Beast Pelt | First creature's hide |
| 561-580 | Genesis Hide | Origin leather |
| 581-600 | Omega Scale | Final beast |
| 601-620 | Meme Skin | Updates with trends |
| 621-640 | Doge Pelt | Much leather, very wow |
| 641-660 | Chonker Hide | Absolute unit |
| 661-680 | Legendary Floof | Maximum softness |
| 681-700 | Mythic Fur | Stories woven in |
| 701-720 | Gigachad Hide | Perfectly sculpted |
| 721-740 | Sigma Pelt | Lone wolf energy |
| 741-760 | Based Beast Leather | Fundamental |
| 761-780 | Ultra Hide | Super Saiyan fur |
| 781-800 | God Skin | Divine protection |
| 801-820 | Perfect Pelt | Flawless texture |
| 821-840 | Supreme Scale | Unmatched quality |
| 841-860 | Ultimate Hide | Peak leather |
| 861-880 | Apex Pelt | Top predator |
| 881-900 | Zenith Scale | Highest tier |
| 901-920 | Final Form Fur | Maximum evolution |
| 921-940 | Endgame Hide | Nearly complete |
| 941-960 | Prestige Pelt | Reset quality |
| 961-980 | The Great Beast | Legendary creature |
| 981-999 | World Serpent Scale | Legendary, end-game |

---

### Foraging - Find Tiers (Every 20 Levels)

Foraging is unique - it yields random resources AND rare equipment finds!

| Levels | Location Type | Possible Finds |
|--------|---------------|----------------|
| 1-20 | Roadside | Scraps, common materials, copper gear |
| 21-40 | Fields | More resources, bronze gear |
| 41-60 | Forest Edge | Wood, herbs, iron gear |
| 61-80 | Abandoned Camp | Metal scraps, silver gear |
| 81-100 | Old Battlefield | Weapons, armor pieces |
| 101-120 | Ruins | Ancient items, mithril gear |
| 121-140 | Cave Entrance | Ores, gems, rare finds |
| 141-160 | Mountain Path | Valuable materials, gold gear |
| 161-180 | Ancient Temple | Magical items, platinum gear |
| 181-200 | Dragon's Hoard | Rare treasures, diamond gear |
| 201-220 | Void Rift | Strange materials |
| 221-240 | Celestial Grounds | Divine items |
| 241-260 | Titan's Rest | Massive finds |
| 261-280 | Phoenix Nest | Regenerating materials |
| 281-300 | Dragon Graveyard | Dragon gear drops increase |
| 301-320 | Cosmic Debris | Star materials |
| 321-340 | Time Ruins | Temporal items |
| 341-360 | Ethereal Plane | Ghostly finds |
| 361-380 | Divine Treasury | God-touched items |
| 381-400 | Primal Grounds | Ancient artifacts |
| 401+ | Legendary Zones | End-game rare finds |

#### Equipment Found While Foraging

**Weapons** (Rare drops, 100 fantasy names each):
- Swords, Broadswords, Maces, Axes, Daggers, Staffs, Wands

**Armor Pieces** (Rare drops):
- Helmets, Chestpieces, Pauldrons, Bracers, Gauntlets, Legguards, Boots, Cloaks

**Jewelry** (Very rare drops):
- Rings, Necklaces, Trinkets

**Material Tiers for Equipment:**
1. Copper (Common) - 40% of equipment drops
2. Bronze (Common) - 25%
3. Iron (Uncommon) - 15%
4. Silver (Uncommon) - 8%
5. Mithril (Rare) - 5%
6. Gold (Rare) - 3%
7. Platinum (Epic) - 2%
8. Diamond (Epic) - 1.5%
9. Dragon (Legendary) - 0.5%

---

### Smithing - Forge Tiers (Every 20 Levels)

Creates Plate & Mail armor and metal weapons.

| Levels | Forge Type | Products |
|--------|------------|----------|
| 1-20 | Stone Forge | Copper gear |
| 21-40 | Clay Forge | Bronze gear |
| 41-60 | Brick Forge | Iron gear |
| 61-80 | Iron Forge | Steel gear |
| 81-100 | Steel Forge | Silver gear |
| 101-120 | Mythril Forge | Mithril gear |
| 121-140 | Enchanted Forge | Gold gear |
| 141-160 | Arcane Forge | Platinum gear |
| 161-180 | Dragon Forge | Diamond gear |
| 181-200 | Divine Forge | Dragon gear |
| 201+ | Legendary Forges | Special items |

**Weapon Types Crafted:**
- Swords (1H, Strength)
- Broadswords (2H, Strength)
- Maces (1H, Strength)
- Axes (1H/2H, Strength)
- Daggers (1H, Agility)

**Armor Created:**
- Plate: Helmet, Chestplate, Pauldrons, Bracers, Gauntlets, Legguards, Boots
- Mail: Same slots, lighter weight

---

### Tailoring - Loom Tiers (Every 20 Levels)

Creates Cloth armor and magical off-hands.

| Levels | Loom Type | Products |
|--------|-----------|----------|
| 1-20 | Basic Loom | Simple cloth gear |
| 21-40 | Wooden Loom | Cotton gear |
| 41-60 | Bronze Loom | Linen gear |
| 61-80 | Iron Loom | Wool gear |
| 81-100 | Steel Loom | Silk gear |
| 101-120 | Enchanted Loom | Moonweave gear |
| 121-140 | Arcane Loom | Starcloth gear |
| 141-160 | Celestial Loom | Celestial robes |
| 161-180 | Divine Loom | Divine vestments |
| 181-200 | Cosmic Loom | Cosmic attire |

**Armor Created (Intellect focus):**
- Hood, Robe, Mantle, Wraps, Gloves, Leggings, Slippers, Cloak

**Off-hands Created:**
- Orbs, Tomes, Focus items

---

### Leatherworking - Workbench Tiers (Every 20 Levels)

Creates Leather armor from Skinning materials.

| Levels | Workbench Type | Products |
|--------|----------------|----------|
| 1-20 | Basic Bench | Rough leather gear |
| 21-40 | Wooden Bench | Light leather gear |
| 41-60 | Reinforced Bench | Medium leather gear |
| 61-80 | Master Bench | Fine leather gear |
| 81-100 | Artisan Bench | Exotic leather gear |
| 101+ | Legendary Benches | Special items |

**Armor Created (Agility focus):**
- Leather Helm, Vest, Shoulders, Bracers, Gloves, Pants, Boots

---

### Jewelcrafting - Jewelry Bench Tiers (Every 20 Levels)

Creates Rings, Necklaces, and Trinkets from gems and metals.

| Levels | Bench Type | Products |
|--------|------------|----------|
| 1-20 | Basic Jewelry Bench | Copper jewelry |
| 21-40 | Apprentice Bench | Bronze jewelry |
| 41-60 | Journeyman Bench | Silver jewelry |
| 61-80 | Expert Bench | Gold jewelry |
| 81-100 | Master Bench | Platinum jewelry |
| 101-120 | Artisan Bench | Mythril jewelry |
| 121+ | Legendary Benches | Diamond/Dragon jewelry |

**Products:**
- Rings (2 slots) - Various stat combinations
- Necklaces (1 slot) - Various stat combinations
- Trinkets (1 slot) - Special effects + stats

---

### Sawmill - Expanded Products

In addition to processing wood, the Sawmill creates:

**Weapons:**
- Staffs (2H, Intellect) - Various wood types
- Wands (1H, Intellect) - Various wood types

**Furniture (Sellable):**
- Chairs - Basic to ornate
- Tables - Dining, work, fancy
- Beds - From cot to royal
- Portraits - Frames and decorations
- Cabinets - Storage furniture
- Shelves - Display pieces

---

### Skills To Be Fleshed Out Later

**Engineering** - Gadgets, mechanical devices, tools
**Enchanting** - Magical enhancements for gear
**Alchemy** - Potions, elixirs, transmutations
**Cooking** - Food with stat buffs

---

## Immediate TODO

Priority tasks for the next development sprint:

1. [x] Finalize technology stack decision (TypeScript + React + Vite)
2. [x] Design XP curve formula (levels 1-999) - see GAME_MATH.md
3. [x] Create skill data structure - see `src/types/game.types.ts`
4. [ ] Design basic UI wireframes
5. [ ] Implement core game loop prototype
6. [ ] Create resource/item database schema
7. [x] Design Chaos Point earning formula - see GAME_MATH.md
8. [ ] Map out initial talent tree
9. [ ] Complete tier lists for all 20 skills (every 20 levels)
10. [x] Design mid-tier upgrade costs and scaling formula - see GAME_MATH.md
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
