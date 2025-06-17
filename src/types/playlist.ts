export interface PlaylistVideo {
  selected: boolean;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  videoDesc?: string; // Optional as specified
  convertedToMP3: boolean; // Initially false
  mp3FilePath?: string; // Path to the MP3 file when converted
  syncWithVlc?: boolean;

}

export interface Playlist {
  playlistName: string;
  playlistId: string;
  playlistUrl?: string; // Optional as specified
  playlistVideos: PlaylistVideo[];
  syncWithVlc?: boolean;
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

export interface VlcUploadResult {
  videoId: string;
  title: string;
  success: boolean;
  error?: string;
}

export interface VlcUploadResponse {
  success: boolean;
  message: string;
  uploaded: number;
  total: number;
  results: VlcUploadResult[];
}

export interface VlcUploadRequest {
  playlistId: string;
  vlcIp: string;
} 