/**
 * Inventory Panel Component
 * Shows all resources and equipment in player's inventory
 */

import React, { useState, useMemo } from 'react';
import { useGame, getResourceName, SKILL_DEFINITIONS } from '../../store/gameStore';
import { SkillType, Equipment, Rarity } from '../../types/game.types';
import { RARITY_DATA, MATERIAL_DATA } from '../../data/items';
import { formatGold } from '../../utils/math';
import './InventoryPanel.css';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'resources' | 'equipment';

export function InventoryPanel({ isOpen, onClose }: InventoryPanelProps) {
  const { state, sellResource, sellEquipment, sellAllResources } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('resources');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Group resources by skill type
  const groupedResources = useMemo(() => {
    const groups: Record<string, { id: string; name: string; quantity: number; value: number }[]> = {};

    Object.entries(state.resources).forEach(([resourceId, quantity]) => {
      if (quantity <= 0) return;

      // Parse resourceId format: skillType_tTier
      const match = resourceId.match(/^(.+)_t(\d+)$/);
      if (!match) return;

      const [, skillType, tierStr] = match;
      const tier = parseInt(tierStr);
      const name = getResourceName(skillType as SkillType, tier);
      const value = 0.1 * Math.pow(1.5, tier - 1); // Match BALANCE values

      if (!groups[skillType]) {
        groups[skillType] = [];
      }
      groups[skillType].push({ id: resourceId, name, quantity, value });
    });

    return groups;
  }, [state.resources]);

  const totalResourceValue = useMemo(() => {
    let total = 0;
    Object.values(groupedResources).forEach(resources => {
      resources.forEach(r => {
        total += r.quantity * r.value;
      });
    });
    return total;
  }, [groupedResources]);

  const getSkillIcon = (skillType: string) => {
    const skill = SKILL_DEFINITIONS.find(s => s.id === skillType);
    return skill?.icon || '?';
  };

  const getSkillName = (skillType: string) => {
    const skill = SKILL_DEFINITIONS.find(s => s.id === skillType);
    return skill?.name || skillType;
  };

  const getRarityColor = (rarity: Rarity) => {
    return RARITY_DATA[rarity]?.color || '#ffffff';
  };

  return (
    <>
      <div className={`inventory-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`inventory-panel ${isOpen ? 'open' : ''}`}>
        <div className="inventory-header">
          <h2>Inventory</h2>
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}/{state.maxMana} (+{state.manaRegen.toFixed(1)}/s)</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="inventory-close" onClick={onClose}>&times;</button>
        </div>

        {/* Tab Buttons */}
        <div className="inventory-tabs">
          <button
            className={`inventory-tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button
            className={`inventory-tab ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment ({state.equipmentInventory.length})
          </button>
        </div>

        <div className="inventory-content">
          {activeTab === 'resources' && (
            <div className="resources-tab">
              {/* Sell All Button */}
              {Object.keys(groupedResources).length > 0 && (
                <div className="sell-all-section">
                  <button className="sell-all-button" onClick={sellAllResources}>
                    Sell All Resources ({formatGold(totalResourceValue)}g)
                  </button>
                </div>
              )}

              {/* Resource List */}
              {Object.entries(groupedResources).length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>No resources yet!</p>
                  <p className="empty-hint">Gather resources by tapping on skills.</p>
                </div>
              ) : (
                Object.entries(groupedResources).map(([skillType, resources]) => (
                  <div key={skillType} className="resource-group">
                    <div className="resource-group-header">
                      <span className="group-icon">{getSkillIcon(skillType)}</span>
                      <span className="group-name">{getSkillName(skillType)}</span>
                    </div>
                    <div className="resource-list">
                      {resources.map(resource => (
                        <div
                          key={resource.id}
                          className={`resource-row ${selectedResource === resource.id ? 'selected' : ''}`}
                          onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                        >
                          <div className="resource-info">
                            <span className="resource-name">{resource.name}</span>
                            <span className="resource-quantity">x{resource.quantity}</span>
                          </div>
                          <div className="resource-value">
                            {formatGold(resource.quantity * resource.value)}g
                          </div>
                          {selectedResource === resource.id && (
                            <button
                              className="sell-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sellResource(resource.id, resource.quantity);
                                setSelectedResource(null);
                              }}
                            >
                              Sell All
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="equipment-tab">
              {state.equipmentInventory.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🎒</span>
                  <p>No equipment yet!</p>
                  <p className="empty-hint">Find equipment while foraging or craft it.</p>
                </div>
              ) : (
                <div className="equipment-list">
                  {state.equipmentInventory.map((item) => (
                    <div key={item.id} className="equipment-row">
                      <div className="equipment-icon">{item.icon}</div>
                      <div className="equipment-info">
                        <span
                          className="equipment-name"
                          style={{ color: getRarityColor(item.rarity) }}
                        >
                          {item.name}
                        </span>
                        <span className="equipment-slot">{item.slot}</span>
                        <div className="equipment-stats">
                          {item.stats.strength > 0 && <span className="stat str">+{item.stats.strength} STR</span>}
                          {item.stats.intellect > 0 && <span className="stat int">+{item.stats.intellect} INT</span>}
                          {item.stats.agility > 0 && <span className="stat agi">+{item.stats.agility} AGI</span>}
                          {item.stats.stamina > 0 && <span className="stat sta">+{item.stats.stamina} STA</span>}
                        </div>
                      </div>
                      <div className="equipment-actions">
                        <span className="equipment-value">{formatGold(item.sellValue)}g</span>
                        <button
                          className="sell-button small"
                          onClick={() => sellEquipment(item.id)}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
