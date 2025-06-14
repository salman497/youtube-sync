# 🎵 YouTube Sync

A comprehensive React + Express TypeScript application for syncing YouTube playlists to MP3 files and managing your music collection. Connect your YouTube account, select playlists, convert videos to MP3, and seamlessly upload them to VLC Mobile with a beautiful, modern web interface.

## ✨ Features

### 🔐 Authentication & Authorization
- **YouTube OAuth Integration**: Secure authentication with your YouTube account using OAuth 2.0
- **Session Management**: Persistent login sessions with automatic token refresh
- **Offline Mode**: View and manage previously loaded playlists even when offline

### 📚 Playlist Management
- **Load Playlists**: Fetch all your YouTube playlists and video metadata
- **Smart Caching**: Playlist data saved to JSON for offline access and faster loading
- **Playlist Organization**: Organized by playlist name with proper folder structure
- **Video Metadata**: Full video details including title, description, and URLs

### 🎵 Video Selection & Conversion
- **Selective Sync**: Choose specific videos from playlists to convert
- **Bulk Operations**: Select all/none functionality for efficient management
- **MP3 Conversion**: High-quality audio conversion using FFmpeg
- **Progress Tracking**: Real-time conversion progress and status updates
- **File Path Tracking**: Persistent storage of MP3 file paths in playlist metadata

### 📱 VLC Mobile Integration
- **Wireless Upload**: Upload MP3 files directly to VLC Mobile app over Wi-Fi
- **Batch Upload**: Upload multiple selected files simultaneously
- **Connection Testing**: Automatic VLC Mobile connectivity verification
- **Upload Status**: Detailed upload results and error handling

### 🎯 Smart Sync Status
- **Track Conversion State**: Visual indicators for selected, synced, and uploaded files
- **Selective Upload**: Only upload successfully converted MP3 files
- **Sync History**: Persistent tracking of which videos have been processed

### 📁 File Organization
- **Structured Storage**: MP3 files organized by playlist in dedicated folders
- **Filename Sanitization**: Automatic cleanup of invalid characters in filenames
- **Path Management**: Consistent file path handling across sync and upload operations

### 🖥️ Modern Web Interface
- **Responsive Design**: Mobile-friendly React interface
- **Real-time Updates**: Live status updates during operations
- **Error Handling**: Comprehensive error messages and recovery suggestions
- **Clean UI**: Intuitive interface with clear visual feedback

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

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:
```bash
API_PORT=8080
WEB_HOST=http://localhost:5173
SESSION_SECRET=your-secure-session-secret-here
NODE_ENV=development
```

### 4. Start Development

```bash
# Start both backend and frontend
npm run dev
```

Visit http://localhost:5173 to use the application!

## 🏗️ Architecture

```
youtube-sync/
├── src/
│   ├── server/           # Express.js API backend
│   │   ├── routes/       # Authentication routes
│   │   └── index.ts      # Main server with API endpoints
│   ├── services/         # External service integrations
│   │   ├── youtube.ts    # YouTube Data API v3 client
│   │   └── vlc.ts        # VLC Mobile upload service
│   ├── types/           # Shared TypeScript interfaces
│   └── utils/           # MP3 conversion utilities
├── client/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── AuthSection.tsx
│   │   │   ├── PlaylistSelector.tsx
│   │   │   └── VideoList.tsx
│   │   ├── services/    # API client
│   │   └── types/       # Client-side types
├── playlists/           # Downloaded MP3 files (organized by playlist)
│   ├── Playlist Name 1/
│   │   ├── Song 1.mp3
│   │   └── Song 2.mp3
│   └── Playlist Name 2/
│       └── Song 3.mp3
└── playlist.json        # Cached playlist metadata with file paths
```

## 🎯 How It Works

### 1. **Authentication Flow**
- OAuth 2.0 flow with Google/YouTube
- Secure token storage and management
- Automatic token refresh

### 2. **Playlist Loading**
- Fetch all user playlists from YouTube API
- Load video metadata for each playlist
- Cache data locally for offline access

### 3. **Video Selection**
- Browse loaded playlists in web interface
- Select specific videos for conversion
- Bulk selection tools for efficiency

### 4. **MP3 Conversion**
- High-quality audio extraction using ytdl-core
- FFmpeg conversion to MP3 format
- Progress tracking and status updates
- File path storage in playlist metadata

### 5. **VLC Mobile Upload**
- Wireless file transfer to VLC Mobile app
- Automatic connection testing
- Batch upload with progress tracking
- Error handling and retry logic

## 🛠️ Available Scripts

### Backend Development
- `npm run dev:server` - Start Express API server with hot reload
- `npm run build:server` - Build TypeScript backend to dist/

### Frontend Development
- `npm run dev:client` - Start React development server (Vite)
- `npm run build:client` - Build React production bundle

### Full Stack
- `npm run dev` - Start both backend and frontend concurrently
- `npm run build` - Build complete application
- `npm start` - Start production server (requires build first)

### Utilities
- `npm run install:client` - Install frontend dependencies
- `npm run youtube:to:mp3` - Test single video conversion utility

## 📋 API Endpoints

