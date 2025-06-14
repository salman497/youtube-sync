import { google } from 'googleapis';
import * as fs from 'fs-extra';
import * as path from 'path';
import open from 'open';
import { Playlist, PlaylistVideo } from '../types/playlist';

const youtube = google.youtube('v3');
const OAuth2 = google.auth.OAuth2;

export class YouTubeService {
  private oauth2Client: any;
  private readonly SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
  private readonly TOKEN_PATH = path.join(process.cwd(), 'youtube-token.json');

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Load client secrets from environment variables
      const client_id = process.env.YOUTUBE_CLIENT_ID;
      const client_secret = process.env.YOUTUBE_CLIENT_SECRET;
      const api_port = process.env.API_PORT || '3001';
      const redirect_uri = `http://localhost:${api_port}`;
      
      if (!client_id) {
        throw new Error('YOUTUBE_CLIENT_ID environment variable is required');
      }
      
      if (!client_secret) {
        throw new Error('YOUTUBE_CLIENT_SECRET environment variable is required');
      }
      
      this.oauth2Client = new OAuth2(client_id, client_secret, `${redirect_uri}/auth/callback`);
      
      // Try to load existing token
      try {
        const token = await fs.readJson(this.TOKEN_PATH);
        this.oauth2Client.setCredentials(token);
      } catch (err) {
        // Token doesn't exist, will need to authorize
      }
    } catch (error) {
      console.error('Error loading YouTube credentials:', error);
      throw error;
    }
  }

  async authorize(): Promise<string> {
    return new Promise((resolve, reject) => {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.SCOPES,
      });

      console.log('Authorize this app by visiting this url:', authUrl);
      
      // Open the authorization URL in the default browser
      open(authUrl);
      
      resolve(authUrl);
    });
  }

  async getAccessToken(code: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      // Store the token to disk for later program executions
      await fs.writeJson(this.TOKEN_PATH, tokens);
      console.log('Token stored to', this.TOKEN_PATH);
    } catch (error) {
      console.error('Error retrieving access token', error);
      throw error;
    }
  }

  async getUserPlaylists(): Promise<Playlist[]> {
    try {
      if (!this.oauth2Client.credentials.access_token) {
        throw new Error('Not authorized. Please authorize first.');
      }

      const playlists: Playlist[] = [];
      let nextPageToken = '';

      do {
        const response = await youtube.playlists.list({
          auth: this.oauth2Client,
          part: ['snippet', 'contentDetails'],
          mine: true,
          maxResults: 50,
          pageToken: nextPageToken || undefined,
        });

        if (response.data.items) {
          for (const item of response.data.items) {
            const playlist: Playlist = {
              playlistName: item.snippet?.title || 'Unknown Playlist',
              playlistId: item.id || '',
              playlistUrl: `https://www.youtube.com/playlist?list=${item.id}`,
              playlistVideos: [],
            };

            // Fetch videos for this playlist
            playlist.playlistVideos = await this.getPlaylistVideos(playlist.playlistId);
            playlists.push(playlist);
          }
        }

        nextPageToken = response.data.nextPageToken || '';
      } while (nextPageToken);

      return playlists;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  private async getPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
    try {
      const videos: PlaylistVideo[] = [];
      let nextPageToken = '';

      do {
        const response = await youtube.playlistItems.list({
          auth: this.oauth2Client,
          part: ['snippet', 'contentDetails'],
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken || undefined,
        });

        if (response.data.items) {
          for (const item of response.data.items) {
            const video: PlaylistVideo = {
              selected: false,
              videoId: item.snippet?.resourceId?.videoId || '',
              videoUrl: `https://www.youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`,
              videoTitle: item.snippet?.title || 'Unknown Video',
              videoDesc: item.snippet?.description || undefined,
              sync: false,
            };
            videos.push(video);
          }
        }

        nextPageToken = response.data.nextPageToken || '';
      } while (nextPageToken);

      return videos;
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      return [];
    }
  }

  isAuthorized(): boolean {
    return !!(this.oauth2Client && this.oauth2Client.credentials && this.oauth2Client.credentials.access_token);
  }
} 