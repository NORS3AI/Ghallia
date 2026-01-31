/**
 * Ghallia - Main App Component
 * Medieval idle/active crafting game
 */

import React, { useState, useCallback, useMemo } from 'react';
import { SkillType, SkillCategory } from './types/game.types';
import { GameProvider, useGame, SKILL_DEFINITIONS, getUnlockCost } from './store/gameStore';
import { SkillTable } from './components/skills/SkillTable';
import { SkillDetail } from './components/skills/SkillDetail';
import { UnlockPanel } from './components/ui/UnlockPanel';
import { SettingsPanel } from './components/ui/SettingsPanel';
import { PrestigePanel } from './components/ui/PrestigePanel';
import { StatsPanel } from './components/ui/StatsPanel';
import { UpgradesPanel } from './components/ui/UpgradesPanel';
import { SpellsPanel } from './components/ui/SpellsPanel';
import { InventoryPanel } from './components/ui/InventoryPanel';
import { CharacterPanel } from './components/ui/CharacterPanel';
import { formatNumber, formatGold } from './utils/math';

// Error Boundary to catch and display errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#1a1410',
          color: '#e8dcc4',
          minHeight: '100vh',
          fontFamily: 'system-ui'
        }}>
          <h1 style={{ color: '#d4a853' }}>Something went wrong</h1>
          <pre style={{
            background: '#2a2218',
            padding: '10px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#d4a853',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Clear Save & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type View = 'skills' | 'detail';

type PanelType = 'none' | 'unlock' | 'settings' | 'prestige' | 'stats' | 'upgrades' | 'spells' | 'inventory' | 'character';

function GameApp() {
  const { state } = useGame();
  const [view, setView] = useState<View>('skills');
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>('none');

  // Helper to open a panel (closes any other open panel)
  const openPanel = useCallback((panel: PanelType) => {
    setActivePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel('none');
  }, []);

  // Get list of unlocked skills for swipe navigation
  const unlockedSkills = useMemo(() => {
    return SKILL_DEFINITIONS
      .filter(s => state.skills[s.id].unlocked)
      .map(s => s.id);
  }, [state.skills]);

  const handleSelectSkill = useCallback((skillType: SkillType) => {
    setSelectedSkill(skillType);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('skills');
    setSelectedSkill(null);
  }, []);

  const handleSwipeToNext = useCallback(() => {
    if (!selectedSkill) return;
    const currentIndex = unlockedSkills.indexOf(selectedSkill);
    if (currentIndex < unlockedSkills.length - 1) {
      setSelectedSkill(unlockedSkills[currentIndex + 1]);
    }
  }, [selectedSkill, unlockedSkills]);

  const handleSwipeToPrev = useCallback(() => {
    if (!selectedSkill) return;
    const currentIndex = unlockedSkills.indexOf(selectedSkill);
    if (currentIndex > 0) {
      setSelectedSkill(unlockedSkills[currentIndex - 1]);
    } else {
      handleBack();
    }
  }, [selectedSkill, unlockedSkills, handleBack]);

  // Count skills available to unlock
  const lockedCount = useMemo(() => {
    return SKILL_DEFINITIONS.filter(s => {
      if (s.category === SkillCategory.SUPPORT && state.prestigeCount < 1) return false;
      return !state.skills[s.id].unlocked;
    }).length;
  }, [state.skills, state.prestigeCount]);

  const nextUnlockCost = getUnlockCost(state.skillsUnlockedCount + 1);
  const canUnlock = state.gold >= nextUnlockCost && lockedCount > 0;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Ghallia</h1>
          <div className="header-currencies">
            {state.spellsUnlocked && (
              <div className="header-mana">
                <span>💧</span>
                <span>{Math.floor(state.mana)}</span>
              </div>
            )}
            <div className="header-gold">
              <span>💰</span>
              <span>{formatGold(state.gold)}g</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {view === 'skills' && (
          <SkillTable onSelectSkill={handleSelectSkill} />
        )}

        {view === 'detail' && selectedSkill && (
          <SkillDetail
            skillType={selectedSkill}
            onBack={handleBack}
            onSwipeToNext={handleSwipeToNext}
            onSwipeToPrev={handleSwipeToPrev}
          />
        )}
      </main>

      {/* Floating Unlock Button */}
      {lockedCount > 0 && (
        <button
          className="fab-unlock"
          onClick={() => openPanel('unlock')}
        >
          +
          {canUnlock && <span className="badge">!</span>}
        </button>
      )}

      {/* Unlock Panel */}
      <UnlockPanel
        isOpen={activePanel === 'unlock'}
        onClose={closePanel}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={activePanel === 'settings'}
        onClose={closePanel}
      />

      {/* Prestige Panel */}
      <PrestigePanel
        isOpen={activePanel === 'prestige'}
        onClose={closePanel}
      />

      {/* Stats Panel */}
      <StatsPanel
        isOpen={activePanel === 'stats'}
        onClose={closePanel}
      />

      {/* Upgrades Panel */}
      <UpgradesPanel
        isOpen={activePanel === 'upgrades'}
        onClose={closePanel}
      />

      {/* Spells Panel */}
      <SpellsPanel
        isOpen={activePanel === 'spells'}
        onClose={closePanel}
      />

      {/* Inventory Panel */}
      <InventoryPanel
        isOpen={activePanel === 'inventory'}
        onClose={closePanel}
      />

      {/* Character Panel */}
      <CharacterPanel
        isOpen={activePanel === 'character'}
        onClose={closePanel}
      />

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <button
            className={`nav-button ${view === 'skills' ? 'active' : ''}`}
            onClick={() => { setView('skills'); setSelectedSkill(null); closePanel(); }}
          >
            <span className="nav-icon">📜</span>
            <span>Skills</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('inventory')}>
            <span className="nav-icon">🎒</span>
            <span>Bag</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('character')}>
            <span className="nav-icon">🧙</span>
            <span>Char</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('stats')}>
            <span className="nav-icon">📖</span>
            <span>Stats</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('upgrades')}>
            <span className="nav-icon">⚔️</span>
            <span>Power</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('spells')}>
            <span className="nav-icon">🔮</span>
            <span>Magic</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('prestige')}>
            <span className="nav-icon">👑</span>
            <span>Prestige</span>
          </button>

          <button className="nav-button" onClick={() => openPanel('settings')}>
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameApp />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
