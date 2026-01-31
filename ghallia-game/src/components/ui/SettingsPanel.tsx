/**
 * Settings Panel Component
 * Slide-up panel for game settings including reset and text size
 */

import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TextSize = 'small' | 'medium' | 'large' | 'huge';

const TEXT_SIZES: { value: TextSize; label: string; size: number }[] = [
  { value: 'small', label: 'Small', size: 10 },
  { value: 'medium', label: 'Medium', size: 12 },
  { value: 'large', label: 'Large', size: 14 },
  { value: 'huge', label: 'Huge', size: 16 },
];

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 32;

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('ghallia_text_size') as TextSize) || 'medium';
  });
  const [customOffset, setCustomOffset] = useState<number>(() => {
    const saved = localStorage.getItem('ghallia_font_offset');
    return saved ? parseInt(saved, 10) : 0;
  });

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
