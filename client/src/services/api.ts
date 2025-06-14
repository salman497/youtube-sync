import { Playlist, PlaylistData, SyncResponse } from '../types/playlist';

const API_BASE_URL = '/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // YouTube Authentication
  async getAuthStatus(): Promise<{ loggedIn: boolean }> {
    return this.request('/auth/status');
  }

  getAuthUrl(): string {
    return '/auth/youtube';
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Playlist Management
  async loadPlaylistsFromYouTube(): Promise<{
    success: boolean;
    message: string;
    playlists: PlaylistData;
  }> {
    return this.request('/playlists/load', {
      method: 'POST',
    });
  }

  async getPlaylists(): Promise<PlaylistData> {
    return this.request('/playlists');
  }

  async updatePlaylist(playlistId: string, playlist: Playlist): Promise<{
    success: boolean;
    playlist: Playlist;
  }> {
    return this.request(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(playlist),
    });
  }

  async syncPlaylist(playlistId: string): Promise<SyncResponse> {
    return this.request(`/playlists/${playlistId}/sync`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService(); 