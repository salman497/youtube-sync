export interface PlaylistVideo {
  selected: boolean;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  videoDesc?: string; // Optional as specified
  sync: boolean; // Initially false
}

export interface Playlist {
  playlistName: string;
  playlistId: string;
  playlistUrl?: string; // Optional as specified
  playlistVideos: PlaylistVideo[];
}

export type PlaylistData = Playlist[]; 