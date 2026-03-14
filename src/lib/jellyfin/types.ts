// ===== Normalized DTOs (what the frontend sees) =====

export interface NormalizedMediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  overview: string;
  year: number;
  rating: number;
  communityRating?: number;
  runtime: number; // minutes
  genres: string[];
  type: "Movie" | "Series" | "Episode" | "Anime";
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  streamUrl?: string; // External video link (URL)
  isPlayed: boolean;
  playbackPosition: number; // ticks
  playbackDuration: number; // ticks
  playbackPercent: number;
  dateAdded: string;
  premiereDate?: string;
  tagline?: string;
  studios?: string[];
  people?: NormalizedPerson[];
}

export interface NormalizedPerson {
  id: string;
  name: string;
  role?: string;
  type: string;
  imageUrl?: string;
}

export interface NormalizedSeries extends NormalizedMediaItem {
  seasonCount: number;
  episodeCount: number;
  status: string;
}

export interface NormalizedEpisode {
  id: string;
  title: string;
  overview: string;
  seasonNumber: number;
  episodeNumber: number;
  runtime: number;
  posterUrl: string;
  isPlayed: boolean;
  playbackPercent: number;
}

export interface NormalizedSeason {
  id: string;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  posterUrl: string;
  episodes: NormalizedEpisode[];
}

export interface MediaFilter {
  genreId?: string;
  sortBy?: "DateCreated" | "SortName" | "CommunityRating" | "PremiereDate";
  sortOrder?: "Ascending" | "Descending";
  limit?: number;
  startIndex?: number;
  searchTerm?: string;
  includeItemTypes?: string;
  parentId?: string;
}

// ===== Jellyfin Raw Types (what the API returns) =====

export interface JellyfinItem {
  Id: string;
  Name: string;
  OriginalTitle?: string;
  Overview?: string;
  ProductionYear?: number;
  OfficialRating?: string;
  CommunityRating?: number;
  RunTimeTicks?: number;
  Genres?: string[];
  Type: string;
  ImageTags?: Record<string, string>;
  BackdropImageTags?: string[];
  ParentBackdropImageTags?: string[];
  UserData?: {
    PlaybackPositionTicks: number;
    PlayedPercentage?: number;
    Played: boolean;
  };
  DateCreated?: string;
  PremiereDate?: string;
  Taglines?: string[];
  Studios?: { Name: string }[];
  People?: JellyfinPerson[];
  ChildCount?: number;
  RecursiveItemCount?: number;
  Status?: string;
  ParentIndexNumber?: number;
  IndexNumber?: number;
  SeriesId?: string;
  SeasonId?: string;
}

export interface JellyfinPerson {
  Id: string;
  Name: string;
  Role?: string;
  Type: string;
  PrimaryImageTag?: string;
}

export interface JellyfinResponse {
  Items: JellyfinItem[];
  TotalRecordCount: number;
  StartIndex: number;
}
