/**
 * Ghallia Game Math Utilities
 * All formulas and calculations for game mechanics
 */

import {
  ItemQuality,
  RecipeComplexity,
  Skill,
  UpgradeType,
} from '../types/game.types';

import {
  BALANCE,
  SKILL_UNLOCK_COSTS,
  UPGRADE_BASE_COSTS,
  BASE_QUALITY_CHANCES,
  COMPLEXITY_TIME_MULTIPLIERS,
  COMPLEXITY_GOLD_MULTIPLIERS,
  GATHERING,
  PRESTIGE,
} from './constants';

// ============================================
// EXPERIENCE CALCULATIONS
// ============================================

/**
 * Calculate XP required for a specific level
 * Formula: floor((L + 300 × 2^(L/7)) / 4)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor((level + 300 * Math.pow(2, level / BALANCE.xp.levelExponent)) / 4);
}

/**
 * Calculate total XP needed to reach a level from level 1
 */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  let xpAccumulated = 0;

  while (level < BALANCE.limits.maxLevel) {
    const xpNeeded = xpForLevel(level);
    if (xpAccumulated + xpNeeded > totalXp) {
      break;
    }
    xpAccumulated += xpNeeded;
    level++;
  }

  return level;
}

/**
 * Calculate XP earned per action based on tier and bonuses
 */
export function xpPerAction(tier: number, xpBonusPercent: number = 0, talentMultiplier: number = 1): number {
  const baseXp = BALANCE.xp.base * Math.pow(BALANCE.xp.tierScale, tier - 1);
  return Math.floor(baseXp * (1 + xpBonusPercent / 100) * talentMultiplier);
}

/**
 * Get current tier from level
 */
export function getTierFromLevel(level: number): number {
  return Math.floor((level - 1) / 20) + 1;
}

// ============================================
// GOLD CALCULATIONS
// ============================================

/**
 * Calculate gold value of a resource
 */
export function resourceGoldValue(
  tier: number,
  quality: ItemQuality,
  goldBonusPercent: number = 0
): number {
  const tierMultiplier = Math.pow(BALANCE.gold.tierScale, tier - 1);
  const qualityMultiplier = BALANCE.gold.qualityMultipliers[quality];
  return Math.floor(BALANCE.gold.base * tierMultiplier * qualityMultiplier * (1 + goldBonusPercent / 100));
}

/**
 * Calculate gold value of a crafted item
 */
export function craftedItemGoldValue(
  materialValues: number[],
  complexity: RecipeComplexity,
  skillBonusPercent: number = 0
): number {
  const totalMaterialValue = materialValues.reduce((sum, val) => sum + val, 0);
  const complexityMultiplier = COMPLEXITY_GOLD_MULTIPLIERS[complexity];
  return Math.floor(totalMaterialValue * complexityMultiplier * (1 + skillBonusPercent / 100));
}

// ============================================
// SKILL UNLOCK COSTS
// ============================================

/**
 * Calculate cost to unlock the nth skill
 */
export function skillUnlockCost(unlockNumber: number): number {
  if (unlockNumber <= 0) return 0;
  if (unlockNumber <= 8) {
    return SKILL_UNLOCK_COSTS[unlockNumber as keyof typeof SKILL_UNLOCK_COSTS] ?? 0;
  }
  // After 8th skill, cost doubles each time from 1M base
  return 250_000 * Math.pow(2, unlockNumber - 6);
}

// ============================================
// MID-TIER UPGRADE COSTS
// ============================================

/**
 * Calculate cost of a mid-tier upgrade at a specific level
 */
export function upgradeCost(level: number, upgradeType: UpgradeType): number {
  const baseCost = UPGRADE_BASE_COSTS[upgradeType];
  const tierMultiplier = 1 + Math.floor(level / 100);
  return baseCost * level * tierMultiplier;
}

/**
 * Get levels where mid-tier upgrades are available
 * (10, 30, 50, 70, 90, 110, ...)
 */
export function getUpgradeLevels(maxLevel: number = BALANCE.limits.maxLevel): number[] {
  const levels: number[] = [];
  for (let i = 10; i <= maxLevel; i += 20) {
    levels.push(i);
  }
  return levels;
}

/**
 * Check if a level has an available upgrade
 */
export function hasUpgradeAvailable(level: number): boolean {
  return level >= 10 && (level - 10) % 20 === 0;
}

// ============================================
// GATHERING CALCULATIONS
// ============================================

/**
 * Calculate actual gather cooldown with speed bonuses
 */
export function gatherCooldown(speedBonusPercent: number = 0): number {
  return BALANCE.time.baseGatherCooldown / (1 + speedBonusPercent / 100);
}

/**
 * Calculate resources gathered (with yield and crit)
 */
export function calculateGatherYield(
  yieldBonusPercent: number = 0,
  critBonusPercent: number = 0
): { quantity: number; isCrit: boolean } {
  const critChance = GATHERING.baseCritChance + critBonusPercent / 100;
  const isCrit = Math.random() < critChance;
  const baseYield = 1 * (1 + yieldBonusPercent / 100);
  const quantity = Math.floor(baseYield * (isCrit ? GATHERING.critMultiplier : 1));

  return { quantity: Math.max(1, quantity), isCrit };
}

/**
 * Determine quality of gathered resource
 */
