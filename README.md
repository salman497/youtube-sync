# YouTube to MP3 Converter

A simple TypeScript utility to convert YouTube videos to MP3 files with organized folder structure.

## Features

- 🎵 Convert YouTube videos to high-quality MP3 (128kbps)
- 📁 Organized folder structure: `<root>/<playlistname>/<filename>.mp3`  
- 🔧 Built with TypeScript for type safety
- 🚀 Uses `@distube/ytdl-core` for reliable YouTube downloading
- 🎛️ FFmpeg integration for audio conversion
- ✨ File name sanitization for cross-platform compatibility

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Dependencies Used

After researching the best npm packages for YouTube to MP3 conversion, I selected:

- **`@distube/ytdl-core`** - A reliable fork of ytdl-core with active maintenance and bug fixes
- **`fluent-ffmpeg`** - For audio processing and MP3 conversion  
- **`ffmpeg-static`** - Provides FFmpeg binary automatically
- **`fs-extra`** - Enhanced file system operations

## Usage

### Using the Utility Function

```typescript
import { convertYouTubeVideoToMp3 } from './src/utils/convert-youtube-video-to-mp3';

const videoId = 'Zjp3zIZwloE';
const playlistName = 'Islamic-Lectures';
const fileName = 'Life Changing Bayan ┇ Phir Nek Nahi ho Tum - Dr. Israr Ahmed';

convertYouTubeVideoToMp3(videoId, playlistName, fileName)
  .then(outputPath => {
    console.log('Downloaded to:', outputPath);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Using the Test Script

Run the pre-configured test:

```bash
npm run youtube:to:mp3
```

This will download the example video to:
```
Islamic-Lectures/Life Changing Bayan - Phir Nek Nahi ho Tum - Dr. Israr Ahmed.mp3
```

## Function Parameters

- **`videoId`** - The YouTube video ID (e.g., 'Zjp3zIZwloE' from youtube.com/watch?v=Zjp3zIZwloE)
- **`playlistName`** - Name of the folder to create (e.g., 'Islamic-Lectures')  
- **`fileName`** - Desired filename without extension (special characters will be sanitized)

## File Structure

```
youtube-sync/
├── src/
│   ├── utils/
│   │   └── convert-youtube-video-to-mp3.ts    # Main utility function
│   └── test-convert.ts                        # Test script
├── Islamic-Lectures/                          # Generated folder
│   └── Life Changing Bayan - ....mp3         # Downloaded MP3
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

- `npm run youtube:to:mp3` - Run the test conversion
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Development mode with auto-reload

## Notes

- The utility automatically creates the playlist directory if it doesn't exist
- File names are sanitized to remove invalid characters (`<>:"/\\|?*┇` become `-`)
- Downloads highest quality audio available and converts to 128kbps MP3
- Progress is displayed during conversion

## Requirements

- Node.js (v14 or higher)
- FFmpeg (included via ffmpeg-static)

## License

MIT 