import { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { Playlist, PlaylistData } from './types/playlist';
import PlaylistSelector from './components/PlaylistSelector';
import VideoList from './components/VideoList';
import AuthSection from './components/AuthSection';

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistData>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      setLoading(true);
      
      // Check if user is authorized
      const authStatus = await apiService.getAuthStatus();
      setIsAuthorized(authStatus.loggedIn);
      
      // Load existing playlists regardless of auth status (from local playlist.json)
      const existingPlaylists = await apiService.getPlaylists();
      setPlaylists(existingPlaylists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthorized(true);
    setError(null);
    setSuccess('Successfully connected to YouTube!');
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthorized(false);
      setPlaylists([]);
      setSelectedPlaylist(null);
      setSuccess('Successfully logged out');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  const handleLoadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.loadPlaylistsFromYouTube();
      setPlaylists(response.playlists);
      setSuccess(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setError(null);
    setSuccess(null);
  };

  const handlePlaylistUpdate = async (updatedPlaylist: Playlist) => {
    try {
      await apiService.updatePlaylist(updatedPlaylist.playlistId, updatedPlaylist);
      
      // Update local state
      setPlaylists(prev => 
        prev.map(p => 
          p.playlistId === updatedPlaylist.playlistId ? updatedPlaylist : p
        )
      );
      setSelectedPlaylist(updatedPlaylist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update playlist');
    }
  };

  const handleSync = async (playlistId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.syncPlaylist(playlistId);
      
      if (response.success) {
        setSuccess(`${response.message}. Successfully converted ${response.synced} videos.`);
        
        // Refresh playlists to get updated conversion status
        const updatedPlaylists = await apiService.getPlaylists();
        setPlaylists(updatedPlaylists);
        
        // Update selected playlist
        const updatedSelected = updatedPlaylists.find(p => p.playlistId === playlistId);
        if (updatedSelected) {
          setSelectedPlaylist(updatedSelected);
        }
      } else {
        setError('Conversion failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert playlist');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading && !isAuthorized) {
    return (
      <div className="loading">
        Initializing YouTube Sync...
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>🎵 YouTube Sync</h1>
        </div>
      </header>

      <div className="container">
        {error && (
          <div className="error">
            {error}
            <button 
              onClick={clearMessages}
              style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="success">
            {success}
            <button 
              onClick={clearMessages}
              style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}
            >
              ✕
            </button>
          </div>
        )}

        {!isAuthorized && playlists.length === 0 ? (
          <AuthSection onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {!isAuthorized && (
              <div className="card" style={{ marginBottom: '20px', backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
                <p style={{ margin: '0 0 12px 0', color: '#856404' }}>
                  ℹ️ You're viewing offline playlist data. Connect to YouTube to load fresh data or convert videos.
                </p>
                <AuthSection onAuthSuccess={handleAuthSuccess} />
              </div>
            )}
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2>📚 Playlist Management</h2>
                  <p>Load your YouTube playlists and convert selected videos to MP3.</p>
                </div>
                {isAuthorized && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleLogout}
                    style={{ height: 'fit-content' }}
                  >
                    🚪 Logout
                  </button>
                )}
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleLoadPlaylists}
                disabled={loading || !isAuthorized}
                title={!isAuthorized ? 'Connect to YouTube first to load fresh playlist data' : ''}
              >
                {loading ? 'Saving...' : '💾 Save Youtube Playlist in Playlist.json'}
              </button>
            </div>

            {playlists.length > 0 && (
              <PlaylistSelector
                playlists={playlists}
                selectedPlaylist={selectedPlaylist}
                onPlaylistSelect={handlePlaylistSelect}
              />
            )}

            {selectedPlaylist && (
              <VideoList
                playlist={selectedPlaylist}
                onPlaylistUpdate={handlePlaylistUpdate}
                onSync={handleSync}
                loading={loading}
                isAuthorized={isAuthorized}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App; 