export function rollQuality(qualityBonusPercent: number = 0): ItemQuality {
  const roll = Math.random();

  // Adjust chances based on quality bonus
  // Quality bonus shifts probability from Normal to higher tiers
  const bonusFactor = qualityBonusPercent / 100;

  const legendaryChance = BASE_QUALITY_CHANCES[ItemQuality.LEGENDARY] * (1 + bonusFactor * 5);
  const epicChance = BASE_QUALITY_CHANCES[ItemQuality.EPIC] * (1 + bonusFactor * 4);
  const rareChance = BASE_QUALITY_CHANCES[ItemQuality.RARE] * (1 + bonusFactor * 3);
  const uncommonChance = BASE_QUALITY_CHANCES[ItemQuality.UNCOMMON] * (1 + bonusFactor * 2);

  if (roll < legendaryChance) return ItemQuality.LEGENDARY;
  if (roll < legendaryChance + epicChance) return ItemQuality.EPIC;
  if (roll < legendaryChance + epicChance + rareChance) return ItemQuality.RARE;
  if (roll < legendaryChance + epicChance + rareChance + uncommonChance) return ItemQuality.UNCOMMON;

  return ItemQuality.NORMAL;
}

// ============================================
// CRAFTING CALCULATIONS
// ============================================

/**
 * Calculate crafting time for a recipe
 */
export function craftTime(
  tier: number,
  complexity: RecipeComplexity,
  speedBonusPercent: number = 0
): number {
  const basetime = (BALANCE.time.baseCraftTime + tier * BALANCE.time.craftTierScale);
  const complexityMultiplier = COMPLEXITY_TIME_MULTIPLIERS[complexity];
  return (basetime * complexityMultiplier) / (1 + speedBonusPercent / 100);
}

/**
 * Calculate material requirements with efficiency bonus
 */
export function adjustedMaterialCost(
  baseCost: number,
  efficiencyBonusPercent: number = 0
): number {
  const minCost = Math.ceil(baseCost * 0.5); // Minimum 50% of base
  const adjustedCost = Math.ceil(baseCost * (1 - efficiencyBonusPercent / 100));
  return Math.max(minCost, adjustedCost);
}

/**
 * Check for multi-craft (double output)
 */
export function rollMultiCraft(multiCraftChancePercent: number = 0): boolean {
  return Math.random() < multiCraftChancePercent / 100;
}

// ============================================
// PRESTIGE CALCULATIONS
// ============================================

/**
 * Check if player can prestige
 */
export function canPrestige(skills: Skill[]): boolean {
  const eligibleSkills = skills.filter(s => s.level >= PRESTIGE.levelThreshold);
  return eligibleSkills.length >= PRESTIGE.minSkillsAtThreshold;
}

/**
 * Calculate Chaos Points earned from prestige
 */
export function calculateChaosPoints(
  skills: Skill[],
  gold: number,
  prestigeTalentBonus: number = 0
): number {
  const eligibleSkills = skills.filter(s => s.level >= PRESTIGE.levelThreshold);

  if (eligibleSkills.length < PRESTIGE.minSkillsAtThreshold) {
    return 0;
  }

  // Skill bonus: sum of floor(level / 10) for each eligible skill
  const skillBonus = eligibleSkills.reduce(
    (sum, skill) => sum + Math.floor(skill.level / PRESTIGE.skillBonusDivisor),
    0
  );

  // Gold bonus: log10 of gold
  const goldBonus = Math.floor(Math.log10(Math.max(1, gold)));

  // Multiplier for extra skills beyond 5
  const extraSkills = eligibleSkills.length - PRESTIGE.minSkillsAtThreshold;
  const skillsMultiplier = 1 + extraSkills * PRESTIGE.extraSkillMultiplier;

  // Talent multiplier
  const talentMultiplier = 1 + prestigeTalentBonus / 100;

  return Math.floor(
    (BALANCE.prestige.baseChaosPoints + skillBonus + goldBonus) *
    skillsMultiplier *
    talentMultiplier
  );
}

/**
 * Get prestige summary for UI
 */
export function getPrestigeSummary(skills: Skill[], gold: number): {
  canPrestige: boolean;
  eligibleSkills: number;
  chaosPoints: number;
  skillsNeeded: number;
} {
  const eligibleSkills = skills.filter(s => s.level >= PRESTIGE.levelThreshold).length;
  const skillsNeeded = Math.max(0, PRESTIGE.minSkillsAtThreshold - eligibleSkills);
  const cp = eligibleSkills >= PRESTIGE.minSkillsAtThreshold
    ? calculateChaosPoints(skills, gold)
    : 0;

  return {
    canPrestige: eligibleSkills >= PRESTIGE.minSkillsAtThreshold,
    eligibleSkills,
    chaosPoints: cp,
    skillsNeeded,
  };
}

// ============================================
// TALENT CALCULATIONS
// ============================================

/**
 * Calculate cost for next talent rank
 */
export function talentRankCost(
  baseCost: number,
  currentRank: number,
  talentTier: number
): number {
  const tierMultiplier = [1, 1, 2, 5, 10, 25][talentTier] ?? 1;
  return baseCost * (currentRank + 1) * tierMultiplier;
}

/**
 * Calculate total bonus from a talent
 */
export function talentTotalBonus(effectPerRank: number, ranks: number): number {
  return effectPerRank * ranks;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toFixed(0);
}

/**
 * Format time duration
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate percentage progress to next level
 */
export function levelProgress(currentXp: number, level: number): number {
  const xpForCurrent = totalXpForLevel(level);
  const xpForNext = totalXpForLevel(level + 1);
  const xpNeeded = xpForNext - xpForCurrent;
  const xpProgress = currentXp - xpForCurrent;
  return clamp((xpProgress / xpNeeded) * 100, 0, 100);
}
