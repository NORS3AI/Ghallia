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

const TEXT_SIZES: { value: TextSize; label: string; size: string }[] = [
  { value: 'small', label: 'Small', size: '10px' },
  { value: 'medium', label: 'Medium', size: '12px' },
  { value: 'large', label: 'Large', size: '14px' },
  { value: 'huge', label: 'Huge', size: '16px' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('ghallia_text_size') as TextSize) || 'medium';
  });

  // Apply text size to document
  useEffect(() => {
    const sizeConfig = TEXT_SIZES.find(s => s.value === textSize);
    if (sizeConfig) {
      document.documentElement.style.setProperty('--base-font-size', sizeConfig.size);
      document.documentElement.style.fontSize = sizeConfig.size;
      localStorage.setItem('ghallia_text_size', textSize);
    }
  }, [textSize]);

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
            <div className="text-size-options">
              {TEXT_SIZES.map(size => (
                <button
                  key={size.value}
                  className={`text-size-button ${textSize === size.value ? 'active' : ''}`}
                  onClick={() => setTextSize(size.value)}
                >
                  {size.label}
                </button>
              ))}
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
