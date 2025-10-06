import YTDlpWrap from 'yt-dlp-wrap';
import * as fs from 'fs-extra';
import * as path from 'path';
import ffmpegStatic from 'ffmpeg-static';

/**
 * Interface for YouTube to MP3 conversion parameters
 */
export interface ConvertParams {
  videoId: string;
  playlistName: string;
  fileName: string;
}

// Initialize yt-dlp wrapper with binary path
let ytDlpWrap: YTDlpWrap;
let ytDlpInitialized = false;

async function initializeYtDlp(): Promise<YTDlpWrap> {
  if (ytDlpInitialized && ytDlpWrap) {
    return ytDlpWrap;
  }

  const ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp');

  // Check if yt-dlp binary exists
  if (!await fs.pathExists(ytDlpPath)) {
    console.log('📥 Downloading yt-dlp binary...');
    await fs.ensureDir(path.join(process.cwd(), 'bin'));
    await YTDlpWrap.downloadFromGithub(ytDlpPath);
    console.log('✅ yt-dlp binary downloaded successfully');
  }

  ytDlpWrap = new YTDlpWrap(ytDlpPath);
  ytDlpInitialized = true;
  return ytDlpWrap;
}

/**
 * Converts a YouTube video to MP3 and saves it to the specified directory structure
 * @param videoId - The YouTube video ID (e.g., 'Zjp3zIZwloE')
 * @param playlistName - The name of the playlist folder
 * @param fileName - The desired filename (without extension)
 * @returns Promise<string> - Path to the downloaded file
 */
export async function convertYouTubeVideoToMp3(
  videoId: string,
  playlistName: string,
  fileName: string
): Promise<string> {
  try {
    // Create the directory structure: <root>/<playlistname>/
    const rootDir = process.cwd();
    const playlistDir = path.join(rootDir, 'playlists', playlistName);

    // Ensure the playlist directory exists
    await fs.ensureDir(playlistDir);

    // Sanitize filename to remove invalid characters
    const sanitizedFileName = fileName.replace(/[<>:"/\\|?*┇]/g, '-').trim();
    const outputPath = path.join(playlistDir, `${sanitizedFileName}.mp3`);

    // Create YouTube URL from video ID
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`🎵 Starting download: ${youtubeUrl}`);
    console.log(`📁 Output directory: ${playlistDir}`);
    console.log(`📄 Filename: ${sanitizedFileName}.mp3`);

    // Initialize yt-dlp (downloads binary if needed)
    const ytDlp = await initializeYtDlp();

    // Get ffmpeg path from ffmpeg-static
    const ffmpegPath = ffmpegStatic ? path.dirname(ffmpegStatic) : '';

    // Download with yt-dlp (more reliable than ytdl-core)
    const args = [
      youtubeUrl,
      '-x', // Extract audio
      '--audio-format', 'mp3',
      '--audio-quality', '0', // Best quality
      '-o', outputPath.replace('.mp3', '.%(ext)s'), // Output template
      '--no-playlist', // Don't download playlists
    ];

    // Add ffmpeg location if available
    if (ffmpegPath) {
      args.push('--ffmpeg-location', ffmpegPath);
    }

    await ytDlp.execPromise(args);

    console.log(`✅ Successfully downloaded: ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error('❌ Error converting YouTube video to MP3:', error);
    throw new Error(`Failed to convert video ${videoId}: ${error}`);
  }
}

/**
 * Convenience function that takes an object parameter
 */
export async function convertVideo(params: ConvertParams): Promise<string> {
  return convertYouTubeVideoToMp3(params.videoId, params.playlistName, params.fileName);
} 