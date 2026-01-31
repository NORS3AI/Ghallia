/**
 * Ghallia Game Constants
 * All balance values and configuration constants
 */

import { ItemQuality, RecipeComplexity, UpgradeType, BalanceConfig } from '../types/game.types';

// ============================================
// CORE BALANCE CONFIG
// ============================================

export const BALANCE: BalanceConfig = {
  xp: {
    base: 10,
    tierScale: 1.15,
    levelExponent: 7,
  },
  gold: {
    base: 0.01,    // 0.01g per tier 1 resource (super grindy medieval economy)
    tierScale: 1.5, // 1.5x scaling per tier
    qualityMultipliers: {
      [ItemQuality.NORMAL]: 1.0,
      [ItemQuality.UNCOMMON]: 1.5,
      [ItemQuality.RARE]: 2.5,
      [ItemQuality.EPIC]: 5.0,
      [ItemQuality.LEGENDARY]: 10.0,
    },
  },
  time: {
    baseGatherCooldown: 1.0,
    baseCraftTime: 5,
    craftTierScale: 2,
  },
  prestige: {
    baseChaosPoints: 100,
    skillRequirement: 5,
    levelRequirement: 99,
  },
  limits: {
    maxLevel: 999,
    maxQueue: 100,
    minClickInterval: 100,
  },
};

// ============================================
// SKILL UNLOCK COSTS (Fast early game!)
// ============================================

export const SKILL_UNLOCK_COSTS = {
  1: 0,           // Logging (free) - instant
  2: 50,          // Sawmill - cheap to get started
  3: 10_000,      // 3rd skill
  4: 50_000,      // 4th skill
  5: 250_000,     // 5th skill
  6: 1_000_000,   // 6th skill
  7: 2_500_000,   // 7th skill
  8: 5_000_000,   // 8th skill
  // 9+ calculated dynamically (doubles each time)
};

// ============================================
// EARLY GAME XP MULTIPLIERS
// ============================================

export const EARLY_GAME_XP_MULTIPLIERS = {
  1: 3.0,    // Levels 1-10: 3x XP (tutorial)
  11: 2.0,   // Levels 11-20: 2x XP (engagement)
  21: 1.5,   // Levels 21-50: 1.5x XP (hook)
  51: 1.0,   // Levels 51+: normal
};

/**
 * Get XP multiplier based on current level (for fast early game)
 */
export function getEarlyGameMultiplier(level: number): number {
  if (level <= 10) return EARLY_GAME_XP_MULTIPLIERS[1];
  if (level <= 20) return EARLY_GAME_XP_MULTIPLIERS[11];
  if (level <= 50) return EARLY_GAME_XP_MULTIPLIERS[21];
  return EARLY_GAME_XP_MULTIPLIERS[51];
}

// ============================================
// SUPPORT SKILL COSTS (Chaos Points)
// ============================================

export const SUPPORT_SKILL_CP_COSTS = {
  trading: 100,
  farming: 150,
  runecrafting: 200,
  archaeology: 250,
};

// ============================================
// MID-TIER UPGRADE COSTS
// ============================================

export const UPGRADE_BASE_COSTS: Record<UpgradeType, number> = {
  [UpgradeType.SPEED]: 100,
  [UpgradeType.YIELD]: 150,
  [UpgradeType.XP]: 125,
  [UpgradeType.CRIT]: 200,
  [UpgradeType.QUALITY]: 175,
};

export const UPGRADE_EFFECTS: Record<UpgradeType, number> = {
  [UpgradeType.SPEED]: 1,     // +1% per upgrade
  [UpgradeType.YIELD]: 1,     // +1% per upgrade
  [UpgradeType.XP]: 1,        // +1% per upgrade
  [UpgradeType.CRIT]: 0.5,    // +0.5% per upgrade
  [UpgradeType.QUALITY]: 1,   // +1% per upgrade
};

// ============================================
// CRAFTING COMPLEXITY MULTIPLIERS
// ============================================

