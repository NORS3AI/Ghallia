/**
 * Ghallia Game Types
 * Core type definitions for all game entities
 */

// ============================================
// ENUMS
// ============================================

export enum SkillCategory {
  GATHERING = 'gathering',
  CRAFTING = 'crafting',
  SUPPORT = 'support',
}

export enum SkillType {
  // Gathering (Active - Click-based)
  LOGGING = 'logging',
  MINING = 'mining',
  FISHING = 'fishing',
  HERBALISM = 'herbalism',
  SKINNING = 'skinning',
  FORAGING = 'foraging',
  HUNTING = 'hunting',

  // Crafting (Idle - Queue-based)
  SAWMILL = 'sawmill',
  SMITHING = 'smithing',
  COOKING = 'cooking',
  ALCHEMY = 'alchemy',
  LEATHERWORKING = 'leatherworking',
  TAILORING = 'tailoring',
  JEWELCRAFTING = 'jewelcrafting',
  ENCHANTING = 'enchanting',
  ENGINEERING = 'engineering',

  // Support (Post-Prestige 1)
  TRADING = 'trading',
  FARMING = 'farming',
  RUNECRAFTING = 'runecrafting',
  ARCHAEOLOGY = 'archaeology',
}

export enum ItemQuality {
  NORMAL = 'normal',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum RecipeComplexity {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  MASTER = 'master',
  LEGENDARY = 'legendary',
}

export enum UpgradeType {
  SPEED = 'speed',
  YIELD = 'yield',
  XP = 'xp',
  CRIT = 'crit',
  QUALITY = 'quality',
}

export enum TalentCategory {
  XP_BOOST = 'xp_boost',
  GOLD_MULTIPLIER = 'gold_multiplier',
  CRAFTING_SPEED = 'crafting_speed',
  MULTI_CRAFT = 'multi_craft',
  RESOURCE_EFFICIENCY = 'resource_efficiency',
  RARE_FINDS = 'rare_finds',
  IDLE_EFFICIENCY = 'idle_efficiency',
  PRESTIGE_BONUS = 'prestige_bonus',
}

// ============================================
// INTERFACES
// ============================================

export interface Skill {
  id: SkillType;
  name: string;
  category: SkillCategory;
  level: number;
  currentXp: number;
  totalXp: number;
  unlocked: boolean;
  upgrades: SkillUpgrades;
}

export interface SkillUpgrades {
  speed: number;      // +1% per upgrade
  yield: number;      // +1% per upgrade
  xp: number;         // +1% per upgrade
  crit: number;       // +0.5% per upgrade
  quality: number;    // +1% per upgrade
}

export interface SkillTier {
  tier: number;
  minLevel: number;
  maxLevel: number;
  name: string;
  description: string;
  resourceId: string;
}

export interface Resource {
  id: string;
  name: string;
  skillType: SkillType;
  tier: number;
  quality: ItemQuality;
  baseValue: number;
  stackSize: number;
}

export interface InventoryItem {
  resourceId: string;
  quantity: number;
  quality: ItemQuality;
}

export interface Recipe {
  id: string;
  name: string;
  skillType: SkillType;
  requiredLevel: number;
  complexity: RecipeComplexity;
  materials: RecipeMaterial[];
  output: RecipeOutput;
  craftTime: number; // base seconds
}

export interface RecipeMaterial {
  resourceId: string;
  quantity: number;
  quality?: ItemQuality; // minimum quality required
}

export interface RecipeOutput {
  resourceId: string;
  quantity: number;
}

export interface CraftingQueueItem {
  recipeId: string;
  quantity: number;
  startTime: number;
  endTime: number;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  category: TalentCategory;
  tier: number;
  maxRanks: number;
  currentRanks: number;
  effectPerRank: number;
  baseCost: number;
  prerequisiteIds: string[];
  prestigeRequired: number;
}

export interface PlayerStats {
  totalGold: number;
  totalXpEarned: number;
  totalResourcesGathered: number;
  totalItemsCrafted: number;
  totalItemsSold: number;
  totalClicks: number;
  totalPlayTime: number; // seconds
  prestigeCount: number;
  highestLevel: number;
}

export interface PrestigeData {
  count: number;
  chaosPoints: number;
  totalChaosPointsEarned: number;
  talents: Record<string, number>; // talentId -> ranks
  supportSkillsUnlocked: SkillType[];
}

// ============================================
// GAME STATE
// ============================================

export interface GameState {
  // Core
  gold: number;
  skills: Record<SkillType, Skill>;
  inventory: InventoryItem[];
  craftingQueue: CraftingQueueItem[];

  // Progression
  skillsUnlocked: number;
  prestige: PrestigeData;

  // Stats
  stats: PlayerStats;

  // Meta
  lastSaveTime: number;
  lastTickTime: number;
  gameVersion: string;
}

// ============================================
// ACTIONS
// ============================================

export interface GatherResult {
  resourceId: string;
  quantity: number;
  quality: ItemQuality;
  xpGained: number;
  isCrit: boolean;
}

export interface CraftResult {
  recipeId: string;
  outputId: string;
  quantity: number;
  xpGained: number;
  isDoubleCraft: boolean;
}

export interface SellResult {
  resourceId: string;
  quantity: number;
  goldEarned: number;
}

export interface PrestigeResult {
  chaosPointsEarned: number;
  skillsReset: SkillType[];
  goldLost: number;
}

// ============================================
// CONFIG TYPES
// ============================================

export interface SkillConfig {
  id: SkillType;
  name: string;
  category: SkillCategory;
  description: string;
  unlockCost: number; // 0 for logging, -1 for support skills (CP cost)
  tiers: SkillTier[];
}

export interface BalanceConfig {
  xp: {
    base: number;
    tierScale: number;
    levelExponent: number;
  };
  gold: {
    base: number;
    tierScale: number;
    qualityMultipliers: Record<ItemQuality, number>;
  };
  time: {
    baseGatherCooldown: number;
    baseCraftTime: number;
    craftTierScale: number;
  };
  prestige: {
    baseChaosPoints: number;
    skillRequirement: number;
    levelRequirement: number;
  };
  limits: {
    maxLevel: number;
    maxQueue: number;
    minClickInterval: number;
  };
}
