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
import { formatNumber } from './utils/math';

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

function GameApp() {
  const { state, sellAllResources } = useGame();
  const [view, setView] = useState<View>('skills');
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null);
  const [unlockPanelOpen, setUnlockPanelOpen] = useState(false);

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
          <div className="header-gold">
            <span>💰</span>
            <span>{formatNumber(state.gold)}g</span>
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
          onClick={() => setUnlockPanelOpen(true)}
        >
          +
          {canUnlock && <span className="badge">!</span>}
        </button>
      )}

      {/* Unlock Panel */}
      <UnlockPanel
        isOpen={unlockPanelOpen}
        onClose={() => setUnlockPanelOpen(false)}
      />

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <button
            className={`nav-button ${view === 'skills' ? 'active' : ''}`}
            onClick={() => { setView('skills'); setSelectedSkill(null); }}
          >
            <span className="nav-icon">📜</span>
            <span>Skills</span>
          </button>

          <button className="nav-button" onClick={sellAllResources}>
            <span className="nav-icon">💰</span>
            <span>Sell All</span>
          </button>

          <button className="nav-button">
            <span className="nav-icon">🏆</span>
            <span>Prestige</span>
          </button>

          <button className="nav-button">
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
