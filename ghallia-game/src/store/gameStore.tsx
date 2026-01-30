/**
 * Ghallia Game State Store
 * React Context + useReducer for state management
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SkillType, SkillCategory, ItemQuality } from '../types/game.types';
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

export interface GameState {
  gold: number;
  skills: Record<SkillType, SkillState>;
  resources: ResourceState;
  skillsUnlockedCount: number;
  prestigeCount: number;
  chaosPoints: number;
  lastSaveTime: number;
  gameVersion: string;
}

// ============================================
// ACTIONS
// ============================================

type GameAction =
  | { type: 'GATHER'; skillType: SkillType }
  | { type: 'UNLOCK_SKILL'; skillType: SkillType }
  | { type: 'SELL_RESOURCE'; resourceId: string; quantity: number }
  | { type: 'ADD_GOLD'; amount: number }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

// ============================================
// INITIAL STATE
// ============================================

function createInitialSkills(): Record<SkillType, SkillState> {
  const skills: Partial<Record<SkillType, SkillState>> = {};

  for (const def of SKILL_DEFINITIONS) {
    skills[def.id] = {
      level: 1,
      totalXp: 0,
      unlocked: def.id === SkillType.LOGGING, // Only Logging starts unlocked
    };
  }

  return skills as Record<SkillType, SkillState>;
}

const initialState: GameState = {
  gold: 0,
  skills: createInitialSkills(),
  resources: {},
  skillsUnlockedCount: 1, // Logging
  prestigeCount: 0,
  chaosPoints: 0,
  lastSaveTime: Date.now(),
  gameVersion: GAME_VERSION,
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
  // Add other skills later
  return 'Resource';
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
      const xpGained = xpPerAction(tier, skill.level);
      const newTotalXp = skill.totalXp + xpGained;
      const newLevel = levelFromTotalXp(newTotalXp);

      // Gather resources
      const { quantity } = calculateGatherYield(0, 0);
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
          [resourceId]: (state.resources[resourceId] || 0) + quantity,
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

      // Calculate gold based on tier (extract from resourceId)
      const tierMatch = action.resourceId.match(/_t(\d+)$/);
      const tier = tierMatch ? parseInt(tierMatch[1]) : 1;
      const goldPerItem = Math.floor(BALANCE.gold.base * Math.pow(BALANCE.gold.tierScale, tier - 1));
      const goldGained = goldPerItem * action.quantity;

      return {
        ...state,
        gold: state.gold + goldGained,
        resources: {
          ...state.resources,
          [action.resourceId]: current - action.quantity,
        },
      };
    }

    case 'ADD_GOLD': {
      return {
        ...state,
        gold: state.gold + action.amount,
      };
    }

    case 'LOAD_GAME': {
      return action.state;
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
  saveGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

const SAVE_KEY = 'ghallia_save';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    // Load saved game
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return initial;
  });

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

  const saveGame = useCallback(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }));
  }, [state]);

  return (
    <GameContext.Provider value={{
      state,
      dispatch,
      gather,
      unlockSkill,
      sellResource,
      sellAllResources,
      saveGame
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
