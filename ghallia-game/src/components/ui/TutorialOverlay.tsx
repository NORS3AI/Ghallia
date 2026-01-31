/**
 * Tutorial Overlay Component
 * Guides new players through the basics of the game
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/gameStore';
import './TutorialOverlay.css';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?: string; // CSS selector or description of what to highlight
  position: 'center' | 'top' | 'bottom';
  waitFor?: (state: any) => boolean; // Wait for condition before allowing next
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Ghallia!',
    content: 'A medieval crafting adventure awaits. Let me show you the basics!',
    position: 'center',
  },
  {
    id: 'logging',
    title: 'Gathering Resources',
    content: 'Tap on Logging to enter your first skill. Gathering skills require you to tap to collect resources.',
    highlight: 'skill-card',
    position: 'top',
  },
  {
    id: 'tap',
    title: 'Tap to Gather',
    content: 'Tap the tree icon to chop wood! Each tap gives you resources and experience. Try it now!',
    highlight: 'tap-area',
    position: 'top',
    waitFor: (state) => state.stats.totalTaps >= 5,
  },
  {
    id: 'resources',
    title: 'Collecting Resources',
    content: 'Great job! You gathered some wood. Resources can be sold for gold or used in crafting.',
    position: 'center',
  },
  {
    id: 'sell',
    title: 'Earning Gold',
    content: 'Tap the "Sell" button to sell your resources for gold. Gold is used to unlock new skills and buy upgrades.',
    highlight: 'sell-button',
    position: 'top',
    waitFor: (state) => state.stats.totalGoldEarned >= 0.01,
  },
  {
    id: 'levelup',
    title: 'Leveling Up',
    content: 'As you gather, you earn XP and level up. Higher levels unlock new resource tiers and give bonus resources!',
    position: 'center',
  },
  {
    id: 'unlock',
    title: 'Unlocking Skills',
    content: 'Save up gold to unlock more skills! The "+" button shows available skills. Your next unlock: Sawmill!',
    highlight: 'fab-unlock',
    position: 'bottom',
  },
  {
    id: 'crafting',
    title: 'Crafting Skills',
    content: 'Crafting skills like Sawmill are idle - queue items and they craft automatically over time!',
    position: 'center',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    content: 'Use the bottom bar to access Stats, Upgrades, and more features as you unlock them.',
    highlight: 'bottom-nav',
    position: 'top',
  },
  {
    id: 'goal',
    title: 'Your Goal',
    content: 'Level up 5 skills to 99 to Prestige and earn Chaos Points for permanent upgrades. Good luck!',
    position: 'center',
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const { state } = useGame();
  const [currentStep, setCurrentStep] = useState(0);
  const [canProceed, setCanProceed] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];

  // Check if current step has a wait condition
  useEffect(() => {
    if (step?.waitFor) {
      setCanProceed(step.waitFor(state));
    } else {
      setCanProceed(true);
    }
  }, [step, state]);

  const handleNext = () => {
    if (!canProceed) return;

    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="tutorial-overlay">
      {/* Semi-transparent backdrop */}
      <div className="tutorial-backdrop" />

      {/* Tutorial card */}
      <div className={`tutorial-card position-${step.position}`}>
        <div className="tutorial-progress">
          <div
            className="tutorial-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="tutorial-step-indicator">
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>

        <h2 className="tutorial-title">{step.title}</h2>
        <p className="tutorial-content">{step.content}</p>

        {step.waitFor && !canProceed && (
          <div className="tutorial-waiting">
            <span className="waiting-dot" />
            <span>Complete the action to continue...</span>
          </div>
        )}

        <div className="tutorial-actions">
          <button className="tutorial-skip" onClick={handleSkip}>
            Skip Tutorial
          </button>
          <button
            className={`tutorial-next ${!canProceed ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!canProceed}
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Playing!' : 'Next'}
          </button>
        </div>
      </div>

      {/* Highlight indicator */}
      {step.highlight && (
        <div className="tutorial-highlight-hint">
          Look for the highlighted area
        </div>
      )}
    </div>
  );
}

// Hook to manage tutorial state
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialComplete, setTutorialComplete] = useState(() => {
    return localStorage.getItem('ghallia_tutorial_complete') === 'true';
  });

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setTutorialComplete(true);
    localStorage.setItem('ghallia_tutorial_complete', 'true');
  };

  const resetTutorial = () => {
    localStorage.removeItem('ghallia_tutorial_complete');
    setTutorialComplete(false);
  };

  return {
    showTutorial,
    tutorialComplete,
    startTutorial,
    completeTutorial,
    resetTutorial,
  };
}
