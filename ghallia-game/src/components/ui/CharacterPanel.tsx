/**
 * Character Panel Component
 * Shows character equipment slots and stats
 */

import React, { useState } from 'react';
import { useGame } from '../../store/gameStore';
import { EquipmentSlot, Equipment, Rarity } from '../../types/game.types';
import { RARITY_DATA } from '../../data/items';
import { formatGold } from '../../utils/math';
import './CharacterPanel.css';

interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLOT_CONFIG: { slot: EquipmentSlot; icon: string; label: string }[] = [
  { slot: EquipmentSlot.HEAD, icon: '🪖', label: 'Head' },
  { slot: EquipmentSlot.SHOULDERS, icon: '🦺', label: 'Shoulders' },
  { slot: EquipmentSlot.CHEST, icon: '👕', label: 'Chest' },
  { slot: EquipmentSlot.BACK, icon: '🧥', label: 'Back' },
  { slot: EquipmentSlot.BRACERS, icon: '🦾', label: 'Bracers' },
  { slot: EquipmentSlot.GLOVES, icon: '🧤', label: 'Gloves' },
  { slot: EquipmentSlot.PANTS, icon: '👖', label: 'Pants' },
  { slot: EquipmentSlot.BOOTS, icon: '👢', label: 'Boots' },
  { slot: EquipmentSlot.MAIN_HAND, icon: '⚔️', label: 'Main Hand' },
  { slot: EquipmentSlot.OFF_HAND, icon: '🛡️', label: 'Off Hand' },
  { slot: EquipmentSlot.RING_1, icon: '💍', label: 'Ring 1' },
  { slot: EquipmentSlot.RING_2, icon: '💍', label: 'Ring 2' },
  { slot: EquipmentSlot.NECKLACE, icon: '📿', label: 'Necklace' },
  { slot: EquipmentSlot.TRINKET, icon: '🎰', label: 'Trinket' },
];

