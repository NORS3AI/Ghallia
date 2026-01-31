/**
 * Settings Panel Component
 * Slide-up panel for game settings including reset, text size, and account/cloud sync
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NumberNotation, getNumberNotation, setNumberNotation } from '../../utils/math';
import { useGame } from '../../store/gameStore';
import { useAuth } from '../../contexts/AuthContext';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TextSize = 'small' | 'medium' | 'large' | 'huge';
type SettingsTab = 'general' | 'account';

const NOTATION_OPTIONS: { value: NumberNotation; label: string; example: string }[] = [
  { value: 'standard', label: 'Standard', example: '1K, 1M, 1B, 1T' },
  { value: 'alphabet', label: 'Alphabet', example: '1a, 1b, 1c, 1d' },
  { value: 'scientific', label: 'Scientific', example: '1e3, 1e6, 1e9' },
];

const TEXT_SIZES: { value: TextSize; label: string; size: number }[] = [
  { value: 'small', label: 'S', size: 10 },
  { value: 'medium', label: 'M', size: 12 },
  { value: 'large', label: 'L', size: 14 },
  { value: 'huge', label: 'XL', size: 16 },
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
  { code: 'INFINITY2026', reward: { type: 'gold', amount: 10000 }, description: '+10,000 Gold' },
  { code: 'CHAOSMASTER', reward: { type: 'chaosPoints', amount: 50 }, description: '+50 Chaos Points' },
  { code: 'TAPTAPTAP', reward: { type: 'bonusTaps', amount: 5 }, description: '+5 Bonus Taps' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { devAddGold, devAddChaosPoints, devAddBonusTaps, state, loadCloudSave } = useGame();
  const { user, isAuthenticated, serverOnline, error, login, register, logout, clearError, syncToCloud, loadFromCloud, getCloudSaveInfo } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [confirmReset, setConfirmReset] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('infinity_text_size') as TextSize) || 'medium';
  });
  const [customOffset, setCustomOffset] = useState<number>(() => {
    const saved = localStorage.getItem('infinity_font_offset');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [numberNotation, setNotation] = useState<NumberNotation>(() => getNumberNotation());

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('infinity_sound_enabled') !== 'false';
  });

  // Secret codes
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('infinity_used_codes');
    return saved ? JSON.parse(saved) : [];
  });

  // Account state
  const [authFormMode, setAuthFormMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudSaveInfo, setCloudSaveInfo] = useState<{ hasSave: boolean; savedAt?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Load cloud save info
  const loadCloudInfo = useCallback(async () => {
    const info = await getCloudSaveInfo();
    setCloudSaveInfo(info);
  }, [getCloudSaveInfo]);

  // Load cloud info when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCloudInfo();
    }
  }, [isAuthenticated, loadCloudInfo]);

  // Clear form when closing
  const clearForm = useCallback(() => {
    setLocalError(null);
    clearError();
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [clearError]);

  useEffect(() => {
    if (!isOpen) {
      clearForm();
      setConfirmReset(false);
    }
  }, [isOpen, clearForm]);

  const handleNotationChange = (notation: NumberNotation) => {
    setNotation(notation);
    setNumberNotation(notation);
  };

  // Save sound setting
  useEffect(() => {
    localStorage.setItem('infinity_sound_enabled', soundEnabled.toString());
  }, [soundEnabled]);

  // Save used codes
  useEffect(() => {
    localStorage.setItem('infinity_used_codes', JSON.stringify(usedCodes));
  }, [usedCodes]);

  const handleSecretCode = () => {
    const code = secretCodeInput.toUpperCase().trim();
    setSecretCodeInput('');

    if (!code) {
      setCodeResult({ success: false, message: 'Please enter a code' });
      return;
    }

    if (usedCodes.includes(code)) {
      setCodeResult({ success: false, message: 'Code already redeemed!' });
      return;
    }

    const secretCode = SECRET_CODES.find(c => c.code === code);
    if (!secretCode) {
      setCodeResult({ success: false, message: 'Invalid code' });
      return;
    }

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

    setUsedCodes(prev => [...prev, code]);
    setCodeResult({ success: true, message: secretCode.description });
    setTimeout(() => setCodeResult(null), 3000);
  };

  const getActualFontSize = useCallback(() => {
    const sizeConfig = TEXT_SIZES.find(s => s.value === textSize);
    const baseSize = sizeConfig?.size || 12;
    return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, baseSize + customOffset));
  }, [textSize, customOffset]);

  useEffect(() => {
    const actualSize = getActualFontSize();
    document.documentElement.style.setProperty('--base-font-size', `${actualSize}px`);
    document.documentElement.style.fontSize = `${actualSize}px`;
    localStorage.setItem('infinity_text_size', textSize);
    localStorage.setItem('infinity_font_offset', customOffset.toString());
  }, [textSize, customOffset, getActualFontSize]);

  const handleIncreaseFont = () => {
    if (getActualFontSize() < MAX_FONT_SIZE) {
      setCustomOffset(prev => prev + 2);
    }
  };

  const handleDecreaseFont = () => {
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
    localStorage.clear();
    window.location.reload();
  };

  const handleClose = () => {
    setConfirmReset(false);
    onClose();
  };

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username || !password) {
      setLocalError('Please enter username and password');
      return;
    }

    setIsSubmitting(true);
    const success = await login(username, password);
    setIsSubmitting(false);

    if (success) {
      clearForm();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    const success = await register(username, email, password);
    setIsSubmitting(false);

    if (success) {
      clearForm();
    }
  };

  const handleSyncToCloud = async () => {
    setSyncStatus('syncing');
    const success = await syncToCloud(state);
    if (success) {
      setSyncStatus('success');
      loadCloudInfo();
    } else {
      setSyncStatus('error');
    }
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const handleLoadFromCloud = async () => {
    setSyncStatus('syncing');
    const cloudState = await loadFromCloud();
    if (cloudState) {
      loadCloudSave(cloudState);
      setSyncStatus('success');
    } else {
      setSyncStatus('error');
    }
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const handleLogout = () => {
    logout();
    setAuthFormMode('login');
  };

  const displayError = localError || error;

  return (
    <>
      <div
        className={`settings-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
      />

      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ General
          </button>
          <button
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            👤 Account
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <>
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
                <p className="sound-note">Sound effects coming soon!</p>
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
                    Go
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
                  This will permanently delete all your progress.
                </p>
                <button
                  className={`reset-button ${confirmReset ? 'confirm' : ''}`}
                  onClick={handleReset}
                >
                  {confirmReset ? 'Tap Again to Confirm' : 'Reset All Progress'}
                </button>
                {confirmReset && (
                  <button className="cancel-button" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <>
              {/* Server Status */}
              <div className={`server-status-bar ${serverOnline ? 'online' : 'offline'}`}>
                <span className="status-dot" />
                <span>{serverOnline ? 'Server Online' : 'Server Offline'}</span>
              </div>

              {!serverOnline && (
                <div className="server-offline-warning">
                  Cloud features unavailable. Your progress is saved locally.
                </div>
              )}

              {/* Login Form */}
              {!isAuthenticated && authFormMode === 'login' && (
                <form onSubmit={handleLogin} className="auth-form">
                  {displayError && <div className="auth-error">{displayError}</div>}

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      disabled={!serverOnline || isSubmitting}
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      disabled={!serverOnline || isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-button primary"
                    disabled={!serverOnline || isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>

                  <div className="auth-switch">
                    No account?{' '}
                    <button type="button" onClick={() => setAuthFormMode('register')}>
                      Register
                    </button>
                  </div>
                </form>
              )}

              {/* Register Form */}
              {!isAuthenticated && authFormMode === 'register' && (
                <form onSubmit={handleRegister} className="auth-form">
                  {displayError && <div className="auth-error">{displayError}</div>}

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose username"
                      disabled={!serverOnline || isSubmitting}
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      disabled={!serverOnline || isSubmitting}
                      autoCapitalize="none"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      disabled={!serverOnline || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      disabled={!serverOnline || isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-button primary"
                    disabled={!serverOnline || isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </button>

                  <div className="auth-switch">
                    Have an account?{' '}
                    <button type="button" onClick={() => setAuthFormMode('login')}>
                      Login
                    </button>
                  </div>
                </form>
              )}

              {/* Account Info (when logged in) */}
              {isAuthenticated && user && (
                <div className="account-info">
                  <div className="user-card">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>

                  {/* Cloud Sync Section */}
                  <div className="cloud-sync-section">
                    <h3>☁️ Cloud Save</h3>
                    <div className="cloud-save-info">
                      <span className="cloud-icon">💾</span>
                      <span>
                        {cloudSaveInfo?.hasSave
                          ? `Last saved: ${new Date(cloudSaveInfo.savedAt!).toLocaleDateString()}`
                          : 'No cloud save found'}
                      </span>
                    </div>

                    <div className="sync-buttons">
                      <button
                        className="sync-button upload"
                        onClick={handleSyncToCloud}
                        disabled={syncStatus === 'syncing'}
                      >
                        ⬆️ Upload
                      </button>
                      <button
                        className="sync-button download"
                        onClick={handleLoadFromCloud}
                        disabled={syncStatus === 'syncing' || !cloudSaveInfo?.hasSave}
                      >
                        ⬇️ Download
                      </button>
                    </div>

                    {syncStatus !== 'idle' && (
                      <div className={`sync-status ${syncStatus}`}>
                        {syncStatus === 'syncing' && 'Syncing...'}
                        {syncStatus === 'success' && '✓ Sync complete!'}
                        {syncStatus === 'error' && '✗ Sync failed'}
                      </div>
                    )}
                  </div>

                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