export const COMPLEXITY_TIME_MULTIPLIERS: Record<RecipeComplexity, number> = {
  [RecipeComplexity.BASIC]: 1.0,
  [RecipeComplexity.INTERMEDIATE]: 1.5,
  [RecipeComplexity.ADVANCED]: 2.5,
  [RecipeComplexity.MASTER]: 4.0,
  [RecipeComplexity.LEGENDARY]: 10.0,
};

export const COMPLEXITY_GOLD_MULTIPLIERS: Record<RecipeComplexity, number> = {
  [RecipeComplexity.BASIC]: 1.5,
  [RecipeComplexity.INTERMEDIATE]: 2.0,
  [RecipeComplexity.ADVANCED]: 3.0,
  [RecipeComplexity.MASTER]: 5.0,
  [RecipeComplexity.LEGENDARY]: 10.0,
};

export const COMPLEXITY_MATERIAL_BASE: Record<RecipeComplexity, number> = {
  [RecipeComplexity.BASIC]: 5,
  [RecipeComplexity.INTERMEDIATE]: 10,
  [RecipeComplexity.ADVANCED]: 25,
  [RecipeComplexity.MASTER]: 50,
  [RecipeComplexity.LEGENDARY]: 100,
};

// ============================================
// QUALITY DROP RATES
// ============================================

export const BASE_QUALITY_CHANCES: Record<ItemQuality, number> = {
  [ItemQuality.NORMAL]: 0.80,
  [ItemQuality.UNCOMMON]: 0.15,
  [ItemQuality.RARE]: 0.04,
  [ItemQuality.EPIC]: 0.009,
  [ItemQuality.LEGENDARY]: 0.001,
};

// ============================================
// TALENT CONFIGURATION
// ============================================

export const TALENT_CONFIG = {
  xpBoost: {
    effectPerRank: 5,    // +5% per rank
    maxRanks: 20,
    baseCost: 10,
  },
  goldMultiplier: {
    effectPerRank: 3,    // +3% per rank
    maxRanks: 20,
    baseCost: 10,
  },
  craftingSpeed: {
    effectPerRank: 4,    // +4% per rank
    maxRanks: 25,
    baseCost: 10,
  },
  multiCraft: {
    effectPerRank: 2,    // +2% per rank
    maxRanks: 25,
    baseCost: 15,
  },
  resourceEfficiency: {
    effectPerRank: 2,    // -2% materials per rank
    maxRanks: 25,
    baseCost: 15,
  },
  rareFinds: {
    effectPerRank: 1,    // +1% per rank
    maxRanks: 20,
    baseCost: 20,
  },
  idleEfficiency: {
    effectPerRank: 5,    // +5% per rank
    maxRanks: 20,
    baseCost: 15,
  },
  prestigeBonus: {
    effectPerRank: 5,    // +5% per rank
    maxRanks: 20,
    baseCost: 25,
  },
};

export const TALENT_TIER_MULTIPLIERS = {
  1: 1,
  2: 2,
  3: 5,
  4: 10,  // Requires Prestige 5+
  5: 25,  // Requires Prestige 10+
};

// ============================================
// GATHERING CONSTANTS
// ============================================

export const GATHERING = {
  baseCritChance: 0.05,           // 5% base crit
  critMultiplier: 2,              // Double resources on crit
  maxClicksPerSecond: 10,         // Anti-macro limit
};

// ============================================
// PRESTIGE CONSTANTS
// ============================================

export const PRESTIGE = {
  minSkillsAtThreshold: 5,
  levelThreshold: 99,
  skillBonusDivisor: 10,          // floor(level / 10) bonus
  extraSkillMultiplier: 0.2,      // +20% per skill beyond 5
};

// ============================================
// UI CONSTANTS
// ============================================

export const UI = {
  maxVisibleQueueItems: 10,
  saveInterval: 30_000,           // Auto-save every 30s
  tickInterval: 100,              // Game tick every 100ms
  numberFormatThreshold: 1_000_000,
};

// ============================================
// VERSION
// ============================================

export const GAME_VERSION = '0.1.0';
