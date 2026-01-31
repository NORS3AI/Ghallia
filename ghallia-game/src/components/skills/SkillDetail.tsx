/**
 * SkillDetail Component
 * Individual skill view with gather button and stats
 */

import { useState, useCallback, useRef } from 'react';
import { SkillType, SkillCategory } from '../../types/game.types';
import {
  useGame,
  SKILL_DEFINITIONS,
  getXpProgress,
  getResourceName
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
  type: 'xp' | 'resource';
  x: number;
  y: number;
}

export function SkillDetail({ skillType, onBack, onSwipeToNext, onSwipeToPrev }: SkillDetailProps) {
  const { state, gather, sellResource } = useGame();
  const skillDef = SKILL_DEFINITIONS.find(s => s.id === skillType)!;
  const skillState = state.skills[skillType];
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

  const handleGather = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    gather(skillType);

    // Create floating number just above the gather button
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const newPop: NumberPop = {
        id: ++popIdRef.current,
        value: '+1',
        type: 'resource',
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 30,
        y: rect.top - 20, // Position above the button
      };
      setPops(prev => [...prev, newPop]);
      setTimeout(() => {
        setPops(prev => prev.filter(p => p.id !== newPop.id));
      }, 800);
    }
  }, [gather, skillType]);

  const handleSellAll = useCallback(() => {
    if (resourceCount > 0) {
      sellResource(resourceId, resourceCount);
    }
  }, [sellResource, resourceId, resourceCount]);

  const isGathering = skillDef.category === SkillCategory.GATHERING;

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
