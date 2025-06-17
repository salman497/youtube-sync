import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { Playlist, PlaylistVideo } from '../types/playlist';

dotenv.config();

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.API_HOST}/api/auth/youtube/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('YouTube client ID and secret are required.');
}

export const createOAuth2Client = (): OAuth2Client => {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

export const getYoutubeClient = (oauth2Client: OAuth2Client) => {
    return google.youtube({
        version: 'v3',
        auth: oauth2Client,
    });
}

export class YouTubeService {
  private oauth2Client: OAuth2Client;
  private youtube: any;

  constructor(tokens?: any) {
    this.oauth2Client = createOAuth2Client();
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }
    this.youtube = getYoutubeClient(this.oauth2Client);
  }

  setTokens(tokens: any): void {
    this.oauth2Client.setCredentials(tokens);
  }

  async getUserPlaylists(): Promise<Playlist[]> {
    try {
      if (!this.oauth2Client.credentials.access_token) {
        throw new Error('Not authorized. Please authorize first.');
      }

      const playlists: Playlist[] = [];
      let nextPageToken = '';

      do {
        const response = await this.youtube.playlists.list({
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
        const response = await this.youtube.playlistItems.list({
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
              convertedToMP3: false,
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