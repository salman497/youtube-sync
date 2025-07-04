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
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    currentVideo?: string;
  } | null>(null);

  // Filter videos based on search term
  const filteredVideos = playlist.playlistVideos.filter(video => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = video.videoTitle.toLowerCase().includes(searchLower);
    const descMatch = video.videoDesc?.toLowerCase().includes(searchLower) || false;
    
    return titleMatch || descMatch;
  });

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
    
    // Update select all state based on filtered videos
    const filteredUpdatedVideos = updatedVideos.filter(video => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = video.videoTitle.toLowerCase().includes(searchLower);
      const descMatch = video.videoDesc?.toLowerCase().includes(searchLower) || false;
      return titleMatch || descMatch;
    });
    const allSelected = filteredUpdatedVideos.length > 0 && filteredUpdatedVideos.every(v => v.selected);
    setSelectAll(allSelected);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    const updatedVideos = playlist.playlistVideos.map(video => {
      // Only toggle selection for filtered videos
      const isInFilteredResults = filteredVideos.some(fv => fv.videoId === video.videoId);
      if (isInFilteredResults) {
        return { ...video, selected: newSelectAll };
      }
      return video;
    });
    
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
    setUploadProgress({ current: 0, total: selectedConvertedCount });

    try {
      const response = await apiService.uploadToVlc(playlist.playlistId, vlcIp);
      
      if (response.success) {
        setVlcMessage(`✅ Successfully uploaded ${response.uploaded} of ${response.total} files to VLC Mobile`);
        
        // Update individual video sync status based on server response
        const updatedVideos = playlist.playlistVideos.map(video => {
          const uploadResult = response.results.find(r => r.videoId === video.videoId);
          if (uploadResult) {
            return { ...video, syncWithVlc: uploadResult.success };
          }
          return video;
        });

        // Update playlist sync status
        const selectedVideos = updatedVideos.filter(v => v.selected);
        const allSelectedSynced = selectedVideos.length > 0 && 
          selectedVideos.filter(v => v.convertedToMP3).every(v => v.syncWithVlc);
        
        const updatedPlaylist = {
          ...playlist,
          playlistVideos: updatedVideos,
          syncWithVlc: allSelectedSynced,
        };
        onPlaylistUpdate(updatedPlaylist);
        
        // Show detailed results if there were failures
        if (response.uploaded < response.total) {
          const failedUploads = response.results.filter(r => !r.success);
          const failedTitles = failedUploads.map(r => r.title).join(', ');
          setVlcMessage(`⚠️ Uploaded ${response.uploaded}/${response.total} files. Failed: ${failedTitles}`);
        }
      } else {
        setVlcMessage(`❌ Upload failed: ${response.message}`);
      }
    } catch (error) {
      console.error('VLC upload error:', error);
      setVlcMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVlcLoading(false);
      setUploadProgress(null);
    }
  };

  const selectedCount = playlist.playlistVideos.filter(v => v.selected).length;
  const convertedCount = playlist.playlistVideos.filter(v => v.convertedToMP3).length;
  const selectedConvertedCount = playlist.playlistVideos.filter(v => v.selected && v.convertedToMP3).length;
  const filteredSelectedCount = filteredVideos.filter(v => v.selected).length;
  const canSync = selectedCount > 0 && !loading && isAuthorized;
  const canUploadVlc = selectedConvertedCount > 0 && !vlcLoading && !loading;

  // Update selectAll state when playlist or search changes
  React.useEffect(() => {
    const allSelected = filteredVideos.length > 0 && 
                       filteredVideos.every(v => v.selected);
    setSelectAll(allSelected);
  }, [filteredVideos]);

  const clearSearch = () => {
    setSearchTerm('');
  };

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

      {/* Search Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ minWidth: '60px', fontSize: '14px' }}>🔍 Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search videos by title or description..."
            disabled={loading || vlcLoading}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px 8px',
                color: '#666'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Showing {filteredVideos.length} of {playlist.playlistVideos.length} videos
          </div>
        )}
      </div>

      <div className="toolbar">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            disabled={loading || vlcLoading || filteredVideos.length === 0}
          />
          <span>
            Select All ({filteredVideos.length} {searchTerm ? 'filtered' : ''} videos)
            {searchTerm && filteredSelectedCount > 0 && ` - ${filteredSelectedCount} selected`}
          </span>
        </label>

        <button
          className="btn btn-success"
          onClick={handleSync}
          // disabled={!canSync}
          title={!isAuthorized ? 'Connect to YouTube to convert videos' : ''}
        >
          {loading ? '🔄 Converting...' : `🎵 Convert & Download video as mp3 (${selectedCount})`}
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
            {vlcLoading ? (
              uploadProgress ? 
                `🔄 Uploading ${uploadProgress.current}/${uploadProgress.total}...` : 
                '🔄 Uploading...'
            ) : `📤 Upload to VLC (${selectedConvertedCount})`}
          </button>
        </div>

        {/* Progress indicator during upload */}
        {uploadProgress && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#cce5ff',
            color: '#0066cc',
            border: '1px solid #99ccff',
            marginBottom: '8px'
          }}>
            🔄 Uploading {uploadProgress.current} of {uploadProgress.total} files...
            {uploadProgress.currentVideo && (
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Current: {uploadProgress.currentVideo}
              </div>
            )}
          </div>
        )}

        {vlcMessage && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: vlcMessage.startsWith('✅') ? '#d4edda' : 
                           vlcMessage.startsWith('⚠️') ? '#fff3cd' : '#f8d7da',
            color: vlcMessage.startsWith('✅') ? '#155724' : 
                   vlcMessage.startsWith('⚠️') ? '#856404' : '#721c24',
            border: `1px solid ${vlcMessage.startsWith('✅') ? '#c3e6cb' : 
                                vlcMessage.startsWith('⚠️') ? '#ffeaa7' : '#f5c6cb'}`
          }}>
            {vlcMessage}
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        <div>Only converted MP3 files will be uploaded to VLC Mobile</div>
        
        {/* Show sync progress for individual videos */}
        {selectedConvertedCount > 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {(() => {
              const syncedCount = playlist.playlistVideos.filter(v => v.selected && v.convertedToMP3 && v.syncWithVlc).length;
              return syncedCount > 0 ? (
                <span style={{ color: '#28a745' }}>
                  📱 {syncedCount} of {selectedConvertedCount} videos synced with VLC
                </span>
              ) : null;
            })()}
          </div>
        )}
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
          <span className="stat-number">{convertedCount}</span>
          <div className="stat-label">Converted</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{selectedConvertedCount}</span>
          <div className="stat-label">Ready for VLC</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{playlist.playlistVideos.filter(v => v.syncWithVlc).length}</span>
          <div className="stat-label">VLC Synced</div>
        </div>
      </div>

      {playlist.playlistVideos.length === 0 ? (
        <p>No videos found in this playlist.</p>
      ) : filteredVideos.length === 0 && searchTerm ? (
        <p>No videos match your search "{searchTerm}". <button onClick={clearSearch} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button></p>
      ) : (
        <div className="video-list">
          {filteredVideos.map((video) => (
            <VideoItem
              key={video.videoId}
              video={video}
              onToggle={() => handleVideoToggle(video.videoId)}
              disabled={loading || vlcLoading}
              searchTerm={searchTerm}
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
  searchTerm: string;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, onToggle, disabled, searchTerm }) => {
  // Highlight search terms in title and description
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#ffeb3b', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

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
            {highlightText(video.videoTitle, searchTerm)}
          </a>
        </h4>
        {video.videoDesc && (
          <p className="video-description">
            {highlightText(video.videoDesc, searchTerm)}
          </p>
        )}
      </div>
      
      <div className="video-status">
        <span className={`status-${video.convertedToMP3 ? 'converted' : 'pending'}`}>
          {video.convertedToMP3 ? '✅ Converted' : '⏳ Pending'}
        </span>
        {video.convertedToMP3 && (
          <span 
            className={`status-${video.syncWithVlc ? 'synced' : 'not-synced'}`}
            style={{ 
              marginLeft: '8px',
              fontSize: '12px',
              color: video.syncWithVlc ? '#28a745' : '#6c757d'
            }}
          >
            {video.syncWithVlc ? '📱 VLC Synced' : '📱 Not Synced'}
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoList; 