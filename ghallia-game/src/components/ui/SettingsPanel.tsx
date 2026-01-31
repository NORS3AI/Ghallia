/**
 * Settings Panel Component
 * Slide-up panel for game settings including reset and text size
 */

import React, { useState, useEffect } from 'react';
import { NumberNotation, getNumberNotation, setNumberNotation } from '../../utils/math';
import { useGame } from '../../store/gameStore';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TextSize = 'small' | 'medium' | 'large' | 'huge';

const NOTATION_OPTIONS: { value: NumberNotation; label: string; example: string }[] = [
  { value: 'standard', label: 'Standard', example: '1K, 1M, 1B, 1T' },
  { value: 'alphabet', label: 'Alphabet', example: '1a, 1b, 1c, 1d' },
  { value: 'scientific', label: 'Scientific', example: '1e3, 1e6, 1e9' },
];

const TEXT_SIZES: { value: TextSize; label: string; size: number }[] = [
  { value: 'small', label: 'Small', size: 10 },
  { value: 'medium', label: 'Medium', size: 12 },
  { value: 'large', label: 'Large', size: 14 },
  { value: 'huge', label: 'Huge', size: 16 },
];

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 32;

// Secret codes - rewards applied through game store
interface SecretCode {
  code: string;
  reward: { type: 'gold' | 'chaosPoints' | 'bonusTaps'; amount: number };
  description: string;
}

