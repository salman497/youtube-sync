import React, { useState } from 'react';
import { apiService } from '../services/api';

interface AuthSectionProps {
  onAuthSuccess: () => void;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'initial' | 'waiting' | 'code'>('initial');
  const [authCode, setAuthCode] = useState('');

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAuthUrl();
      
      // Open the authorization URL in a new window
      window.open(response.authUrl, '_blank');
      
      setAuthStep('waiting');
      
      // Wait a moment then show code input
      setTimeout(() => {
        setAuthStep('code');
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get authorization URL');
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authCode.trim()) {
      setError('Please enter the authorization code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiService.exchangeAuthCode(authCode.trim());
      onAuthSuccess();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authorize with YouTube');
    } finally {
      setLoading(false);
    }
  };

  const resetAuth = () => {
    setAuthStep('initial');
    setAuthCode('');
    setError(null);
  };

  return (
    <div className="card">
      <h2>🔐 YouTube Authorization</h2>
      <p>Connect to your YouTube account to load and sync your playlists.</p>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {authStep === 'initial' && (
        <button 
          className="btn btn-primary" 
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : '🔗 Connect to YouTube'}
        </button>
      )}

      {authStep === 'waiting' && (
        <div>
          <div className="loading">
            Opening YouTube authorization page...
          </div>
          <p>Please authorize the app in the new browser window, then return here.</p>
        </div>
      )}

      {authStep === 'code' && (
        <div>
          <p>After authorizing, you should see an authorization code. Please paste it below:</p>
          <form onSubmit={handleCodeSubmit}>
            <div className="form-group">
              <label htmlFor="authCode" className="form-label">
                Authorization Code:
              </label>
              <input
                type="text"
                id="authCode"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Paste your authorization code here..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                }}
                disabled={loading}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !authCode.trim()}
              >
                {loading ? 'Authorizing...' : '✅ Submit Code'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetAuth}
                disabled={loading}
              >
                🔄 Start Over
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthSection; 