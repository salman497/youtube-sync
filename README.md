# 🎵 YouTube Sync

A modern React + Express TypeScript application for syncing YouTube playlists to MP3 files. Connect your YouTube account, select playlists, choose videos, and automatically convert them to MP3 format with a beautiful web interface.

## ✨ Features

- **🔐 YouTube OAuth Integration**: Secure authentication with your YouTube account
- **📚 Playlist Management**: Load and manage all your YouTube playlists
- **🎵 Video Selection**: Choose specific videos from playlists to sync
- **⚡ Batch Processing**: Convert multiple videos to MP3 simultaneously
- **📁 Organized Storage**: MP3 files organized by playlist in folder structure
- **🎯 Smart Sync Status**: Track which videos have been synced
- **📱 Responsive UI**: Modern, mobile-friendly React interface
- **💾 Persistent Data**: Playlist data saved to JSON for reuse across sessions

## 🚀 Quick Start

### 1. Setup YouTube API Credentials

Follow the detailed instructions in [SETUP.md](./SETUP.md) to:
- Create a Google Cloud project
- Enable YouTube Data API v3
- Set up OAuth 2.0 credentials
- Configure `youtube-credentials.json`

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install:client
```

### 3. Start Development

```bash
# Start both backend and frontend
npm run dev
```

Visit http://localhost:3000 to use the application!

## 🏗️ Architecture

```
youtube-sync/
├── src/
│   ├── server/           # Express.js API backend
│   ├── services/         # YouTube API integration
│   ├── types/           # Shared TypeScript interfaces
│   └── utils/           # MP3 conversion utilities
├── client/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   └── types/       # Client-side types
├── playlists/           # Downloaded MP3 files
└── playlist.json        # Cached playlist data
```

## 🎯 How It Works

1. **Authentication**: Connect to YouTube using OAuth 2.0
2. **Load Playlists**: Fetch all your YouTube playlists and videos
3. **Select Content**: Choose playlists and specific videos to sync
4. **Convert to MP3**: Download and convert selected videos using FFmpeg
5. **Organize Files**: Save MP3s in organized folder structure
6. **Track Progress**: Monitor sync status and manage your collection

## 🛠️ Available Scripts

### Backend
- `npm run dev:server` - Start Express API server
- `npm run build:server` - Build TypeScript backend

### Frontend
- `npm run dev:client` - Start React development server
- `npm run build:client` - Build React production bundle

### Combined
- `npm run dev` - Start both backend and frontend
- `npm run build` - Build complete application
- `npm start` - Start production server

### Legacy
- `npm run youtube:to:mp3` - Test single video conversion

## 📋 API Endpoints

- `GET /api/health` - Health check
- `GET /api/youtube/auth-status` - Check authorization status
- `GET /api/youtube/auth-url` - Get OAuth authorization URL
- `POST /api/youtube/auth-callback` - Exchange auth code for token
- `POST /api/playlists/load` - Load playlists from YouTube
- `GET /api/playlists` - Get cached playlist data
- `PUT /api/playlists/:id` - Update playlist selections
- `POST /api/playlists/:id/sync` - Sync selected videos to MP3

## 🔧 Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Google APIs** - YouTube Data API v3
- **FFmpeg** - Audio conversion
- **ytdl-core** - YouTube video downloading

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Modern CSS** - Responsive styling

## 📦 Dependencies

### Core
- `express` - Web server framework
- `googleapis` - Google API client
- `@distube/ytdl-core` - YouTube downloader
- `fluent-ffmpeg` - Audio processing
- `react` & `react-dom` - UI framework

### Development
- `typescript` - Type checking
- `vite` - Build tool
- `concurrently` - Run multiple processes

## 🔒 Security

- OAuth 2.0 authentication with Google
- Sensitive credentials stored locally (not in version control)
- CORS enabled for frontend-backend communication
- Secure token handling and refresh

## 📝 File Structure Example

```
playlists/
├── My Favorites/
│   ├── Song 1.mp3
│   ├── Song 2.mp3
│   └── Song 3.mp3
├── Workout Mix/
│   ├── High Energy Track.mp3
│   └── Pump Up Song.mp3
└── Chill Vibes/
    └── Relaxing Tune.mp3

playlist.json
[
  {
    "playlistName": "My Favorites",
    "playlistId": "PLrAKs...",
    "playlistUrl": "https://youtube.com/playlist?list=...",
    "playlistVideos": [
      {
        "selected": true,
        "videoId": "abc123",
        "videoUrl": "https://youtube.com/watch?v=abc123",
        "videoTitle": "Song 1",
        "videoDesc": "Great song description",
        "sync": true
      }
    ]
  }
]
```

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md) for detailed troubleshooting guide including:
- YouTube API setup issues
- Authentication problems
- Conversion failures
- Network connectivity issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Note**: This application requires YouTube API credentials to function. Please follow the setup guide carefully and ensure you comply with YouTube's Terms of Service when using their API. 