# YouTube Sync Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Console account

## YouTube API Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to APIs & Services > Library
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "YouTube Sync"
     - User support email: your email
     - Developer contact information: your email
   - Add your email to test users if using external type
4. Create OAuth client ID:
   - Application type: "Desktop application"
   - Name: "YouTube Sync Desktop"
5. Download the JSON file

### 3. Configure Credentials

1. Rename the downloaded JSON file to `youtube-credentials.json`
2. Place it in the root directory of this project (same level as package.json)

The file should look something like this:
```json
{
  "installed": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "your-client-secret",
    "redirect_uris": ["http://localhost"]
  }
}
```

## Installation & Setup

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
npm run install:client
```

### 3. Start Development

Run both backend and frontend in development mode:

```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend React app on http://localhost:3000

Alternatively, you can run them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

## Usage

1. Open your browser and go to http://localhost:3000
2. Click "Connect to YouTube" - this will open a browser window for authorization
3. Authorize the application with your Google account
4. Copy the authorization code and paste it back in the app
5. Click "Load My Playlist Data" to fetch your YouTube playlists
6. Select a playlist from the dropdown
7. Choose which videos you want to sync by checking the boxes
8. Click "Sync Selected" to download and convert videos to MP3

## File Structure

```
youtube-sync/
├── src/
│   ├── server/           # Express.js backend
│   ├── services/         # YouTube API service
│   ├── types/           # TypeScript interfaces
│   └── utils/           # MP3 conversion utilities
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript interfaces
├── playlists/           # Downloaded MP3 files (organized by playlist)
├── playlist.json        # Cached playlist data
├── youtube-credentials.json  # Your OAuth credentials (create this)
└── youtube-token.json   # Auto-generated access token
```

## Production Build

```bash
# Build both backend and frontend
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

1. **"YouTube credentials file not found"**
   - Make sure `youtube-credentials.json` is in the root directory
   - Verify the file structure matches the example above

2. **"Authorization failed"**
   - Check if your OAuth consent screen is configured correctly
   - Make sure you've added yourself as a test user
   - Verify the redirect URI in your credentials

3. **"API quota exceeded"**
   - YouTube API has daily quotas - wait for reset or request quota increase

4. **MP3 conversion fails**
   - Make sure ffmpeg is available on your system
   - Check if the video is available and not private/restricted

### Debug Mode

To see detailed logs, set environment variable:

```bash
NODE_ENV=development npm run dev
```

## Security Notes

- Never commit `youtube-credentials.json` or `youtube-token.json` to version control
- These files contain sensitive authentication information
- The `.gitignore` file is configured to exclude these files automatically 