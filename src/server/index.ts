import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import * as fs from 'fs-extra';
import { YouTubeService } from '../services/youtube';
import { PlaylistData, Playlist, VlcUploadRequest, VlcUploadResponse } from '../types/playlist';
import { convertYouTubeVideoToMp3 } from '../utils/convert-youtube-video-to-mp3';
import { authRouter } from './routes/auth';
import { VlcService } from '../services/vlc';

const app = express();
const PORT = process.env.API_PORT;
const PLAYLIST_FILE = path.join(process.cwd(), 'playlists', 'playlist.json');

// Middleware
app.use(cors({
  origin: process.env.WEB_HOST || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Use auth routes
app.use('/api/auth', authRouter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'YouTube Sync API is running' });
});

// Load playlists from YouTube and save to playlist.json
app.post('/api/playlists/load', async (req, res) => {
  try {
    const tokens = (req.session as any).tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authorized with YouTube' });
    }

    const youtubeService = new YouTubeService(tokens);
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
      const playlists = await fs.readJson(PLAYLIST_FILE);
      
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

// Convert selected videos to MP3
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
    
    const selectedVideos = playlist.playlistVideos.filter(v => v.selected && !v.convertedToMP3);
    
          if (selectedVideos.length === 0) {
        return res.json({ success: true, message: 'No videos selected for conversion', synced: 0 });
      }
    
    console.log(`🎵 Starting conversion of ${selectedVideos.length} videos from playlist: ${playlist.playlistName}`);
    
    let convertedCount = 0;
    const results = [];
    
    for (const video of selectedVideos) {
      try {
        // Check if MP3 already exists
        const sanitizedFileName = video.videoTitle.replace(/[<>:"/\\|?*┇]/g, '-').trim();
        const expectedOutputPath = path.join(process.cwd(), 'playlists', playlist.playlistName, `${sanitizedFileName}.mp3`);
        
        if (await fs.pathExists(expectedOutputPath)) {
          console.log(`🎵 MP3 already exists: ${video.videoTitle}`);
          
          // Mark as converted and store the MP3 file path
          video.convertedToMP3 = true;
          video.mp3FilePath = expectedOutputPath;
          convertedCount++;
          
          results.push({
            videoId: video.videoId,
            title: video.videoTitle,
            success: true,
            outputPath: expectedOutputPath
          });
          
          console.log(`✅ Already converted (skipped): ${video.videoTitle}`);
        } else {
          console.log(`🔄 Converting: ${video.videoTitle}`);
          
          const outputPath = await convertYouTubeVideoToMp3(
            video.videoId,
            playlist.playlistName,
            video.videoTitle
          );
          
          // Mark as converted and store the MP3 file path
          video.convertedToMP3 = true;
          video.mp3FilePath = outputPath;
          convertedCount++;
          
          results.push({
            videoId: video.videoId,
            title: video.videoTitle,
            success: true,
            outputPath
          });
          
          console.log(`✅ Successfully converted: ${video.videoTitle}`);
        }
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
      message: `Converted ${convertedCount} out of ${selectedVideos.length} videos`,
      synced: convertedCount,
      total: selectedVideos.length,
      results
    });
    
  } catch (error) {
    console.error('Error converting playlist:', error);
    res.status(500).json({ error: 'Failed to convert playlist' });
  }
});

// Upload selected videos to VLC Mobile
app.post('/api/playlists/:playlistId/upload-vlc', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { vlcIp } = req.body as Pick<VlcUploadRequest, 'vlcIp'>;
    
    if (!vlcIp) {
      return res.status(400).json({ error: 'VLC IP address is required' });
    }
    
    if (!(await fs.pathExists(PLAYLIST_FILE))) {
      return res.status(404).json({ error: 'Playlist file not found' });
    }
    
    const playlists: PlaylistData = await fs.readJson(PLAYLIST_FILE);
    const playlist = playlists.find(p => p.playlistId === playlistId);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Only upload selected videos that have been converted (MP3 exists)
    const selectedVideos = playlist.playlistVideos.filter(v => v.selected && v.convertedToMP3);
    
    if (selectedVideos.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No converted videos selected for VLC upload', 
        uploaded: 0,
        total: 0,
        results: []
      });
    }
    
    console.log(`📱 Starting VLC upload of ${selectedVideos.length} videos from playlist: ${playlist.playlistName}`);
    
    // Initialize VLC service
    const vlcService = new VlcService(vlcIp);
    
    // Test VLC connection first
    const isConnected = await vlcService.testConnection();
    if (!isConnected) {
      return res.status(400).json({ error: `Cannot connect to VLC Mobile at ${vlcIp}` });
    }
    
    // Try to create playlist in VLC (if supported)
    await vlcService.createPlaylist(playlist.playlistName);
    
    // Prepare files for upload
    const files = [];
    for (const video of selectedVideos) {
      if (video.mp3FilePath && await fs.pathExists(video.mp3FilePath)) {
        const fileName = path.basename(video.mp3FilePath);
        files.push({
          filePath: video.mp3FilePath,
          fileName,
          videoId: video.videoId,
          title: video.videoTitle
        });
      } else {
        console.warn(`⚠️ MP3 file not found for ${video.videoTitle} (path: ${video.mp3FilePath}), skipping upload`);
      }
    }
    
    if (files.length === 0) {
      return res.json({
        success: false,
        message: 'No MP3 files found for selected videos',
        uploaded: 0,
        total: selectedVideos.length,
        results: []
      });
    }
    
    // Upload files to VLC with playlist folder structure
    const results = await vlcService.uploadMultipleFiles(files, playlist.playlistName);
    const uploadedCount = results.filter(r => r.success).length;
    
    // Mark playlist as synced with VLC
    playlist.syncWithVlc = true;
    await fs.writeJson(PLAYLIST_FILE, playlists, { spaces: 2 });
    
    const response: VlcUploadResponse = {
      success: true,
      message: `Uploaded ${uploadedCount} out of ${files.length} files to VLC Mobile`,
      uploaded: uploadedCount,
      total: files.length,
      results
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error uploading to VLC:', error);
    res.status(500).json({ error: 'Failed to upload to VLC Mobile' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 YouTube Sync API server running on port ${PORT}`);
  console.log(`📁 Playlist file: ${PLAYLIST_FILE}`);
  console.log(`🎵 MP3 files will be saved to: ${path.join(process.cwd(), 'playlists')}`);
});

export default app; 