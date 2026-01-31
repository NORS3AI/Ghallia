/**
 * Account Panel Component
 * Handles login, registration, and cloud save sync
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../store/gameStore';
import './AccountPanel.css';

interface AccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'login' | 'register' | 'account';

export function AccountPanel({ isOpen, onClose }: AccountPanelProps) {
  const { user, isAuthenticated, serverOnline, error, login, register, logout, clearError, syncToCloud, loadFromCloud, getCloudSaveInfo } = useAuth();
  const { state, loadCloudSave } = useGame();

  const [viewMode, setViewMode] = useState<ViewMode>(isAuthenticated ? 'account' : 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudSaveInfo, setCloudSaveInfo] = useState<{ hasSave: boolean; savedAt?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Update view mode when auth state changes
  useEffect(() => {
    setViewMode(isAuthenticated ? 'account' : 'login');
    if (isAuthenticated) {
      loadCloudInfo();
    }
  }, [isAuthenticated]);

  // Clear errors when closing
  useEffect(() => {
    if (!isOpen) {
      setLocalError(null);
      clearError();
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, clearError]);

  const loadCloudInfo = async () => {
    const info = await getCloudSaveInfo();
    setCloudSaveInfo(info);
  };

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
      setUsername('');
      setPassword('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username || !email || !password) {
      setLocalError('All fields are required');
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
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSyncToCloud = async () => {
    setSyncStatus('syncing');
    const success = await syncToCloud(state);
    setSyncStatus(success ? 'success' : 'error');
    if (success) {
      await loadCloudInfo();
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
    setViewMode('login');
  };

  const displayError = localError || error;

  return (
    <>
      <div
        className={`account-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`account-panel ${isOpen ? 'open' : ''}`}>
        <div className="account-header">
          <h2>{viewMode === 'account' ? 'Account' : viewMode === 'login' ? 'Login' : 'Register'}</h2>
          <div className={`server-status ${serverOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {serverOnline ? 'Online' : 'Offline'}
          </div>
          <button className="account-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="account-content">
          {!serverOnline && (
            <div className="server-offline-warning">
              Server is offline. Cloud features unavailable.
            </div>
          )}

          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username or Email</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  disabled={!serverOnline || isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={!serverOnline || isSubmitting}
                />
              </div>

              {displayError && (
                <div className="auth-error">{displayError}</div>
              )}

              <button
                type="submit"
                className="auth-button primary"
                disabled={!serverOnline || isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <div className="auth-switch">
                Don't have an account?{' '}
                <button type="button" onClick={() => setViewMode('register')}>
                  Register
                </button>
              </div>
            </form>
          )}

          {viewMode === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  disabled={!serverOnline || isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!serverOnline || isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (8+ chars)"
                  disabled={!serverOnline || isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  disabled={!serverOnline || isSubmitting}
                />
              </div>

              {displayError && (
                <div className="auth-error">{displayError}</div>
              )}

              <button
                type="submit"
                className="auth-button primary"
                disabled={!serverOnline || isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="auth-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => setViewMode('login')}>
                  Login
                </button>
              </div>
            </form>
          )}

          {viewMode === 'account' && user && (
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

              <div className="cloud-sync-section">
                <h3>Cloud Save</h3>

                {cloudSaveInfo?.hasSave ? (
                  <div className="cloud-save-info">
                    <span className="cloud-icon">☁️</span>
                    <span>Last saved: {new Date(cloudSaveInfo.savedAt!).toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="cloud-save-info">
                    <span className="cloud-icon">☁️</span>
                    <span>No cloud save found</span>
                  </div>
                )}

                <div className="sync-buttons">
                  <button
                    className="sync-button upload"
                    onClick={handleSyncToCloud}
                    disabled={syncStatus === 'syncing'}
                  >
                    {syncStatus === 'syncing' ? '...' : '⬆️'} Save to Cloud
                  </button>
                  <button
                    className="sync-button download"
                    onClick={handleLoadFromCloud}
                    disabled={syncStatus === 'syncing' || !cloudSaveInfo?.hasSave}
                  >
                    {syncStatus === 'syncing' ? '...' : '⬇️'} Load from Cloud
                  </button>
                </div>

                {syncStatus === 'success' && (
                  <div className="sync-status success">Sync successful!</div>
                )}
                {syncStatus === 'error' && (
                  <div className="sync-status error">Sync failed</div>
                )}
              </div>

              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
