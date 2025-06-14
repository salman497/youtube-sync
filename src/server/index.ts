import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import * as fs from 'fs-extra';
import { YouTubeService } from '../services/youtube';
import { PlaylistData, Playlist } from '../types/playlist';
import { convertYouTubeVideoToMp3 } from '../utils/convert-youtube-video-to-mp3';

const app = express();
const PORT = process.env.API_PORT || 3001;
const PLAYLIST_FILE = path.join(process.cwd(), 'playlist.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize YouTube service
const youtubeService = new YouTubeService();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'YouTube Sync API is running' });
});

// Check if user is authorized with YouTube
app.get('/api/youtube/auth-status', (req, res) => {
  try {
    const isAuthorized = youtubeService.isAuthorized();
    res.json({ authorized: isAuthorized });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check authorization status' });
  }
});

// Get YouTube authorization URL
app.get('/api/youtube/auth-url', async (req, res) => {
  try {
    const authUrl = await youtubeService.authorize();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: 'Failed to get authorization URL' });
  }
});

// Exchange authorization code for access token
app.post('/api/youtube/auth-callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    await youtubeService.getAccessToken(code);
    res.json({ success: true, message: 'Authorization successful' });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

// Load playlists from YouTube and save to playlist.json
app.post('/api/playlists/load', async (req, res) => {
  try {
    if (!youtubeService.isAuthorized()) {
      return res.status(401).json({ error: 'Not authorized with YouTube' });
    }

    console.log('🎵 Loading playlists from YouTube...');
    const playlists = await youtubeService.getUserPlaylists();
    
    // Save to playlist.json
    await fs.writeJson(PLAYLIST_FILE, playlists, { spaces: 2 });
    console.log(`✅ Saved ${playlists.length} playlists to playlist.json`);
    
    res.json({ 
      success: true, 
      message: `Loaded ${playlists.length} playlists`,
      playlists 
    });
  } catch (error) {
    console.error('Error loading playlists:', error);
    res.status(500).json({ error: 'Failed to load playlists from YouTube' });
  }
});

// Get playlists from playlist.json
app.get('/api/playlists', async (req, res) => {
  try {
    if (await fs.pathExists(PLAYLIST_FILE)) {
      const playlists: PlaylistData = await fs.readJson(PLAYLIST_FILE);
      res.json(playlists);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading playlists:', error);
    res.status(500).json({ error: 'Failed to read playlists' });
  }
});

// Update playlist (e.g., video selection)
app.put('/api/playlists/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const updatedPlaylist: Playlist = req.body;
    
    if (await fs.pathExists(PLAYLIST_FILE)) {
      const playlists: PlaylistData = await fs.readJson(PLAYLIST_FILE);
      const index = playlists.findIndex(p => p.playlistId === playlistId);
      
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        await fs.writeJson(PLAYLIST_FILE, playlists, { spaces: 2 });
        res.json({ success: true, playlist: updatedPlaylist });
      } else {
        res.status(404).json({ error: 'Playlist not found' });
      }
    } else {
      res.status(404).json({ error: 'Playlist file not found' });
    }
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Sync selected videos to MP3
app.post('/api/playlists/:playlistId/sync', async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    if (!(await fs.pathExists(PLAYLIST_FILE))) {
      return res.status(404).json({ error: 'Playlist file not found' });
    }
    
    const playlists: PlaylistData = await fs.readJson(PLAYLIST_FILE);
    const playlist = playlists.find(p => p.playlistId === playlistId);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const selectedVideos = playlist.playlistVideos.filter(v => v.selected && !v.sync);
    
    if (selectedVideos.length === 0) {
      return res.json({ success: true, message: 'No videos selected for sync', synced: 0 });
    }
    
    console.log(`🎵 Starting sync of ${selectedVideos.length} videos from playlist: ${playlist.playlistName}`);
    
    let syncedCount = 0;
    const results = [];
    
    for (const video of selectedVideos) {
      try {
        console.log(`🔄 Converting: ${video.videoTitle}`);
        
        const outputPath = await convertYouTubeVideoToMp3(
          video.videoId,
          playlist.playlistName,
          video.videoTitle
        );
        
        // Mark as synced
        video.sync = true;
        syncedCount++;
        
        results.push({
          videoId: video.videoId,
          title: video.videoTitle,
          success: true,
          outputPath
        });
        
        console.log(`✅ Successfully converted: ${video.videoTitle}`);
      } catch (error) {
        console.error(`❌ Failed to convert ${video.videoTitle}:`, error);
        results.push({
          videoId: video.videoId,
          title: video.videoTitle,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Save updated playlist
    await fs.writeJson(PLAYLIST_FILE, playlists, { spaces: 2 });
    
    res.json({ 
      success: true, 
      message: `Synced ${syncedCount} out of ${selectedVideos.length} videos`,
      synced: syncedCount,
      total: selectedVideos.length,
      results
    });
    
  } catch (error) {
    console.error('Error syncing playlist:', error);
    res.status(500).json({ error: 'Failed to sync playlist' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 YouTube Sync API server running on port ${PORT}`);
  console.log(`📁 Playlist file: ${PLAYLIST_FILE}`);
  console.log(`🎵 MP3 files will be saved to: ${path.join(process.cwd(), 'playlists')}`);
});

export default app; 