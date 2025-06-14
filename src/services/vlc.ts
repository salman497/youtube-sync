import * as fs from 'fs-extra';
import * as path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { VlcUploadResult } from '../types/playlist';

export class VlcService {
  private vlcIp: string;

  constructor(vlcIp: string) {
    this.vlcIp = vlcIp.endsWith('/') ? vlcIp.slice(0, -1) : vlcIp;
  }

  /**
   * Upload a single MP3 file to VLC Mobile
   */
  async uploadFile(filePath: string, fileName: string, playlistName?: string): Promise<boolean> {
    try {
      if (!(await fs.pathExists(filePath))) {
        throw new Error(`File not found: ${filePath}`);
      }

      const form = new FormData();
      const fileStream = fs.createReadStream(filePath);
      
      // Include playlist name as folder in the filename if provided
      const fileNameWithFolder = playlistName ? `${playlistName}/${fileName}` : fileName;
      form.append('files[]', fileStream, fileNameWithFolder);

      const response = await axios.post(`${this.vlcIp}/upload.json`, form, {
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': `${this.vlcIp}/`,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          ...form.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      });

      return response.status === 200 && response.data.success !== false;
    } catch (error) {
      console.error(`Error uploading ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Create a playlist in VLC Mobile (if supported by the API)
   */
  async createPlaylist(playlistName: string): Promise<boolean> {
    try {
      // This is a placeholder - VLC Mobile HTTP interface might not support playlist creation
      // You would need to check VLC Mobile's HTTP interface documentation
      // For now, we'll just return true as we focus on file upload
      console.log(`Playlist creation for "${playlistName}" - feature may not be available in VLC Mobile HTTP interface`);
      return true;
    } catch (error) {
      console.error(`Error creating playlist ${playlistName}:`, error);
      return false;
    }
  }

  /**
   * Upload multiple MP3 files to VLC Mobile
   */
  async uploadMultipleFiles(
    files: Array<{ filePath: string; fileName: string; videoId: string; title: string }>,
    playlistName?: string
  ): Promise<VlcUploadResult[]> {
    const results: VlcUploadResult[] = [];

    for (const file of files) {
      try {
        const logMessage = playlistName 
          ? `🔄 Uploading to VLC folder "${playlistName}": ${file.title}`
          : `🔄 Uploading to VLC: ${file.title}`;
        console.log(logMessage);
        
        await this.uploadFile(file.filePath, file.fileName, playlistName);
        
        results.push({
          videoId: file.videoId,
          title: file.title,
          success: true
        });
        
        const successMessage = playlistName 
          ? `✅ Successfully uploaded to VLC folder "${playlistName}": ${file.title}`
          : `✅ Successfully uploaded to VLC: ${file.title}`;
        console.log(successMessage);
      } catch (error) {
        console.error(`❌ Failed to upload to VLC ${file.title}:`, error);
        results.push({
          videoId: file.videoId,
          title: file.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Test VLC connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.head(`${this.vlcIp}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('VLC connection test failed:', error);
      return false;
    }
  }
} 