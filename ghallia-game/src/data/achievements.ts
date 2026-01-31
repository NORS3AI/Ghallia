/**
 * Achievements System
 * Hundreds of achievements for players to unlock and claim
 */

import { SkillType } from '../types/game.types';
import { SKILL_DEFINITIONS } from '../store/gameStore';

// ============================================
// TYPES
// ============================================

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum AchievementCategory {
  PLAYTIME = 'playtime',
  SKILLS = 'skills',
  GATHERING = 'gathering',
  GOLD = 'gold',
  TAPS = 'taps',
  COMBAT = 'combat',
  EQUIPMENT = 'equipment',
  PRESTIGE = 'prestige',
  UPGRADES = 'upgrades',
  MAGIC = 'magic',
  MILESTONES = 'milestones',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  reward: number; // Gold reward
  icon: string;
  // Check function receives game state
  check: (state: any) => boolean;
  // Optional: hide achievement until condition is met
  hidden?: (state: any) => boolean;
}

// ============================================
// REWARD SCALING
// ============================================

// Base rewards by rarity (grows by ~20% each tier within rarity)
const RARITY_BASE_REWARDS = {
  [AchievementRarity.COMMON]: 1,
  [AchievementRarity.UNCOMMON]: 5,
  [AchievementRarity.RARE]: 25,
  [AchievementRarity.EPIC]: 125,
  [AchievementRarity.LEGENDARY]: 625,
};

// Calculate scaled reward
function calcReward(rarity: AchievementRarity, tier: number): number {
  const base = RARITY_BASE_REWARDS[rarity];
  return Math.floor(base * Math.pow(1.2, tier));
}

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

const achievements: Achievement[] = [];

// --------------------------------------------
// PLAYTIME ACHIEVEMENTS
// --------------------------------------------

