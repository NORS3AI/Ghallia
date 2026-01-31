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

export const UPGRADES: UpgradeDef[] = [
  // Tap upgrades (increases taps per click)
  { id: 'tap_power_1', name: 'Stronger Grip', description: '+1 tap per click', baseCost: 0.5, maxLevel: 1, effect: () => 1, category: 'tap' },
  { id: 'tap_power_2', name: 'Calloused Hands', description: '+1 tap per click', baseCost: 5, maxLevel: 1, effect: () => 1, category: 'tap' },
  { id: 'tap_power_3', name: 'Iron Fingers', description: '+1 tap per click', baseCost: 50, maxLevel: 1, effect: () => 1, category: 'tap' },
  { id: 'tap_power_4', name: 'Steel Arms', description: '+1 tap per click', baseCost: 500, maxLevel: 1, effect: () => 1, category: 'tap' },
  { id: 'tap_power_5', name: 'Titan Strength', description: '+1 tap per click', baseCost: 5000, maxLevel: 1, effect: () => 1, category: 'tap' },
  { id: 'tap_power_6', name: 'Divine Touch', description: '+2 taps per click', baseCost: 25000, maxLevel: 1, effect: () => 2, category: 'tap' },
  { id: 'tap_power_7', name: 'Cosmic Power', description: '+3 taps per click', baseCost: 100000, maxLevel: 1, effect: () => 3, category: 'tap' },

  // Crit Chance upgrades
  { id: 'crit_chance_1', name: 'Sharp Eyes', description: '+2% crit chance', baseCost: 1, maxLevel: 1, effect: () => 2, category: 'crit' },
  { id: 'crit_chance_2', name: 'Focused Mind', description: '+2% crit chance', baseCost: 10, maxLevel: 1, effect: () => 2, category: 'crit' },
  { id: 'crit_chance_3', name: 'Keen Instincts', description: '+3% crit chance', baseCost: 100, maxLevel: 1, effect: () => 3, category: 'crit' },
  { id: 'crit_chance_4', name: 'Eagle Vision', description: '+3% crit chance', baseCost: 1000, maxLevel: 1, effect: () => 3, category: 'crit' },
  { id: 'crit_chance_5', name: 'Perfect Precision', description: '+5% crit chance', baseCost: 10000, maxLevel: 1, effect: () => 5, category: 'crit' },
  { id: 'crit_chance_6', name: 'Master Striker', description: '+5% crit chance', baseCost: 50000, maxLevel: 1, effect: () => 5, category: 'crit' },

  // Crit Damage upgrades
  { id: 'crit_damage_1', name: 'Heavy Hits', description: '+25% crit damage', baseCost: 2, maxLevel: 1, effect: () => 25, category: 'crit' },
  { id: 'crit_damage_2', name: 'Brutal Force', description: '+25% crit damage', baseCost: 20, maxLevel: 1, effect: () => 25, category: 'crit' },
  { id: 'crit_damage_3', name: 'Devastating Blows', description: '+50% crit damage', baseCost: 200, maxLevel: 1, effect: () => 50, category: 'crit' },
  { id: 'crit_damage_4', name: 'Crushing Power', description: '+50% crit damage', baseCost: 2000, maxLevel: 1, effect: () => 50, category: 'crit' },
  { id: 'crit_damage_5', name: 'Annihilating Strikes', description: '+100% crit damage', baseCost: 20000, maxLevel: 1, effect: () => 100, category: 'crit' },

  // Luck upgrades (chance for +5 bonus taps)
  { id: 'luck_1', name: 'Lucky Charm', description: '+1% luck', baseCost: 3, maxLevel: 1, effect: () => 1, category: 'luck' },
  { id: 'luck_2', name: 'Fortune\'s Favor', description: '+1% luck', baseCost: 15, maxLevel: 1, effect: () => 1, category: 'luck' },
  { id: 'luck_3', name: 'Blessed Touch', description: '+2% luck', baseCost: 75, maxLevel: 1, effect: () => 2, category: 'luck' },
  { id: 'luck_4', name: 'Serendipity', description: '+2% luck', baseCost: 375, maxLevel: 1, effect: () => 2, category: 'luck' },
  { id: 'luck_5', name: 'Golden Aura', description: '+3% luck', baseCost: 1875, maxLevel: 1, effect: () => 3, category: 'luck' },
  { id: 'luck_6', name: 'Destiny\'s Child', description: '+3% luck', baseCost: 9375, maxLevel: 1, effect: () => 3, category: 'luck' },
  { id: 'luck_7', name: 'Cosmic Fortune', description: '+5% luck', baseCost: 46875, maxLevel: 1, effect: () => 5, category: 'luck' },

  // Mana upgrades
  { id: 'mana_cap_1', name: 'Mana Pool I', description: '+10 max mana', baseCost: 100, maxLevel: 1, effect: () => 10, category: 'mana' },
  { id: 'mana_cap_2', name: 'Mana Pool II', description: '+10 max mana', baseCost: 500, maxLevel: 1, effect: () => 10, category: 'mana' },
  { id: 'mana_cap_3', name: 'Mana Pool III', description: '+15 max mana', baseCost: 2500, maxLevel: 1, effect: () => 15, category: 'mana' },
  { id: 'mana_cap_4', name: 'Mana Pool IV', description: '+15 max mana', baseCost: 12500, maxLevel: 1, effect: () => 15, category: 'mana' },
  { id: 'mana_cap_5', name: 'Mana Pool V', description: '+25 max mana', baseCost: 62500, maxLevel: 1, effect: () => 25, category: 'mana' },
  { id: 'mana_regen_1', name: 'Mana Flow I', description: '+0.05 mana/sec', baseCost: 250, maxLevel: 1, effect: () => 0.05, category: 'mana' },
  { id: 'mana_regen_2', name: 'Mana Flow II', description: '+0.05 mana/sec', baseCost: 1250, maxLevel: 1, effect: () => 0.05, category: 'mana' },
  { id: 'mana_regen_3', name: 'Mana Flow III', description: '+0.1 mana/sec', baseCost: 6250, maxLevel: 1, effect: () => 0.1, category: 'mana' },
  { id: 'mana_regen_4', name: 'Mana Flow IV', description: '+0.1 mana/sec', baseCost: 31250, maxLevel: 1, effect: () => 0.1, category: 'mana' },

  // Gold upgrades
  { id: 'gold_bonus_1', name: 'Merchant\'s Eye', description: '+5% gold from sales', baseCost: 25, maxLevel: 1, effect: () => 5, category: 'gold' },
  { id: 'gold_bonus_2', name: 'Haggler', description: '+5% gold from sales', baseCost: 125, maxLevel: 1, effect: () => 5, category: 'gold' },
  { id: 'gold_bonus_3', name: 'Trade Master', description: '+10% gold from sales', baseCost: 625, maxLevel: 1, effect: () => 10, category: 'gold' },
  { id: 'gold_bonus_4', name: 'Golden Touch', description: '+10% gold from sales', baseCost: 3125, maxLevel: 1, effect: () => 10, category: 'gold' },
  { id: 'gold_bonus_5', name: 'Midas Blessing', description: '+15% gold from sales', baseCost: 15625, maxLevel: 1, effect: () => 15, category: 'gold' },
  { id: 'gold_bonus_6', name: 'Wealth Incarnate', description: '+20% gold from sales', baseCost: 78125, maxLevel: 1, effect: () => 20, category: 'gold' },
];

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
  playTime: number; // seconds
}

