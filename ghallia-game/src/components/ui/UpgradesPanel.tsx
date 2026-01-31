/**
 * Upgrades Panel Component
 * Shows purchasable upgrades for tap power, crit, luck, mana, and gold
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useGame, UPGRADES, UpgradeDef, getUpgradeManaCost } from '../../store/gameStore';
import { formatGold } from '../../utils/math';
import './UpgradesPanel.css';

interface UpgradesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryFilter = 'tap' | 'crit' | 'luck' | 'mana' | 'gold';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  tap: 'Tap',
  crit: 'Crit',
  luck: 'Luck',
  mana: 'Mana',
  gold: 'Gold',
};

const CATEGORY_ICONS: Record<CategoryFilter, string> = {
  tap: '👆',
  crit: '💥',
  luck: '🍀',
  mana: '💧',
  gold: '💰',
};

const ALL_CATEGORIES: CategoryFilter[] = ['tap', 'crit', 'luck', 'mana', 'gold'];

export function UpgradesPanel({ isOpen, onClose }: UpgradesPanelProps) {
  const { state, buyUpgrade, unlockAchievements, unlockSpells } = useGame();
  // Multi-select category filters (empty = show all)
  const [activeCategories, setActiveCategories] = useState<Set<CategoryFilter>>(new Set());
  // Afford filter - only show affordable upgrades
  const [affordOnly, setAffordOnly] = useState(false);
  // Hide purchased upgrades
  const [hidePurchased, setHidePurchased] = useState(false);

  const toggleCategory = (cat: CategoryFilter) => {
    setActiveCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) {
        newSet.delete(cat);
      } else {
        newSet.add(cat);
      }
      return newSet;
    });
  };

  const filteredUpgrades = useMemo(() => {
    let result = UPGRADES;

    // Filter by categories (if any selected)
    if (activeCategories.size > 0) {
      result = result.filter(u => activeCategories.has(u.category as CategoryFilter));
    }

    // Filter affordable only
    if (affordOnly) {
      result = result.filter(u => {
        const purchased = !!state.upgrades[u.id];
        const canAfford = state.gold >= u.baseCost;
        return !purchased && canAfford;
      });
    }

    // Hide purchased
    if (hidePurchased) {
      result = result.filter(u => !state.upgrades[u.id]);
    }

    return result;
  }, [activeCategories, affordOnly, hidePurchased, state.upgrades, state.gold]);

  const sortedUpgrades = useMemo(() => {
    return [...filteredUpgrades].sort((a, b) => a.baseCost - b.baseCost);
  }, [filteredUpgrades]);

  const upgradeStats = useMemo(() => {
    const total = UPGRADES.length;
    const purchased = Object.keys(state.upgrades).length;
    return { total, purchased };
  }, [state.upgrades]);

  // Get affordable unpurchased upgrades sorted by cost
  const affordableUpgrades = useMemo(() => {
    return UPGRADES
      .filter(u => {
        if (state.upgrades[u.id]) return false;
        const manaCost = getUpgradeManaCost(u.id);
        const canAffordGold = state.gold >= u.baseCost;
        const canAffordMana = manaCost === 0 || state.mana >= manaCost;
        return canAffordGold && canAffordMana;
      })
      .sort((a, b) => a.baseCost - b.baseCost);
  }, [state.upgrades, state.gold, state.mana]);

  const handleUpgradeAll = useCallback(() => {
    if (affordableUpgrades.length === 0) return;

    // Buy upgrades one by one, cheapest first
    // Need to track remaining gold/mana as we buy
    let remainingGold = state.gold;
    let remainingMana = state.mana;

    for (const upgrade of affordableUpgrades) {
      const manaCost = getUpgradeManaCost(upgrade.id);
      if (remainingGold >= upgrade.baseCost && (manaCost === 0 || remainingMana >= manaCost)) {
        buyUpgrade(upgrade.id);
        remainingGold -= upgrade.baseCost;
        remainingMana -= manaCost;
      }
    }
  }, [affordableUpgrades, state.gold, state.mana, buyUpgrade]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`upgrades-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`upgrades-panel ${isOpen ? 'open' : ''}`}>
        <div className="upgrades-header">
          <h2>Upgrades</h2>
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}/{state.maxMana} (+{state.manaRegen.toFixed(1)}/s)</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="upgrades-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Category Filter - Multi-select */}
        <div className="upgrades-filters">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-button ${activeCategories.has(cat) ? 'active' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              <span className="filter-icon">{CATEGORY_ICONS[cat]}</span>
              <span className="filter-label">{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}

          {/* Afford filter */}
          <button
            className={`filter-button afford-filter ${affordOnly ? 'active' : ''}`}
            onClick={() => setAffordOnly(prev => !prev)}
          >
            <span className="filter-icon">✓</span>
            <span className="filter-label">Afford</span>
          </button>

          {/* Spacer to push Hide to the right */}
          <div className="filter-spacer" />

          {/* Hide purchased toggle */}
          <button
            className={`filter-button hide-filter ${hidePurchased ? 'active' : ''}`}
            onClick={() => setHidePurchased(prev => !prev)}
          >
            <span className="filter-icon">👁️</span>
            <span className="filter-label">Hide</span>
          </button>
        </div>

        {/* Upgrade Count */}
        <div className="upgrade-count-bar">
          <span>{upgradeStats.purchased}/{upgradeStats.total} purchased</span>
          <span className="showing-count">Showing: {sortedUpgrades.length}</span>
          {affordableUpgrades.length > 0 && (
            <button className="upgrade-all-button" onClick={handleUpgradeAll}>
              Buy All ({affordableUpgrades.length})
            </button>
          )}
        </div>

        {/* Upgrades List */}
        <div className="upgrades-content">
          {/* Feature Unlocks Section */}
          {(!state.achievementsUnlocked || !state.spellsUnlocked) && (
            <div className="feature-unlocks-section">
              <h3 className="feature-unlocks-title">Feature Unlocks</h3>
              <div className="feature-unlocks-list">
                {!state.achievementsUnlocked && (
                  <div className={`feature-unlock-item ${state.gold >= 100 ? 'affordable' : 'locked'}`}>
                    <div className="feature-unlock-info">
                      <span className="feature-unlock-icon">🏆</span>
                      <div className="feature-unlock-text">
                        <span className="feature-unlock-name">Achievements</span>
                        <span className="feature-unlock-desc">Track your progress and earn rewards</span>
                      </div>
                    </div>
                    <button
                      className={`feature-unlock-buy ${state.gold >= 100 ? 'affordable' : ''}`}
                      onClick={unlockAchievements}
                      disabled={state.gold < 100}
                    >
                      100g
                    </button>
                  </div>
                )}
                {!state.spellsUnlocked && (
                  <div className={`feature-unlock-item ${state.gold >= 10000 ? 'affordable' : 'locked'}`}>
                    <div className="feature-unlock-info">
                      <span className="feature-unlock-icon">🔮</span>
                      <div className="feature-unlock-text">
                        <span className="feature-unlock-name">Magic</span>
                        <span className="feature-unlock-desc">Cast powerful spells using mana</span>
                      </div>
                    </div>
                    <button
                      className={`feature-unlock-buy ${state.gold >= 10000 ? 'affordable' : ''}`}
                      onClick={unlockSpells}
                      disabled={state.gold < 10000}
                    >
                      10,000g
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="upgrades-list">
            {sortedUpgrades.map(upgrade => {
              const manaCost = getUpgradeManaCost(upgrade.id);
              const canAffordGold = state.gold >= upgrade.baseCost;
              const canAffordMana = manaCost === 0 || state.mana >= manaCost;
              return (
                <UpgradeItem
                  key={upgrade.id}
                  upgrade={upgrade}
                  purchased={!!state.upgrades[upgrade.id]}
                  canAfford={canAffordGold && canAffordMana}
                  manaCost={manaCost}
                  onBuy={() => buyUpgrade(upgrade.id)}
                />
              );
            })}
            {sortedUpgrades.length === 0 && (
              <div className="no-upgrades">No upgrades match your filters</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface UpgradeItemProps {
  upgrade: UpgradeDef;
  purchased: boolean;
  canAfford: boolean;
  manaCost: number;
  onBuy: () => void;
}

function UpgradeItem({ upgrade, purchased, canAfford, manaCost, onBuy }: UpgradeItemProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tap': return '#ff9f43';
      case 'crit': return '#ee5253';
      case 'luck': return '#2ecc71';
      case 'mana': return '#4ecdc4';
      case 'gold': return '#d4a853';
      default: return '#a89880';
    }
  };

  return (
    <div className={`upgrade-item ${purchased ? 'purchased' : ''} ${!canAfford && !purchased ? 'locked' : ''}`}>
      <div className="upgrade-info">
        <div className="upgrade-name" style={{ color: getCategoryColor(upgrade.category) }}>
          {upgrade.name}
        </div>
        <div className="upgrade-description">{upgrade.description}</div>
      </div>

      {purchased ? (
        <div className="upgrade-purchased">✓</div>
      ) : (
        <button
          className={`upgrade-buy ${canAfford ? 'affordable' : ''}`}
          onClick={onBuy}
          disabled={!canAfford}
        >
          <span className="upgrade-cost-gold">{formatGold(upgrade.baseCost)}g</span>
          {manaCost > 0 && (
            <span className="upgrade-cost-mana">+ {manaCost}💧</span>
          )}
        </button>
      )}
    </div>
  );
}
