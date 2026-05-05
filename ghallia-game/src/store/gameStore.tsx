/**
 * Infinity Game State Store
 * React Context + useReducer for state management
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { SkillType, SkillCategory, ItemQuality, Equipment, EquipmentSlot, CharacterEquipment, EquipmentStats, Rarity, MaterialTier, EquipmentType, ArmorClass, WeaponType } from '../types/game.types';
import {
  xpPerAction,
  totalXpForLevel,
  levelFromTotalXp,
  getTierFromLevel,
  rollQuality,
  calculateGatherYield,
  formatNumber
} from '../utils/math';
import { SKILL_UNLOCK_COSTS, GAME_VERSION, BALANCE } from '../utils/constants';

// ============================================
// SKILL DEFINITIONS
// ============================================

export interface SkillDef {
  id: SkillType;
  name: string;
  icon: string;
  category: SkillCategory;
  description: string;
}

export const SKILL_DEFINITIONS: SkillDef[] = [
  // Gathering Skills
  { id: SkillType.LOGGING, name: 'Logging', icon: '🪓', category: SkillCategory.GATHERING, description: 'Chop trees for wood' },
  { id: SkillType.MINING, name: 'Mining', icon: '⛏️', category: SkillCategory.GATHERING, description: 'Extract ores and gems' },
  { id: SkillType.FISHING, name: 'Fishing', icon: '🎣', category: SkillCategory.GATHERING, description: 'Catch fish' },
  { id: SkillType.HERBALISM, name: 'Herbalism', icon: '🌿', category: SkillCategory.GATHERING, description: 'Gather herbs and plants' },
  { id: SkillType.SKINNING, name: 'Skinning', icon: '🦴', category: SkillCategory.GATHERING, description: 'Harvest leather and hides' },
  { id: SkillType.FORAGING, name: 'Foraging', icon: '🍄', category: SkillCategory.GATHERING, description: 'Collect wild ingredients' },
  { id: SkillType.HUNTING, name: 'Hunting', icon: '🏹', category: SkillCategory.GATHERING, description: 'Track and capture game' },

  // Crafting Skills
  { id: SkillType.SAWMILL, name: 'Sawmill', icon: '🪚', category: SkillCategory.CRAFTING, description: 'Process wood into lumber' },
  { id: SkillType.SMITHING, name: 'Smithing', icon: '⚒️', category: SkillCategory.CRAFTING, description: 'Forge weapons and armor' },
  { id: SkillType.COOKING, name: 'Cooking', icon: '🍳', category: SkillCategory.CRAFTING, description: 'Prepare food' },
  { id: SkillType.ALCHEMY, name: 'Alchemy', icon: '⚗️', category: SkillCategory.CRAFTING, description: 'Brew potions' },
  { id: SkillType.LEATHERWORKING, name: 'Leatherwork', icon: '🧥', category: SkillCategory.CRAFTING, description: 'Craft leather goods' },
  { id: SkillType.TAILORING, name: 'Tailoring', icon: '🧵', category: SkillCategory.CRAFTING, description: 'Create cloth items' },
  { id: SkillType.JEWELCRAFTING, name: 'Jewelcraft', icon: '💎', category: SkillCategory.CRAFTING, description: 'Cut gems, make jewelry' },
  { id: SkillType.ENCHANTING, name: 'Enchanting', icon: '✨', category: SkillCategory.CRAFTING, description: 'Imbue magical properties' },
  { id: SkillType.ENGINEERING, name: 'Engineering', icon: '⚙️', category: SkillCategory.CRAFTING, description: 'Build gadgets' },

  // Support Skills (Prestige 1+)
  { id: SkillType.TRADING, name: 'Trading', icon: '💰', category: SkillCategory.SUPPORT, description: 'Better prices' },
  { id: SkillType.FARMING, name: 'Farming', icon: '🌾', category: SkillCategory.SUPPORT, description: 'Grow crops passively' },
  { id: SkillType.RUNECRAFTING, name: 'Runecraft', icon: '🔮', category: SkillCategory.SUPPORT, description: 'Create magical runes' },
  { id: SkillType.ARCHAEOLOGY, name: 'Archaeology', icon: '🏺', category: SkillCategory.SUPPORT, description: 'Discover artifacts' },
];

// Support Skill Chaos Point costs (unlocked after Prestige 1)
export const SUPPORT_SKILL_COSTS: Record<SkillType, number> = {
  [SkillType.TRADING]: 100,
  [SkillType.FARMING]: 150,
  [SkillType.RUNECRAFTING]: 200,
  [SkillType.ARCHAEOLOGY]: 250,
} as Record<SkillType, number>;

// Check if a skill is a support skill
export function isSupportSkill(skillType: SkillType): boolean {
  const def = SKILL_DEFINITIONS.find(s => s.id === skillType);
  return def?.category === SkillCategory.SUPPORT;
}

// ============================================
// UPGRADE DEFINITIONS
// ============================================

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
  effect: (level: number) => number;
  category: 'tap' | 'crit' | 'luck' | 'mana' | 'gold';
}

// Generate tap upgrades (57 total) - +1 tap per click each
const TAP_UPGRADE_NAMES = [
  'Stronger Grip', 'Calloused Hands', 'Iron Fingers', 'Steel Arms', 'Titan Strength',
  'Divine Touch', 'Cosmic Power', 'Primal Force', 'Unshakeable Will', 'Mountain Might',
  'Thunder Palms', 'Dragon Grasp', 'Phoenix Claws', 'Demon Fists', 'Angel Wings',
  'Storm Hands', 'Ocean Force', 'Earth Shaker', 'Sky Splitter', 'Void Walker',
  'Star Crusher', 'Moon Breaker', 'Sun Burner', 'Galaxy Render', 'Universe Shaker',
  'Time Bender', 'Space Warper', 'Reality Rift', 'Dimension Tear', 'Eternity Grasp',
  'Infinite Power', 'Boundless Force', 'Limitless Might', 'Endless Strength', 'Eternal Grip',
  'Ascended Touch', 'Transcendent Power', 'Supreme Force', 'Ultimate Might', 'Apex Strength',
  'Legendary Grip', 'Mythic Touch', 'Ancient Power', 'Primordial Force', 'Elder Might',
  'Cosmic Surge', 'Stellar Burst', 'Nebula Grasp', 'Quasar Touch', 'Pulsar Power',
  'Black Hole Grip', 'Supernova Force', 'Hypernova Might', 'Omega Strength', 'Alpha Touch',
  'Genesis Power', 'Apocalypse Force'
];

const generateTapUpgrades = (): UpgradeDef[] => {
  return TAP_UPGRADE_NAMES.map((name, i) => ({
    id: `tap_power_${i + 1}`,
    name,
    description: `+1 tap per click`,
    baseCost: Math.floor(0.5 * Math.pow(2.5, i)),
    maxLevel: 1,
    effect: () => 1,
    category: 'tap' as const
  }));
};

// Generate crit chance upgrades (55 total, 0.025% each - VERY slow grind)
const CRIT_CHANCE_NAMES = [
  'Sharp Eyes', 'Focused Mind', 'Keen Instincts', 'Eagle Vision', 'Perfect Precision',
  'Sniper Sight', 'Hunter Focus', 'Predator Gaze', 'Hawk Eye', 'Lynx Vision',
  'Cat Reflexes', 'Owl Wisdom', 'Fox Cunning', 'Wolf Senses', 'Bear Awareness',
  'Tiger Strike', 'Lion Courage', 'Panther Grace', 'Cheetah Speed', 'Viper Strike',
  'Cobra Focus', 'Scorpion Sting', 'Spider Sense', 'Mantis Precision', 'Dragonfly Dart',
  'Crystal Clarity', 'Diamond Focus', 'Ruby Sight', 'Sapphire Vision', 'Emerald Eye',
  'Topaz Gleam', 'Amethyst Gaze', 'Opal Shimmer', 'Pearl Luster', 'Onyx Depth',
  'Silver Strike', 'Gold Precision', 'Platinum Focus', 'Titanium Edge', 'Mithril Sight',
  'Adamantine Vision', 'Orichalcum Eye', 'Celestial Gaze', 'Ethereal Focus', 'Astral Precision',
  'Void Sight', 'Shadow Vision', 'Light Eye', 'Dark Gaze', 'Chaos Focus',
  'Order Precision', 'Balance Sight', 'Harmony Vision', 'Discord Eye', 'Unity Gaze'
];

const generateCritChanceUpgrades = (): UpgradeDef[] => {
  return CRIT_CHANCE_NAMES.map((name, i) => ({
    id: `crit_chance_${i + 1}`,
    name,
    description: `+0.025% crit chance`,
    baseCost: Math.floor(100 * Math.pow(1.8, i)),
    maxLevel: 1,
    effect: () => 0.025,
    category: 'crit' as const
  }));
};

// Generate crit damage upgrades (55 total, 0.5% each - VERY slow grind)
const CRIT_DAMAGE_NAMES = [
  'Heavy Hits', 'Brutal Force', 'Devastating Blows', 'Crushing Power', 'Annihilating Strikes',
  'Shattering Impact', 'Pulverizing Might', 'Obliterating Force', 'Decimating Power', 'Ruinous Blows',
  'Catastrophic Strikes', 'Cataclysmic Force', 'Apocalyptic Power', 'Doomsday Might', 'Armageddon Blows',
  'Ragnarok Strikes', 'Twilight Force', 'Dawn Breaker', 'Dusk Crusher', 'Midnight Striker',
  'Noon Smasher', 'Eclipse Crusher', 'Solstice Breaker', 'Equinox Striker', 'Zenith Smasher',
  'Nadir Crusher', 'Apex Breaker', 'Peak Striker', 'Summit Smasher', 'Pinnacle Crusher',
  'Crown Breaker', 'Throne Striker', 'Scepter Smasher', 'Orb Crusher', 'Staff Breaker',
  'Wand Striker', 'Rod Smasher', 'Blade Crusher', 'Sword Breaker', 'Axe Striker',
  'Hammer Smasher', 'Mace Crusher', 'Flail Breaker', 'Spear Striker', 'Lance Smasher',
  'Pike Crusher', 'Halberd Breaker', 'Glaive Striker', 'Scythe Smasher', 'Sickle Crusher',
  'Dagger Breaker', 'Knife Striker', 'Fang Smasher', 'Claw Crusher', 'Talon Breaker'
];

const generateCritDamageUpgrades = (): UpgradeDef[] => {
  return CRIT_DAMAGE_NAMES.map((name, i) => ({
    id: `crit_damage_${i + 1}`,
    name,
    description: `+0.5% crit damage`,
    baseCost: Math.floor(150 * Math.pow(1.8, i)),
    maxLevel: 1,
    effect: () => 0.5,
    category: 'crit' as const
  }));
};

// Generate luck upgrades (55 total, 0.025% each - VERY slow grind)
const LUCK_UPGRADE_NAMES = [
  'Lucky Charm', 'Fortune\'s Favor', 'Blessed Touch', 'Serendipity', 'Golden Aura',
  'Destiny\'s Child', 'Cosmic Fortune', 'Starlight Blessing', 'Moonbeam Grace', 'Sunray Gift',
  'Rainbow Promise', 'Four Leaf Clover', 'Horseshoe Luck', 'Rabbit\'s Foot', 'Lucky Penny',
  'Wishing Well', 'Shooting Star', 'Lucky Number', 'Fortune Cookie', 'Dice Roll',
  'Card Draw', 'Coin Flip', 'Wheel Spin', 'Jackpot Hit', 'Lottery Win',
  'Treasure Find', 'Gold Rush', 'Diamond Strike', 'Emerald Discovery', 'Ruby Unearthed',
  'Sapphire Revealed', 'Pearl Found', 'Opal Uncovered', 'Amethyst Spotted', 'Topaz Located',
  'Crystal Clear', 'Gem Hunter', 'Jewel Seeker', 'Ore Finder', 'Vein Tracker',
  'Lode Spotter', 'Mother Lode', 'Bonanza', 'Windfall', 'Godsend',
  'Miracle', 'Wonder', 'Marvel', 'Phenomenon', 'Providence',
  'Kismet', 'Karma', 'Fate\'s Hand', 'Chance\'s Favor', 'Random\'s Gift'
];

const generateLuckUpgrades = (): UpgradeDef[] => {
  return LUCK_UPGRADE_NAMES.map((name, i) => ({
    id: `luck_${i + 1}`,
    name,
    description: `+0.025% luck`,
    baseCost: Math.floor(200 * Math.pow(1.8, i)),
    maxLevel: 1,
    effect: () => 0.025,
    category: 'luck' as const
  }));
};

// Generate mana pool upgrades (15 total) - costs only gold, +5 max mana each
// Costs: 1000, 5000, 25000, 100000, 500000, 2M, 8M, 30M, 100M, 400M, 1.5B, 5B, 20B, 80B, 300B
const MANA_POOL_NAMES = [
  'Mana Pool I', 'Mana Pool II', 'Mana Pool III', 'Mana Pool IV', 'Mana Pool V',
  'Arcane Reserve', 'Mystic Reservoir', 'Ethereal Basin', 'Astral Lake', 'Cosmic Ocean',
  'Spirit Well', 'Soul Spring', 'Life Fountain', 'Energy Core', 'Power Source'
];

const generateManaPoolUpgrades = (): UpgradeDef[] => {
  const costs = [1000, 5000, 25000, 100000, 500000, 2000000, 8000000, 30000000, 100000000, 400000000, 1500000000, 5000000000, 20000000000, 80000000000, 300000000000];
  return MANA_POOL_NAMES.map((name, i) => ({
    id: `mana_cap_${i + 1}`,
    name,
    description: `+5 max mana`,
    baseCost: costs[i] || costs[costs.length - 1] * Math.pow(4, i - costs.length + 1),
    maxLevel: 1,
    effect: () => 5,
    category: 'mana' as const
  }));
};

// Generate mana regen upgrades with Common/Rare/Epic tiers
// Common: +0.1/sec (gold only) - frequent, affordable
// Rare: +0.5/sec (gold only) - less frequent, more expensive
// Epic: +1.0/sec (gold + mana) - rare, very expensive
const MANA_REGEN_COMMON = [
  'Mana Trickle', 'Mana Drip', 'Mana Seep', 'Mana Leak', 'Mana Flow',
  'Minor Stream', 'Small Current', 'Gentle Wave', 'Soft Pulse', 'Light Surge',
  'Faint Glow', 'Dim Spark', 'Weak Flare', 'Low Burn', 'Mild Heat',
];
const MANA_REGEN_RARE = [
  'Arcane Stream', 'Mystic Current', 'Ethereal River', 'Astral Tide', 'Cosmic Wave',
  'Spirit Rush', 'Soul Cascade', 'Life Torrent', 'Energy Rapids', 'Power Flood',
];
const MANA_REGEN_EPIC = [
  'Mana Tsunami', 'Arcane Deluge', 'Mystic Maelstrom', 'Ethereal Tempest', 'Astral Storm',
];

// Extended upgrade definition to include mana cost
export interface ManaUpgradeDef extends UpgradeDef {
  manaCost?: number;
  rarity?: 'common' | 'rare' | 'epic';
}

const generateManaRegenUpgrades = (): ManaUpgradeDef[] => {
  const upgrades: ManaUpgradeDef[] = [];

  // Common upgrades (+0.1/sec) - 15 total, gold only
  // Prices: 500, 2K, 8K, 25K, 80K, 250K, 800K, 2.5M, 8M, 25M, 80M, 250M, 800M, 2.5B, 8B
  const commonCosts = [500, 2000, 8000, 25000, 80000, 250000, 800000, 2500000, 8000000, 25000000, 80000000, 250000000, 800000000, 2500000000, 8000000000];
  for (let i = 0; i < MANA_REGEN_COMMON.length; i++) {
    upgrades.push({
      id: `mana_regen_common_${i + 1}`,
      name: MANA_REGEN_COMMON[i],
      description: `+0.1 mana/sec`,
      baseCost: commonCosts[i],
      maxLevel: 1,
      effect: () => 0.1,
      category: 'mana' as const,
      manaCost: 0,
      rarity: 'common'
    });
  }

  // Rare upgrades (+0.5/sec) - 10 total, gold only but expensive
  // Prices: 50K, 200K, 800K, 3M, 12M, 50M, 200M, 800M, 3B, 12B
  const rareCosts = [50000, 200000, 800000, 3000000, 12000000, 50000000, 200000000, 800000000, 3000000000, 12000000000];
  for (let i = 0; i < MANA_REGEN_RARE.length; i++) {
    upgrades.push({
      id: `mana_regen_rare_${i + 1}`,
      name: MANA_REGEN_RARE[i],
      description: `+0.5 mana/sec (Rare)`,
      baseCost: rareCosts[i],
      maxLevel: 1,
      effect: () => 0.5,
      category: 'mana' as const,
      manaCost: 0,
      rarity: 'rare'
    });
  }

  // Epic upgrades (+1.0/sec) - 5 total, gold + mana cost
  // Prices: 5M + 25 mana, 50M + 50 mana, 500M + 100 mana, 5B + 200 mana, 50B + 500 mana
  const epicCosts = [
    { gold: 5000000, mana: 25 },
    { gold: 50000000, mana: 50 },
    { gold: 500000000, mana: 100 },
    { gold: 5000000000, mana: 200 },
    { gold: 50000000000, mana: 500 }
  ];
  for (let i = 0; i < MANA_REGEN_EPIC.length; i++) {
    upgrades.push({
      id: `mana_regen_epic_${i + 1}`,
      name: MANA_REGEN_EPIC[i],
      description: `+1.0 mana/sec (Epic, costs ${epicCosts[i].mana} mana)`,
      baseCost: epicCosts[i].gold,
      maxLevel: 1,
      effect: () => 1.0,
      category: 'mana' as const,
      manaCost: epicCosts[i].mana,
      rarity: 'epic'
    });
  }

  return upgrades;
};

// Generate gold bonus upgrades (55 total, 0.1% each - VERY slow grind)
const GOLD_BONUS_NAMES = [
  'Merchant\'s Eye', 'Haggler', 'Trade Master', 'Golden Touch', 'Midas Blessing',
  'Wealth Incarnate', 'Fortune Seeker', 'Treasure Hunter', 'Gold Digger', 'Coin Collector',
  'Silver Tongue', 'Bronze Mind', 'Copper Heart', 'Iron Will', 'Steel Resolve',
  'Platinum Soul', 'Diamond Spirit', 'Emerald Essence', 'Ruby Core', 'Sapphire Aura',
  'Market Savvy', 'Price Wisdom', 'Value Insight', 'Worth Knowledge', 'Cost Awareness',
  'Profit Sense', 'Gain Instinct', 'Yield Intuition', 'Return Feel', 'Revenue Gut',
  'Income Flow', 'Earnings Stream', 'Wages River', 'Salary Ocean', 'Payment Sea',
  'Commission Lake', 'Bonus Pond', 'Tip Well', 'Gratuity Spring', 'Reward Fountain',
  'Prize Pool', 'Bounty Basin', 'Loot Reservoir', 'Spoils Tank', 'Plunder Cache',
  'Riches Vault', 'Wealth Safe', 'Fortune Chest', 'Treasure Box', 'Coffer Fill',
  'Purse Swell', 'Wallet Grow', 'Pouch Expand', 'Sack Enlarge', 'Bag Increase'
];

const generateGoldBonusUpgrades = (): UpgradeDef[] => {
  return GOLD_BONUS_NAMES.map((name, i) => ({
    id: `gold_bonus_${i + 1}`,
    name,
    description: `+0.1% gold from sales`,
    baseCost: Math.floor(50 * Math.pow(1.8, i)),
    maxLevel: 1,
    effect: () => 0.1,
    category: 'gold' as const
  }));
};

export const UPGRADES: UpgradeDef[] = [
  ...generateTapUpgrades(),
  ...generateCritChanceUpgrades(),
  ...generateCritDamageUpgrades(),
  ...generateLuckUpgrades(),
  ...generateManaPoolUpgrades(),
  ...generateManaRegenUpgrades(),
  ...generateGoldBonusUpgrades(),
];

// Helper to get mana cost for an upgrade (if any)
export function getUpgradeManaCost(upgradeId: string): number {
  const manaUpgrades = generateManaRegenUpgrades();
  const upgrade = manaUpgrades.find(u => u.id === upgradeId);
  return upgrade?.manaCost || 0;
}

// ============================================
// SPELL DEFINITIONS
// ============================================

export interface SpellDef {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  duration: number; // seconds, 0 for instant
  cooldown: number; // seconds
  icon: string;
}

export const SPELLS: SpellDef[] = [
  { id: 'auto_tap', name: 'Auto Harvest', description: 'Auto-gather all skills 100x/sec for 60s', manaCost: 15, duration: 60, cooldown: 60, icon: '⚡' },
  { id: 'double_xp', name: 'Wisdom', description: '2x XP for 90 seconds', manaCost: 30, duration: 90, cooldown: 90, icon: '📚' },
  { id: 'double_gold', name: 'Prosperity', description: '2x gold for 90 seconds', manaCost: 30, duration: 90, cooldown: 90, icon: '💎' },
  { id: 'mega_crit', name: 'Critical Surge', description: '100% crit chance for 90 seconds', manaCost: 40, duration: 90, cooldown: 120, icon: '🎯' },
  { id: 'lucky_star', name: 'Lucky Star', description: '50% luck for 90 seconds', manaCost: 35, duration: 90, cooldown: 100, icon: '⭐' },
];

// ============================================
// TALENT DEFINITIONS
// ============================================

export interface TalentDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxRank: number;
  baseCost: number; // CP cost for rank 1
  costPerRank: number; // Additional CP per rank
  tier: number; // 1-5, higher tiers require more prestiges
  effect: (rank: number) => number; // Returns bonus value
  category: 'xp' | 'gold' | 'crafting' | 'gathering' | 'prestige';
}

export const TALENTS: TalentDef[] = [
  // Tier 1 - Basic talents (available immediately)
  { id: 'xp_boost', name: 'Wisdom', description: '+5% XP per rank', icon: '📚', maxRank: 20, baseCost: 10, costPerRank: 10, tier: 1, effect: (r) => r * 5, category: 'xp' },
  { id: 'gold_boost', name: 'Prosperity', description: '+3% gold per rank', icon: '💰', maxRank: 20, baseCost: 10, costPerRank: 10, tier: 1, effect: (r) => r * 3, category: 'gold' },
  { id: 'gather_speed', name: 'Swift Hands', description: '+2% gather speed per rank', icon: '⚡', maxRank: 20, baseCost: 15, costPerRank: 15, tier: 1, effect: (r) => r * 2, category: 'gathering' },
  { id: 'craft_speed', name: 'Efficient Crafter', description: '+4% crafting speed per rank', icon: '🔨', maxRank: 25, baseCost: 15, costPerRank: 15, tier: 1, effect: (r) => r * 4, category: 'crafting' },

  // Tier 2 - Intermediate (requires Prestige 2+)
  { id: 'multi_craft', name: 'Double Output', description: '+2% double craft chance per rank', icon: '✨', maxRank: 25, baseCost: 25, costPerRank: 25, tier: 2, effect: (r) => r * 2, category: 'crafting' },
  { id: 'resource_efficiency', name: 'Resourceful', description: '-2% material cost per rank', icon: '♻️', maxRank: 25, baseCost: 25, costPerRank: 25, tier: 2, effect: (r) => r * 2, category: 'crafting' },
  { id: 'rare_finds', name: 'Lucky Prospector', description: '+1% rare resource chance per rank', icon: '🍀', maxRank: 20, baseCost: 30, costPerRank: 30, tier: 2, effect: (r) => r * 1, category: 'gathering' },
  { id: 'crit_boost', name: 'Precision', description: '+1% crit chance per rank', icon: '🎯', maxRank: 20, baseCost: 30, costPerRank: 30, tier: 2, effect: (r) => r * 1, category: 'gathering' },

  // Tier 3 - Advanced (requires Prestige 5+)
  { id: 'idle_efficiency', name: 'Passive Income', description: '+5% offline crafting speed per rank', icon: '😴', maxRank: 20, baseCost: 50, costPerRank: 50, tier: 3, effect: (r) => r * 5, category: 'crafting' },
  { id: 'prestige_boost', name: 'Chaos Mastery', description: '+5% Chaos Points earned per rank', icon: '🌀', maxRank: 20, baseCost: 75, costPerRank: 75, tier: 3, effect: (r) => r * 5, category: 'prestige' },
  { id: 'starting_gold', name: 'Head Start', description: '+100 starting gold per rank', icon: '🏦', maxRank: 50, baseCost: 40, costPerRank: 20, tier: 3, effect: (r) => r * 100, category: 'gold' },
  { id: 'starting_xp', name: 'Experienced', description: '+50 starting XP per rank (all skills)', icon: '📈', maxRank: 50, baseCost: 40, costPerRank: 20, tier: 3, effect: (r) => r * 50, category: 'xp' },

  // Tier 4 - Expert (requires Prestige 10+)
  { id: 'super_crit', name: 'Devastating Blows', description: '+5% crit damage per rank', icon: '💥', maxRank: 20, baseCost: 100, costPerRank: 100, tier: 4, effect: (r) => r * 5, category: 'gathering' },
  { id: 'mega_gold', name: 'Midas Touch', description: '+10% gold per rank', icon: '👑', maxRank: 10, baseCost: 150, costPerRank: 150, tier: 4, effect: (r) => r * 10, category: 'gold' },

  // Tier 5 - Master (requires Prestige 20+)
  { id: 'ultimate_xp', name: 'Enlightenment', description: '+25% XP per rank', icon: '🌟', maxRank: 5, baseCost: 500, costPerRank: 500, tier: 5, effect: (r) => r * 25, category: 'xp' },
  { id: 'ultimate_prestige', name: 'Chaos Lord', description: '+25% Chaos Points per rank', icon: '🔥', maxRank: 5, baseCost: 750, costPerRank: 750, tier: 5, effect: (r) => r * 25, category: 'prestige' },
];

// Get required prestige count for a talent tier
export function getRequiredPrestigeForTier(tier: number): number {
  switch (tier) {
    case 1: return 0;
    case 2: return 2;
    case 3: return 5;
    case 4: return 10;
    case 5: return 20;
    default: return 0;
  }
}

// Calculate talent cost for a specific rank
export function getTalentCost(talent: TalentDef, currentRank: number): number {
  return talent.baseCost + (talent.costPerRank * currentRank);
}

// Calculate Chaos Points earned from prestige
export function calculateChaosPoints(
  skills: Record<SkillType, SkillState>,
  gold: number,
  talentBonus: number = 0
): number {
  const BASE_CP = 100;

  // Get skills at level 99+
  const eligibleSkills = Object.values(skills).filter(s => s.level >= 99);

  // Skill bonus: floor(level/10) for each eligible skill
  const skillBonus = eligibleSkills.reduce((sum, s) => sum + Math.floor(s.level / 10), 0);

  // Gold bonus: log10 of gold
  const goldBonus = Math.floor(Math.log10(Math.max(1, gold)));

  // Skills multiplier: 1 + (skills_beyond_5 * 0.2)
  const skillsMultiplier = 1 + Math.max(0, eligibleSkills.length - 5) * 0.2;

  // Talent multiplier from prestige boost talents
  const talentMultiplier = 1 + (talentBonus / 100);

  return Math.floor((BASE_CP + skillBonus + goldBonus) * skillsMultiplier * talentMultiplier);
}

// Check if player can prestige
export function canPrestige(skills: Record<SkillType, SkillState>): boolean {
  const eligibleSkills = Object.values(skills).filter(s => s.level >= 99);
  return eligibleSkills.length >= 5;
}

// Get count of skills at level 99+
export function getSkillsAt99Plus(skills: Record<SkillType, SkillState>): number {
  return Object.values(skills).filter(s => s.level >= 99).length;
}

// Calculate all talent bonuses from talents state
export interface TalentBonuses {
  xpBonus: number; // Total XP bonus %
  goldBonus: number; // Total gold bonus %
  craftSpeedBonus: number; // Crafting speed bonus %
  multiCraftChance: number; // Double craft chance %
  critBonus: number; // Crit chance bonus %
  critDamageBonus: number; // Crit damage bonus %
  rareFindsBonus: number; // Rare resource chance bonus %
}

export function calculateTalentBonuses(talents: Record<string, number>): TalentBonuses {
  let xpBonus = 0;
  let goldBonus = 0;
  let craftSpeedBonus = 0;
  let multiCraftChance = 0;
  let critBonus = 0;
  let critDamageBonus = 0;
  let rareFindsBonus = 0;

  for (const talent of TALENTS) {
    const rank = talents[talent.id] || 0;
    if (rank === 0) continue;

    switch (talent.id) {
      case 'xp_boost':
      case 'ultimate_xp':
        xpBonus += talent.effect(rank);
        break;
      case 'gold_boost':
      case 'mega_gold':
        goldBonus += talent.effect(rank);
        break;
      case 'craft_speed':
        craftSpeedBonus += talent.effect(rank);
        break;
      case 'multi_craft':
        multiCraftChance += talent.effect(rank);
        break;
      case 'crit_boost':
        critBonus += talent.effect(rank);
        break;
      case 'super_crit':
        critDamageBonus += talent.effect(rank);
        break;
      case 'rare_finds':
        rareFindsBonus += talent.effect(rank);
        break;
    }
  }

  return {
    xpBonus,
    goldBonus,
    craftSpeedBonus,
    multiCraftChance,
    critBonus,
    critDamageBonus,
    rareFindsBonus,
  };
}

// ============================================
// CRAFTING RECIPE DEFINITIONS
// ============================================

export interface CraftingRecipe {
  id: string;
  name: string;
  craftingSkill: SkillType; // Which crafting skill makes this
  requiredLevel: number; // Level needed in crafting skill
  materials: { resourceId: string; quantity: number }[]; // Required materials
  produces?: { resourceId: string; quantity: number }; // If set, outputs a resource instead of sellable item
  craftTime: number; // Seconds to craft
  xpReward: number; // XP gained when crafted
  sellValue: number; // Gold when sold
  icon: string;
}

// =============================================
// CRAFTING RECIPE SYSTEM
// Raw materials → Processed materials → Final items
// =============================================

// Tier names for each gathering skill (10 tiers)
const TIER_NAMES = {
  logging: ['Maple', 'Oak', 'Birch', 'Pine', 'Willow', 'Cedar', 'Ash', 'Elm', 'Spruce', 'Redwood'],
  mining: ['Copper', 'Tin', 'Bronze', 'Iron', 'Steel', 'Silver', 'Gold', 'Platinum', 'Mithril', 'Adamant'],
  fishing: ['Minnow', 'Sardine', 'Trout', 'Salmon', 'Tuna', 'Cod', 'Bass', 'Perch', 'Pike', 'Swordfish'],
  herbalism: ['Dandelion', 'Clover', 'Mint', 'Basil', 'Sage', 'Thyme', 'Rosemary', 'Lavender', 'Chamomile', 'Ginseng'],
  skinning: ['Rabbit', 'Deer', 'Wolf', 'Bear', 'Boar', 'Elk', 'Bison', 'Tiger', 'Lion', 'Dragon'],
  foraging: ['Cotton', 'Flax', 'Hemp', 'Silk', 'Spider Silk', 'Wool', 'Mohair', 'Cashmere', 'Alpaca', 'Phoenix'],
  hunting: ['Rabbit', 'Pheasant', 'Duck', 'Goose', 'Turkey', 'Venison', 'Boar', 'Elk', 'Buffalo', 'Beast'],
};

// =============================================
// PROCESSING RECIPES (Raw → Processed materials)
// 10 raw materials → 1 processed material
// These produce resources that are used in advanced recipes
// =============================================

// Base value per tier for raw materials (logs, ores, fish, etc.)
// Tier 1 raw = 0.01g each (10 logs = 0.10g), Tier 2 = 0.02g, etc.
const RAW_VALUE_PER_TIER = 0.01;
// Processed material markup (2.5x so T1 plank = 0.25g from 10 raw @ 0.10g)
const PROCESSED_MARKUP = 2.5;

const generateProcessingRecipes = (): CraftingRecipe[] => {
  const recipes: CraftingRecipe[] = [];

  // SAWMILL: 10 Logs → 1 Plank (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.logging[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP; // 10 materials * 2.5x markup
    recipes.push({
      id: `sawmill_plank_t${tier}`,
      name: `${tierName} Plank`,
      craftingSkill: SkillType.SAWMILL,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `logging_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100, // Can sell planks directly
      icon: '🪵',
      produces: { resourceId: `plank_t${tier}`, quantity: 1 },
    });
  }

  // SMITHING: 10 Ores → 1 Ingot (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.mining[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP;
    recipes.push({
      id: `smithing_ingot_t${tier}`,
      name: `${tierName} Ingot`,
      craftingSkill: SkillType.SMITHING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `mining_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '🧱',
      produces: { resourceId: `ingot_t${tier}`, quantity: 1 },
    });
  }

  // SMITHING: 10 Ingots → 1 Plate (worth ~0.625g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.mining[tier - 1];
    const tierLevel = (tier - 1) * 10 + 5;
    const baseValue = tier * RAW_VALUE_PER_TIER * 100 * PROCESSED_MARKUP; // 10 ingots (each from 10 ore) * 2.5x
    recipes.push({
      id: `smithing_plate_t${tier}`,
      name: `${tierName} Plate`,
      craftingSkill: SkillType.SMITHING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `ingot_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(20 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '🛡️',
      produces: { resourceId: `plate_t${tier}`, quantity: 1 },
    });
  }

  // COOKING: 10 Fish → 1 Fillet (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.fishing[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP;
    recipes.push({
      id: `cooking_fillet_t${tier}`,
      name: `${tierName} Fillet`,
      craftingSkill: SkillType.COOKING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `fishing_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '🍣',
      produces: { resourceId: `fillet_t${tier}`, quantity: 1 },
    });
  }

  // ALCHEMY: 10 Herbs → 1 Extract (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.herbalism[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP;
    recipes.push({
      id: `alchemy_extract_t${tier}`,
      name: `${tierName} Extract`,
      craftingSkill: SkillType.ALCHEMY,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `herbalism_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '💧',
      produces: { resourceId: `extract_t${tier}`, quantity: 1 },
    });
  }

  // LEATHERWORKING: 10 Hides → 1 Leather (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.skinning[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP;
    recipes.push({
      id: `leatherworking_leather_t${tier}`,
      name: `${tierName} Leather`,
      craftingSkill: SkillType.LEATHERWORKING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `skinning_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '📜',
      produces: { resourceId: `leather_t${tier}`, quantity: 1 },
    });
  }

  // TAILORING: 10 Fibers → 1 Cloth (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.foraging[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP;
    recipes.push({
      id: `tailoring_cloth_t${tier}`,
      name: `${tierName} Cloth`,
      craftingSkill: SkillType.TAILORING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `foraging_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '🧵',
      produces: { resourceId: `cloth_t${tier}`, quantity: 1 },
    });
  }

  // JEWELCRAFTING: 10 Hunting materials → 1 Setting (worth ~0.25g at T1)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.hunting[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 10 * PROCESSED_MARKUP;
    recipes.push({
      id: `jewelcrafting_setting_t${tier}`,
      name: `${tierName} Setting`,
      craftingSkill: SkillType.JEWELCRAFTING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `hunting_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(10 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '💎',
      produces: { resourceId: `setting_t${tier}`, quantity: 1 },
    });
  }

  // ENCHANTING: 10 Extracts → 1 Essence (worth ~0.625g at T1, extracts are processed)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.herbalism[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 100 * PROCESSED_MARKUP; // 10 extracts (each from 10 raw) * 2.5x
    recipes.push({
      id: `enchanting_essence_t${tier}`,
      name: `${tierName} Essence`,
      craftingSkill: SkillType.ENCHANTING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `extract_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(20 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '✨',
      produces: { resourceId: `essence_t${tier}`, quantity: 1 },
    });
  }

  // ENGINEERING: 10 Ingots → 1 Part (worth ~0.625g at T1, ingots are processed)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.mining[tier - 1];
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * RAW_VALUE_PER_TIER * 100 * PROCESSED_MARKUP; // 10 ingots (each from 10 ore) * 2.5x
    recipes.push({
      id: `engineering_part_t${tier}`,
      name: `${tierName} Parts`,
      craftingSkill: SkillType.ENGINEERING,
      requiredLevel: tierLevel,
      materials: [{ resourceId: `ingot_t${tier}`, quantity: 10 }],
      craftTime: 0.1,
      xpReward: Math.floor(20 * tier),
      sellValue: Math.round(baseValue * 100) / 100,
      icon: '⚙️',
      produces: { resourceId: `part_t${tier}`, quantity: 1 },
    });
  }

  return recipes;
};

// =============================================
// FINAL ITEM RECIPES (Processed → Sellable items)
// =============================================

// Item templates for each crafting skill
const SAWMILL_ITEMS = [
  { name: 'Chair', icon: '🪑', plankCost: 3, time: 4, value: 8 },
  { name: 'Table', icon: '🪵', plankCost: 5, time: 6, value: 15 },
  { name: 'Shelf', icon: '📚', plankCost: 4, time: 5, value: 12 },
  { name: 'Chest', icon: '📦', plankCost: 6, time: 8, value: 20 },
  { name: 'Cabinet', icon: '🗄️', plankCost: 8, time: 10, value: 28 },
  { name: 'Bed', icon: '🛏️', plankCost: 10, time: 12, value: 35 },
  { name: 'Wardrobe', icon: '🚪', plankCost: 12, time: 15, value: 45 },
  { name: 'Throne', icon: '👑', plankCost: 20, time: 25, value: 80 },
];

const SMITHING_ITEMS = [
  { name: 'Dagger', icon: '🗡️', plateCost: 1, time: 5, value: 12 },
  { name: 'Sword', icon: '⚔️', plateCost: 2, time: 8, value: 25 },
  { name: 'Shield', icon: '🛡️', plateCost: 3, time: 10, value: 35 },
  { name: 'Helmet', icon: '⛑️', plateCost: 2, time: 7, value: 22 },
  { name: 'Chestplate', icon: '🦺', plateCost: 4, time: 12, value: 50 },
  { name: 'Gauntlets', icon: '🧤', plateCost: 2, time: 6, value: 20 },
  { name: 'Greaves', icon: '🦿', plateCost: 3, time: 8, value: 30 },
  { name: 'Battleaxe', icon: '🪓', plateCost: 5, time: 15, value: 65 },
];

const COOKING_ITEMS = [
  { name: 'Soup', icon: '🍲', filletCost: 2, time: 3, value: 8 },
  { name: 'Stew', icon: '🍛', filletCost: 3, time: 5, value: 14 },
  { name: 'Roast', icon: '🍗', filletCost: 4, time: 7, value: 22 },
  { name: 'Pie', icon: '🥧', filletCost: 3, time: 6, value: 18 },
  { name: 'Gourmet Dish', icon: '🍽️', filletCost: 5, time: 10, value: 35 },
  { name: 'Feast Platter', icon: '🍱', filletCost: 8, time: 15, value: 55 },
  { name: 'Chef Special', icon: '👨‍🍳', filletCost: 10, time: 20, value: 75 },
  { name: 'Royal Banquet', icon: '👑', filletCost: 15, time: 30, value: 120 },
];

const ALCHEMY_ITEMS = [
  { name: 'Tincture', icon: '🧪', extractCost: 2, time: 4, value: 10 },
  { name: 'Salve', icon: '🏺', extractCost: 3, time: 6, value: 18 },
  { name: 'Potion', icon: '🧴', extractCost: 4, time: 8, value: 28 },
  { name: 'Elixir', icon: '⚗️', extractCost: 5, time: 10, value: 40 },
  { name: 'Draught', icon: '🍶', extractCost: 6, time: 12, value: 52 },
  { name: 'Philter', icon: '💝', extractCost: 8, time: 15, value: 70 },
  { name: 'Brew', icon: '🫖', extractCost: 10, time: 20, value: 95 },
  { name: 'Panacea', icon: '🌈', extractCost: 15, time: 30, value: 150 },
];

const LEATHERWORKING_ITEMS = [
  { name: 'Belt', icon: '👔', leatherCost: 2, time: 4, value: 10 },
  { name: 'Gloves', icon: '🧤', leatherCost: 3, time: 5, value: 16 },
  { name: 'Boots', icon: '👢', leatherCost: 4, time: 7, value: 24 },
  { name: 'Vest', icon: '🦺', leatherCost: 5, time: 9, value: 34 },
  { name: 'Jacket', icon: '🧥', leatherCost: 6, time: 11, value: 45 },
  { name: 'Armor', icon: '🛡️', leatherCost: 8, time: 14, value: 60 },
  { name: 'Backpack', icon: '🎒', leatherCost: 10, time: 18, value: 80 },
  { name: 'Saddle', icon: '🐴', leatherCost: 15, time: 25, value: 125 },
];

const TAILORING_ITEMS = [
  { name: 'Scarf', icon: '🧣', clothCost: 2, time: 3, value: 8 },
  { name: 'Hat', icon: '🎩', clothCost: 3, time: 5, value: 14 },
  { name: 'Shirt', icon: '👕', clothCost: 4, time: 7, value: 22 },
  { name: 'Pants', icon: '👖', clothCost: 5, time: 8, value: 28 },
  { name: 'Dress', icon: '👗', clothCost: 6, time: 10, value: 38 },
  { name: 'Robe', icon: '🥻', clothCost: 8, time: 13, value: 52 },
  { name: 'Cloak', icon: '🧥', clothCost: 10, time: 16, value: 70 },
  { name: 'Royal Garb', icon: '👑', clothCost: 15, time: 25, value: 115 },
];

const JEWELCRAFTING_ITEMS = [
  { name: 'Ring', icon: '💍', settingCost: 2, time: 5, value: 15 },
  { name: 'Earring', icon: '👂', settingCost: 2, time: 4, value: 12 },
  { name: 'Pendant', icon: '📿', settingCost: 3, time: 6, value: 22 },
  { name: 'Bracelet', icon: '⌚', settingCost: 4, time: 8, value: 32 },
  { name: 'Necklace', icon: '📿', settingCost: 5, time: 10, value: 45 },
  { name: 'Circlet', icon: '👑', settingCost: 7, time: 14, value: 65 },
  { name: 'Amulet', icon: '🔮', settingCost: 10, time: 18, value: 95 },
  { name: 'Crown', icon: '👑', settingCost: 15, time: 28, value: 150 },
];

const ENCHANTING_ITEMS = [
  { name: 'Glyph', icon: '📜', essenceCost: 2, time: 5, value: 14 },
  { name: 'Rune', icon: '🔮', essenceCost: 3, time: 7, value: 22 },
  { name: 'Sigil', icon: '⚜️', essenceCost: 4, time: 9, value: 32 },
  { name: 'Ward', icon: '🛡️', essenceCost: 5, time: 11, value: 44 },
  { name: 'Charm', icon: '🍀', essenceCost: 6, time: 14, value: 58 },
  { name: 'Enchantment', icon: '✨', essenceCost: 8, time: 18, value: 78 },
  { name: 'Blessing', icon: '🙏', essenceCost: 10, time: 22, value: 100 },
  { name: 'Divine Rune', icon: '⚡', essenceCost: 15, time: 32, value: 160 },
];

const ENGINEERING_ITEMS = [
  { name: 'Gear', icon: '⚙️', partCost: 2, time: 4, value: 10 },
  { name: 'Spring', icon: '🌀', partCost: 3, time: 6, value: 18 },
  { name: 'Mechanism', icon: '🔧', partCost: 4, time: 8, value: 28 },
  { name: 'Clock', icon: '⏰', partCost: 5, time: 10, value: 40 },
  { name: 'Compass', icon: '🧭', partCost: 6, time: 12, value: 52 },
  { name: 'Telescope', icon: '🔭', partCost: 8, time: 16, value: 72 },
  { name: 'Music Box', icon: '🎵', partCost: 10, time: 20, value: 95 },
  { name: 'Automaton', icon: '🤖', partCost: 15, time: 30, value: 150 },
];

const generateFinalItemRecipes = (): CraftingRecipe[] => {
  const recipes: CraftingRecipe[] = [];

  // SAWMILL final items (use planks)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.logging[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3; // Start a bit higher than processing
    SAWMILL_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `sawmill_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.SAWMILL,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `plank_t${tier}`, quantity: item.plankCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // SMITHING final items (use plates)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.mining[tier - 1];
    const tierLevel = (tier - 1) * 10 + 8; // Higher level since needs plates
    SMITHING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `smithing_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.SMITHING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `plate_t${tier}`, quantity: item.plateCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // COOKING final items (use fillets)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.fishing[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    COOKING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `cooking_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.COOKING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `fillet_t${tier}`, quantity: item.filletCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // ALCHEMY final items (use extracts)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.herbalism[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    ALCHEMY_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `alchemy_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.ALCHEMY,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `extract_t${tier}`, quantity: item.extractCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // LEATHERWORKING final items (use leather)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.skinning[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    LEATHERWORKING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `leatherworking_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.LEATHERWORKING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `leather_t${tier}`, quantity: item.leatherCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // TAILORING final items (use cloth)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.foraging[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    TAILORING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `tailoring_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.TAILORING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `cloth_t${tier}`, quantity: item.clothCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // JEWELCRAFTING final items (use settings)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.hunting[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    JEWELCRAFTING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `jewelcrafting_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.JEWELCRAFTING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `setting_t${tier}`, quantity: item.settingCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // ENCHANTING final items (use essences)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.herbalism[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    ENCHANTING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `enchanting_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.ENCHANTING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `essence_t${tier}`, quantity: item.essenceCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  // ENGINEERING final items (use parts)
  for (let tier = 1; tier <= 10; tier++) {
    const tierName = TIER_NAMES.mining[tier - 1];
    const tierLevel = (tier - 1) * 10 + 3;
    ENGINEERING_ITEMS.forEach((item, idx) => {
      recipes.push({
        id: `engineering_item_t${tier}_${idx}`,
        name: `${tierName} ${item.name}`,
        craftingSkill: SkillType.ENGINEERING,
        requiredLevel: tierLevel + idx,
        materials: [{ resourceId: `part_t${tier}`, quantity: item.partCost }],
        craftTime: 0.1,
        xpReward: Math.floor(item.value * tier * 0.8),
        sellValue: Math.floor(item.value * tier),
        icon: item.icon,
      });
    });
  }

  return recipes;
};

// Generate all recipes (processing + final items)
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  ...generateProcessingRecipes(),
  ...generateFinalItemRecipes(),
];

// Helper to get recipes for a specific crafting skill
export function getRecipesForSkill(skillType: SkillType, level: number): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter(
    r => r.craftingSkill === skillType && r.requiredLevel <= level
  ).sort((a, b) => a.requiredLevel - b.requiredLevel);
}

// Helper to get unique material tiers available for a skill
export function getMaterialTiersForSkill(skillType: SkillType): number[] {
  const recipes = CRAFTING_RECIPES.filter(r => r.craftingSkill === skillType);
  const tiers = new Set<number>();

  recipes.forEach(recipe => {
    recipe.materials.forEach(mat => {
      const match = mat.resourceId.match(/_t(\d+)$/);
      if (match) {
        tiers.add(parseInt(match[1]));
      }
    });
  });

  return Array.from(tiers).sort((a, b) => a - b);
}

// Equipment slot mapping for crafted items
const EQUIPMENT_SLOT_MAP: Record<string, EquipmentSlot> = {
  // Smithing
  'Dagger': EquipmentSlot.MAIN_HAND,
  'Sword': EquipmentSlot.MAIN_HAND,
  'Shield': EquipmentSlot.OFF_HAND,
  'Helmet': EquipmentSlot.HEAD,
  'Chestplate': EquipmentSlot.CHEST,
  'Gauntlets': EquipmentSlot.GLOVES,
  'Greaves': EquipmentSlot.PANTS,
  'Battleaxe': EquipmentSlot.MAIN_HAND,
  // Leatherworking
  'Belt': EquipmentSlot.BRACERS,
  'Gloves': EquipmentSlot.GLOVES,
  'Boots': EquipmentSlot.BOOTS,
  'Vest': EquipmentSlot.CHEST,
  'Jacket': EquipmentSlot.CHEST,
  'Armor': EquipmentSlot.CHEST,
  'Backpack': EquipmentSlot.BACK,
  // Tailoring
  'Scarf': EquipmentSlot.BACK,
  'Hat': EquipmentSlot.HEAD,
  'Shirt': EquipmentSlot.CHEST,
  'Robe': EquipmentSlot.CHEST,
  'Cloak': EquipmentSlot.BACK,
  'Cape': EquipmentSlot.BACK,
  // Jewelcrafting
  'Ring': EquipmentSlot.RING_1,
  'Amulet': EquipmentSlot.NECKLACE,
  'Pendant': EquipmentSlot.NECKLACE,
  'Bracelet': EquipmentSlot.BRACERS,
  'Brooch': EquipmentSlot.TRINKET,
  'Crown': EquipmentSlot.HEAD,
  'Tiara': EquipmentSlot.HEAD,
  'Circlet': EquipmentSlot.HEAD,
};

// Check if a recipe produces equippable gear
export function isEquippableRecipe(recipeId: string): boolean {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;

  // Check if it's a final item (not processing like ingots/planks)
  const isProcessing = recipeId.includes('_ingot_') || recipeId.includes('_plank_') ||
                       recipeId.includes('_plate_') || recipeId.includes('_fillet_') ||
                       recipeId.includes('_extract_') || recipeId.includes('_leather_') ||
                       recipeId.includes('_cloth_') || recipeId.includes('_setting_') ||
                       recipeId.includes('_essence_') || recipeId.includes('_part_');
  if (isProcessing) return false;

  // Check if we have a slot mapping for this item
  const itemName = recipe.name.split(' ').pop() || '';
  return itemName in EQUIPMENT_SLOT_MAP;
}

// Generate Equipment from a crafted recipe
export function createEquipmentFromRecipe(recipeId: string): Equipment | null {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if (!recipe || !isEquippableRecipe(recipeId)) return null;

  const itemName = recipe.name.split(' ').pop() || '';
  const slot = EQUIPMENT_SLOT_MAP[itemName];
  if (!slot) return null;

  // Extract tier from recipe ID
  const tierMatch = recipeId.match(/_t(\d+)_/);
  const tier = tierMatch ? parseInt(tierMatch[1]) : 1;

  // Determine rarity based on tier
  let rarity: Rarity = Rarity.COMMON;
  if (tier >= 8) rarity = Rarity.LEGENDARY;
  else if (tier >= 6) rarity = Rarity.EPIC;
  else if (tier >= 4) rarity = Rarity.RARE;
  else if (tier >= 2) rarity = Rarity.UNCOMMON;

  // Calculate stats based on tier and item type
  const baseStatValue = tier * 2;
  const stats: EquipmentStats = {
    strength: 0,
    intellect: 0,
    agility: 0,
    stamina: Math.floor(baseStatValue * 0.5),
  };

  // Assign primary stat based on crafting skill
  if (recipe.craftingSkill === SkillType.SMITHING) {
    stats.strength = baseStatValue;
  } else if (recipe.craftingSkill === SkillType.LEATHERWORKING) {
    stats.agility = baseStatValue;
  } else if (recipe.craftingSkill === SkillType.TAILORING) {
    stats.intellect = baseStatValue;
  } else if (recipe.craftingSkill === SkillType.JEWELCRAFTING) {
    stats.intellect = Math.floor(baseStatValue * 0.5);
    stats.agility = Math.floor(baseStatValue * 0.5);
  }

  return {
    id: `equip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: recipe.name,
    type: EquipmentType.ARMOR,
    slot,
    materialTier: tier as MaterialTier,
    rarity,
    stats,
    sellValue: recipe.sellValue,
    icon: recipe.icon,
  };
}

// ============================================
// STATE TYPES
// ============================================

interface SkillState {
  level: number;
  totalXp: number;
  unlocked: boolean;
}

interface ResourceState {
  [resourceId: string]: number;
}

interface StatsState {
  totalTaps: number;
  totalCrits: number;
  totalLuckyHits: number;
  totalGoldEarned: number;
  totalResourcesGathered: number;
  highestCombo: number;
  totalPlayTime: number; // seconds - never resets
  sessionPlayTime: number; // seconds - resets on prestige
  totalSpellsCast: number;
  totalEquipmentObtained: number;
}

interface SpellState {
  activeUntil: number; // timestamp when spell expires
  cooldownUntil: number; // timestamp when spell can be cast again
}

// Crafting queue item (batched - single entry for multiple items)
export interface CraftingQueueItem {
  id: string; // unique instance id
  recipeId: string; // recipe being crafted
  quantity: number; // number of items in this batch
  startTime: number; // timestamp when started
  endTime: number; // timestamp when complete (total time for all items)
}

// ============================================
// CHARACTER STATS
// ============================================

interface CharacterState {
  equipment: CharacterEquipment;
  // Computed total stats from all equipment
  totalStrength: number;
  totalIntellect: number;
  totalAgility: number;
  totalStamina: number;
  // Derived stats
  maxHp: number;
  currentHp: number;
}

// Result of last gather action for UI feedback
export interface GatherResult {
  skillType: SkillType;
  baseTaps: number;
  resourceTaps: number;
  isCrit: boolean;
  isLucky: boolean;
  xpGained: number;
  timestamp: number;
  levelUp?: boolean;
  newLevel?: number;
  levelUpBonus?: number;
}

export interface GameState {
  gold: number;
  goldPerSecond: number; // passive gold income from achievements
  mana: number;
  maxMana: number;
  manaRegen: number; // per second
  skills: Record<SkillType, SkillState>;
  resources: ResourceState;
  skillsUnlockedCount: number;
  prestigeCount: number;
  chaosPoints: number;
  talents: Record<string, number>; // talent id -> rank
  lastSaveTime: number;
  gameVersion: string;
  // New systems
  upgrades: Record<string, number>; // upgrade id -> level
  spellsUnlocked: boolean;
  achievementsUnlocked: boolean;
  characterUnlocked: boolean;
  spells: Record<string, SpellState>;
  stats: StatsState;
  // Computed bonuses (from upgrades)
  bonusTaps: number;
  critChance: number;
  critDamage: number;
  luck: number;
  goldBonus: number;
  // Equipment & Character
  equipmentInventory: Equipment[]; // unequipped gear
  character: CharacterState;
  // Achievements
  unlockedAchievements: string[]; // achievement IDs that have been unlocked
  claimedAchievements: string[]; // achievement IDs that have been claimed
  // Last gather result for UI feedback
  lastGatherResult: GatherResult | null;
  // Crafting system
  craftingQueue: CraftingQueueItem[];
  craftedItems: Record<string, number>; // recipeId -> quantity crafted
  // Dev tools
  devInstantCraft: boolean;
}

// ============================================
// ACTIONS
// ============================================

type GameAction =
  | { type: 'GATHER'; skillType: SkillType }
  | { type: 'UNLOCK_SKILL'; skillType: SkillType }
  | { type: 'SELL_RESOURCE'; resourceId: string; quantity: number }
  | { type: 'ADD_GOLD'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string }
  | { type: 'UNLOCK_SPELLS' }
  | { type: 'UNLOCK_ACHIEVEMENTS' }
  | { type: 'UNLOCK_CHARACTER' }
  | { type: 'CAST_SPELL'; spellId: string }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_EQUIPMENT'; equipment: Equipment }
  | { type: 'EQUIP_ITEM'; equipmentId: string }
  | { type: 'UNEQUIP_ITEM'; slot: EquipmentSlot }
  | { type: 'SELL_EQUIPMENT'; equipmentId: string }
  // Developer tools
  | { type: 'DEV_ADD_MANA'; amount: number }
  | { type: 'DEV_ADD_MAX_MANA'; amount: number }
  | { type: 'DEV_ADD_BONUS_TAPS'; amount: number }
  | { type: 'DEV_UNLOCK_SPELLS' }
  | { type: 'DEV_ADD_CHAOS_POINTS'; amount: number }
  | { type: 'DEV_SET_PRESTIGE'; count: number }
  | { type: 'DEV_TOGGLE_INSTANT_CRAFT' }
  // Achievements
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CLAIM_ACHIEVEMENT'; achievementId: string; reward: number }
  // Prestige & Talents
  | { type: 'PRESTIGE'; chaosPointsEarned: number }
  | { type: 'BUY_TALENT'; talentId: string }
  // Crafting
  | { type: 'START_CRAFT'; recipeId: string; quantity: number }
  | { type: 'CANCEL_CRAFT'; queueItemId: string }
  | { type: 'COLLECT_CRAFTED'; recipeId: string; quantity: number }
  | { type: 'EQUIP_CRAFTED'; recipeId: string }
  // Cloud save
  | { type: 'LOAD_CLOUD_SAVE'; cloudState: any };

// ============================================
// INITIAL STATE
// ============================================

function createInitialSkills(): Record<SkillType, SkillState> {
  const skills: Partial<Record<SkillType, SkillState>> = {};

  for (const def of SKILL_DEFINITIONS) {
    skills[def.id] = {
      level: 1,
      totalXp: 0,
      unlocked: def.id === SkillType.LOGGING,
    };
  }

  return skills as Record<SkillType, SkillState>;
}

const initialStats: StatsState = {
  totalTaps: 0,
  totalCrits: 0,
  totalLuckyHits: 0,
  totalGoldEarned: 0,
  totalResourcesGathered: 0,
  highestCombo: 0,
  totalPlayTime: 0,
  sessionPlayTime: 0,
  totalSpellsCast: 0,
  totalEquipmentObtained: 0,
};

const initialCharacterEquipment: CharacterEquipment = {
  [EquipmentSlot.HEAD]: null,
  [EquipmentSlot.SHOULDERS]: null,
  [EquipmentSlot.CHEST]: null,
  [EquipmentSlot.BACK]: null,
  [EquipmentSlot.BRACERS]: null,
  [EquipmentSlot.GLOVES]: null,
  [EquipmentSlot.PANTS]: null,
  [EquipmentSlot.BOOTS]: null,
  [EquipmentSlot.MAIN_HAND]: null,
  [EquipmentSlot.OFF_HAND]: null,
  [EquipmentSlot.RING_1]: null,
  [EquipmentSlot.RING_2]: null,
  [EquipmentSlot.NECKLACE]: null,
  [EquipmentSlot.TRINKET]: null,
};

const initialCharacter: CharacterState = {
  equipment: initialCharacterEquipment,
  totalStrength: 0,
  totalIntellect: 0,
  totalAgility: 0,
  totalStamina: 0,
  maxHp: 10, // Base HP
  currentHp: 10,
};

const initialState: GameState = {
  gold: 0,
  goldPerSecond: 0,
  mana: 0,
  maxMana: 50,
  manaRegen: 0.1,
  skills: createInitialSkills(),
  resources: {},
  skillsUnlockedCount: 1,
  prestigeCount: 0,
  chaosPoints: 0,
  talents: {},
  lastSaveTime: Date.now(),
  gameVersion: GAME_VERSION,
  upgrades: {},
  spellsUnlocked: false,
  achievementsUnlocked: false,
  characterUnlocked: false,
  spells: {},
  stats: initialStats,
  bonusTaps: 0,
  critChance: 0, // 0% base
  critDamage: 0, // 0% base
  luck: 0,
  goldBonus: 0,
  equipmentInventory: [],
  character: initialCharacter,
  unlockedAchievements: [],
  claimedAchievements: [],
  lastGatherResult: null,
  craftingQueue: [],
  craftedItems: {},
  devInstantCraft: false,
};

// ============================================
// TIER DATA (for resource names)
// ============================================

const LOGGING_TIERS = [
  'Maple', 'Oak', 'Birch', 'Pine', 'Willow', 'Cedar', 'Ash', 'Elm', 'Spruce', 'Redwood',
  'Mahogany', 'Teak', 'Ebony', 'Ironwood', 'Bloodwood', 'Ghostwood', 'Petrified',
  'Crystalbark', 'Moonbark', 'Sunwood', 'Stormoak', 'Frostpine', 'Emberbark', 'Voidwood',
  'Mythril', 'Dragon', 'Phoenix', 'Titan', 'Cosmic', 'Nebula',
  'Starfall', 'Quantum', 'Temporal', 'Ethereal', 'Celestial',
  'Divine', 'Astral', 'Primal', 'Infinity', 'World Tree'
];

const MINING_TIERS = [
  'Copper', 'Tin', 'Bronze', 'Iron', 'Coal', 'Silver', 'Gold', 'Steel', 'Platinum', 'Mithril',
  'Adamantite', 'Runite', 'Dragonite', 'Obsidian', 'Starmetal', 'Moonstone', 'Sunstone',
  'Voidstone', 'Crystite', 'Aetherium', 'Orichalcum', 'Celestium', 'Eternium', 'Infinitum',
  'Primordium', 'Cosmium', 'Dimensium', 'Quantum Ore', 'Chrono Metal', 'Omega Ore',
  'Alpha Stone', 'Genesis Ore', 'Apex Metal', 'Ultima Ore', 'Legendary Ore',
  'Mythical Ore', 'Divine Ore', 'Godly Ore', 'Supreme Ore', 'World\'s Core'
];

const FISHING_TIERS = [
  'Minnow', 'Sardine', 'Trout', 'Salmon', 'Tuna', 'Cod', 'Bass', 'Perch', 'Pike', 'Catfish',
  'Swordfish', 'Shark', 'Marlin', 'Barracuda', 'Anglerfish', 'Ghostfish', 'Crystal Koi',
  'Moonfish', 'Sunfish', 'Starfish', 'Voidfish', 'Leviathan', 'Kraken Spawn', 'Dragon Eel',
  'Phoenix Fish', 'Titan Bass', 'Cosmic Carp', 'Nebula Ray', 'Quantum Trout', 'Time Salmon',
  'Ethereal Pike', 'Celestial Cod', 'Divine Marlin', 'Astral Shark', 'Primal Tuna',
  'Infinity Koi', 'World Serpent', 'Mythic Whale', 'God Fish', 'The One That Got Away'
];

const HERBALISM_TIERS = [
  'Dandelion', 'Clover', 'Mint', 'Basil', 'Sage', 'Thyme', 'Rosemary', 'Lavender', 'Chamomile', 'Ginseng',
  'Nightshade', 'Wolfsbane', 'Mandrake', 'Bloodroot', 'Ghostweed', 'Moonpetal', 'Sunbloom',
  'Starleaf', 'Voidmoss', 'Crystalwort', 'Dragonvine', 'Phoenix Flower', 'Titan Root', 'Cosmic Bloom',
  'Nebula Moss', 'Quantum Herb', 'Time Blossom', 'Ethereal Fern', 'Celestial Lotus', 'Divine Lily',
  'Astral Rose', 'Primal Vine', 'Infinity Orchid', 'World Flower', 'Genesis Bloom',
  'Mythic Herb', 'God\'s Breath', 'Supreme Petal', 'Ultimate Root', 'The First Seed'
];

const SKINNING_TIERS = [
  'Rabbit', 'Deer', 'Wolf', 'Bear', 'Boar', 'Elk', 'Bison', 'Tiger', 'Lion', 'Rhino',
  'Dragon', 'Wyvern', 'Griffin', 'Basilisk', 'Hydra', 'Phoenix', 'Chimera', 'Manticore',
  'Kraken', 'Leviathan', 'Behemoth', 'Titan Beast', 'Cosmic Serpent', 'Void Walker',
  'Starborn', 'Moon Beast', 'Sun Lion', 'Nebula Drake', 'Quantum Chimera', 'Time Beast',
  'Ethereal Wolf', 'Celestial Tiger', 'Divine Bear', 'Astral Dragon', 'Primal Titan',
  'Infinity Beast', 'World Serpent', 'Mythic Horror', 'God Beast', 'The Last Monster'
];

const FORAGING_TIERS = [
  'Cotton', 'Flax', 'Hemp', 'Silk Worm', 'Spider Silk', 'Wool', 'Mohair', 'Cashmere', 'Alpaca', 'Angora',
  'Shadowcloth', 'Moonweave', 'Sunthread', 'Starsilk', 'Voidfiber', 'Crystal Thread', 'Dragon Silk',
  'Phoenix Down', 'Titan Wool', 'Cosmic Cotton', 'Nebula Silk', 'Quantum Fiber', 'Time Thread',
  'Ethereal Weave', 'Celestial Cloth', 'Divine Silk', 'Astral Cotton', 'Primal Fiber',
  'Infinity Thread', 'World Weave', 'Genesis Silk', 'Mythic Cloth', 'God Thread',
  'Supreme Weave', 'Ultimate Fiber', 'Alpha Silk', 'Omega Cotton', 'The First Thread'
];

const HUNTING_TIERS = [
  'Rabbit', 'Pheasant', 'Duck', 'Goose', 'Turkey', 'Venison', 'Boar', 'Elk', 'Buffalo', 'Bear',
  'Exotic Bird', 'Wild Ox', 'Mountain Lion', 'Snow Leopard', 'White Tiger', 'Golden Eagle',
  'Shadow Panther', 'Moon Stag', 'Sun Phoenix', 'Star Hawk', 'Void Raven', 'Crystal Beast',
  'Dragon Game', 'Titan Prey', 'Cosmic Hunt', 'Nebula Fowl', 'Quantum Game', 'Time Beast',
  'Ethereal Prey', 'Celestial Stag', 'Divine Game', 'Astral Hunt', 'Primal Trophy',
  'Infinity Game', 'World Beast', 'Mythic Prey', 'God\'s Quarry', 'The Ultimate Hunt'
];

export function getResourceName(skillType: SkillType, tier: number): string {
  const idx = Math.min(tier - 1, 39);
  switch (skillType) {
    case SkillType.LOGGING:
      return LOGGING_TIERS[idx] + ' Wood';
    case SkillType.MINING:
      return MINING_TIERS[idx] + ' Ore';
    case SkillType.FISHING:
      return FISHING_TIERS[idx];
    case SkillType.HERBALISM:
      return HERBALISM_TIERS[idx];
    case SkillType.SKINNING:
      return SKINNING_TIERS[idx] + ' Hide';
    case SkillType.FORAGING:
      return FORAGING_TIERS[idx];
    case SkillType.HUNTING:
      return HUNTING_TIERS[idx] + ' Meat';
    default:
      return 'Resource';
  }
}

// Get name for any resourceId including processed materials
export function getResourceNameById(resourceId: string): string {
  // Parse resourceId format: "type_tN" (e.g., "logging_t1", "plank_t3", "ingot_t5")
  const match = resourceId.match(/^(.+)_t(\d+)$/);
  if (!match) return resourceId;

  const [, type, tierStr] = match;
  const tier = parseInt(tierStr);
  const idx = Math.min(tier - 1, 9); // Processed materials use 10 tiers

  // Raw gathering materials
  const skillTypeMap: Record<string, SkillType> = {
    logging: SkillType.LOGGING,
    mining: SkillType.MINING,
    fishing: SkillType.FISHING,
    herbalism: SkillType.HERBALISM,
    skinning: SkillType.SKINNING,
    foraging: SkillType.FORAGING,
    hunting: SkillType.HUNTING,
  };

  if (skillTypeMap[type]) {
    return getResourceName(skillTypeMap[type], tier);
  }

  // Processed materials
  const processedNames: Record<string, string[]> = {
    plank: TIER_NAMES.logging,
    ingot: TIER_NAMES.mining,
    plate: TIER_NAMES.mining,
    fillet: TIER_NAMES.fishing,
    extract: TIER_NAMES.herbalism,
    leather: TIER_NAMES.skinning,
    cloth: TIER_NAMES.foraging,
    setting: TIER_NAMES.hunting,
    essence: TIER_NAMES.herbalism,
    part: TIER_NAMES.mining,
  };

  const processedSuffixes: Record<string, string> = {
    plank: 'Plank',
    ingot: 'Ingot',
    plate: 'Plate',
    fillet: 'Fillet',
    extract: 'Extract',
    leather: 'Leather',
    cloth: 'Cloth',
    setting: 'Setting',
    essence: 'Essence',
    part: 'Part',
  };

  if (processedNames[type]) {
    const tierName = processedNames[type][idx] || 'Unknown';
    const suffix = processedSuffixes[type] || type;
    return `${tierName} ${suffix}`;
  }

  return resourceId;
}

// Helper to get tier name without suffix
export function getTierName(skillType: SkillType, tier: number): string {
  const idx = Math.min(tier - 1, 39);
  switch (skillType) {
    case SkillType.LOGGING: return LOGGING_TIERS[idx];
    case SkillType.MINING: return MINING_TIERS[idx];
    case SkillType.FISHING: return FISHING_TIERS[idx];
    case SkillType.HERBALISM: return HERBALISM_TIERS[idx];
    case SkillType.SKINNING: return SKINNING_TIERS[idx];
    case SkillType.FORAGING: return FORAGING_TIERS[idx];
    case SkillType.HUNTING: return HUNTING_TIERS[idx];
    default: return 'Unknown';
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function recalculateCharacterStats(state: GameState): CharacterState {
  const { equipment } = state.character;
  let totalStrength = 0;
  let totalIntellect = 0;
  let totalAgility = 0;
  let totalStamina = 0;

  // Sum stats from all equipped items
  const slots = Object.values(EquipmentSlot);
  for (const slot of slots) {
    const item = equipment[slot as EquipmentSlot];
    if (item) {
      totalStrength += item.stats.strength;
      totalIntellect += item.stats.intellect;
      totalAgility += item.stats.agility;
      totalStamina += item.stats.stamina;
    }
  }

  const maxHp = 10 + (totalStamina * 5);

  return {
    ...state.character,
    totalStrength,
    totalIntellect,
    totalAgility,
    totalStamina,
    maxHp,
    currentHp: Math.min(state.character.currentHp, maxHp),
  };
}

function recalculateBonuses(state: GameState): GameState {
  let bonusTaps = 0;
  let critChance = 0; // base 0%
  let critDamage = 0; // base 0%
  let luck = 0;
  let goldBonus = 0;
  let maxMana = 50;
  let manaRegen = 0.1;

  for (const upgrade of UPGRADES) {
    const level = state.upgrades[upgrade.id] || 0;
    if (level > 0) {
      const effect = upgrade.effect(level);
      switch (upgrade.category) {
        case 'tap':
          bonusTaps += effect;
          break;
        case 'crit':
          if (upgrade.id.includes('chance')) {
            critChance += effect;
          } else {
            critDamage += effect;
          }
          break;
        case 'luck':
          luck += effect;
          break;
        case 'gold':
          goldBonus += effect;
          break;
        case 'mana':
          if (upgrade.id.includes('cap')) {
            maxMana += effect;
          } else {
            manaRegen += effect;
          }
          break;
      }
    }
  }

  // Add bonuses from character stats (equipment)
  const charStats = state.character;
  bonusTaps += Math.floor(charStats.totalStrength * 0.01 * bonusTaps); // Strength adds % tap power
  manaRegen *= 1 + (charStats.totalIntellect * 0.02); // Intellect adds % mana regen
  luck += charStats.totalAgility * 0.5; // Agility adds luck

  return {
    ...state,
    bonusTaps,
    critChance,
    critDamage,
    luck,
    goldBonus,
    maxMana,
    manaRegen,
  };
}

// ============================================
// REDUCER
// ============================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GATHER': {
      const skill = state.skills[action.skillType];
      if (!skill.unlocked) return state;

      const tier = getTierFromLevel(skill.level);

      // Get talent bonuses
      const talentBonuses = calculateTalentBonuses(state.talents);

      // Check for active spells
      const now = Date.now();
      const hasDoubleXp = (state.spells['double_xp']?.activeUntil || 0) > now;
      const hasMegaCrit = (state.spells['mega_crit']?.activeUntil || 0) > now;
      const hasLuckyStar = (state.spells['lucky_star']?.activeUntil || 0) > now;

      // Calculate base taps (1 base + bonus from upgrades)
      const baseTaps = 1 + state.bonusTaps;
      let resourceTaps = baseTaps;

      // Check for crit - affects resources, gives bonus XP
      // Apply talent crit bonus
      const effectiveCritChance = hasMegaCrit ? 100 : (state.critChance + talentBonuses.critBonus);
      const isCrit = Math.random() * 100 < effectiveCritChance;
      if (isCrit) {
        // Apply talent crit damage bonus
        const totalCritDamage = state.critDamage + talentBonuses.critDamageBonus;
        resourceTaps = Math.floor(resourceTaps * (1 + totalCritDamage / 100));
      }

      // Check for luck (chance for +5 bonus resources)
      const effectiveLuck = hasLuckyStar ? state.luck + 50 : state.luck;
      const isLucky = Math.random() * 100 < effectiveLuck;
      if (isLucky) {
        resourceTaps += 5;
      }

      // Calculate XP - flat 1 XP per tap, no level scaling
      const xpPerTap = 1;
      let xpGained = xpPerTap * baseTaps;
      // Crits give 50% bonus XP (not the full crit damage multiplier)
      if (isCrit) xpGained = Math.floor(xpGained * 1.5);
      // Lucky hits give 25% bonus XP
      if (isLucky) xpGained = Math.floor(xpGained * 1.25);
      // Double XP spell doubles final amount
      if (hasDoubleXp) xpGained *= 2;
      // Apply talent XP bonus
      if (talentBonuses.xpBonus > 0) {
        xpGained = Math.floor(xpGained * (1 + talentBonuses.xpBonus / 100));
      }

      const newTotalXp = skill.totalXp + xpGained;
      const newLevel = levelFromTotalXp(newTotalXp);
      const didLevelUp = newLevel > skill.level;

      const resourceId = `${action.skillType}_t${tier}`;

      // Level up bonus: scales by level bracket (1-10: 100, 11-20: 200, 21-30: 300, etc.)
      // Plus milestone bonus at every 10th level (10: +1000, 20: +2000, 30: +3000, etc.)
      let levelUpBonus = 0;
      if (didLevelUp) {
        for (let i = skill.level + 1; i <= newLevel && i <= 999; i++) {
          // Level bracket determines base bonus: ceil(level/10) * 100
          levelUpBonus += Math.ceil(i / 10) * 100;
          // Milestone bonus at every 10th level: (level/10) * 1000
          if (i % 10 === 0) {
            levelUpBonus += (i / 10) * 1000;
          }
        }
      }

      // Total resources gained (normal + level up bonus)
      const totalResourceGain = resourceTaps + levelUpBonus;

      // Auto-unlock character tab when foraging
      const shouldUnlockCharacter = action.skillType === SkillType.FORAGING && !state.characterUnlocked;

      return {
        ...state,
        characterUnlocked: state.characterUnlocked || shouldUnlockCharacter,
        skills: {
          ...state.skills,
          [action.skillType]: {
            ...skill,
            totalXp: newTotalXp,
            level: Math.min(newLevel, 999),
          },
        },
        resources: {
          ...state.resources,
          [resourceId]: (state.resources[resourceId] || 0) + totalResourceGain,
        },
        stats: {
          ...state.stats,
          totalTaps: state.stats.totalTaps + 1,
          totalCrits: state.stats.totalCrits + (isCrit ? 1 : 0),
          totalLuckyHits: state.stats.totalLuckyHits + (isLucky ? 1 : 0),
          totalResourcesGathered: state.stats.totalResourcesGathered + totalResourceGain,
        },
        lastGatherResult: {
          skillType: action.skillType,
          baseTaps,
          resourceTaps,
          isCrit,
          isLucky,
          xpGained,
          timestamp: Date.now(),
          levelUp: didLevelUp,
          newLevel: didLevelUp ? newLevel : undefined,
          levelUpBonus: didLevelUp ? levelUpBonus : undefined,
        },
      };
    }

    case 'UNLOCK_SKILL': {
      const skill = state.skills[action.skillType];
      if (skill.unlocked) return state;

      // Check if this is a support skill
      if (isSupportSkill(action.skillType)) {
        // Support skills require Prestige 1+ and cost Chaos Points
        if (state.prestigeCount < 1) return state;

        const cpCost = SUPPORT_SKILL_COSTS[action.skillType] || 100;
        if (state.chaosPoints < cpCost) return state;

        return {
          ...state,
          chaosPoints: state.chaosPoints - cpCost,
          skills: {
            ...state.skills,
            [action.skillType]: {
              ...skill,
              unlocked: true,
            },
          },
        };
      }

      // Regular skills cost gold
      const cost = getUnlockCost(state.skillsUnlockedCount + 1);
      if (state.gold < cost) return state;

      return {
        ...state,
        gold: state.gold - cost,
        skillsUnlockedCount: state.skillsUnlockedCount + 1,
        skills: {
          ...state.skills,
          [action.skillType]: {
            ...skill,
            unlocked: true,
          },
        },
      };
    }

    case 'SELL_RESOURCE': {
      const current = state.resources[action.resourceId] || 0;
      if (current < action.quantity) return state;

      const tierMatch = action.resourceId.match(/_t(\d+)$/);
      const tier = tierMatch ? parseInt(tierMatch[1]) : 1;
      const goldPerItem = BALANCE.gold.base * Math.pow(BALANCE.gold.tierScale, tier - 1);

      // Check for double gold spell
      const now = Date.now();
      const hasDoubleGold = (state.spells['double_gold']?.activeUntil || 0) > now;
      const goldMultiplier = hasDoubleGold ? 2 : 1;

      // Chaos points bonus: +0.1% gold per chaos point
      const chaosGoldBonus = state.chaosPoints * 0.1;

      let goldGained = goldPerItem * action.quantity * (1 + state.goldBonus / 100 + chaosGoldBonus / 100) * goldMultiplier;

      return {
        ...state,
        gold: state.gold + goldGained,
        resources: {
          ...state.resources,
          [action.resourceId]: current - action.quantity,
        },
        stats: {
          ...state.stats,
          totalGoldEarned: state.stats.totalGoldEarned + goldGained,
        },
      };
    }

    case 'ADD_GOLD': {
      return {
        ...state,
        gold: state.gold + action.amount,
      };
    }

    case 'BUY_UPGRADE': {
      const upgrade = UPGRADES.find(u => u.id === action.upgradeId);
      if (!upgrade) return state;

      const currentLevel = state.upgrades[action.upgradeId] || 0;
      if (currentLevel >= upgrade.maxLevel) return state;

      const cost = upgrade.baseCost;
      if (state.gold < cost) return state;

      // Check mana cost for advanced mana regen upgrades
      const manaCost = getUpgradeManaCost(action.upgradeId);
      if (manaCost > 0 && state.mana < manaCost) return state;

      const newState = {
        ...state,
        gold: state.gold - cost,
        mana: manaCost > 0 ? state.mana - manaCost : state.mana,
        upgrades: {
          ...state.upgrades,
          [action.upgradeId]: currentLevel + 1,
        },
      };

      return recalculateBonuses(newState);
    }

    case 'UNLOCK_SPELLS': {
      if (state.spellsUnlocked) return state;
      if (state.gold < 10000) return state;

      return {
        ...state,
        gold: state.gold - 10000,
        spellsUnlocked: true,
      };
    }

    case 'UNLOCK_ACHIEVEMENTS': {
      if (state.achievementsUnlocked) return state;
      if (state.gold < 100) return state;

      return {
        ...state,
        gold: state.gold - 100,
        achievementsUnlocked: true,
      };
    }

    case 'UNLOCK_CHARACTER': {
      if (state.characterUnlocked) return state;
      return {
        ...state,
        characterUnlocked: true,
      };
    }

    case 'CAST_SPELL': {
      const spell = SPELLS.find(s => s.id === action.spellId);
      if (!spell) return state;
      if (!state.spellsUnlocked) return state;
      if (state.mana < spell.manaCost) return state;

      const now = Date.now();
      const spellState = state.spells[action.spellId];
      if (spellState && spellState.cooldownUntil > now) return state;

      return {
        ...state,
        mana: state.mana - spell.manaCost,
        spells: {
          ...state.spells,
          [action.spellId]: {
            activeUntil: now + spell.duration * 1000,
            cooldownUntil: now + spell.cooldown * 1000,
          },
        },
        stats: {
          ...state.stats,
          totalSpellsCast: state.stats.totalSpellsCast + 1,
        },
      };
    }

    case 'TICK': {
      const deltaSeconds = action.deltaMs / 1000;
      let newMana = state.mana + state.manaRegen * deltaSeconds;
      if (newMana > state.maxMana) newMana = state.maxMana;

      // Process completed crafts
      const now = Date.now();
      const completedCrafts: CraftingQueueItem[] = [];
      const remainingQueue: CraftingQueueItem[] = [];

      for (const item of state.craftingQueue) {
        if (item.endTime <= now) {
          completedCrafts.push(item);
        } else {
          remainingQueue.push(item);
        }
      }

      // Calculate XP and crafted items from completed crafts
      let newCraftedItems = { ...state.craftedItems };
      let newSkills = { ...state.skills };
      let newResources = { ...state.resources };
      let shouldUnlockCharacter = false;

      // Equipment crafting skills (unlock character when crafting final items)
      const equipmentSkills = [
        SkillType.SMITHING,
        SkillType.LEATHERWORKING,
        SkillType.TAILORING,
        SkillType.JEWELCRAFTING,
      ];

      // Get talent bonuses for crafting
      const talentBonuses = calculateTalentBonuses(state.talents);

      for (const completed of completedCrafts) {
        const recipe = CRAFTING_RECIPES.find(r => r.id === completed.recipeId);
        if (recipe) {
          let batchQty = completed.quantity || 1;

          // Apply multi-craft chance (each item has a chance to double)
          if (talentBonuses.multiCraftChance > 0) {
            let bonusItems = 0;
            for (let i = 0; i < batchQty; i++) {
              if (Math.random() * 100 < talentBonuses.multiCraftChance) {
                bonusItems++;
              }
            }
            batchQty += bonusItems;
          }

          // If recipe produces a resource, add to resources; otherwise add to crafted items
          if (recipe.produces) {
            newResources[recipe.produces.resourceId] =
              (newResources[recipe.produces.resourceId] || 0) + (recipe.produces.quantity * batchQty);
          } else {
            newCraftedItems[recipe.id] = (newCraftedItems[recipe.id] || 0) + batchQty;
            // Unlock character when crafting equipment (final items from equipment skills)
            if (equipmentSkills.includes(recipe.craftingSkill)) {
              shouldUnlockCharacter = true;
            }
          }

          // Add XP to crafting skill (multiplied by batch quantity)
          // Apply talent XP bonus
          const skillState = newSkills[recipe.craftingSkill];
          if (skillState) {
            let xpGain = recipe.xpReward * batchQty;
            if (talentBonuses.xpBonus > 0) {
              xpGain = Math.floor(xpGain * (1 + talentBonuses.xpBonus / 100));
            }
            const newTotalXp = skillState.totalXp + xpGain;
            const newLevel = levelFromTotalXp(newTotalXp);
            newSkills = {
              ...newSkills,
              [recipe.craftingSkill]: {
                ...skillState,
                totalXp: newTotalXp,
                level: newLevel,
              },
            };
          }
        }
      }

      // Calculate passive gold income
      const goldIncome = state.goldPerSecond * deltaSeconds;

      return {
        ...state,
        gold: state.gold + goldIncome,
        characterUnlocked: state.characterUnlocked || shouldUnlockCharacter,
        mana: state.spellsUnlocked ? newMana : state.mana,
        stats: {
          ...state.stats,
          totalPlayTime: state.stats.totalPlayTime + deltaSeconds,
          sessionPlayTime: state.stats.sessionPlayTime + deltaSeconds,
          totalGoldEarned: state.stats.totalGoldEarned + goldIncome,
        },
        craftingQueue: remainingQueue,
        craftedItems: newCraftedItems,
        skills: newSkills,
        resources: newResources,
      };
    }

    case 'ADD_EQUIPMENT': {
      return {
        ...state,
        equipmentInventory: [...state.equipmentInventory, action.equipment],
        stats: {
          ...state.stats,
          totalEquipmentObtained: state.stats.totalEquipmentObtained + 1,
        },
      };
    }

    case 'EQUIP_ITEM': {
      const itemIndex = state.equipmentInventory.findIndex(e => e.id === action.equipmentId);
      if (itemIndex === -1) return state;

      const item = state.equipmentInventory[itemIndex];
      const currentlyEquipped = state.character.equipment[item.slot];

      // Remove item from inventory
      const newInventory = state.equipmentInventory.filter((_, i) => i !== itemIndex);

      // If there's already an item in that slot, move it to inventory
      if (currentlyEquipped) {
        newInventory.push(currentlyEquipped);
      }

      const newEquipment = {
        ...state.character.equipment,
        [item.slot]: item,
      };

      const newCharacter = recalculateCharacterStats({
        ...state,
        character: { ...state.character, equipment: newEquipment },
      });

      const newState = {
        ...state,
        equipmentInventory: newInventory,
        character: newCharacter,
      };

      return recalculateBonuses(newState);
    }

    case 'UNEQUIP_ITEM': {
      const equipped = state.character.equipment[action.slot];
      if (!equipped) return state;

      const newEquipment = {
        ...state.character.equipment,
        [action.slot]: null,
      };

      const newCharacter = recalculateCharacterStats({
        ...state,
        character: { ...state.character, equipment: newEquipment },
      });

      const newState = {
        ...state,
        equipmentInventory: [...state.equipmentInventory, equipped],
        character: newCharacter,
      };

      return recalculateBonuses(newState);
    }

    case 'SELL_EQUIPMENT': {
      const itemIndex = state.equipmentInventory.findIndex(e => e.id === action.equipmentId);
      if (itemIndex === -1) return state;

      const item = state.equipmentInventory[itemIndex];

      return {
        ...state,
        gold: state.gold + item.sellValue,
        equipmentInventory: state.equipmentInventory.filter((_, i) => i !== itemIndex),
        stats: {
          ...state.stats,
          totalGoldEarned: state.stats.totalGoldEarned + item.sellValue,
        },
      };
    }

    // Developer tools
    case 'DEV_ADD_MANA': {
      return {
        ...state,
        mana: Math.min(state.maxMana, state.mana + action.amount),
      };
    }

    case 'DEV_ADD_MAX_MANA': {
      return {
        ...state,
        maxMana: state.maxMana + action.amount,
      };
    }

    case 'DEV_ADD_BONUS_TAPS': {
      return {
        ...state,
        bonusTaps: state.bonusTaps + action.amount,
      };
    }

    case 'DEV_UNLOCK_SPELLS': {
      return {
        ...state,
        spellsUnlocked: true,
      };
    }

    case 'DEV_ADD_CHAOS_POINTS': {
      return {
        ...state,
        chaosPoints: state.chaosPoints + action.amount,
      };
    }

    case 'DEV_SET_PRESTIGE': {
      return {
        ...state,
        prestigeCount: action.count,
      };
    }

    case 'DEV_TOGGLE_INSTANT_CRAFT': {
      return {
        ...state,
        devInstantCraft: !state.devInstantCraft,
      };
    }

    // Achievements
    case 'UNLOCK_ACHIEVEMENT': {
      if (state.unlockedAchievements.includes(action.achievementId)) {
        return state;
      }
      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, action.achievementId],
      };
    }

    case 'CLAIM_ACHIEVEMENT': {
      if (state.claimedAchievements.includes(action.achievementId)) {
        return state;
      }
      if (!state.unlockedAchievements.includes(action.achievementId)) {
        return state;
      }
      // Achievement rewards add to gold per second, not instant gold
      return {
        ...state,
        goldPerSecond: state.goldPerSecond + action.reward,
        claimedAchievements: [...state.claimedAchievements, action.achievementId],
      };
    }

    case 'PRESTIGE': {
      // Reset skills to initial state
      const newSkills = createInitialSkills();

      // Apply starting XP talent bonus
      const startingXpTalent = TALENTS.find(t => t.id === 'starting_xp');
      const startingXpRank = state.talents['starting_xp'] || 0;
      if (startingXpTalent && startingXpRank > 0) {
        const bonusXp = startingXpTalent.effect(startingXpRank);
        for (const skillType of Object.keys(newSkills) as SkillType[]) {
          newSkills[skillType].totalXp = bonusXp;
          newSkills[skillType].level = levelFromTotalXp(bonusXp);
        }
      }

      // Apply starting gold talent bonus
      const startingGoldTalent = TALENTS.find(t => t.id === 'starting_gold');
      const startingGoldRank = state.talents['starting_gold'] || 0;
      const startingGold = startingGoldTalent && startingGoldRank > 0
        ? startingGoldTalent.effect(startingGoldRank)
        : 0;

      // Keep total play time but reset session play time
      const newStats: StatsState = {
        ...initialStats,
        totalPlayTime: state.stats.totalPlayTime,
        sessionPlayTime: 0,
      };

      return {
        ...initialState,
        gold: startingGold,
        prestigeCount: state.prestigeCount + 1,
        chaosPoints: state.chaosPoints + action.chaosPointsEarned,
        talents: state.talents, // Keep talents!
        skills: newSkills,
        stats: newStats,
        // Reset achievements for new prestige run
        unlockedAchievements: [],
        claimedAchievements: [],
        // Keep game version
        gameVersion: state.gameVersion,
        lastSaveTime: Date.now(),
      };
    }

    case 'BUY_TALENT': {
      const talent = TALENTS.find(t => t.id === action.talentId);
      if (!talent) return state;

      const currentRank = state.talents[action.talentId] || 0;
      if (currentRank >= talent.maxRank) return state;

      // Check prestige requirement
      const requiredPrestige = getRequiredPrestigeForTier(talent.tier);
      if (state.prestigeCount < requiredPrestige) return state;

      // Check cost
      const cost = getTalentCost(talent, currentRank);
      if (state.chaosPoints < cost) return state;

      return {
        ...state,
        chaosPoints: state.chaosPoints - cost,
        talents: {
          ...state.talents,
          [action.talentId]: currentRank + 1,
        },
      };
    }

    // Crafting actions
    case 'START_CRAFT': {
      const recipe = CRAFTING_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      const quantity = action.quantity || 1;

      // Check if player has required materials for all items
      for (const mat of recipe.materials) {
        const have = state.resources[mat.resourceId] || 0;
        if (have < mat.quantity * quantity) {
          return state; // Not enough materials
        }
      }

      // Check if player has required crafting skill level
      const skillLevel = state.skills[recipe.craftingSkill]?.level || 1;
      if (skillLevel < recipe.requiredLevel) {
        return state; // Level too low
      }

      // Deduct materials for all items
      const newResources = { ...state.resources };
      for (const mat of recipe.materials) {
        newResources[mat.resourceId] = (newResources[mat.resourceId] || 0) - (mat.quantity * quantity);
      }

      // If instant craft is enabled, skip queue and add directly
      if (state.devInstantCraft) {
        const newSkillState = { ...state.skills };
        const currentSkill = newSkillState[recipe.craftingSkill];
        const xpGained = recipe.xpReward * quantity;
        const newTotalXp = currentSkill.totalXp + xpGained;
        const newLevel = levelFromTotalXp(newTotalXp);
        newSkillState[recipe.craftingSkill] = {
          ...currentSkill,
          totalXp: newTotalXp,
          level: newLevel,
        };

        // If recipe produces a resource (like plates/ingots), add to resources
        // Otherwise add to craftedItems (final sellable items)
        if (recipe.produces) {
          return {
            ...state,
            resources: {
              ...newResources,
              [recipe.produces.resourceId]: (newResources[recipe.produces.resourceId] || 0) + (recipe.produces.quantity * quantity),
            },
            skills: newSkillState,
          };
        }

        return {
          ...state,
          resources: newResources,
          skills: newSkillState,
          craftedItems: {
            ...state.craftedItems,
            [action.recipeId]: (state.craftedItems[action.recipeId] || 0) + quantity,
          },
        };
      }

      // Get talent craft speed bonus
      const talentBonuses = calculateTalentBonuses(state.talents);
      const craftSpeedMultiplier = 1 + (talentBonuses.craftSpeedBonus / 100);

      // Add single batched item to crafting queue (total time = craftTime * quantity)
      // Apply craft speed bonus (faster = less time)
      const now = Date.now();
      const baseCraftTime = recipe.craftTime * quantity * 1000;
      const totalCraftTime = Math.floor(baseCraftTime / craftSpeedMultiplier);
      const newQueueItem: CraftingQueueItem = {
        id: `craft_${now}_${Math.random().toString(36).substr(2, 9)}`,
        recipeId: action.recipeId,
        quantity,
        startTime: now,
        endTime: now + totalCraftTime,
      };

      return {
        ...state,
        resources: newResources,
        craftingQueue: [...state.craftingQueue, newQueueItem],
      };
    }

    case 'CANCEL_CRAFT': {
      const itemToCancel = state.craftingQueue.find(item => item.id === action.queueItemId);
      if (!itemToCancel) return state;

      // Refund materials for full batch quantity
      const recipe = CRAFTING_RECIPES.find(r => r.id === itemToCancel.recipeId);
      if (!recipe) return state;

      const newResources = { ...state.resources };
      for (const mat of recipe.materials) {
        newResources[mat.resourceId] = (newResources[mat.resourceId] || 0) + (mat.quantity * itemToCancel.quantity);
      }

      return {
        ...state,
        resources: newResources,
        craftingQueue: state.craftingQueue.filter(item => item.id !== action.queueItemId),
      };
    }

    case 'COLLECT_CRAFTED': {
      const currentCount = state.craftedItems[action.recipeId] || 0;
      if (currentCount < action.quantity) return state;

      const recipe = CRAFTING_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      // Get talent gold bonus
      const talentBonuses = calculateTalentBonuses(state.talents);
      const totalGoldBonus = state.goldBonus + talentBonuses.goldBonus;

      // Sell for gold
      const goldEarned = recipe.sellValue * action.quantity * (1 + totalGoldBonus / 100);

      return {
        ...state,
        gold: state.gold + goldEarned,
        craftedItems: {
          ...state.craftedItems,
          [action.recipeId]: currentCount - action.quantity,
        },
        stats: {
          ...state.stats,
          totalGoldEarned: state.stats.totalGoldEarned + goldEarned,
        },
      };
    }

    case 'EQUIP_CRAFTED': {
      const currentCount = state.craftedItems[action.recipeId] || 0;
      if (currentCount < 1) return state;

      // Create equipment from the recipe
      const equipment = createEquipmentFromRecipe(action.recipeId);
      if (!equipment) return state;

      // Auto-equip: move any currently equipped item to inventory
      const currentlyEquipped = state.character.equipment[equipment.slot];
      const newInventory = currentlyEquipped
        ? [...state.equipmentInventory, currentlyEquipped]
        : [...state.equipmentInventory];

      // Update equipment slots
      const newEquipment = {
        ...state.character.equipment,
        [equipment.slot]: equipment,
      };

      // Recalculate character stats with new equipment
      const newCharacter = recalculateCharacterStats({
        ...state,
        character: { ...state.character, equipment: newEquipment },
      });

      const newState = {
        ...state,
        craftedItems: {
          ...state.craftedItems,
          [action.recipeId]: currentCount - 1,
        },
        equipmentInventory: newInventory,
        character: newCharacter,
        characterUnlocked: true,
        stats: {
          ...state.stats,
          totalEquipmentObtained: state.stats.totalEquipmentObtained + 1,
        },
      };

      return recalculateBonuses(newState);
    }

    case 'LOAD_GAME': {
      // Merge loaded state with defaults for any missing fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedStats = (action.state.stats || {}) as any;
      // Migration: if old playTime exists but not totalPlayTime, use playTime as totalPlayTime
      const migratedStats = {
        ...initialStats,
        ...loadedStats,
        totalPlayTime: loadedStats.totalPlayTime ?? loadedStats.playTime ?? 0,
        sessionPlayTime: loadedStats.sessionPlayTime ?? 0,
      };

      const loadedState = {
        ...initialState,
        ...action.state,
        character: action.state.character || initialCharacter,
        equipmentInventory: action.state.equipmentInventory || [],
        unlockedAchievements: action.state.unlockedAchievements || [],
        claimedAchievements: action.state.claimedAchievements || [],
        stats: migratedStats,
        // Migration: add crafting state if missing
        craftingQueue: action.state.craftingQueue || [],
        craftedItems: action.state.craftedItems || {},
        // Migration: add talents if missing
        talents: action.state.talents || {},
      };
      return recalculateBonuses(loadedState);
    }

    case 'LOAD_CLOUD_SAVE': {
      // Load cloud save state, similar to LOAD_GAME
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cloudStats = (action.cloudState.stats || {}) as any;
      const migratedStats = {
        ...initialStats,
        ...cloudStats,
        totalPlayTime: cloudStats.totalPlayTime ?? cloudStats.playTime ?? 0,
        sessionPlayTime: 0, // Reset session time on cloud load
      };

      const cloudState = {
        ...initialState,
        ...action.cloudState,
        character: action.cloudState.character || initialCharacter,
        equipmentInventory: action.cloudState.equipmentInventory || [],
        unlockedAchievements: action.cloudState.unlockedAchievements || [],
        claimedAchievements: action.cloudState.claimedAchievements || [],
        stats: migratedStats,
        craftingQueue: action.cloudState.craftingQueue || [],
        craftedItems: action.cloudState.craftedItems || {},
        talents: action.cloudState.talents || {},
      };
      return recalculateBonuses(cloudState);
    }

    case 'RESET_GAME': {
      return initialState;
    }

    default:
      return state;
  }
}

// ============================================
// HELPERS
// ============================================

export function getUnlockCost(unlockNumber: number): number {
  return SKILL_UNLOCK_COSTS[unlockNumber as keyof typeof SKILL_UNLOCK_COSTS]
    ?? 250_000 * Math.pow(2, unlockNumber - 7);
}

export function getXpProgress(skill: SkillState): number {
  if (skill.level >= 999) return 100;
  const currentLevelXp = totalXpForLevel(skill.level);
  const nextLevelXp = totalXpForLevel(skill.level + 1);
  const progress = (skill.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return Math.max(0, Math.min(100, progress * 100));
}

// ============================================
// CONTEXT
// ============================================

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  gather: (skillType: SkillType) => void;
  unlockSkill: (skillType: SkillType) => void;
  sellResource: (resourceId: string, quantity: number) => void;
  sellAllResources: () => void;
  buyUpgrade: (upgradeId: string) => void;
  unlockSpells: () => void;
  unlockAchievements: () => void;
  unlockCharacter: () => void;
  castSpell: (spellId: string) => void;
  saveGame: () => void;
  addEquipment: (equipment: Equipment) => void;
  equipItem: (equipmentId: string) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  sellEquipment: (equipmentId: string) => void;
  // Developer tools
  devAddGold: (amount: number) => void;
  devAddMana: (amount: number) => void;
  devAddMaxMana: (amount: number) => void;
  devAddBonusTaps: (amount: number) => void;
  devUnlockSpells: () => void;
  devAddChaosPoints: (amount: number) => void;
  devSetPrestige: (count: number) => void;
  devToggleInstantCraft: () => void;
  // Achievements
  unlockAchievement: (achievementId: string) => void;
  claimAchievement: (achievementId: string, reward: number) => void;
  checkAchievements: () => void;
  // Prestige & Talents
  prestige: (chaosPointsEarned: number) => void;
  buyTalent: (talentId: string) => void;
  // Crafting
  startCraft: (recipeId: string, quantity?: number) => void;
  cancelCraft: (queueItemId: string) => void;
  collectCrafted: (recipeId: string, quantity: number) => void;
  equipCrafted: (recipeId: string) => void;
  // Cloud save
  loadCloudSave: (cloudState: any) => void;
}

const GameContext = createContext<GameContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

const SAVE_KEY = 'infinity_save';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return recalculateBonuses({ ...initial, ...parsed });
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return initial;
  });

  // Game tick for mana regen and play time
  const lastTickRef = useRef(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;
      dispatch({ type: 'TICK', deltaMs });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }));
    }, 30000);
    return () => clearInterval(interval);
  }, [state]);

  // Save on page refresh/close and tab switch
  useEffect(() => {
    const saveToStorage = () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }));
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToStorage();
      }
    };
    window.addEventListener('beforeunload', saveToStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', saveToStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state]);

  const gather = useCallback((skillType: SkillType) => {
    dispatch({ type: 'GATHER', skillType });
  }, []);

  const unlockSkill = useCallback((skillType: SkillType) => {
    dispatch({ type: 'UNLOCK_SKILL', skillType });
  }, []);

  const sellResource = useCallback((resourceId: string, quantity: number) => {
    dispatch({ type: 'SELL_RESOURCE', resourceId, quantity });
  }, []);

  const sellAllResources = useCallback(() => {
    Object.entries(state.resources).forEach(([resourceId, quantity]) => {
      if (quantity > 0) {
        dispatch({ type: 'SELL_RESOURCE', resourceId, quantity });
      }
    });
  }, [state.resources]);

  const buyUpgrade = useCallback((upgradeId: string) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeId });
  }, []);

  const unlockSpells = useCallback(() => {
    dispatch({ type: 'UNLOCK_SPELLS' });
  }, []);

  const unlockAchievements = useCallback(() => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENTS' });
  }, []);

  const unlockCharacter = useCallback(() => {
    dispatch({ type: 'UNLOCK_CHARACTER' });
  }, []);

  const castSpell = useCallback((spellId: string) => {
    dispatch({ type: 'CAST_SPELL', spellId });
  }, []);

  const saveGame = useCallback(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }));
  }, [state]);

  const addEquipment = useCallback((equipment: Equipment) => {
    dispatch({ type: 'ADD_EQUIPMENT', equipment });
  }, []);

  const equipItem = useCallback((equipmentId: string) => {
    dispatch({ type: 'EQUIP_ITEM', equipmentId });
  }, []);

  const unequipItem = useCallback((slot: EquipmentSlot) => {
    dispatch({ type: 'UNEQUIP_ITEM', slot });
  }, []);

  const sellEquipment = useCallback((equipmentId: string) => {
    dispatch({ type: 'SELL_EQUIPMENT', equipmentId });
  }, []);

  // Developer tools
  const devAddGold = useCallback((amount: number) => {
    dispatch({ type: 'ADD_GOLD', amount });
  }, []);

  const devAddMana = useCallback((amount: number) => {
    dispatch({ type: 'DEV_ADD_MANA', amount });
  }, []);

  const devAddMaxMana = useCallback((amount: number) => {
    dispatch({ type: 'DEV_ADD_MAX_MANA', amount });
  }, []);

  const devAddBonusTaps = useCallback((amount: number) => {
    dispatch({ type: 'DEV_ADD_BONUS_TAPS', amount });
  }, []);

  const devUnlockSpells = useCallback(() => {
    dispatch({ type: 'DEV_UNLOCK_SPELLS' });
  }, []);

  const devAddChaosPoints = useCallback((amount: number) => {
    dispatch({ type: 'DEV_ADD_CHAOS_POINTS', amount });
  }, []);

  const devSetPrestige = useCallback((count: number) => {
    dispatch({ type: 'DEV_SET_PRESTIGE', count });
  }, []);

  const devToggleInstantCraft = useCallback(() => {
    dispatch({ type: 'DEV_TOGGLE_INSTANT_CRAFT' });
  }, []);

  // Achievements
  const unlockAchievement = useCallback((achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
  }, []);

  const claimAchievement = useCallback((achievementId: string, reward: number) => {
    dispatch({ type: 'CLAIM_ACHIEVEMENT', achievementId, reward });
  }, []);

  // Check all achievements against current state
  const checkAchievements = useCallback(() => {
    // This is called from the component that has access to achievements
    // We don't check here, just provide the function
  }, []);

  // Prestige function
  const prestige = useCallback((chaosPointsEarned: number) => {
    dispatch({ type: 'PRESTIGE', chaosPointsEarned });
  }, []);

  // Talent function
  const buyTalent = useCallback((talentId: string) => {
    dispatch({ type: 'BUY_TALENT', talentId });
  }, []);

  // Crafting functions
  const startCraft = useCallback((recipeId: string, quantity: number = 1) => {
    dispatch({ type: 'START_CRAFT', recipeId, quantity });
  }, []);

  const cancelCraft = useCallback((queueItemId: string) => {
    dispatch({ type: 'CANCEL_CRAFT', queueItemId });
  }, []);

  const collectCrafted = useCallback((recipeId: string, quantity: number) => {
    dispatch({ type: 'COLLECT_CRAFTED', recipeId, quantity });
  }, []);

  const equipCrafted = useCallback((recipeId: string) => {
    dispatch({ type: 'EQUIP_CRAFTED', recipeId });
  }, []);

  // Load cloud save - replaces current state with cloud state
  const loadCloudSave = useCallback((cloudState: any) => {
    dispatch({ type: 'LOAD_CLOUD_SAVE', cloudState });
  }, []);

  return (
    <GameContext.Provider value={{
      state,
      dispatch,
      gather,
      unlockSkill,
      sellResource,
      sellAllResources,
      buyUpgrade,
      unlockSpells,
      unlockAchievements,
      unlockCharacter,
      castSpell,
      saveGame,
      addEquipment,
      equipItem,
      unequipItem,
      sellEquipment,
      devAddGold,
      devAddMana,
      devAddMaxMana,
      devAddBonusTaps,
      devUnlockSpells,
      devAddChaosPoints,
      devSetPrestige,
      devToggleInstantCraft,
      unlockAchievement,
      claimAchievement,
      checkAchievements,
      prestige,
      buyTalent,
      startCraft,
      cancelCraft,
      collectCrafted,
      equipCrafted,
      loadCloudSave,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
