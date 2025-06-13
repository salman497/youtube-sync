import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Interface for YouTube to MP3 conversion parameters
 */
export interface ConvertParams {
  videoId: string;
  playlistName: string;
  fileName: string;
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
  return new Promise(async (resolve, reject) => {
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
      
      // Get video info to find audio stream
      const info = await ytdl.getInfo(youtubeUrl);
      console.log(`📺 Video title: ${info.videoDetails.title}`);
      
      // Create audio stream
      const audioStream = ytdl(youtubeUrl, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });
      
      // Convert to MP3 using ffmpeg
      ffmpeg(audioStream)
        .audioBitrate(128)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('start', (commandLine) => {
          console.log('🔄 FFmpeg started with command:', commandLine);
        })
        .on('progress', (progress) => {
          // FFmpeg progress can include: frames, currentFps, currentKbps, targetSize, timemark, percent
          if (progress.percent && progress.percent > 0) {
            console.log(`⏳ Processing: ${Math.round(progress.percent)}% done`);
          } else if (progress.timemark) {
            console.log(`⏳ Processing: ${progress.timemark} processed`);
          } else if (progress.targetSize) {
            console.log(`⏳ Processing: ${Math.round(progress.targetSize)}KB processed`);
          } else {
            console.log(`⏳ Processing audio conversion...`);
          }
        })
        .on('end', () => {
          console.log(`✅ Successfully downloaded: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
        
    } catch (error) {
      console.error('❌ Error converting YouTube video to MP3:', error);
      reject(new Error(`Failed to convert video ${videoId}: ${error}`));
    }
  });
}

/**
 * Convenience function that takes an object parameter
 */
export async function convertVideo(params: ConvertParams): Promise<string> {
  return convertYouTubeVideoToMp3(params.videoId, params.playlistName, params.fileName);
} 