interface SpellState {
  activeUntil: number; // timestamp when spell expires
  cooldownUntil: number; // timestamp when spell can be cast again
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
  | { type: 'DEV_ADD_BONUS_TAPS'; amount: number };

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
  playTime: 0,
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
};

// ============================================
// TIER DATA (for resource names)
// ============================================

const LOGGING_TIERS = [
  'Maple', 'Oak', 'Birch', 'Pine', 'Willow', 'Cedar', 'Ash', 'Elm', 'Spruce', 'Redwood',
  'Mahogany', 'Teak', 'Ebony', 'Ironwood', 'Bloodwood', 'Ghostwood', 'Petrified Oak',
  'Crystalbark', 'Moonbark', 'Sunwood', 'Stormoak', 'Frostpine', 'Emberbark', 'Voidwood',
  'Mythril Birch', 'Dragon Oak', 'Phoenix Ash', 'Titan Elm', 'Cosmic Cedar', 'Nebula Maple',
  'Starfall Willow', 'Quantum Pine', 'Temporal Spruce', 'Ethereal Redwood', 'Celestial Teak',
  'Divine Mahogany', 'Astral Ebony', 'Primal Ironwood', 'The Giving Tree', 'Infinity Oak',
  'Schrödinger\'s Birch', 'Meme Wood', 'Plot Armor Tree', 'Lag Spike Pine', 'Fourth Wall Willow',
  'Error 404 Cedar', 'Gigachad Oak', 'Final Boss Elm', 'Prestige Redwood', 'The World Tree'
];

export function getResourceName(skillType: SkillType, tier: number): string {
  if (skillType === SkillType.LOGGING) {
    return LOGGING_TIERS[Math.min(tier - 1, LOGGING_TIERS.length - 1)] + ' Wood';
  }
  return 'Resource';
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

      // Calculate taps (1 base + bonus from upgrades)
      let taps = 1 + state.bonusTaps;

      // Check for crit
      const effectiveCritChance = hasMegaCrit ? 100 : state.critChance;
      const isCrit = Math.random() * 100 < effectiveCritChance;
      if (isCrit) {
        taps = Math.floor(taps * (1 + state.critDamage / 100));
      }

      // Check for luck (chance for +5 bonus taps)
      const effectiveLuck = hasLuckyStar ? state.luck + 50 : state.luck;
      const isLucky = Math.random() * 100 < effectiveLuck;
      if (isLucky) {
        taps += 5;
      }

      // Calculate XP
      let xpGained = xpPerAction(tier, skill.level) * taps;
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
          [resourceId]: (state.resources[resourceId] || 0) + taps,
        },
        stats: {
          ...state.stats,
          totalTaps: state.stats.totalTaps + 1,
          totalCrits: state.stats.totalCrits + (isCrit ? 1 : 0),
          totalLuckyHits: state.stats.totalLuckyHits + (isLucky ? 1 : 0),
          totalResourcesGathered: state.stats.totalResourcesGathered + taps,
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

      const newState = {
        ...state,
        gold: state.gold - cost,
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
      };
    }

    case 'TICK': {
      const deltaSeconds = action.deltaMs / 1000;
      let newMana = state.mana + state.manaRegen * deltaSeconds;
      if (newMana > state.maxMana) newMana = state.maxMana;

      return {
        ...state,
        mana: state.spellsUnlocked ? newMana : state.mana,
        stats: {
          ...state.stats,
          playTime: state.stats.playTime + deltaSeconds,
        },
      };
    }

    case 'ADD_EQUIPMENT': {
      return {
        ...state,
        equipmentInventory: [...state.equipmentInventory, action.equipment],
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

    case 'LOAD_GAME': {
      // Merge loaded state with defaults for any missing fields
      const loadedState = {
        ...initialState,
        ...action.state,
        character: action.state.character || initialCharacter,
        equipmentInventory: action.state.equipmentInventory || [],
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
