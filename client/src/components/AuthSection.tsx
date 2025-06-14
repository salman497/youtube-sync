import React, { useState } from 'react';
import { apiService } from '../services/api';

interface AuthSectionProps {
  onAuthSuccess: () => void;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    try {
      setLoading(true);
      setError(null);
      
      const authUrl = apiService.getAuthUrl();
      
      // Redirect to the auth URL which will handle the OAuth flow
      window.location.href = authUrl;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authorization');
      setLoading(false);
    }
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

      <button 
        className="btn btn-primary" 
        onClick={handleConnect}
        disabled={loading}
      >
        {loading ? 'Connecting...' : '🔗 Connect to YouTube'}
      </button>
    </div>
  );
};

export default AuthSection; 