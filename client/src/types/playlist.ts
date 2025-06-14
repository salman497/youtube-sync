export interface PlaylistVideo {
  selected: boolean;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  videoDesc?: string;
  sync: boolean;
}

export interface Playlist {
  playlistName: string;
  playlistId: string;
  playlistUrl?: string;
  playlistVideos: PlaylistVideo[];
}

export type PlaylistData = Playlist[];

export interface SyncResult {
  videoId: string;
  title: string;
  success: boolean;
  outputPath?: string;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  synced: number;
  total: number;
  results: SyncResult[];
} 