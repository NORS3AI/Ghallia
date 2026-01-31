/**
 * Upgrades Panel Component
 * Shows purchasable upgrades for tap power, crit, luck, mana, and gold
 */

import React, { useMemo, useState } from 'react';
import { useGame, UPGRADES, UpgradeDef } from '../../store/gameStore';
import { formatGold } from '../../utils/math';
import './UpgradesPanel.css';

interface UpgradesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryFilter = 'all' | 'tap' | 'crit' | 'luck' | 'mana' | 'gold';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  tap: 'Tap Power',
  crit: 'Critical',
  luck: 'Luck',
  mana: 'Mana',
  gold: 'Gold',
};

const CATEGORY_ICONS: Record<CategoryFilter, string> = {
  all: '📋',
  tap: '👆',
  crit: '💥',
  luck: '🍀',
  mana: '💧',
  gold: '💰',
};

export function UpgradesPanel({ isOpen, onClose }: UpgradesPanelProps) {
  const { state, buyUpgrade } = useGame();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredUpgrades = useMemo(() => {
    if (filter === 'all') return UPGRADES;
    return UPGRADES.filter(u => u.category === filter);
  }, [filter]);

  const sortedUpgrades = useMemo(() => {
    return [...filteredUpgrades].sort((a, b) => a.baseCost - b.baseCost);
  }, [filteredUpgrades]);

  const upgradeStats = useMemo(() => {
    const total = UPGRADES.length;
    const purchased = Object.keys(state.upgrades).length;
    return { total, purchased };
  }, [state.upgrades]);

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
          <span className="upgrade-count">{upgradeStats.purchased}/{upgradeStats.total}</span>
          <button className="upgrades-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Category Filter */}
        <div className="upgrades-filters">
          {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map(cat => (
            <button
              key={cat}
              className={`filter-button ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              <span className="filter-icon">{CATEGORY_ICONS[cat]}</span>
              <span className="filter-label">{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
        </div>

        {/* Upgrades List */}
        <div className="upgrades-content">
          <div className="upgrades-list">
            {sortedUpgrades.map(upgrade => (
              <UpgradeItem
                key={upgrade.id}
                upgrade={upgrade}
                purchased={!!state.upgrades[upgrade.id]}
                canAfford={state.gold >= upgrade.baseCost}
                onBuy={() => buyUpgrade(upgrade.id)}
              />
            ))}
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
  onBuy: () => void;
}

function UpgradeItem({ upgrade, purchased, canAfford, onBuy }: UpgradeItemProps) {
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
          {formatGold(upgrade.baseCost)}g
        </button>
      )}
    </div>
  );
}
