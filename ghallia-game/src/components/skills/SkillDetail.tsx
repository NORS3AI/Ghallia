/**
 * SkillDetail Component
 * Individual skill view with gather button and stats
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { SkillType, SkillCategory } from '../../types/game.types';
import {
  useGame,
  SKILL_DEFINITIONS,
  getXpProgress,
  getResourceName,
  getRecipesForSkill,
  getMaterialTiersForSkill,
  CRAFTING_RECIPES,
  CraftingRecipe,
} from '../../store/gameStore';
import { getTierFromLevel, totalXpForLevel, formatNumber } from '../../utils/math';
import { useSwipe } from '../../hooks/useSwipe';

interface SkillDetailProps {
  skillType: SkillType;
  onBack: () => void;
  onSwipeToNext?: () => void;
  onSwipeToPrev?: () => void;
}

interface NumberPop {
  id: number;
  value: string;
  type: 'normal' | 'crit' | 'lucky' | 'crit-lucky';
  x: number;
  y: number;
}

export function SkillDetail({ skillType, onBack, onSwipeToNext, onSwipeToPrev }: SkillDetailProps) {
  const { state, gather, sellResource, startCraft, cancelCraft, collectCrafted } = useGame();
  const skillDef = SKILL_DEFINITIONS.find(s => s.id === skillType)!;
  const skillState = state.skills[skillType];
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [pops, setPops] = useState<NumberPop[]>([]);
  const popIdRef = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const tier = getTierFromLevel(skillState.level);
  const resourceName = getResourceName(skillType, tier);
  const resourceId = `${skillType}_t${tier}`;
  const resourceCount = state.resources[resourceId] || 0;

  const xpProgress = getXpProgress(skillState);
  const currentLevelXp = totalXpForLevel(skillState.level);
  const nextLevelXp = totalXpForLevel(skillState.level + 1);
  const xpInLevel = skillState.totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  const tierMin = (tier - 1) * 20 + 1;
  const tierMax = tier * 20;

  const swipeHandlers = useSwipe({
    onSwipeLeft: onSwipeToNext,
    onSwipeRight: onSwipeToPrev || onBack,
  });

  // Get the last gather result for this skill
  const lastGather = state.lastGatherResult;

  const handleGather = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    gather(skillType);
  }, [gather, skillType]);

  // Effect to show popup when gather result changes
  const lastTimestampRef = useRef(0);
  useEffect(() => {
    if (lastGather && lastGather.skillType === skillType && lastGather.timestamp > lastTimestampRef.current) {
      lastTimestampRef.current = lastGather.timestamp;

      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        // Determine pop type based on crit/lucky
        let popType: 'normal' | 'crit' | 'lucky' | 'crit-lucky' = 'normal';
        if (lastGather.isCrit && lastGather.isLucky) {
          popType = 'crit-lucky';
        } else if (lastGather.isCrit) {
          popType = 'crit';
        } else if (lastGather.isLucky) {
          popType = 'lucky';
        }

        const newPop: NumberPop = {
          id: ++popIdRef.current,
          value: `+${lastGather.resourceTaps}`,
          type: popType,
          x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 30,
          y: rect.top - 40,
        };
        setPops(prev => [...prev, newPop]);
        setTimeout(() => {
          setPops(prev => prev.filter(p => p.id !== newPop.id));
        }, 800);
      }
    }
  }, [lastGather, skillType]);

  const handleSellAll = useCallback(() => {
    if (resourceCount > 0) {
      sellResource(resourceId, resourceCount);
    }
  }, [sellResource, resourceId, resourceCount]);

  const isGathering = skillDef.category === SkillCategory.GATHERING;
  const isCrafting = skillDef.category === SkillCategory.CRAFTING;

  // Crafting-related data
  const availableRecipes = useMemo(() => {
    if (!isCrafting) return [];
    return getRecipesForSkill(skillType, skillState.level);
  }, [isCrafting, skillType, skillState.level]);

  const materialTiers = useMemo(() => {
    if (!isCrafting) return [];
    return getMaterialTiersForSkill(skillType);
  }, [isCrafting, skillType]);

  const filteredRecipes = useMemo(() => {
    if (selectedTier === 'all') return availableRecipes;
    return availableRecipes.filter(recipe =>
      recipe.materials.some(mat => mat.resourceId.includes(`_t${selectedTier}`))
    );
  }, [availableRecipes, selectedTier]);

  // Crafting queue for this skill
  const craftingQueue = state.craftingQueue.filter(item => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === item.recipeId);
    return recipe?.craftingSkill === skillType;
  });

  // Crafted items ready to sell for this skill
  const craftedItemsForSkill = useMemo(() => {
    const items: { recipe: CraftingRecipe; quantity: number }[] = [];
    Object.entries(state.craftedItems).forEach(([recipeId, quantity]) => {
      if (quantity > 0) {
        const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
        if (recipe && recipe.craftingSkill === skillType) {
          items.push({ recipe, quantity });
        }
      }
    });
    return items;
  }, [state.craftedItems, skillType]);

  // Check if player can afford a recipe
  const canAffordRecipe = useCallback((recipe: CraftingRecipe) => {
    for (const mat of recipe.materials) {
      const have = state.resources[mat.resourceId] || 0;
      if (have < mat.quantity) return false;
    }
    return true;
  }, [state.resources]);

  // Handle starting a craft
  const handleStartCraft = useCallback((recipeId: string) => {
    startCraft(recipeId);
  }, [startCraft]);

  // Handle collecting/selling crafted items
  const handleCollect = useCallback((recipeId: string, quantity: number) => {
    collectCrafted(recipeId, quantity);
  }, [collectCrafted]);

  return (
    <div className="skill-detail" {...swipeHandlers}>
      {/* Back Button */}
      <button className="back-button" onClick={onBack}>
        ← Skills
      </button>

      {/* Header */}
      <div className="skill-detail-header">
        <div className="skill-detail-icon">{skillDef.icon}</div>
        <div className="skill-detail-info">
          <h2 className="skill-detail-name">{skillDef.name}</h2>
          <div className="skill-detail-level">
            Level <strong>{skillState.level}</strong> / 999
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="xp-progress">
        <div className="xp-bar-container">
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="xp-text">
          <span className="xp-current">{formatNumber(xpInLevel)} XP</span>
          <span>{formatNumber(xpNeeded)} XP to next</span>
        </div>
      </div>

      {/* Resource Display */}
      <div className="resource-display">
        <div className="resource-item">
          <div className="resource-count">{formatNumber(resourceCount)}</div>
          <div className="resource-label">{resourceName}</div>
        </div>
        <div className="resource-item">
          <button
            className="unlock-button"
            onClick={handleSellAll}
            disabled={resourceCount === 0}
          >
            Sell All
          </button>
        </div>
      </div>

      {/* Gather Section (only for gathering skills) */}
      {isGathering && (
        <div className="gather-section">
          <div className="gather-resource-name">
            Gathering: {resourceName}
          </div>
          <button
            ref={buttonRef}
            className="gather-button"
            onClick={handleGather}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleGather(e);
            }}
          >
            {skillDef.icon}
          </button>
          <div className="gather-hint">Tap to gather</div>
        </div>
      )}

      {/* Crafting Section (only for crafting skills) */}
      {isCrafting && (
        <div className="crafting-section">
          {/* Crafted Items Ready to Sell */}
          {craftedItemsForSkill.length > 0 && (
            <div className="crafted-items-section">
              <h3 className="section-title">Ready to Sell</h3>
              <div className="crafted-items-list">
                {craftedItemsForSkill.map(({ recipe, quantity }) => (
                  <div key={recipe.id} className="crafted-item">
                    <span className="crafted-icon">{recipe.icon}</span>
                    <span className="crafted-name">{recipe.name}</span>
                    <span className="crafted-quantity">x{quantity}</span>
                    <button
                      className="sell-crafted-button"
                      onClick={() => handleCollect(recipe.id, quantity)}
                    >
                      Sell ({formatNumber(recipe.sellValue * quantity)}g)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crafting Queue */}
          {craftingQueue.length > 0 && (
            <div className="crafting-queue-section">
              <h3 className="section-title">Crafting Queue ({craftingQueue.length})</h3>
              <div className="crafting-queue-list">
                {craftingQueue.slice(0, 5).map(item => {
                  const recipe = CRAFTING_RECIPES.find(r => r.id === item.recipeId);
                  if (!recipe) return null;
                  const now = Date.now();
                  const progress = Math.min(100, ((now - item.startTime) / (item.endTime - item.startTime)) * 100);
                  const remaining = Math.max(0, Math.ceil((item.endTime - now) / 1000));
                  return (
                    <div key={item.id} className="queue-item">
                      <span className="queue-icon">{recipe.icon}</span>
                      <div className="queue-info">
                        <span className="queue-name">{recipe.name}</span>
                        <div className="queue-progress-bar">
                          <div className="queue-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="queue-time">{remaining}s</span>
                      </div>
                      <button
                        className="cancel-craft-button"
                        onClick={() => cancelCraft(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Material Tier Filter */}
          <div className="material-filter">
            <button
              className={`filter-btn ${selectedTier === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedTier('all')}
            >
              All
            </button>
            {materialTiers.slice(0, 5).map(tierNum => (
              <button
                key={tierNum}
                className={`filter-btn ${selectedTier === tierNum ? 'active' : ''}`}
                onClick={() => setSelectedTier(tierNum)}
              >
                T{tierNum}
              </button>
            ))}
          </div>

          {/* Recipe List */}
          <div className="recipes-section">
            <h3 className="section-title">Recipes ({filteredRecipes.length})</h3>
            <div className="recipes-list">
              {filteredRecipes.slice(0, 20).map(recipe => {
                const canAfford = canAffordRecipe(recipe);
                const meetsLevel = skillState.level >= recipe.requiredLevel;
                return (
                  <div
                    key={recipe.id}
                    className={`recipe-item ${!canAfford ? 'cannot-afford' : ''} ${!meetsLevel ? 'locked' : ''}`}
                  >
                    <span className="recipe-icon">{recipe.icon}</span>
                    <div className="recipe-info">
                      <span className="recipe-name">{recipe.name}</span>
                      <span className="recipe-level">Lv. {recipe.requiredLevel}</span>
                      <div className="recipe-materials">
                        {recipe.materials.map((mat, idx) => {
                          const have = state.resources[mat.resourceId] || 0;
                          const tierMatch = mat.resourceId.match(/_t(\d+)$/);
                          const tierNum = tierMatch ? parseInt(tierMatch[1]) : 1;
                          // Extract skill type from resourceId (e.g., "logging_t1" -> "logging")
                          const skillMatch = mat.resourceId.match(/^(.+)_t\d+$/);
                          const gatheringSkill = skillMatch ? skillMatch[1] : 'logging';
                          const skillTypeMap: Record<string, SkillType> = {
                            logging: SkillType.LOGGING,
                            mining: SkillType.MINING,
                            fishing: SkillType.FISHING,
                            herbalism: SkillType.HERBALISM,
                            skinning: SkillType.SKINNING,
                            foraging: SkillType.FORAGING,
                            hunting: SkillType.HUNTING,
                          };
                          const matSkillType = skillTypeMap[gatheringSkill] || SkillType.LOGGING;
                          const materialName = getResourceName(matSkillType, tierNum);
                          return (
                            <span
                              key={idx}
                              className={`material ${have >= mat.quantity ? 'has-enough' : 'not-enough'}`}
                            >
                              {materialName}: {have}/{mat.quantity}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="recipe-actions">
                      <span className="recipe-value">{recipe.sellValue}g</span>
                      <button
                        className="craft-button"
                        disabled={!canAfford || !meetsLevel}
                        onClick={() => handleStartCraft(recipe.id)}
                      >
                        Craft
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredRecipes.length === 0 && (
                <div className="no-recipes">No recipes available at this level</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tier Info */}
      <div className="tier-info">
        <div className="tier-header">
          <span className="tier-name">Tier {tier}: {resourceName.replace(' Wood', '')}</span>
          <span className="tier-level-range">Lv. {tierMin}-{tierMax}</span>
        </div>
        <div className="tier-progress">
          {skillState.level < tierMax
            ? `${tierMax - skillState.level} levels until next tier`
            : 'Tier complete!'}
        </div>
      </div>

      {/* Floating number pops */}
      {pops.map(pop => (
        <div
          key={pop.id}
          className={`number-pop ${pop.type}`}
          style={{ left: pop.x, top: pop.y }}
        >
          {pop.value}
        </div>
      ))}
    </div>
  );
}
