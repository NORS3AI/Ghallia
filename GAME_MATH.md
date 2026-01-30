# Ghallia - Game Mathematics & Formulas

This document contains all mathematical formulas, curves, and balancing values for Ghallia.

---

## Table of Contents

1. [Experience System](#experience-system)
2. [Gold Economy](#gold-economy)
3. [Skill Unlock Costs](#skill-unlock-costs)
4. [Mid-Tier Upgrades](#mid-tier-upgrades)
5. [Gathering Mechanics](#gathering-mechanics)
6. [Crafting Mechanics](#crafting-mechanics)
7. [Prestige & Chaos Points](#prestige--chaos-points)
8. [Talent System](#talent-system)
9. [Tier Scaling](#tier-scaling)
10. [Time Estimates](#time-estimates)

---

## Experience System

### XP Required Per Level

Uses a modified exponential curve inspired by RuneScape, scaled for 999 levels.

```
XP_FOR_LEVEL(L) = floor(L + 300 × 2^(L/7)) / 4

TOTAL_XP_TO_LEVEL(L) = Σ XP_FOR_LEVEL(i) for i = 1 to L-1
```

#### Key Level Milestones

| Level | XP to Next | Total XP | Tier Unlock |
|-------|------------|----------|-------------|
| 1 | 83 | 0 | Starter |
| 10 | 388 | 1,154 | Mid-tier upgrade |
| 20 | 1,154 | 4,470 | Tier 2 |
| 50 | 13,363 | 101,333 | Mid-tier |
| 99 | 191,452 | 13,034,431 | Prestige eligible |
| 100 | 197,993 | 13,225,883 | Tier 6 |
| 200 | 3,258,594 | 496,254,719 | Tier 11 |
| 500 | 879,613,412 | ~87 billion | Tier 26 |
| 999 | ~1.2 trillion | ~600 trillion | Max level |

### XP Earned Per Action

Base XP earned depends on skill type and tier:

```
BASE_XP(tier) = 10 × (1.15)^tier

ACTUAL_XP = BASE_XP × (1 + xp_bonus_percent/100) × talent_multiplier
```

| Tier | Level Range | Base XP per Action |
|------|-------------|-------------------|
| 1 | 1-20 | 10 |
| 2 | 21-40 | 11.5 |
| 3 | 41-60 | 13.2 |
| 4 | 61-80 | 15.2 |
| 5 | 81-100 | 17.5 |
| 10 | 181-200 | 40.5 |
| 20 | 381-400 | 163.7 |
| 30 | 581-600 | 662.1 |
| 40 | 781-800 | 2,678.6 |
| 50 | 981-999 | 10,836.7 |

---

## Gold Economy

### Selling Resources (Raw Materials)

```
GOLD_VALUE(tier, quality) = BASE_GOLD × tier_multiplier × quality_multiplier × (1 + gold_bonus/100)

BASE_GOLD = 5
tier_multiplier = 1.2^(tier - 1)
quality_multiplier:
  - Normal: 1.0
  - Uncommon: 1.5
  - Rare: 2.5
  - Epic: 5.0
  - Legendary: 10.0
```

| Tier | Level Range | Gold per Normal Resource |
|------|-------------|-------------------------|
| 1 | 1-20 | 5g |
| 2 | 21-40 | 6g |
| 3 | 41-60 | 7g |
| 5 | 81-100 | 10g |
| 10 | 181-200 | 31g |
| 20 | 381-400 | 191g |
| 30 | 581-600 | 1,181g |
| 40 | 781-800 | 7,306g |
| 50 | 981-999 | 45,198g |

### Selling Crafted Items

Crafted items sell for more than raw materials:

```
CRAFTED_VALUE = Σ(material_values) × craft_multiplier × (1 + skill_bonus/100)

craft_multiplier:
  - Basic recipe: 1.5
  - Intermediate: 2.0
  - Advanced: 3.0
  - Master: 5.0
  - Legendary: 10.0
```

---

## Skill Unlock Costs

### Base Unlock Costs

Designed for rapid early progression - player should unlock Sawmill within 2 minutes.

| Unlock # | Skill | Cost | Expected Time |
|----------|-------|------|---------------|
| 1 | Logging | FREE | Instant |
| 2 | Sawmill | 100g | ~1-2 minutes |
| 3 | Any | 1,000g | ~5 minutes |
| 4 | Any | 5,000g | ~15 minutes |
| 5 | Any | 25,000g | ~45 minutes |
| 6 | Any | 100,000g | ~2 hours |
| 7 | Any | 250,000g | ~4 hours |
| 8 | Any | 500,000g | ~8 hours |
| 9+ | Any | Previous × 2 | Continues doubling |

### Formula

```
UNLOCK_COST(n) =
  n = 1: 0 (Logging is free)
  n = 2: 100 (Sawmill - fast unlock!)
  n = 3: 1,000
  n = 4: 5,000
  n = 5: 25,000
  n = 6: 100,000
  n >= 7: 250,000 × 2^(n-7)
```

### Support Skills (Post-Prestige 1)

Support skills cost Chaos Points instead of gold:

| Support Skill | Chaos Point Cost |
|---------------|------------------|
| Trading | 100 CP |
| Farming | 150 CP |
| Runecrafting | 200 CP |
| Archaeology | 250 CP |

---

## Mid-Tier Upgrades

Available every 10 levels (10, 30, 50, 70, etc.)

### Cost Formula

```
UPGRADE_COST(level, upgrade_type) = BASE_COST × level × tier_multiplier

BASE_COST values:
  - Speed Boost: 100g
  - Yield Boost: 150g
  - XP Boost: 125g
  - Crit Chance: 200g
  - Quality Boost: 175g

tier_multiplier = 1 + floor(level / 100)
```

### Example Costs

| Level | Speed (+1%) | Yield (+1%) | XP (+1%) | Crit (+0.5%) | Quality (+1%) |
|-------|-------------|-------------|----------|--------------|---------------|
| 10 | 1,000g | 1,500g | 1,250g | 2,000g | 1,750g |
| 50 | 5,000g | 7,500g | 6,250g | 10,000g | 8,750g |
| 110 | 22,000g | 33,000g | 27,500g | 44,000g | 38,500g |
| 250 | 75,000g | 112,500g | 93,750g | 150,000g | 131,250g |
| 510 | 306,000g | 459,000g | 382,500g | 612,000g | 535,500g |
| 990 | 990,000g | 1,485,000g | 1,237,500g | 1,980,000g | 1,732,500g |

### Maximum Bonuses (All Upgrades Purchased)

At level 990, if all mid-tier upgrades purchased (99 upgrades per type):

| Upgrade Type | Total Bonus |
|--------------|-------------|
| Speed Boost | +99% faster |
| Yield Boost | +99% more resources |
| XP Boost | +99% more XP |
| Crit Chance | +49.5% double chance |
| Quality Boost | +99% rare chance |

---

## Gathering Mechanics

### Click-Based Gathering

Each click/tap gathers resources. Speed affected by bonuses.

```
BASE_GATHER_TIME = 1.0 seconds (time between valid clicks)
ACTUAL_GATHER_TIME = BASE_GATHER_TIME / (1 + speed_bonus/100)

RESOURCES_PER_GATHER = 1 × (1 + yield_bonus/100) × crit_multiplier

crit_multiplier:
  - No crit: 1
  - Crit (double): 2
  - Crit chance = base_crit + crit_bonus
  - base_crit = 5%
```

### Resource Quality Chances

```
BASE_QUALITY_CHANCES:
  - Normal: 80%
  - Uncommon: 15%
  - Rare: 4%
  - Epic: 0.9%
  - Legendary: 0.1%

WITH_QUALITY_BONUS:
  Each +1% quality bonus shifts 1% from Normal to higher tiers
  (distributed proportionally)
```

### Gathering Speed Limits

To prevent auto-clicker abuse:

```
MIN_CLICK_INTERVAL = 100ms (10 clicks/second max)
ANTI_MACRO_DETECTION = Flag accounts with >95% consistent timing
```

---

## Crafting Mechanics

### Idle Crafting Queue

Crafting happens passively. Queue up to 100 items.

```
BASE_CRAFT_TIME(tier, recipe_complexity) =
  (5 + tier × 2) × complexity_multiplier seconds

complexity_multiplier:
  - Basic: 1.0
  - Intermediate: 1.5
  - Advanced: 2.5
  - Master: 4.0
  - Legendary: 10.0

ACTUAL_CRAFT_TIME = BASE_CRAFT_TIME / (1 + crafting_speed_bonus/100)
```

### Craft Time Examples

| Tier | Basic | Intermediate | Advanced | Master |
|------|-------|--------------|----------|--------|
| 1 | 7s | 10.5s | 17.5s | 28s |
| 5 | 15s | 22.5s | 37.5s | 60s |
| 10 | 25s | 37.5s | 62.5s | 100s |
| 20 | 45s | 67.5s | 112.5s | 180s |
| 50 | 105s | 157.5s | 262.5s | 420s |

### Recipe Requirements

```
MATERIALS_REQUIRED(tier, complexity) = base_materials × tier_scaling

base_materials:
  - Basic: 5 resources
  - Intermediate: 10 resources
  - Advanced: 25 resources
  - Master: 50 resources
  - Legendary: 100 resources

tier_scaling = 1 + (tier - 1) × 0.1
```

### Multi-Craft Chance

With talent bonuses:

```
MULTI_CRAFT_CHANCE = talent_multi_craft_percent

If triggered:
  ITEMS_CRAFTED = 2 (double output, same materials)
```

---

## Prestige & Chaos Points

### Prestige Requirements

- Minimum: 5 skills at level 99+
- Resets: All gold, all skill levels, all crafted items, all mid-tier upgrades
- Keeps: Chaos Points, Talents, Support Skills unlocked

### Chaos Points Formula

```
BASE_CP = 100

SKILL_BONUS = Σ floor(skill_level / 10) for each skill at 99+
  (e.g., level 99 = 9 bonus, level 150 = 15 bonus, level 999 = 99 bonus)

GOLD_BONUS = floor(log10(total_gold))
  (e.g., 1M gold = 6 bonus, 1B gold = 9 bonus)

SKILLS_MULTIPLIER = 1 + (skills_at_99_plus - 5) × 0.2
  (each additional skill beyond 5 adds 20%)

TOTAL_CP = floor(BASE_CP + SKILL_BONUS + GOLD_BONUS) × SKILLS_MULTIPLIER × prestige_talent_multiplier
```

### Example Chaos Point Earnings

| Scenario | Skills@99+ | Avg Level | Gold | CP Earned |
|----------|------------|-----------|------|-----------|
| First prestige (minimum) | 5 @ 99 | 99 | 100K | 150 CP |
| Better first prestige | 5 @ 99 | 99 | 1M | 156 CP |
| Second prestige | 7 @ 120 | 105 | 5M | 280 CP |
| Late game | 10 @ 200 | 180 | 100M | 520 CP |
| End game | 16 @ 500 | 400 | 10B | 2,100 CP |
| Max efficiency | 16 @ 999 | 999 | 1T | 5,500 CP |

---

## Talent System

### Talent Costs

Talents cost increasing Chaos Points:

```
TALENT_COST(rank) = BASE_CP × rank × tier_multiplier

BASE_CP = 10 (for Tier 1 talents)
tier_multiplier:
  - Tier 1 talents: 1
  - Tier 2 talents: 2
  - Tier 3 talents: 5
  - Tier 4 talents: 10 (requires Prestige 5+)
  - Tier 5 talents: 25 (requires Prestige 10+)
```

### Talent Effects

#### XP Boost Talents
```
Per rank: +5% XP to specific skill category
Max ranks: 20
Max bonus: +100% XP
```

#### Gold Multiplier Talents
```
Per rank: +3% gold from sales
Max ranks: 20
Max bonus: +60% gold
```

#### Crafting Speed Talents
```
Per rank: +4% crafting speed
Max ranks: 25
Max bonus: +100% crafting speed
```

#### Multi-Craft Talents
```
Per rank: +2% chance to double craft
Max ranks: 25
Max bonus: +50% double craft chance
```

#### Resource Efficiency Talents
```
Per rank: -2% material requirements (min 50%)
Max ranks: 25
Max bonus: -50% materials needed
```

#### Rare Finds Talents
```
Per rank: +1% rare resource chance
Max ranks: 20
Max bonus: +20% rare chance
```

#### Idle Efficiency Talents
```
Per rank: +5% offline crafting speed
Max ranks: 20
Max bonus: +100% offline speed
```

#### Prestige Bonus Talents
```
Per rank: +5% Chaos Points earned
Max ranks: 20
Max bonus: +100% CP earned
```

---

## Tier Scaling

### Resource Value Scaling

Each tier (every 20 levels) increases resource value:

```
TIER_VALUE_MULTIPLIER = 1.2^(tier - 1)

Tier 1 (1-20): 1.0x
Tier 5 (81-100): 2.07x
Tier 10 (181-200): 5.16x
Tier 25 (481-500): 72.8x
Tier 50 (981-999): 9,100x
```

### XP Scaling per Tier

Higher tiers give more XP per action:

```
TIER_XP_MULTIPLIER = 1.15^(tier - 1)

Tier 1: 1.0x
Tier 5: 1.75x
Tier 10: 3.52x
Tier 25: 28.6x
Tier 50: 1,083x
```

---

## Early Game Pacing (Critical!)

**Design Goal:** Player should never go more than 30 seconds without a reward in the first 10 minutes.

### First 10 Minutes Timeline

| Time | Event | Reward Type |
|------|-------|-------------|
| 0:00 | First click | Resource gathered! |
| 0:05 | Level 2 | LEVEL UP! |
| 0:15 | Level 3 | LEVEL UP! |
| 0:30 | Level 4 | LEVEL UP! |
| 0:45 | 50g earned | Can sell stack! |
| 1:00 | Level 5 | LEVEL UP! |
| 1:30 | 100g saved | **SAWMILL UNLOCKS!** |
| 2:00 | Level 6 + craft queued | First craft started! |
| 2:30 | First craft completes | Item crafted! Sell for profit! |
| 3:00 | Level 7-8 | Two levels! |
| 4:00 | Level 10 | **MID-TIER UPGRADE AVAILABLE!** |
| 5:00 | 1,000g saved | **3RD SKILL UNLOCKS!** |
| 7:00 | Level 15 | Halfway to tier 2! |
| 10:00 | Level 20 | **NEW TIER! Oak trees unlocked!** |

### Early Level Speed

Levels 1-20 should fly by:

```
EARLY_GAME_XP_MULTIPLIER:
  Levels 1-10: 3x XP (tutorial phase)
  Levels 11-20: 2x XP (engagement phase)
  Levels 21-50: 1.5x XP (hook phase)
  Levels 51+: 1x XP (normal)
```

| Level | XP Needed | Clicks to Level (with bonus) |
|-------|-----------|------------------------------|
| 1→2 | 83 | ~3 clicks |
| 2→3 | 91 | ~3 clicks |
| 5→6 | 117 | ~4 clicks |
| 9→10 | 163 | ~6 clicks |
| 19→20 | 386 | ~20 clicks |

### Dopamine Checklist

Every session should include:
- [ ] Level up within 30 seconds of starting
- [ ] New unlock within 2 minutes
- [ ] Visual feedback on every click (numbers, particles)
- [ ] Audio feedback (optional but recommended)
- [ ] Progress bar always visibly moving
- [ ] "New!" badges on unlocked content
- [ ] Achievement popups for milestones

---

## Time Estimates

### Estimated Play Time (Revised)

Based on average active play (gathering) and idle time (crafting):

| Milestone | Estimated Time |
|-----------|---------------|
| Level 10 (first upgrade) | ~4 minutes |
| Level 20 (first tier complete) | ~12 minutes |
| Level 50 | ~2 hours |
| Level 99 (prestige ready) | ~15 hours |
| 5 skills to 99 | ~60 hours |
| First prestige | ~60-80 hours |
| Level 200 | ~150 hours |
| Level 500 | ~800 hours |
| Level 999 | ~4,000+ hours |
| All skills 999 | ~40,000+ hours |

### Skill Unlock Pacing

| Skills Unlocked | Time Played | Player State |
|-----------------|-------------|--------------|
| 1 (Logging) | 0 min | Excited, learning |
| 2 (Sawmill) | 2 min | "Oh cool, crafting!" |
| 3 (choice) | 5 min | "I get to choose!" |
| 4 (choice) | 15 min | Invested, planning ahead |
| 5 (choice) | 45 min | Ready to prestige eventually |
| 6+ | 2+ hours | Deep into the game |

### Daily Progress (Casual Player)

Assuming 1 hour active + 8 hours idle per day:

```
DAILY_XP ≈ (active_xp_per_hour × 1) + (idle_xp_per_hour × 8 × 0.5)
DAILY_GOLD ≈ items_crafted × avg_value
```

---

## Balance Constants

### Global Multipliers

```typescript
const BALANCE = {
  // XP
  XP_BASE: 10,
  XP_TIER_SCALE: 1.15,
  XP_LEVEL_EXPONENT: 7,

  // Gold
  GOLD_BASE: 5,
  GOLD_TIER_SCALE: 1.2,

  // Time
  BASE_GATHER_COOLDOWN: 1.0,
  BASE_CRAFT_TIME: 5,
  CRAFT_TIER_SCALE: 2,

  // Prestige
  PRESTIGE_BASE_CP: 100,
  PRESTIGE_SKILL_REQUIREMENT: 5,
  PRESTIGE_LEVEL_REQUIREMENT: 99,

  // Limits
  MAX_LEVEL: 999,
  MAX_QUEUE: 100,
  MIN_CLICK_INTERVAL: 100,

  // Quality
  QUALITY_NORMAL: 0.80,
  QUALITY_UNCOMMON: 0.15,
  QUALITY_RARE: 0.04,
  QUALITY_EPIC: 0.009,
  QUALITY_LEGENDARY: 0.001,
};
```

---

## Formulas Summary (Code Reference)

```typescript
// XP to reach level L
function xpForLevel(level: number): number {
  return Math.floor((level + 300 * Math.pow(2, level / 7)) / 4);
}

// Total XP needed for level L
function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

// Gold value of resource
function resourceGoldValue(tier: number, quality: string): number {
  const qualityMult = { normal: 1, uncommon: 1.5, rare: 2.5, epic: 5, legendary: 10 };
  return Math.floor(5 * Math.pow(1.2, tier - 1) * qualityMult[quality]);
}

// Chaos Points earned
function calculateChaosPoints(skills: Skill[], gold: number): number {
  const eligibleSkills = skills.filter(s => s.level >= 99);
  const skillBonus = eligibleSkills.reduce((sum, s) => sum + Math.floor(s.level / 10), 0);
  const goldBonus = Math.floor(Math.log10(Math.max(1, gold)));
  const multiplier = 1 + (eligibleSkills.length - 5) * 0.2;
  return Math.floor((100 + skillBonus + goldBonus) * multiplier);
}

// Skill unlock cost (fast early game!)
function skillUnlockCost(unlockNumber: number): number {
  if (unlockNumber === 1) return 0;      // Logging free
  if (unlockNumber === 2) return 100;    // Sawmill ~2 min
  if (unlockNumber === 3) return 1000;   // ~5 min
  if (unlockNumber === 4) return 5000;   // ~15 min
  if (unlockNumber === 5) return 25000;  // ~45 min
  if (unlockNumber === 6) return 100000; // ~2 hours
  return 250000 * Math.pow(2, unlockNumber - 7);
}

// Mid-tier upgrade cost
function upgradeCost(level: number, basePrice: number): number {
  const tierMult = 1 + Math.floor(level / 100);
  return basePrice * level * tierMult;
}
```

---

*Last Updated: January 29, 2026*
