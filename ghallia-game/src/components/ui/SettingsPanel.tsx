/**
 * Settings Panel Component
 * Slide-up panel for game settings including reset
 */

import React, { useState } from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);

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
          {/* Reset Section */}
          <div className="settings-section">
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