const PLAYTIME_MILESTONES = [
  { mins: 1, name: 'Baby Steps', desc: 'Play for 1 minute', rarity: AchievementRarity.COMMON, tier: 0 },
  { mins: 5, name: 'Getting Started', desc: 'Play for 5 minutes', rarity: AchievementRarity.COMMON, tier: 1 },
  { mins: 10, name: 'Warming Up', desc: 'Play for 10 minutes', rarity: AchievementRarity.COMMON, tier: 2 },
  { mins: 25, name: 'Dedicated Player', desc: 'Play for 25 minutes', rarity: AchievementRarity.COMMON, tier: 3 },
  { mins: 60, name: 'Hour of Power', desc: 'Play for 1 hour', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { mins: 120, name: 'Marathon Runner', desc: 'Play for 2 hours', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { mins: 360, name: 'Half Day Hero', desc: 'Play for 6 hours', rarity: AchievementRarity.UNCOMMON, tier: 2 },
  { mins: 720, name: 'Full Day Warrior', desc: 'Play for 12 hours', rarity: AchievementRarity.RARE, tier: 0 },
  { mins: 1440, name: 'Day and Night', desc: 'Play for 24 hours', rarity: AchievementRarity.RARE, tier: 1 },
  { mins: 4320, name: 'Three Day Legend', desc: 'Play for 3 days', rarity: AchievementRarity.EPIC, tier: 0 },
  { mins: 10080, name: 'Week Warrior', desc: 'Play for 1 week', rarity: AchievementRarity.EPIC, tier: 1 },
  { mins: 43200, name: 'Monthly Master', desc: 'Play for 30 days', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

PLAYTIME_MILESTONES.forEach(m => {
  achievements.push({
    id: `playtime_${m.mins}`,
    name: m.name,
    description: m.desc,
    category: AchievementCategory.PLAYTIME,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '⏱️',
    check: (state) => state.stats.sessionPlayTime >= m.mins * 60,
  });
});

// --------------------------------------------
// SKILL LEVEL ACHIEVEMENTS
// --------------------------------------------

const SKILL_LEVEL_MILESTONES = [10, 25, 50, 75, 99, 150, 200, 300, 500, 750, 999];

SKILL_DEFINITIONS.forEach(skill => {
  SKILL_LEVEL_MILESTONES.forEach((level, idx) => {
    let rarity: AchievementRarity;
    let tier: number;

    if (level <= 25) { rarity = AchievementRarity.COMMON; tier = idx; }
    else if (level <= 75) { rarity = AchievementRarity.UNCOMMON; tier = idx - 2; }
    else if (level <= 200) { rarity = AchievementRarity.RARE; tier = idx - 4; }
    else if (level <= 500) { rarity = AchievementRarity.EPIC; tier = idx - 6; }
    else { rarity = AchievementRarity.LEGENDARY; tier = idx - 9; }

    achievements.push({
      id: `skill_${skill.id}_${level}`,
      name: `${skill.name} ${level}`,
      description: `Reach level ${level} in ${skill.name}`,
      category: AchievementCategory.SKILLS,
      rarity,
      reward: calcReward(rarity, tier),
      icon: skill.icon,
      check: (state) => state.skills[skill.id]?.level >= level,
    });
  });
});

// --------------------------------------------
// SKILLS UNLOCKED ACHIEVEMENTS
// --------------------------------------------

const SKILLS_UNLOCKED = [
  { count: 2, name: 'Second Profession', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 3, name: 'Triple Threat', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 5, name: 'Jack of Trades', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 7, name: 'Skilled Worker', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 10, name: 'Halfway There', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 12, name: 'Master of Many', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 15, name: 'Renaissance Person', rarity: AchievementRarity.RARE, tier: 1 },
  { count: 17, name: 'Nearly Complete', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 20, name: 'Completionist', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

SKILLS_UNLOCKED.forEach(m => {
  achievements.push({
    id: `skills_unlocked_${m.count}`,
    name: m.name,
    description: `Unlock ${m.count} skills`,
    category: AchievementCategory.SKILLS,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '📚',
    check: (state) => state.skillsUnlockedCount >= m.count,
  });
});

// --------------------------------------------
// GOLD EARNED ACHIEVEMENTS
// --------------------------------------------

const GOLD_MILESTONES = [
  { amount: 1, name: 'First Coin', rarity: AchievementRarity.COMMON, tier: 0 },
  { amount: 10, name: 'Pocket Change', rarity: AchievementRarity.COMMON, tier: 1 },
  { amount: 100, name: 'Savings Account', rarity: AchievementRarity.COMMON, tier: 2 },
  { amount: 500, name: 'Stash', rarity: AchievementRarity.COMMON, tier: 3 },
  { amount: 1000, name: 'Thousand Gold', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { amount: 5000, name: 'Comfortable', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { amount: 10000, name: 'Wealthy', rarity: AchievementRarity.UNCOMMON, tier: 2 },
  { amount: 50000, name: 'Rich', rarity: AchievementRarity.RARE, tier: 0 },
  { amount: 100000, name: 'Six Figures', rarity: AchievementRarity.RARE, tier: 1 },
  { amount: 500000, name: 'Half Millionaire', rarity: AchievementRarity.RARE, tier: 2 },
  { amount: 1000000, name: 'Millionaire', rarity: AchievementRarity.EPIC, tier: 0 },
  { amount: 5000000, name: 'Multi-Millionaire', rarity: AchievementRarity.EPIC, tier: 1 },
  { amount: 10000000, name: 'Tycoon', rarity: AchievementRarity.EPIC, tier: 2 },
  { amount: 100000000, name: 'Mogul', rarity: AchievementRarity.LEGENDARY, tier: 0 },
  { amount: 1000000000, name: 'Billionaire', rarity: AchievementRarity.LEGENDARY, tier: 1 },
];

GOLD_MILESTONES.forEach(m => {
  achievements.push({
    id: `gold_earned_${m.amount}`,
    name: m.name,
    description: `Earn ${m.amount >= 1000000 ? (m.amount / 1000000) + 'M' : m.amount >= 1000 ? (m.amount / 1000) + 'K' : m.amount} gold total`,
    category: AchievementCategory.GOLD,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '💰',
    check: (state) => state.stats.totalGoldEarned >= m.amount,
  });
});

// --------------------------------------------
// TAPS ACHIEVEMENTS
// --------------------------------------------

const TAP_MILESTONES = [
  { count: 1, name: 'First Tap', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 10, name: 'Getting the Hang', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 100, name: 'Tapper', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 500, name: 'Dedicated Tapper', rarity: AchievementRarity.COMMON, tier: 3 },
  { count: 1000, name: 'Click Master', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 5000, name: 'Rapid Fire', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 10000, name: 'Carpal Tunnel', rarity: AchievementRarity.UNCOMMON, tier: 2 },
  { count: 50000, name: 'Machine', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 100000, name: 'Unstoppable', rarity: AchievementRarity.RARE, tier: 1 },
  { count: 500000, name: 'Inhuman', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 1000000, name: 'Million Taps', rarity: AchievementRarity.EPIC, tier: 1 },
  { count: 10000000, name: 'Legendary Tapper', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

TAP_MILESTONES.forEach(m => {
  achievements.push({
    id: `taps_${m.count}`,
    name: m.name,
    description: `Tap ${m.count >= 1000000 ? (m.count / 1000000) + 'M' : m.count >= 1000 ? (m.count / 1000) + 'K' : m.count} times`,
    category: AchievementCategory.TAPS,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '👆',
    check: (state) => state.stats.totalTaps >= m.count,
  });
});

// --------------------------------------------
// RESOURCES GATHERED ACHIEVEMENTS
// --------------------------------------------

const RESOURCE_MILESTONES = [
  { count: 1, name: 'First Harvest', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 50, name: 'Gatherer', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 100, name: 'Collector', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 500, name: 'Hoarder', rarity: AchievementRarity.COMMON, tier: 3 },
  { count: 1000, name: 'Stockpiler', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 5000, name: 'Warehouse Owner', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 10000, name: 'Storage King', rarity: AchievementRarity.UNCOMMON, tier: 2 },
  { count: 50000, name: 'Resource Baron', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 100000, name: 'Industrial Giant', rarity: AchievementRarity.RARE, tier: 1 },
  { count: 500000, name: 'Empire Builder', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 1000000, name: 'Million Resources', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

RESOURCE_MILESTONES.forEach(m => {
  achievements.push({
    id: `resources_${m.count}`,
    name: m.name,
    description: `Gather ${m.count >= 1000000 ? (m.count / 1000000) + 'M' : m.count >= 1000 ? (m.count / 1000) + 'K' : m.count} resources`,
    category: AchievementCategory.GATHERING,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🌿',
    check: (state) => state.stats.totalResourcesGathered >= m.count,
  });
});

// --------------------------------------------
// CRIT ACHIEVEMENTS
// --------------------------------------------

const CRIT_MILESTONES = [
  { count: 1, name: 'First Critical!', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 10, name: 'Critical Thinker', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 50, name: 'Critical Mass', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 100, name: 'Crit Machine', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 500, name: 'Crit King', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 1000, name: 'Thousand Crits', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 5000, name: 'Crit Legend', rarity: AchievementRarity.RARE, tier: 1 },
  { count: 10000, name: 'Critical Master', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 100000, name: 'Crit God', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

CRIT_MILESTONES.forEach(m => {
  achievements.push({
    id: `crits_${m.count}`,
    name: m.name,
    description: `Land ${m.count >= 1000 ? (m.count / 1000) + 'K' : m.count} critical hits`,
    category: AchievementCategory.COMBAT,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '💥',
    check: (state) => state.stats.totalCrits >= m.count,
  });
});

// --------------------------------------------
// LUCKY HITS ACHIEVEMENTS
// --------------------------------------------

const LUCK_MILESTONES = [
  { count: 1, name: 'Lucky!', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 10, name: 'Lucky Streak', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 50, name: 'Fortune Favors', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 100, name: 'Lucky Star', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 500, name: 'Blessed by Fortune', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 1000, name: 'Luck of the Gods', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 10000, name: 'Impossibly Lucky', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

LUCK_MILESTONES.forEach(m => {
  achievements.push({
    id: `lucky_${m.count}`,
    name: m.name,
    description: `Get ${m.count >= 1000 ? (m.count / 1000) + 'K' : m.count} lucky hits`,
    category: AchievementCategory.COMBAT,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🍀',
    check: (state) => state.stats.totalLuckyHits >= m.count,
  });
});

// --------------------------------------------
// EQUIPMENT RARITY ACHIEVEMENTS
// --------------------------------------------

achievements.push({
  id: 'first_equipment',
  name: 'First Gear',
  description: 'Obtain your first piece of equipment',
  category: AchievementCategory.EQUIPMENT,
  rarity: AchievementRarity.COMMON,
  reward: calcReward(AchievementRarity.COMMON, 0),
  icon: '🗡️',
  check: (state) => state.equipmentInventory.length > 0 || Object.values(state.character.equipment).some((e: any) => e !== null),
});

const EQUIPMENT_COUNTS = [
  { count: 5, name: 'Small Arsenal', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 10, name: 'Armory', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 25, name: 'Collector', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 50, name: 'Hoarder of Gear', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 100, name: 'Equipment Master', rarity: AchievementRarity.RARE, tier: 0 },
];

EQUIPMENT_COUNTS.forEach(m => {
  achievements.push({
    id: `equipment_count_${m.count}`,
    name: m.name,
    description: `Obtain ${m.count} pieces of equipment`,
    category: AchievementCategory.EQUIPMENT,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '⚔️',
    check: (state) => {
      const inventoryCount = state.equipmentInventory.length;
      const equippedCount = Object.values(state.character.equipment).filter((e: any) => e !== null).length;
      return (state.stats.totalEquipmentObtained || inventoryCount + equippedCount) >= m.count;
    },
  });
});

// Rarity-specific equipment achievements
const RARITY_ACHIEVEMENTS = [
  { rarity: 'Common', achRarity: AchievementRarity.COMMON, tier: 3 },
  { rarity: 'Uncommon', achRarity: AchievementRarity.UNCOMMON, tier: 2 },
  { rarity: 'Rare', achRarity: AchievementRarity.RARE, tier: 1 },
  { rarity: 'Epic', achRarity: AchievementRarity.EPIC, tier: 0 },
  { rarity: 'Legendary', achRarity: AchievementRarity.LEGENDARY, tier: 0 },
];

RARITY_ACHIEVEMENTS.forEach(m => {
  achievements.push({
    id: `first_${m.rarity.toLowerCase()}_equipment`,
    name: `First ${m.rarity}`,
    description: `Obtain your first ${m.rarity} equipment`,
    category: AchievementCategory.EQUIPMENT,
    rarity: m.achRarity,
    reward: calcReward(m.achRarity, m.tier),
    icon: m.rarity === 'Common' ? '⚪' : m.rarity === 'Uncommon' ? '🟢' : m.rarity === 'Rare' ? '🔵' : m.rarity === 'Epic' ? '🟣' : '🟡',
    check: (state) => {
      const rarityKey = m.rarity.toLowerCase();
      return state.stats[`first${m.rarity}Equipment`] ||
        state.equipmentInventory.some((e: any) => e.rarity === rarityKey) ||
        Object.values(state.character.equipment).some((e: any) => e && e.rarity === rarityKey);
    },
  });
});

// --------------------------------------------
// PRESTIGE ACHIEVEMENTS
// --------------------------------------------

const PRESTIGE_MILESTONES = [
  { count: 1, name: 'First Prestige', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 2, name: 'Double Prestige', rarity: AchievementRarity.RARE, tier: 1 },
  { count: 5, name: 'Prestige V', rarity: AchievementRarity.RARE, tier: 2 },
  { count: 10, name: 'Prestige X', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 25, name: 'Prestige XXV', rarity: AchievementRarity.EPIC, tier: 1 },
  { count: 50, name: 'Prestige L', rarity: AchievementRarity.EPIC, tier: 2 },
  { count: 100, name: 'Prestige C', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

PRESTIGE_MILESTONES.forEach(m => {
  achievements.push({
    id: `prestige_${m.count}`,
    name: m.name,
    description: `Reach Prestige level ${m.count}`,
    category: AchievementCategory.PRESTIGE,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '👑',
    check: (state) => state.prestigeCount >= m.count,
  });
});

// Chaos Points achievements
const CHAOS_MILESTONES = [
  { count: 100, name: 'Chaos Initiate', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 500, name: 'Chaos Adept', rarity: AchievementRarity.RARE, tier: 1 },
  { count: 1000, name: 'Chaos Master', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 5000, name: 'Chaos Lord', rarity: AchievementRarity.EPIC, tier: 1 },
  { count: 10000, name: 'Chaos God', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

CHAOS_MILESTONES.forEach(m => {
  achievements.push({
    id: `chaos_${m.count}`,
    name: m.name,
    description: `Accumulate ${m.count >= 1000 ? (m.count / 1000) + 'K' : m.count} Chaos Points`,
    category: AchievementCategory.PRESTIGE,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🌀',
    check: (state) => state.chaosPoints >= m.count,
  });
});

// --------------------------------------------
// UPGRADES ACHIEVEMENTS
// --------------------------------------------

const UPGRADE_MILESTONES = [
  { count: 1, name: 'First Upgrade', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 5, name: 'Upgrader', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 10, name: 'Power Up', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 15, name: 'Upgrade Addict', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 20, name: 'Super Charged', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 25, name: 'Maxed Out', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 30, name: 'Upgrade Master', rarity: AchievementRarity.EPIC, tier: 0 },
];

UPGRADE_MILESTONES.forEach(m => {
  achievements.push({
    id: `upgrades_${m.count}`,
    name: m.name,
    description: `Purchase ${m.count} upgrades`,
    category: AchievementCategory.UPGRADES,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '⬆️',
    check: (state) => Object.keys(state.upgrades).length >= m.count,
  });
});

// --------------------------------------------
// MAGIC/SPELLS ACHIEVEMENTS
// --------------------------------------------

achievements.push({
  id: 'unlock_magic',
  name: 'Magical Awakening',
  description: 'Unlock the Magic system',
  category: AchievementCategory.MAGIC,
  rarity: AchievementRarity.UNCOMMON,
  reward: calcReward(AchievementRarity.UNCOMMON, 0),
  icon: '✨',
  check: (state) => state.spellsUnlocked,
});

const SPELL_CAST_MILESTONES = [
  { count: 1, name: 'First Spell', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 10, name: 'Apprentice Mage', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 50, name: 'Spellcaster', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 100, name: 'Sorcerer', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 500, name: 'Archmage', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 1000, name: 'Grand Magister', rarity: AchievementRarity.EPIC, tier: 0 },
];

SPELL_CAST_MILESTONES.forEach(m => {
  achievements.push({
    id: `spells_cast_${m.count}`,
    name: m.name,
    description: `Cast ${m.count} spells`,
    category: AchievementCategory.MAGIC,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🔮',
    check: (state) => (state.stats.totalSpellsCast || 0) >= m.count,
    hidden: (state) => !state.spellsUnlocked,
  });
});

// Mana pool achievements
const MANA_MILESTONES = [
  { amount: 50, name: 'Mana Pool', rarity: AchievementRarity.COMMON, tier: 0 },
  { amount: 100, name: 'Deep Reserves', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { amount: 200, name: 'Vast Power', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { amount: 500, name: 'Ocean of Mana', rarity: AchievementRarity.RARE, tier: 0 },
  { amount: 1000, name: 'Infinite Power', rarity: AchievementRarity.EPIC, tier: 0 },
];

MANA_MILESTONES.forEach(m => {
  achievements.push({
    id: `max_mana_${m.amount}`,
    name: m.name,
    description: `Reach ${m.amount} max mana`,
    category: AchievementCategory.MAGIC,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '💧',
    check: (state) => state.maxMana >= m.amount,
    hidden: (state) => !state.spellsUnlocked,
  });
});

// --------------------------------------------
// BONUS TAPS ACHIEVEMENTS
// --------------------------------------------

const BONUS_TAP_MILESTONES = [
  { count: 2, name: 'Double Tap', rarity: AchievementRarity.COMMON, tier: 0 },
  { count: 3, name: 'Triple Tap', rarity: AchievementRarity.COMMON, tier: 1 },
  { count: 5, name: 'Penta Tap', rarity: AchievementRarity.COMMON, tier: 2 },
  { count: 10, name: 'Deca Tap', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { count: 25, name: 'Mega Tap', rarity: AchievementRarity.UNCOMMON, tier: 1 },
  { count: 50, name: 'Ultra Tap', rarity: AchievementRarity.RARE, tier: 0 },
  { count: 100, name: 'Hyper Tap', rarity: AchievementRarity.EPIC, tier: 0 },
  { count: 250, name: 'God Tap', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

BONUS_TAP_MILESTONES.forEach(m => {
  achievements.push({
    id: `bonus_taps_${m.count}`,
    name: m.name,
    description: `Reach ${m.count} taps per click`,
    category: AchievementCategory.MILESTONES,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🎯',
    check: (state) => (1 + state.bonusTaps) >= m.count,
  });
});

// --------------------------------------------
// MISC MILESTONES
// --------------------------------------------

// Gold bonus achievements
const GOLD_BONUS_MILESTONES = [
  { percent: 10, name: 'Golden Touch', rarity: AchievementRarity.COMMON, tier: 0 },
  { percent: 25, name: 'Midas', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { percent: 50, name: 'Gold Magnet', rarity: AchievementRarity.RARE, tier: 0 },
  { percent: 100, name: 'Double Gold', rarity: AchievementRarity.EPIC, tier: 0 },
];

GOLD_BONUS_MILESTONES.forEach(m => {
  achievements.push({
    id: `gold_bonus_${m.percent}`,
    name: m.name,
    description: `Reach +${m.percent}% gold bonus`,
    category: AchievementCategory.GOLD,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '✨',
    check: (state) => state.goldBonus >= m.percent,
  });
});

// Crit chance achievements
const CRIT_CHANCE_MILESTONES = [
  { percent: 10, name: 'Sharp Eye', rarity: AchievementRarity.COMMON, tier: 0 },
  { percent: 25, name: 'Precision', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { percent: 50, name: 'Half and Half', rarity: AchievementRarity.RARE, tier: 0 },
  { percent: 75, name: 'Almost Always', rarity: AchievementRarity.EPIC, tier: 0 },
  { percent: 100, name: 'Perfect Crits', rarity: AchievementRarity.LEGENDARY, tier: 0 },
];

CRIT_CHANCE_MILESTONES.forEach(m => {
  achievements.push({
    id: `crit_chance_${m.percent}`,
    name: m.name,
    description: `Reach ${m.percent}% crit chance`,
    category: AchievementCategory.COMBAT,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🎯',
    check: (state) => state.critChance >= m.percent,
  });
});

// Luck achievements
const LUCK_PERCENT_MILESTONES = [
  { percent: 5, name: 'Slightly Lucky', rarity: AchievementRarity.COMMON, tier: 0 },
  { percent: 10, name: 'Lucky Person', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { percent: 25, name: 'Very Lucky', rarity: AchievementRarity.RARE, tier: 0 },
  { percent: 50, name: 'Extremely Lucky', rarity: AchievementRarity.EPIC, tier: 0 },
];

LUCK_PERCENT_MILESTONES.forEach(m => {
  achievements.push({
    id: `luck_percent_${m.percent}`,
    name: m.name,
    description: `Reach ${m.percent}% luck`,
    category: AchievementCategory.COMBAT,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '🍀',
    check: (state) => state.luck >= m.percent,
  });
});

// Current gold achievements (not earned, but held)
const GOLD_HELD_MILESTONES = [
  { amount: 1000, name: 'Saver', rarity: AchievementRarity.COMMON, tier: 0 },
  { amount: 10000, name: 'Prudent', rarity: AchievementRarity.UNCOMMON, tier: 0 },
  { amount: 100000, name: 'Treasurer', rarity: AchievementRarity.RARE, tier: 0 },
  { amount: 1000000, name: 'Dragon\'s Hoard', rarity: AchievementRarity.EPIC, tier: 0 },
];

GOLD_HELD_MILESTONES.forEach(m => {
  achievements.push({
    id: `gold_held_${m.amount}`,
    name: m.name,
    description: `Hold ${m.amount >= 1000000 ? (m.amount / 1000000) + 'M' : m.amount >= 1000 ? (m.amount / 1000) + 'K' : m.amount} gold at once`,
    category: AchievementCategory.GOLD,
    rarity: m.rarity,
    reward: calcReward(m.rarity, m.tier),
    icon: '💎',
    check: (state) => state.gold >= m.amount,
  });
});

// ============================================
// EXPORTS
// ============================================

export const ACHIEVEMENTS = achievements;

export const ACHIEVEMENT_CATEGORIES = [
  { id: AchievementCategory.MILESTONES, name: 'Milestones', icon: '🏆' },
  { id: AchievementCategory.PLAYTIME, name: 'Playtime', icon: '⏱️' },
  { id: AchievementCategory.SKILLS, name: 'Skills', icon: '📚' },
  { id: AchievementCategory.GATHERING, name: 'Gathering', icon: '🌿' },
  { id: AchievementCategory.GOLD, name: 'Gold', icon: '💰' },
  { id: AchievementCategory.TAPS, name: 'Taps', icon: '👆' },
  { id: AchievementCategory.COMBAT, name: 'Combat', icon: '⚔️' },
  { id: AchievementCategory.EQUIPMENT, name: 'Equipment', icon: '🗡️' },
  { id: AchievementCategory.PRESTIGE, name: 'Prestige', icon: '👑' },
  { id: AchievementCategory.UPGRADES, name: 'Upgrades', icon: '⬆️' },
  { id: AchievementCategory.MAGIC, name: 'Magic', icon: '🔮' },
];

export const RARITY_COLORS = {
  [AchievementRarity.COMMON]: '#9d9d9d',
  [AchievementRarity.UNCOMMON]: '#1eff00',
  [AchievementRarity.RARE]: '#0070dd',
  [AchievementRarity.EPIC]: '#a335ee',
  [AchievementRarity.LEGENDARY]: '#ff8000',
};

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

console.log(`Loaded ${ACHIEVEMENTS.length} achievements`);