const SECRET_CODES: SecretCode[] = [
  { code: 'GHALLIA2026', reward: { type: 'gold', amount: 10000 }, description: '+10,000 Gold' },
  { code: 'CHAOSMASTER', reward: { type: 'chaosPoints', amount: 50 }, description: '+50 Chaos Points' },
  { code: 'TAPTAPTAP', reward: { type: 'bonusTaps', amount: 5 }, description: '+5 Bonus Taps' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { devAddGold, devAddChaosPoints, devAddBonusTaps } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('ghallia_text_size') as TextSize) || 'medium';
  });
  const [customOffset, setCustomOffset] = useState<number>(() => {
    const saved = localStorage.getItem('ghallia_font_offset');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [numberNotation, setNotation] = useState<NumberNotation>(() => getNumberNotation());

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ghallia_sound_enabled') !== 'false';
  });

  // Secret codes
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('ghallia_used_codes');
    return saved ? JSON.parse(saved) : [];
  });

  const handleNotationChange = (notation: NumberNotation) => {
    setNotation(notation);
    setNumberNotation(notation);
  };

  // Save sound setting
  useEffect(() => {
    localStorage.setItem('ghallia_sound_enabled', soundEnabled.toString());
  }, [soundEnabled]);

  // Save used codes
  useEffect(() => {
    localStorage.setItem('ghallia_used_codes', JSON.stringify(usedCodes));
  }, [usedCodes]);

  const handleSecretCode = () => {
    const code = secretCodeInput.toUpperCase().trim();
    setSecretCodeInput('');

    if (!code) {
      setCodeResult({ success: false, message: 'Please enter a code' });
      return;
    }

    // Check if code already used
    if (usedCodes.includes(code)) {
      setCodeResult({ success: false, message: 'Code already redeemed!' });
      return;
    }

    // Find matching code
    const secretCode = SECRET_CODES.find(c => c.code === code);
    if (!secretCode) {
      setCodeResult({ success: false, message: 'Invalid code' });
      return;
    }

    // Apply reward
    switch (secretCode.reward.type) {
      case 'gold':
        devAddGold(secretCode.reward.amount);
        break;
      case 'chaosPoints':
        devAddChaosPoints(secretCode.reward.amount);
        break;
      case 'bonusTaps':
        devAddBonusTaps(secretCode.reward.amount);
        break;
    }

    // Mark code as used
    setUsedCodes(prev => [...prev, code]);
    setCodeResult({ success: true, message: secretCode.description });

    // Clear result after 3 seconds
    setTimeout(() => setCodeResult(null), 3000);
  };

  // Calculate actual font size
  const getActualFontSize = () => {
    const sizeConfig = TEXT_SIZES.find(s => s.value === textSize);
    const baseSize = sizeConfig?.size || 12;
    return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, baseSize + customOffset));
  };

  // Apply text size to document
  useEffect(() => {
    const actualSize = getActualFontSize();
    document.documentElement.style.setProperty('--base-font-size', `${actualSize}px`);
    document.documentElement.style.fontSize = `${actualSize}px`;
    localStorage.setItem('ghallia_text_size', textSize);
    localStorage.setItem('ghallia_font_offset', customOffset.toString());
  }, [textSize, customOffset]);

  const handleIncreaseFont = () => {
    if (getActualFontSize() < MAX_FONT_SIZE) {
      setCustomOffset(prev => prev + 2);
    }
  };

  const handleDecreaseFont = () => {
    // Reset offset when decreasing
    if (customOffset > 0) {
      setCustomOffset(prev => Math.max(0, prev - 2));
    } else if (getActualFontSize() > MIN_FONT_SIZE) {
      setCustomOffset(prev => prev - 2);
    }
  };

  const handleResetFont = () => {
    setCustomOffset(0);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    // Clear save and reload
    localStorage.clear();
    window.location.reload();
  };

  const handleClose = () => {
    setConfirmReset(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`settings-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="settings-content">
          {/* Text Size Section */}
          <div className="settings-section">
            <h3>Text Size</h3>
            <div className="text-size-row">
              <button
                className="font-adjust-button"
                onClick={handleDecreaseFont}
                disabled={getActualFontSize() <= MIN_FONT_SIZE}
              >
                −
              </button>
              <div className="text-size-options">
                {TEXT_SIZES.map(size => (
                  <button
                    key={size.value}
                    className={`text-size-button ${textSize === size.value ? 'active' : ''}`}
                    onClick={() => { setTextSize(size.value); setCustomOffset(0); }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              <button
                className="font-adjust-button"
                onClick={handleIncreaseFont}
                disabled={getActualFontSize() >= MAX_FONT_SIZE}
              >
                +
              </button>
            </div>
            <div className="font-size-display">
              Current: {getActualFontSize()}px
              {customOffset !== 0 && (
                <button className="reset-font-button" onClick={handleResetFont}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Number Notation Section */}
          <div className="settings-section">
            <h3>Number Format</h3>
            <div className="notation-options">
              {NOTATION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={`notation-button ${numberNotation === option.value ? 'active' : ''}`}
                  onClick={() => handleNotationChange(option.value)}
                >
                  <span className="notation-label">{option.label}</span>
                  <span className="notation-example">{option.example}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Settings */}
          <div className="settings-section">
            <h3>Sound</h3>
            <div className="sound-toggle-row">
              <span className="sound-label">Sound Effects</span>
              <button
                className={`sound-toggle ${soundEnabled ? 'enabled' : ''}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-state">{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <p className="sound-note">
              Sound effects coming soon!
            </p>
          </div>

          {/* Secret Codes */}
          <div className="settings-section">
            <h3>Redeem Code</h3>
            <div className="secret-code-row">
              <input
                type="text"
                className="secret-code-input"
                value={secretCodeInput}
                onChange={(e) => setSecretCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSecretCode()}
                placeholder="Enter code..."
                maxLength={20}
              />
              <button className="secret-code-button" onClick={handleSecretCode}>
                Redeem
              </button>
            </div>
            {codeResult && (
              <p className={`code-result ${codeResult.success ? 'success' : 'error'}`}>
                {codeResult.success ? '✓ ' : '✗ '}{codeResult.message}
              </p>
            )}
          </div>

          {/* Reset Section */}
          <div className="settings-section danger">
            <h3>Danger Zone</h3>
            <p className="settings-warning">
              This will permanently delete all your progress. This cannot be undone.
            </p>
            <button
              className={`reset-button ${confirmReset ? 'confirm' : ''}`}
              onClick={handleReset}
            >
              {confirmReset ? 'Tap Again to Confirm' : 'Reset All Progress'}
            </button>
            {confirmReset && (
              <button
                className="cancel-button"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
