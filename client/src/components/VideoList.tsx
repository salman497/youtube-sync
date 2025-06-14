import React, { useState } from 'react';
import { Playlist, PlaylistVideo } from '../types/playlist';

interface VideoListProps {
  playlist: Playlist;
  onPlaylistUpdate: (playlist: Playlist) => void;
  onSync: (playlistId: string) => void;
  loading: boolean;
}

const VideoList: React.FC<VideoListProps> = ({
  playlist,
  onPlaylistUpdate,
  onSync,
  loading,
}) => {
  const [selectAll, setSelectAll] = useState(false);

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

  const selectedCount = playlist.playlistVideos.filter(v => v.selected).length;
  const syncedCount = playlist.playlistVideos.filter(v => v.sync).length;
  const canSync = selectedCount > 0 && !loading;

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
            disabled={loading}
          />
          <span>Select All ({playlist.playlistVideos.length} videos)</span>
        </label>

        <button
          className="btn btn-success"
          onClick={handleSync}
          disabled={!canSync}
        >
          {loading ? '🔄 Syncing...' : `🎶 Sync Selected (${selectedCount})`}
        </button>
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
              disabled={loading}
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