### Authentication
- `GET /api/auth/status` - Check current authorization status
- `GET /api/auth/url` - Get OAuth authorization URL
- `POST /api/auth/callback` - Exchange authorization code for tokens
- `POST /api/auth/logout` - Clear authentication session

### Playlist Management
- `POST /api/playlists/load` - Load playlists from YouTube API
- `GET /api/playlists` - Get cached playlist data
- `PUT /api/playlists/:id` - Update playlist (video selections)

### Video Operations
- `POST /api/playlists/:id/sync` - Convert selected videos to MP3
- `POST /api/playlists/:id/upload-vlc` - Upload MP3s to VLC Mobile

### System
- `GET /api/health` - Health check endpoint

## 🔧 Tech Stack

### Backend
- **Express.js** - Web framework with TypeScript
- **Google APIs** - YouTube Data API v3 integration
- **ytdl-core** - YouTube video downloading
- **FFmpeg** - High-quality audio conversion
- **Axios** - HTTP client for VLC Mobile uploads
- **Form-data** - Multipart form handling for file uploads

### Frontend
- **React 19** - Modern UI framework with hooks
- **TypeScript** - Full type safety
- **Vite** - Fast build tool and dev server
- **Modern CSS** - Responsive design with CSS Grid/Flexbox

### Infrastructure
- **Session Management** - Express sessions with secure cookies
- **File System** - fs-extra for advanced file operations
- **Environment Config** - dotenv for configuration management

## 📦 Dependencies

### Core Runtime
- `express` - Web server framework
- `googleapis` - Google API client library
- `@distube/ytdl-core` - YouTube video downloader
- `fluent-ffmpeg` + `ffmpeg-static` - Audio processing
- `axios` + `form-data` - HTTP client and file upload
- `fs-extra` - Enhanced file system operations

### Development Tools
- `typescript` - Type checking and compilation
- `ts-node-dev` - Development server with hot reload
- `concurrently` - Run multiple npm scripts
- `vite` - Frontend build tool

## 🔒 Security Features

- **OAuth 2.0** - Secure authentication with Google
- **Session Security** - HTTP-only cookies with secure flags
- **CORS Protection** - Configured for frontend-backend communication
- **Input Validation** - Sanitized filenames and user inputs
- **Error Handling** - Secure error messages without sensitive data

## 📝 File Structure Example

```
playlists/
├── My Favorites/
│   ├── Amazing Song.mp3
│   ├── Great Track.mp3
│   └── Best Music.mp3
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
    "syncWithVlc": true,
    "playlistVideos": [
      {
        "selected": true,
        "videoId": "abc123",
        "videoUrl": "https://youtube.com/watch?v=abc123",
        "videoTitle": "Amazing Song",
        "videoDesc": "Great song description",
        "sync": true,
        "mp3FilePath": "/path/to/playlists/My Favorites/Amazing Song.mp3"
      }
    ]
  }
]
```

## 📱 VLC Mobile Setup

### Prerequisites
1. Install VLC Mobile app on your device
2. Connect your device to the same Wi-Fi network as your computer
3. Enable VLC's web interface:
   - Open VLC Mobile
   - Go to Settings → Local Network
   - Enable "Share via WiFi"
   - Note the IP address displayed (e.g., http://192.168.1.105)

### Upload Process
1. Select and sync videos to MP3 format
2. Enter your VLC Mobile IP address in the upload section
3. Click "Upload to VLC" to transfer files wirelessly
4. Files will appear in VLC Mobile's local files

## 🐛 Troubleshooting

### Common Issues

**YouTube API Authentication**
- Ensure `youtube-credentials.json` is properly configured
- Check that YouTube Data API v3 is enabled in Google Cloud Console
- Verify OAuth consent screen is configured

**MP3 Conversion Failures**
- Confirm FFmpeg is properly installed and accessible
- Check video availability and privacy settings
- Ensure sufficient disk space for downloads

**VLC Mobile Connection**
- Verify both devices are on the same Wi-Fi network
- Check that VLC Mobile's web interface is enabled
- Test IP address accessibility in browser

**File Path Issues**
- Ensure write permissions to playlists directory
- Check for invalid characters in video titles
- Verify file paths are correctly stored in playlist.json

See [SETUP.md](./SETUP.md) for detailed troubleshooting guide.

## 🚀 Performance Features

- **Concurrent Processing** - Parallel development servers
- **Smart Caching** - Playlist data persistence
- **Optimized Builds** - Production-ready compilation
- **Error Recovery** - Graceful failure handling
- **Progress Tracking** - Real-time operation updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test thoroughly on both frontend and backend
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

### Development Guidelines
- Maintain TypeScript strict mode compliance
- Follow existing code structure and naming conventions
- Add proper error handling for new features
- Update types when modifying data structures

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**⚠️ Important Notes:**
- This application requires YouTube API credentials to function properly
- Ensure compliance with YouTube's Terms of Service when using their API
- VLC Mobile uploads require both devices on the same Wi-Fi network
- Respect copyright laws when downloading and converting YouTube content
- Use responsibly and in accordance with applicable laws and platform policies 