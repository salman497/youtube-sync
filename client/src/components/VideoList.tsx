import React, { useState } from 'react';
import { Playlist, PlaylistVideo } from '../types/playlist';
import { apiService } from '../services/api';

interface VideoListProps {
  playlist: Playlist;
  onPlaylistUpdate: (playlist: Playlist) => void;
  onSync: (playlistId: string) => void;
  loading: boolean;
  isAuthorized: boolean;
}

const VideoList: React.FC<VideoListProps> = ({
  playlist,
  onPlaylistUpdate,
  onSync,
  loading,
  isAuthorized,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [vlcIp, setVlcIp] = useState('http://192.168.1.105');
  const [vlcLoading, setVlcLoading] = useState(false);
  const [vlcMessage, setVlcMessage] = useState<string | null>(null);

  const handleVideoToggle = (videoId: string) => {
    const updatedVideos = playlist.playlistVideos.map(video => 
      video.videoId === videoId 
        ? { ...video, selected: !video.selected }
        : video
    );
    
    const updatedPlaylist = {
      ...playlist,
      playlistVideos: updatedVideos,
    };
    
    onPlaylistUpdate(updatedPlaylist);
    
    // Update select all state
    const allSelected = updatedVideos.every(v => v.selected);
    setSelectAll(allSelected);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    const updatedVideos = playlist.playlistVideos.map(video => ({
      ...video,
      selected: newSelectAll,
    }));
    
    const updatedPlaylist = {
      ...playlist,
      playlistVideos: updatedVideos,
    };
    
    onPlaylistUpdate(updatedPlaylist);
    setSelectAll(newSelectAll);
  };

  const handleSync = () => {
    onSync(playlist.playlistId);
  };

  const handleVlcUpload = async () => {
    if (!vlcIp.trim()) {
      setVlcMessage('Please enter a valid VLC IP address');
      return;
    }

    setVlcLoading(true);
    setVlcMessage(null);

    try {
      const response = await apiService.uploadToVlc(playlist.playlistId, vlcIp);
      
      if (response.success) {
        setVlcMessage(`✅ Successfully uploaded ${response.uploaded} files to VLC Mobile`);
        
        // Update playlist to mark as synced with VLC
        const updatedPlaylist = {
          ...playlist,
          syncWithVlc: true,
        };
        onPlaylistUpdate(updatedPlaylist);
      } else {
        setVlcMessage(`❌ Upload failed: ${response.message}`);
      }
    } catch (error) {
      console.error('VLC upload error:', error);
      setVlcMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVlcLoading(false);
    }
  };

  const selectedCount = playlist.playlistVideos.filter(v => v.selected).length;
  const syncedCount = playlist.playlistVideos.filter(v => v.sync).length;
  const selectedSyncedCount = playlist.playlistVideos.filter(v => v.selected && v.sync).length;
  const canSync = selectedCount > 0 && !loading && isAuthorized;
  const canUploadVlc = selectedSyncedCount > 0 && !vlcLoading && !loading;

  // Update selectAll state when playlist changes
  React.useEffect(() => {
    const allSelected = playlist.playlistVideos.length > 0 && 
                       playlist.playlistVideos.every(v => v.selected);
    setSelectAll(allSelected);
  }, [playlist.playlistVideos]);

  return (
    <div className="card">
      <h2>🎵 {playlist.playlistName}</h2>
      {playlist.playlistUrl && (
        <p>
          <a 
            href={playlist.playlistUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#ff0000', textDecoration: 'none' }}
          >
            🔗 View on YouTube
          </a>
        </p>
      )}

      <div className="toolbar">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            disabled={loading || vlcLoading}
          />
          <span>Select All ({playlist.playlistVideos.length} videos)</span>
        </label>

        <button
          className="btn btn-success"
          onClick={handleSync}
          disabled={!canSync}
          title={!isAuthorized ? 'Connect to YouTube to sync videos' : ''}
        >
          {loading ? '🔄 Syncing...' : `🎶 Sync Selected (${selectedCount})`}
        </button>
      </div>

      {/* VLC Upload Section */}
      <div className="vlc-upload-section" style={{ 
        marginTop: '16px', 
        padding: '16px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        border: '1px solid #ddd' 
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1em' }}>📱 Upload to VLC Mobile</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <label htmlFor="vlc-ip" style={{ minWidth: '80px' }}>VLC IP:</label>
          <input
            id="vlc-ip"
            type="text"
            value={vlcIp}
            onChange={(e) => setVlcIp(e.target.value)}
            placeholder="http://192.168.1.105"
            disabled={vlcLoading || loading}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleVlcUpload}
            disabled={!canUploadVlc}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: canUploadVlc ? 'pointer' : 'not-allowed',
              opacity: canUploadVlc ? 1 : 0.6
            }}
          >
            {vlcLoading ? '🔄 Uploading...' : `📤 Upload to VLC (${selectedSyncedCount})`}
          </button>
        </div>

        {vlcMessage && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: vlcMessage.startsWith('✅') ? '#d4edda' : '#f8d7da',
            color: vlcMessage.startsWith('✅') ? '#155724' : '#721c24',
            border: `1px solid ${vlcMessage.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {vlcMessage}
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {playlist.syncWithVlc && (
            <span style={{ color: '#28a745' }}>✅ Synced with VLC Mobile</span>
          )}
          <div>Only synced MP3 files will be uploaded to VLC Mobile</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-number">{playlist.playlistVideos.length}</span>
          <div className="stat-label">Total Videos</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{selectedCount}</span>
          <div className="stat-label">Selected</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{syncedCount}</span>
          <div className="stat-label">Synced</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{selectedSyncedCount}</span>
          <div className="stat-label">Ready for VLC</div>
        </div>
      </div>

      {playlist.playlistVideos.length === 0 ? (
        <p>No videos found in this playlist.</p>
      ) : (
        <div className="video-list">
          {playlist.playlistVideos.map((video) => (
            <VideoItem
              key={video.videoId}
              video={video}
              onToggle={() => handleVideoToggle(video.videoId)}
              disabled={loading || vlcLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface VideoItemProps {
  video: PlaylistVideo;
  onToggle: () => void;
  disabled: boolean;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, onToggle, disabled }) => {
  return (
    <div className="video-item">
      <div className="video-checkbox">
        <input
          type="checkbox"
          checked={video.selected}
          onChange={onToggle}
          disabled={disabled}
        />
      </div>
      
      <div className="video-info">
        <h4 className="video-title">
          <a 
            href={video.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {video.videoTitle}
          </a>
        </h4>
        {video.videoDesc && (
          <p className="video-description">{video.videoDesc}</p>
        )}
      </div>
      
      <div className="video-status">
        <span className={`status-${video.sync ? 'synced' : 'pending'}`}>
          {video.sync ? '✅ Synced' : '⏳ Pending'}
        </span>
      </div>
    </div>
  );
};

export default VideoList; 