export function CharacterPanel({ isOpen, onClose }: CharacterPanelProps) {
  const { state, equipItem, unequipItem } = useGame();
  const { character, equipmentInventory } = state;
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  const getRarityColor = (rarity: Rarity) => {
    return RARITY_DATA[rarity]?.color || '#ffffff';
  };

  // Get items that can be equipped in the selected slot
  const availableItems = selectedSlot
    ? equipmentInventory.filter(item => item.slot === selectedSlot)
    : [];

  const handleSlotClick = (slot: EquipmentSlot) => {
    if (selectedSlot === slot) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    unequipItem(slot);
    setSelectedSlot(null);
  };

  const handleEquip = (equipmentId: string) => {
    equipItem(equipmentId);
    setSelectedSlot(null);
  };

  return (
    <>
      <div className={`character-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`character-panel ${isOpen ? 'open' : ''}`}>
        <div className="character-header">
          <h2>Character</h2>
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="character-close" onClick={onClose}>&times;</button>
        </div>

        <div className="character-content">
          {/* Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{character.currentHp}/{character.maxHp}</span>
              <span className="stat-label">HP</span>
            </div>
            <div className="stat-card str">
              <span className="stat-icon">💪</span>
              <span className="stat-value">{character.totalStrength}</span>
              <span className="stat-label">STR</span>
            </div>
            <div className="stat-card int">
              <span className="stat-icon">🧠</span>
              <span className="stat-value">{character.totalIntellect}</span>
              <span className="stat-label">INT</span>
            </div>
            <div className="stat-card agi">
              <span className="stat-icon">🏃</span>
              <span className="stat-value">{character.totalAgility}</span>
              <span className="stat-label">AGI</span>
            </div>
            <div className="stat-card sta">
              <span className="stat-icon">🛡️</span>
              <span className="stat-value">{character.totalStamina}</span>
              <span className="stat-label">STA</span>
            </div>
          </div>

          {/* Stat Effects */}
          <div className="stat-effects">
            <div className="effect">
              <span>Tap Bonus:</span>
              <span className="effect-value">+{Math.floor(character.totalStrength * 1)}%</span>
            </div>
            <div className="effect">
              <span>Mana Regen:</span>
              <span className="effect-value">+{Math.floor(character.totalIntellect * 2)}%</span>
            </div>
            <div className="effect">
              <span>Luck:</span>
              <span className="effect-value">+{(character.totalAgility * 0.5).toFixed(1)}%</span>
            </div>
            <div className="effect">
              <span>Dodge:</span>
              <span className="effect-value">+{(character.totalAgility * 0.25).toFixed(1)}%</span>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="equipment-grid">
            <h3>Equipment</h3>
            <div className="slots-grid">
              {SLOT_CONFIG.map(({ slot, icon, label }) => {
                const equipped = character.equipment[slot];
                const isSelected = selectedSlot === slot;

                return (
                  <div
                    key={slot}
                    className={`equip-slot ${equipped ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {equipped ? (
                      <>
                        <span className="slot-item-icon">{equipped.icon}</span>
                        <span
                          className="slot-item-name"
                          style={{ color: getRarityColor(equipped.rarity) }}
                        >
                          {equipped.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="slot-icon">{icon}</span>
                        <span className="slot-label">{label}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Slot Actions */}
          {selectedSlot && (
            <div className="slot-actions">
              <div className="slot-actions-header">
                <h4>{SLOT_CONFIG.find(s => s.slot === selectedSlot)?.label}</h4>
                <button className="close-actions" onClick={() => setSelectedSlot(null)}>&times;</button>
              </div>

              {character.equipment[selectedSlot] && (
                <div className="equipped-item">
                  <p className="action-label">Currently Equipped:</p>
                  <div className="item-preview">
                    <span className="item-icon">{character.equipment[selectedSlot]!.icon}</span>
                    <div className="item-details">
                      <span
                        className="item-name"
                        style={{ color: getRarityColor(character.equipment[selectedSlot]!.rarity) }}
                      >
                        {character.equipment[selectedSlot]!.name}
                      </span>
                      <div className="item-stats">
                        {character.equipment[selectedSlot]!.stats.strength > 0 &&
                          <span className="stat str">+{character.equipment[selectedSlot]!.stats.strength} STR</span>}
                        {character.equipment[selectedSlot]!.stats.intellect > 0 &&
                          <span className="stat int">+{character.equipment[selectedSlot]!.stats.intellect} INT</span>}
                        {character.equipment[selectedSlot]!.stats.agility > 0 &&
                          <span className="stat agi">+{character.equipment[selectedSlot]!.stats.agility} AGI</span>}
                        {character.equipment[selectedSlot]!.stats.stamina > 0 &&
                          <span className="stat sta">+{character.equipment[selectedSlot]!.stats.stamina} STA</span>}
                      </div>
                    </div>
                    <button
                      className="unequip-button"
                      onClick={() => handleUnequip(selectedSlot)}
                    >
                      Unequip
                    </button>
                  </div>
                </div>
              )}

              {availableItems.length > 0 && (
                <div className="available-items">
                  <p className="action-label">Available to Equip:</p>
                  {availableItems.map(item => (
                    <div key={item.id} className="item-preview">
                      <span className="item-icon">{item.icon}</span>
                      <div className="item-details">
                        <span
                          className="item-name"
                          style={{ color: getRarityColor(item.rarity) }}
                        >
                          {item.name}
                        </span>
                        <div className="item-stats">
                          {item.stats.strength > 0 && <span className="stat str">+{item.stats.strength} STR</span>}
                          {item.stats.intellect > 0 && <span className="stat int">+{item.stats.intellect} INT</span>}
                          {item.stats.agility > 0 && <span className="stat agi">+{item.stats.agility} AGI</span>}
                          {item.stats.stamina > 0 && <span className="stat sta">+{item.stats.stamina} STA</span>}
                        </div>
                      </div>
                      <button
                        className="equip-button"
                        onClick={() => handleEquip(item.id)}
                      >
                        Equip
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {availableItems.length === 0 && !character.equipment[selectedSlot] && (
                <p className="no-items">No items available for this slot.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
