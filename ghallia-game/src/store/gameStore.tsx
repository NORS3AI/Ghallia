/**
 * Ghallia Game State Store
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

// Generate mana regen upgrades (15 total)
// First 10: +0.1/sec each, costs gold only (1000, 10000, 100000, 1M, 10M, ...)
// Last 5: +0.5/sec each, costs gold AND mana (100k+10mana, 1M+25mana, 10M+50mana, 100M+100mana, 1B+200mana)
const MANA_REGEN_NAMES = [
  'Mana Flow I', 'Mana Flow II', 'Mana Flow III', 'Mana Flow IV', 'Mana Flow V',
  'Arcane Stream', 'Mystic Current', 'Ethereal River', 'Astral Tide', 'Cosmic Wave',
  'Spirit Surge', 'Soul Pulse', 'Life Beat', 'Energy Flux', 'Power Cycle'
];

// Extended upgrade definition to include mana cost
export interface ManaUpgradeDef extends UpgradeDef {
  manaCost?: number;
}

const generateManaRegenUpgrades = (): ManaUpgradeDef[] => {
  const upgrades: ManaUpgradeDef[] = [];

  // First 10: +0.1/sec, gold only, exponential costs
  const goldOnlyCosts = [1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000, 1000000000000];
  for (let i = 0; i < 10; i++) {
    upgrades.push({
      id: `mana_regen_${i + 1}`,
      name: MANA_REGEN_NAMES[i],
      description: `+0.1 mana/sec`,
      baseCost: goldOnlyCosts[i],
      maxLevel: 1,
      effect: () => 0.1,
      category: 'mana' as const,
      manaCost: 0
    });
  }

  // Last 5: +0.5/sec, gold AND mana costs
  const advancedCosts = [
    { gold: 100000, mana: 10 },
    { gold: 1000000, mana: 25 },
    { gold: 10000000, mana: 50 },
    { gold: 100000000, mana: 100 },
    { gold: 1000000000, mana: 200 }
  ];
  for (let i = 0; i < 5; i++) {
    upgrades.push({
      id: `mana_regen_${i + 11}`,
      name: MANA_REGEN_NAMES[i + 10],
      description: `+0.5 mana/sec (costs ${advancedCosts[i].mana} mana)`,
      baseCost: advancedCosts[i].gold,
      maxLevel: 1,
      effect: () => 0.5,
      category: 'mana' as const,
      manaCost: advancedCosts[i].mana
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
  { id: 'auto_tap', name: 'Auto Harvest', description: 'Auto-tap for 20 seconds', manaCost: 25, duration: 20, cooldown: 60, icon: '⚡' },
  { id: 'double_xp', name: 'Wisdom', description: '2x XP for 30 seconds', manaCost: 30, duration: 30, cooldown: 90, icon: '📚' },
  { id: 'double_gold', name: 'Prosperity', description: '2x gold for 30 seconds', manaCost: 30, duration: 30, cooldown: 90, icon: '💎' },
  { id: 'mega_crit', name: 'Critical Surge', description: '100% crit chance for 10 seconds', manaCost: 40, duration: 10, cooldown: 120, icon: '🎯' },
  { id: 'lucky_star', name: 'Lucky Star', description: '50% luck for 15 seconds', manaCost: 35, duration: 15, cooldown: 100, icon: '⭐' },
];

// ============================================
// CRAFTING RECIPE DEFINITIONS
// ============================================

export interface CraftingRecipe {
  id: string;
  name: string;
  craftingSkill: SkillType; // Which crafting skill makes this
  requiredLevel: number; // Level needed in crafting skill
  materials: { resourceId: string; quantity: number }[]; // Required materials
  craftTime: number; // Seconds to craft
  xpReward: number; // XP gained when crafted
  sellValue: number; // Gold when sold
  icon: string;
}

// Recipe template types for each crafting skill (15 types each)
const SAWMILL_RECIPE_TYPES = [
  { suffix: 'Plank', icon: '🪵', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 1.5 },
  { suffix: 'Board', icon: '📋', timeMultiplier: 1.2, materialMultiplier: 3, valueMultiplier: 2 },
  { suffix: 'Beam', icon: '🏗️', timeMultiplier: 1.5, materialMultiplier: 5, valueMultiplier: 3 },
  { suffix: 'Frame', icon: '🖼️', timeMultiplier: 2, materialMultiplier: 6, valueMultiplier: 4 },
  { suffix: 'Chair', icon: '🪑', timeMultiplier: 3, materialMultiplier: 8, valueMultiplier: 6 },
  { suffix: 'Table', icon: '🪵', timeMultiplier: 4, materialMultiplier: 12, valueMultiplier: 10 },
  { suffix: 'Shelf', icon: '📚', timeMultiplier: 2.5, materialMultiplier: 7, valueMultiplier: 5 },
  { suffix: 'Chest', icon: '📦', timeMultiplier: 5, materialMultiplier: 15, valueMultiplier: 12 },
  { suffix: 'Cabinet', icon: '🗄️', timeMultiplier: 6, materialMultiplier: 20, valueMultiplier: 16 },
  { suffix: 'Bed', icon: '🛏️', timeMultiplier: 8, materialMultiplier: 25, valueMultiplier: 20 },
  { suffix: 'Wardrobe', icon: '🚪', timeMultiplier: 10, materialMultiplier: 30, valueMultiplier: 25 },
  { suffix: 'Throne', icon: '👑', timeMultiplier: 15, materialMultiplier: 50, valueMultiplier: 40 },
  { suffix: 'Carriage', icon: '🛞', timeMultiplier: 20, materialMultiplier: 75, valueMultiplier: 60 },
  { suffix: 'Ship Hull', icon: '⛵', timeMultiplier: 30, materialMultiplier: 100, valueMultiplier: 85 },
  { suffix: 'Cathedral Frame', icon: '⛪', timeMultiplier: 60, materialMultiplier: 200, valueMultiplier: 180 },
];

const SMITHING_RECIPE_TYPES = [
  { suffix: 'Ingot', icon: '🧱', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 1.5 },
  { suffix: 'Nails', icon: '📍', timeMultiplier: 1.2, materialMultiplier: 3, valueMultiplier: 2 },
  { suffix: 'Chain', icon: '⛓️', timeMultiplier: 1.5, materialMultiplier: 5, valueMultiplier: 3 },
  { suffix: 'Dagger', icon: '🗡️', timeMultiplier: 2, materialMultiplier: 6, valueMultiplier: 4 },
  { suffix: 'Sword', icon: '⚔️', timeMultiplier: 3, materialMultiplier: 10, valueMultiplier: 7 },
  { suffix: 'Shield', icon: '🛡️', timeMultiplier: 4, materialMultiplier: 12, valueMultiplier: 10 },
  { suffix: 'Helmet', icon: '⛑️', timeMultiplier: 3.5, materialMultiplier: 8, valueMultiplier: 6 },
  { suffix: 'Chestplate', icon: '🦺', timeMultiplier: 6, materialMultiplier: 20, valueMultiplier: 16 },
  { suffix: 'Gauntlets', icon: '🧤', timeMultiplier: 4, materialMultiplier: 10, valueMultiplier: 8 },
  { suffix: 'Greaves', icon: '🦿', timeMultiplier: 5, materialMultiplier: 15, valueMultiplier: 12 },
  { suffix: 'Battleaxe', icon: '🪓', timeMultiplier: 8, materialMultiplier: 25, valueMultiplier: 20 },
  { suffix: 'Warhammer', icon: '🔨', timeMultiplier: 10, materialMultiplier: 30, valueMultiplier: 25 },
  { suffix: 'Greatsword', icon: '⚔️', timeMultiplier: 15, materialMultiplier: 50, valueMultiplier: 40 },
  { suffix: 'Full Armor', icon: '🛡️', timeMultiplier: 25, materialMultiplier: 80, valueMultiplier: 70 },
  { suffix: 'Legendary Blade', icon: '✨', timeMultiplier: 60, materialMultiplier: 200, valueMultiplier: 180 },
];

const COOKING_RECIPE_TYPES = [
  { suffix: 'Fillet', icon: '🍣', timeMultiplier: 1, materialMultiplier: 1, valueMultiplier: 1.5 },
  { suffix: 'Steak', icon: '🥩', timeMultiplier: 1.2, materialMultiplier: 2, valueMultiplier: 2 },
  { suffix: 'Soup', icon: '🍲', timeMultiplier: 1.5, materialMultiplier: 3, valueMultiplier: 2.5 },
  { suffix: 'Sushi', icon: '🍱', timeMultiplier: 2, materialMultiplier: 2, valueMultiplier: 4 },
  { suffix: 'Pie', icon: '🥧', timeMultiplier: 3, materialMultiplier: 4, valueMultiplier: 5 },
  { suffix: 'Stew', icon: '🍛', timeMultiplier: 4, materialMultiplier: 5, valueMultiplier: 7 },
  { suffix: 'Roast', icon: '🍗', timeMultiplier: 5, materialMultiplier: 6, valueMultiplier: 9 },
  { suffix: 'Casserole', icon: '🥘', timeMultiplier: 6, materialMultiplier: 8, valueMultiplier: 12 },
  { suffix: 'Gourmet Dish', icon: '🍽️', timeMultiplier: 8, materialMultiplier: 10, valueMultiplier: 16 },
  { suffix: 'Feast Platter', icon: '🍱', timeMultiplier: 10, materialMultiplier: 15, valueMultiplier: 22 },
  { suffix: 'Chef Special', icon: '👨‍🍳', timeMultiplier: 15, materialMultiplier: 20, valueMultiplier: 30 },
  { suffix: 'Royal Banquet', icon: '👑', timeMultiplier: 20, materialMultiplier: 30, valueMultiplier: 45 },
  { suffix: 'Divine Cuisine', icon: '✨', timeMultiplier: 30, materialMultiplier: 50, valueMultiplier: 70 },
  { suffix: 'Legendary Meal', icon: '🌟', timeMultiplier: 45, materialMultiplier: 75, valueMultiplier: 100 },
  { suffix: 'Ambrosia', icon: '🏆', timeMultiplier: 60, materialMultiplier: 100, valueMultiplier: 150 },
];

const ALCHEMY_RECIPE_TYPES = [
  { suffix: 'Extract', icon: '💧', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 1.5 },
  { suffix: 'Essence', icon: '✨', timeMultiplier: 1.2, materialMultiplier: 3, valueMultiplier: 2 },
  { suffix: 'Tincture', icon: '🧪', timeMultiplier: 1.5, materialMultiplier: 4, valueMultiplier: 3 },
  { suffix: 'Salve', icon: '🏺', timeMultiplier: 2, materialMultiplier: 5, valueMultiplier: 4 },
  { suffix: 'Potion', icon: '🧴', timeMultiplier: 3, materialMultiplier: 6, valueMultiplier: 6 },
  { suffix: 'Elixir', icon: '⚗️', timeMultiplier: 4, materialMultiplier: 8, valueMultiplier: 9 },
  { suffix: 'Draught', icon: '🍶', timeMultiplier: 5, materialMultiplier: 10, valueMultiplier: 12 },
  { suffix: 'Philter', icon: '💝', timeMultiplier: 6, materialMultiplier: 12, valueMultiplier: 15 },
  { suffix: 'Brew', icon: '🫖', timeMultiplier: 8, materialMultiplier: 15, valueMultiplier: 20 },
  { suffix: 'Concoction', icon: '🧫', timeMultiplier: 10, materialMultiplier: 20, valueMultiplier: 28 },
  { suffix: 'Transmutation', icon: '🔮', timeMultiplier: 15, materialMultiplier: 30, valueMultiplier: 40 },
  { suffix: 'Philosopher\'s Brew', icon: '💎', timeMultiplier: 20, materialMultiplier: 50, valueMultiplier: 60 },
  { suffix: 'Panacea', icon: '🌈', timeMultiplier: 30, materialMultiplier: 75, valueMultiplier: 90 },
  { suffix: 'Immortality Elixir', icon: '⚱️', timeMultiplier: 45, materialMultiplier: 100, valueMultiplier: 130 },
  { suffix: 'Philosopher\'s Stone', icon: '🏆', timeMultiplier: 60, materialMultiplier: 150, valueMultiplier: 180 },
];

const LEATHERWORKING_RECIPE_TYPES = [
  { suffix: 'Strips', icon: '📜', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 1.5 },
  { suffix: 'Patch', icon: '🩹', timeMultiplier: 1.2, materialMultiplier: 3, valueMultiplier: 2 },
  { suffix: 'Belt', icon: '👔', timeMultiplier: 1.5, materialMultiplier: 4, valueMultiplier: 3 },
  { suffix: 'Gloves', icon: '🧤', timeMultiplier: 2, materialMultiplier: 5, valueMultiplier: 4 },
  { suffix: 'Boots', icon: '👢', timeMultiplier: 3, materialMultiplier: 8, valueMultiplier: 6 },
  { suffix: 'Cap', icon: '🧢', timeMultiplier: 2.5, materialMultiplier: 6, valueMultiplier: 5 },
  { suffix: 'Vest', icon: '🦺', timeMultiplier: 4, materialMultiplier: 10, valueMultiplier: 8 },
  { suffix: 'Jacket', icon: '🧥', timeMultiplier: 5, materialMultiplier: 12, valueMultiplier: 11 },
  { suffix: 'Armor', icon: '🛡️', timeMultiplier: 7, materialMultiplier: 18, valueMultiplier: 16 },
  { suffix: 'Satchel', icon: '👜', timeMultiplier: 4, materialMultiplier: 10, valueMultiplier: 9 },
  { suffix: 'Backpack', icon: '🎒', timeMultiplier: 8, materialMultiplier: 20, valueMultiplier: 22 },
  { suffix: 'Saddle', icon: '🐴', timeMultiplier: 12, materialMultiplier: 35, valueMultiplier: 35 },
  { suffix: 'War Armor', icon: '⚔️', timeMultiplier: 20, materialMultiplier: 60, valueMultiplier: 55 },
  { suffix: 'Dragon Armor', icon: '🐉', timeMultiplier: 40, materialMultiplier: 100, valueMultiplier: 100 },
  { suffix: 'Legendary Hide', icon: '🏆', timeMultiplier: 60, materialMultiplier: 150, valueMultiplier: 160 },
];

const TAILORING_RECIPE_TYPES = [
  { suffix: 'Thread', icon: '🧵', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 1.5 },
  { suffix: 'Bandage', icon: '🩹', timeMultiplier: 1.2, materialMultiplier: 3, valueMultiplier: 2 },
  { suffix: 'Scarf', icon: '🧣', timeMultiplier: 1.5, materialMultiplier: 4, valueMultiplier: 3 },
  { suffix: 'Hat', icon: '🎩', timeMultiplier: 2, materialMultiplier: 5, valueMultiplier: 4 },
  { suffix: 'Shirt', icon: '👕', timeMultiplier: 3, materialMultiplier: 8, valueMultiplier: 6 },
  { suffix: 'Pants', icon: '👖', timeMultiplier: 3.5, materialMultiplier: 10, valueMultiplier: 8 },
  { suffix: 'Dress', icon: '👗', timeMultiplier: 4, materialMultiplier: 12, valueMultiplier: 10 },
  { suffix: 'Robe', icon: '🥻', timeMultiplier: 5, materialMultiplier: 15, valueMultiplier: 13 },
  { suffix: 'Cloak', icon: '🧥', timeMultiplier: 6, materialMultiplier: 18, valueMultiplier: 16 },
  { suffix: 'Bag', icon: '👜', timeMultiplier: 4, materialMultiplier: 10, valueMultiplier: 9 },
  { suffix: 'Tapestry', icon: '🖼️', timeMultiplier: 10, materialMultiplier: 25, valueMultiplier: 25 },
  { suffix: 'Royal Garb', icon: '👑', timeMultiplier: 15, materialMultiplier: 40, valueMultiplier: 40 },
  { suffix: 'Wizard Robe', icon: '🧙', timeMultiplier: 20, materialMultiplier: 60, valueMultiplier: 60 },
  { suffix: 'Archmage Vestment', icon: '✨', timeMultiplier: 40, materialMultiplier: 100, valueMultiplier: 100 },
  { suffix: 'Celestial Raiment', icon: '🏆', timeMultiplier: 60, materialMultiplier: 150, valueMultiplier: 160 },
];

const JEWELCRAFTING_RECIPE_TYPES = [
  { suffix: 'Dust', icon: '✨', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 2 },
  { suffix: 'Shard', icon: '💎', timeMultiplier: 1.2, materialMultiplier: 3, valueMultiplier: 3 },
  { suffix: 'Gem', icon: '💠', timeMultiplier: 2, materialMultiplier: 4, valueMultiplier: 5 },
  { suffix: 'Ring', icon: '💍', timeMultiplier: 3, materialMultiplier: 5, valueMultiplier: 8 },
  { suffix: 'Earring', icon: '👂', timeMultiplier: 2.5, materialMultiplier: 4, valueMultiplier: 6 },
  { suffix: 'Pendant', icon: '📿', timeMultiplier: 4, materialMultiplier: 6, valueMultiplier: 10 },
  { suffix: 'Bracelet', icon: '⌚', timeMultiplier: 5, materialMultiplier: 8, valueMultiplier: 14 },
  { suffix: 'Necklace', icon: '📿', timeMultiplier: 6, materialMultiplier: 10, valueMultiplier: 18 },
  { suffix: 'Circlet', icon: '👑', timeMultiplier: 8, materialMultiplier: 15, valueMultiplier: 25 },
  { suffix: 'Amulet', icon: '🔮', timeMultiplier: 10, materialMultiplier: 20, valueMultiplier: 35 },
  { suffix: 'Crown', icon: '👑', timeMultiplier: 15, materialMultiplier: 35, valueMultiplier: 55 },
  { suffix: 'Scepter', icon: '🏆', timeMultiplier: 20, materialMultiplier: 50, valueMultiplier: 80 },
  { suffix: 'Royal Regalia', icon: '✨', timeMultiplier: 30, materialMultiplier: 75, valueMultiplier: 120 },
  { suffix: 'Artifact', icon: '🏺', timeMultiplier: 45, materialMultiplier: 100, valueMultiplier: 170 },
  { suffix: 'Legendary Gem', icon: '🌟', timeMultiplier: 60, materialMultiplier: 150, valueMultiplier: 220 },
];

const ENCHANTING_RECIPE_TYPES = [
  { suffix: 'Dust', icon: '✨', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 2 },
  { suffix: 'Essence', icon: '💫', timeMultiplier: 1.5, materialMultiplier: 3, valueMultiplier: 3 },
  { suffix: 'Glyph', icon: '📜', timeMultiplier: 2, materialMultiplier: 4, valueMultiplier: 5 },
  { suffix: 'Rune', icon: '🔮', timeMultiplier: 3, materialMultiplier: 5, valueMultiplier: 7 },
  { suffix: 'Sigil', icon: '⚜️', timeMultiplier: 4, materialMultiplier: 7, valueMultiplier: 10 },
  { suffix: 'Ward', icon: '🛡️', timeMultiplier: 5, materialMultiplier: 9, valueMultiplier: 14 },
  { suffix: 'Charm', icon: '🍀', timeMultiplier: 6, materialMultiplier: 12, valueMultiplier: 18 },
  { suffix: 'Enchantment', icon: '✨', timeMultiplier: 8, materialMultiplier: 15, valueMultiplier: 24 },
  { suffix: 'Blessing', icon: '🙏', timeMultiplier: 10, materialMultiplier: 20, valueMultiplier: 32 },
  { suffix: 'Hex', icon: '🔯', timeMultiplier: 12, materialMultiplier: 25, valueMultiplier: 42 },
  { suffix: 'Curse', icon: '💀', timeMultiplier: 15, materialMultiplier: 35, valueMultiplier: 55 },
  { suffix: 'Prophecy', icon: '📖', timeMultiplier: 20, materialMultiplier: 50, valueMultiplier: 75 },
  { suffix: 'Divine Rune', icon: '⚡', timeMultiplier: 30, materialMultiplier: 75, valueMultiplier: 110 },
  { suffix: 'Celestial Mark', icon: '🌟', timeMultiplier: 45, materialMultiplier: 100, valueMultiplier: 150 },
  { suffix: 'World Enchantment', icon: '🏆', timeMultiplier: 60, materialMultiplier: 150, valueMultiplier: 200 },
];

const ENGINEERING_RECIPE_TYPES = [
  { suffix: 'Screw', icon: '🔩', timeMultiplier: 1, materialMultiplier: 2, valueMultiplier: 1.5 },
  { suffix: 'Gear', icon: '⚙️', timeMultiplier: 1.5, materialMultiplier: 3, valueMultiplier: 2.5 },
  { suffix: 'Spring', icon: '🌀', timeMultiplier: 2, materialMultiplier: 4, valueMultiplier: 4 },
  { suffix: 'Mechanism', icon: '🔧', timeMultiplier: 3, materialMultiplier: 6, valueMultiplier: 6 },
  { suffix: 'Clock', icon: '⏰', timeMultiplier: 4, materialMultiplier: 10, valueMultiplier: 10 },
  { suffix: 'Compass', icon: '🧭', timeMultiplier: 5, materialMultiplier: 12, valueMultiplier: 13 },
  { suffix: 'Telescope', icon: '🔭', timeMultiplier: 6, materialMultiplier: 15, valueMultiplier: 17 },
  { suffix: 'Music Box', icon: '🎵', timeMultiplier: 8, materialMultiplier: 20, valueMultiplier: 24 },
  { suffix: 'Automaton', icon: '🤖', timeMultiplier: 12, materialMultiplier: 30, valueMultiplier: 38 },
  { suffix: 'Bomb', icon: '💣', timeMultiplier: 10, materialMultiplier: 25, valueMultiplier: 30 },
  { suffix: 'Cannon', icon: '🔫', timeMultiplier: 18, materialMultiplier: 50, valueMultiplier: 60 },
  { suffix: 'Flying Machine', icon: '🚁', timeMultiplier: 25, materialMultiplier: 75, valueMultiplier: 90 },
  { suffix: 'War Machine', icon: '⚔️', timeMultiplier: 35, materialMultiplier: 100, valueMultiplier: 125 },
  { suffix: 'Mech Suit', icon: '🦾', timeMultiplier: 50, materialMultiplier: 150, valueMultiplier: 175 },
  { suffix: 'World Engine', icon: '🏆', timeMultiplier: 60, materialMultiplier: 200, valueMultiplier: 230 },
];

// Tier name arrays for recipes (10 tiers each)
const RECIPE_TIER_NAMES = {
  logging: ['Maple', 'Oak', 'Birch', 'Pine', 'Willow', 'Cedar', 'Ash', 'Elm', 'Spruce', 'Redwood'],
  mining: ['Copper', 'Tin', 'Bronze', 'Iron', 'Coal', 'Silver', 'Gold', 'Steel', 'Platinum', 'Mithril'],
  fishing: ['Minnow', 'Sardine', 'Trout', 'Salmon', 'Tuna', 'Cod', 'Bass', 'Perch', 'Pike', 'Catfish'],
  herbalism: ['Dandelion', 'Clover', 'Mint', 'Basil', 'Sage', 'Thyme', 'Rosemary', 'Lavender', 'Chamomile', 'Ginseng'],
  skinning: ['Rabbit', 'Deer', 'Wolf', 'Bear', 'Boar', 'Elk', 'Bison', 'Tiger', 'Lion', 'Rhino'],
  foraging: ['Cotton', 'Flax', 'Hemp', 'Silk', 'Spider Silk', 'Wool', 'Mohair', 'Cashmere', 'Alpaca', 'Angora'],
  hunting: ['Rabbit', 'Pheasant', 'Duck', 'Goose', 'Turkey', 'Venison', 'Boar', 'Elk', 'Buffalo', 'Bear'],
};

// Generic recipe generator function
const generateRecipes = (
  skillType: SkillType,
  gatheringSkill: string,
  recipeTypes: typeof SAWMILL_RECIPE_TYPES,
  skillPrefix: string
): CraftingRecipe[] => {
  const recipes: CraftingRecipe[] = [];
  const tierNames = RECIPE_TIER_NAMES[gatheringSkill as keyof typeof RECIPE_TIER_NAMES] || RECIPE_TIER_NAMES.logging;

  for (let tier = 1; tier <= 10; tier++) {
    const tierName = tierNames[tier - 1];
    const resourceId = `${gatheringSkill}_t${tier}`;
    const tierLevel = (tier - 1) * 10 + 1;
    const baseValue = tier * 5;

    recipeTypes.forEach((type, typeIdx) => {
      const requiredLevel = tierLevel + typeIdx;
      recipes.push({
        id: `${skillPrefix}_${tier}_${typeIdx}`,
        name: `${tierName} ${type.suffix}`,
        craftingSkill: skillType,
        requiredLevel,
        materials: [{ resourceId, quantity: type.materialMultiplier }],
        craftTime: Math.floor(type.timeMultiplier * (1 + tier * 0.5)),
        xpReward: Math.floor(10 * tier * type.timeMultiplier),
        sellValue: Math.floor(baseValue * type.valueMultiplier),
        icon: type.icon,
      });
    });
  }

  return recipes;
};

// Generate all recipes
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  ...generateRecipes(SkillType.SAWMILL, 'logging', SAWMILL_RECIPE_TYPES, 'sawmill'),
  ...generateRecipes(SkillType.SMITHING, 'mining', SMITHING_RECIPE_TYPES, 'smithing'),
  ...generateRecipes(SkillType.COOKING, 'fishing', COOKING_RECIPE_TYPES, 'cooking'),
  ...generateRecipes(SkillType.ALCHEMY, 'herbalism', ALCHEMY_RECIPE_TYPES, 'alchemy'),
  ...generateRecipes(SkillType.LEATHERWORKING, 'skinning', LEATHERWORKING_RECIPE_TYPES, 'leatherworking'),
  ...generateRecipes(SkillType.TAILORING, 'foraging', TAILORING_RECIPE_TYPES, 'tailoring'),
  ...generateRecipes(SkillType.JEWELCRAFTING, 'mining', JEWELCRAFTING_RECIPE_TYPES, 'jewelcrafting'),
  ...generateRecipes(SkillType.ENCHANTING, 'herbalism', ENCHANTING_RECIPE_TYPES, 'enchanting'),
  ...generateRecipes(SkillType.ENGINEERING, 'mining', ENGINEERING_RECIPE_TYPES, 'engineering'),
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

// Crafting queue item
export interface CraftingQueueItem {
  id: string; // unique instance id
  recipeId: string; // recipe being crafted
  startTime: number; // timestamp when started
  endTime: number; // timestamp when complete
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
}

export interface GameState {
  gold: number;
  mana: number;
  maxMana: number;
  manaRegen: number; // per second
  skills: Record<SkillType, SkillState>;
  resources: ResourceState;
  skillsUnlockedCount: number;
  prestigeCount: number;
  chaosPoints: number;
  lastSaveTime: number;
  gameVersion: string;
  // New systems
  upgrades: Record<string, number>; // upgrade id -> level
  spellsUnlocked: boolean;
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
  // Achievements
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CLAIM_ACHIEVEMENT'; achievementId: string; reward: number }
  // Prestige
  | { type: 'PRESTIGE'; chaosPointsEarned: number }
  // Crafting
  | { type: 'START_CRAFT'; recipeId: string }
  | { type: 'CANCEL_CRAFT'; queueItemId: string }
  | { type: 'COLLECT_CRAFTED'; recipeId: string; quantity: number };

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
  mana: 0,
  maxMana: 50,
  manaRegen: 0.1,
  skills: createInitialSkills(),
  resources: {},
  skillsUnlockedCount: 1,
  prestigeCount: 0,
  chaosPoints: 0,
  lastSaveTime: Date.now(),
  gameVersion: GAME_VERSION,
  upgrades: {},
  spellsUnlocked: false,
  spells: {},
  stats: initialStats,
  bonusTaps: 0,
  critChance: 5, // 5% base
  critDamage: 100, // 100% = 2x damage
  luck: 0,
  goldBonus: 0,
  equipmentInventory: [],
  character: initialCharacter,
  unlockedAchievements: [],
  claimedAchievements: [],
  lastGatherResult: null,
  craftingQueue: [],
  craftedItems: {},
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
  let critChance = 5; // base 5%
  let critDamage = 100; // base 100% (2x)
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

      // Check for active spells
      const now = Date.now();
      const hasDoubleXp = (state.spells['double_xp']?.activeUntil || 0) > now;
      const hasMegaCrit = (state.spells['mega_crit']?.activeUntil || 0) > now;
      const hasLuckyStar = (state.spells['lucky_star']?.activeUntil || 0) > now;

      // Calculate base taps (1 base + bonus from upgrades)
      const baseTaps = 1 + state.bonusTaps;
      let resourceTaps = baseTaps;

      // Check for crit - affects resources, gives bonus XP
      const effectiveCritChance = hasMegaCrit ? 100 : state.critChance;
      const isCrit = Math.random() * 100 < effectiveCritChance;
      if (isCrit) {
        resourceTaps = Math.floor(resourceTaps * (1 + state.critDamage / 100));
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

      const newTotalXp = skill.totalXp + xpGained;
      const newLevel = levelFromTotalXp(newTotalXp);

      const resourceId = `${action.skillType}_t${tier}`;

      return {
        ...state,
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
          [resourceId]: (state.resources[resourceId] || 0) + resourceTaps,
        },
        stats: {
          ...state.stats,
          totalTaps: state.stats.totalTaps + 1,
          totalCrits: state.stats.totalCrits + (isCrit ? 1 : 0),
          totalLuckyHits: state.stats.totalLuckyHits + (isLucky ? 1 : 0),
          totalResourcesGathered: state.stats.totalResourcesGathered + resourceTaps,
        },
        lastGatherResult: {
          skillType: action.skillType,
          baseTaps,
          resourceTaps,
          isCrit,
          isLucky,
          xpGained,
          timestamp: Date.now(),
        },
      };
    }

    case 'UNLOCK_SKILL': {
      const cost = getUnlockCost(state.skillsUnlockedCount + 1);
      if (state.gold < cost) return state;

      const skill = state.skills[action.skillType];
      if (skill.unlocked) return state;

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

      let goldGained = goldPerItem * action.quantity * (1 + state.goldBonus / 100) * goldMultiplier;

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
      if (state.gold < 1000) return state;

      return {
        ...state,
        gold: state.gold - 1000,
        spellsUnlocked: true,
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

      for (const completed of completedCrafts) {
        const recipe = CRAFTING_RECIPES.find(r => r.id === completed.recipeId);
        if (recipe) {
          // Add to crafted items
          newCraftedItems[recipe.id] = (newCraftedItems[recipe.id] || 0) + 1;

          // Add XP to crafting skill
          const skillState = newSkills[recipe.craftingSkill];
          if (skillState) {
            const newTotalXp = skillState.totalXp + recipe.xpReward;
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

      return {
        ...state,
        mana: state.spellsUnlocked ? newMana : state.mana,
        stats: {
          ...state.stats,
          totalPlayTime: state.stats.totalPlayTime + deltaSeconds,
          sessionPlayTime: state.stats.sessionPlayTime + deltaSeconds,
        },
        craftingQueue: remainingQueue,
        craftedItems: newCraftedItems,
        skills: newSkills,
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
      return {
        ...state,
        gold: state.gold + action.reward,
        claimedAchievements: [...state.claimedAchievements, action.achievementId],
        stats: {
          ...state.stats,
          totalGoldEarned: state.stats.totalGoldEarned + action.reward,
        },
      };
    }

    case 'PRESTIGE': {
      // Reset skills to initial state
      const newSkills = createInitialSkills();

      // Keep total play time but reset session play time
      const newStats: StatsState = {
        ...initialStats,
        totalPlayTime: state.stats.totalPlayTime,
        sessionPlayTime: 0,
      };

      return {
        ...initialState,
        prestigeCount: state.prestigeCount + 1,
        chaosPoints: state.chaosPoints + action.chaosPointsEarned,
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

    // Crafting actions
    case 'START_CRAFT': {
      const recipe = CRAFTING_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      // Check if player has required materials
      for (const mat of recipe.materials) {
        const have = state.resources[mat.resourceId] || 0;
        if (have < mat.quantity) {
          return state; // Not enough materials
        }
      }

      // Check if player has required crafting skill level
      const skillLevel = state.skills[recipe.craftingSkill]?.level || 1;
      if (skillLevel < recipe.requiredLevel) {
        return state; // Level too low
      }

      // Deduct materials
      const newResources = { ...state.resources };
      for (const mat of recipe.materials) {
        newResources[mat.resourceId] = (newResources[mat.resourceId] || 0) - mat.quantity;
      }

      // Add to crafting queue
      const now = Date.now();
      const queueItem: CraftingQueueItem = {
        id: `craft_${now}_${Math.random().toString(36).substr(2, 9)}`,
        recipeId: action.recipeId,
        startTime: now,
        endTime: now + (recipe.craftTime * 1000),
      };

      return {
        ...state,
        resources: newResources,
        craftingQueue: [...state.craftingQueue, queueItem],
      };
    }

    case 'CANCEL_CRAFT': {
      const itemToCancel = state.craftingQueue.find(item => item.id === action.queueItemId);
      if (!itemToCancel) return state;

      // Refund materials
      const recipe = CRAFTING_RECIPES.find(r => r.id === itemToCancel.recipeId);
      if (!recipe) return state;

      const newResources = { ...state.resources };
      for (const mat of recipe.materials) {
        newResources[mat.resourceId] = (newResources[mat.resourceId] || 0) + mat.quantity;
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

      // Sell for gold
      const goldEarned = recipe.sellValue * action.quantity * (1 + state.goldBonus / 100);

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
      };
      return recalculateBonuses(loadedState);
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
  // Achievements
  unlockAchievement: (achievementId: string) => void;
  claimAchievement: (achievementId: string, reward: number) => void;
  checkAchievements: () => void;
  // Prestige
  prestige: (chaosPointsEarned: number) => void;
  // Crafting
  startCraft: (recipeId: string) => void;
  cancelCraft: (queueItemId: string) => void;
  collectCrafted: (recipeId: string, quantity: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

const SAVE_KEY = 'ghallia_save';

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

  // Crafting functions
  const startCraft = useCallback((recipeId: string) => {
    dispatch({ type: 'START_CRAFT', recipeId });
  }, []);

  const cancelCraft = useCallback((queueItemId: string) => {
    dispatch({ type: 'CANCEL_CRAFT', queueItemId });
  }, []);

  const collectCrafted = useCallback((recipeId: string, quantity: number) => {
    dispatch({ type: 'COLLECT_CRAFTED', recipeId, quantity });
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
      unlockAchievement,
      claimAchievement,
      checkAchievements,
      prestige,
      startCraft,
      cancelCraft,
      collectCrafted,
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
