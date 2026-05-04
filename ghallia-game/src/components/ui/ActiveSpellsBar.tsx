/**
 * Active Spells Bar Component
 * Shows active spells with remaining time on the left side
 */

import React, { useState, useEffect } from 'react';
import { useGame, SPELLS } from '../../store/gameStore';
import './ActiveSpellsBar.css';

export function ActiveSpellsBar() {
  const { state } = useGame();
  const [now, setNow] = useState(Date.now());

  // Update every 100ms for smooth countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Get active spells
  const activeSpells = SPELLS.filter(spell => {
    const spellState = state.spells[spell.id];
    return spellState && spellState.activeUntil > now;
  }).map(spell => {
    const spellState = state.spells[spell.id];
    const remaining = Math.max(0, spellState.activeUntil - now);
    return {
      ...spell,
      remaining,
    };
  });

  if (activeSpells.length === 0) return null;

  return (
    <div className="active-spells-bar">
      {activeSpells.map(spell => {
        const seconds = Math.ceil(spell.remaining / 1000);
        const progress = spell.remaining / (spell.duration * 1000);

        return (
          <div key={spell.id} className="active-spell-item">
            <div
              className="spell-progress-bg"
              style={{ '--progress': progress } as React.CSSProperties}
            />
            <span className="spell-icon">{spell.icon}</span>
            <div className="spell-info">
              <span className="spell-name">{spell.name}</span>
              <span className="spell-time">{seconds}s</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
