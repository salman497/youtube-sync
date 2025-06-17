import React from 'react';
import { Playlist, PlaylistData } from '../types/playlist';

interface PlaylistSelectorProps {
  playlists: PlaylistData;
  selectedPlaylist: Playlist | null;
  onPlaylistSelect: (playlist: Playlist) => void;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  playlists,
  selectedPlaylist,
  onPlaylistSelect,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playlistId = e.target.value;
    if (playlistId) {
      const playlist = playlists.find(p => p.playlistId === playlistId);
      if (playlist) {
        onPlaylistSelect(playlist);
      }
    }
  };

  const getPlaylistStats = (playlist: Playlist) => {
    const total = playlist.playlistVideos.length;
    const selected = playlist.playlistVideos.filter(v => v.selected).length;
    const converted = playlist.playlistVideos.filter(v => v.convertedToMP3).length;
    
    return { total, selected, converted };
  };

  return (
    <div className="card">
      <h2>📋 Select Playlist</h2>
      <p>Choose a playlist to view and convert its videos.</p>

      <div className="form-group">
        <label htmlFor="playlistSelect" className="form-label">
          Your Playlists ({playlists.length} found):
        </label>
        <select
          id="playlistSelect"
          className="form-select"
          value={selectedPlaylist?.playlistId || ''}
          onChange={handleSelectChange}
        >
          <option value="">-- Select a playlist --</option>
          {playlists.map((playlist) => {
            const stats = getPlaylistStats(playlist);
            return (
              <option key={playlist.playlistId} value={playlist.playlistId}>
                {playlist.playlistName} ({stats.total} videos, {stats.converted} converted)
              </option>
            );
          })}
        </select>
      </div>

      {selectedPlaylist && (
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{getPlaylistStats(selectedPlaylist).total}</span>
            <div className="stat-label">Total Videos</div>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getPlaylistStats(selectedPlaylist).selected}</span>
            <div className="stat-label">Selected</div>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getPlaylistStats(selectedPlaylist).converted}</span>
            <div className="stat-label">Converted</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistSelector; 