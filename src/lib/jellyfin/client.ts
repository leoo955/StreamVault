import { JellyfinItem, JellyfinPerson, JellyfinResponse, NormalizedMediaItem, NormalizedPerson, MediaFilter } from "./types";

// ===== Server-side Jellyfin client =====
// This module runs ONLY on the server. It injects the API key
// and Jellyfin URL from environment variables — never exposed to the browser.

const JELLYFIN_URL = process.env.JELLYFIN_URL || "http://localhost:8096";
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY || "";

class JellyfinClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = JELLYFIN_URL.replace(/\/$/, "");
    this.apiKey = JELLYFIN_API_KEY;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const separator = endpoint.includes("?") ? "&" : "?";
    const urlWithKey = `${url}${separator}api_key=${this.apiKey}`;

    const response = await fetch(urlWithKey, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Jellyfin API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ===== Image URL builder =====
  getImageUrl(itemId: string, imageType: "Primary" | "Backdrop" | "Logo" = "Primary", maxWidth = 600): string {
    return `${this.baseUrl}/Items/${itemId}/Images/${imageType}?maxWidth=${maxWidth}&quality=90&api_key=${this.apiKey}`;
  }

  // ===== Data normalizer =====
  normalizeItem(item: JellyfinItem): NormalizedMediaItem {
    const runtimeMinutes = item.RunTimeTicks ? Math.round(item.RunTimeTicks / 600000000) : 0;
    const playbackPercent = item.UserData?.PlayedPercentage || 0;

    return {
      id: item.Id,
      title: item.Name,
      originalTitle: item.OriginalTitle,
      overview: item.Overview || "",
      year: item.ProductionYear || 0,
      rating: 0,
      communityRating: item.CommunityRating,
      runtime: runtimeMinutes,
      genres: item.Genres || [],
      type: item.Type as NormalizedMediaItem["type"],
      posterUrl: item.ImageTags?.Primary
        ? this.getImageUrl(item.Id, "Primary", 400)
        : "/placeholder-poster.webp",
      backdropUrl: item.BackdropImageTags?.[0]
        ? this.getImageUrl(item.Id, "Backdrop", 1920)
        : item.ParentBackdropImageTags?.[0]
          ? this.getImageUrl(item.Id, "Backdrop", 1920)
          : "/placeholder-backdrop.webp",
      logoUrl: item.ImageTags?.Logo ? this.getImageUrl(item.Id, "Logo", 500) : undefined,
      isPlayed: item.UserData?.Played || false,
      playbackPosition: item.UserData?.PlaybackPositionTicks || 0,
      playbackDuration: item.RunTimeTicks || 0,
      playbackPercent,
      dateAdded: item.DateCreated || "",
      premiereDate: item.PremiereDate,
      tagline: item.Taglines?.[0],
      studios: item.Studios?.map((s) => s.Name),
      people: item.People?.map(this.normalizePerson.bind(this)),
    };
  }

  normalizePerson(person: JellyfinPerson): NormalizedPerson {
    return {
      id: person.Id,
      name: person.Name,
      role: person.Role,
      type: person.Type,
      imageUrl: person.PrimaryImageTag
        ? this.getImageUrl(person.Id, "Primary", 200)
        : undefined,
    };
  }

  // ===== API Methods =====

  async getItems(filters: MediaFilter = {}): Promise<{ items: NormalizedMediaItem[]; totalCount: number }> {
    const params = new URLSearchParams({
      Recursive: "true",
      Fields: "Overview,Genres,Studios,People,DateCreated,Taglines,ProviderIds",
      ImageTypeLimit: "1",
      EnableImageTypes: "Primary,Backdrop,Logo",
      IncludeItemTypes: filters.includeItemTypes || "Movie,Series",
      SortBy: filters.sortBy || "DateCreated",
      SortOrder: filters.sortOrder || "Descending",
      Limit: String(filters.limit || 20),
      StartIndex: String(filters.startIndex || 0),
    });

    if (filters.genreId) params.set("GenreIds", filters.genreId);
    if (filters.searchTerm) params.set("SearchTerm", filters.searchTerm);
    if (filters.parentId) params.set("ParentId", filters.parentId);

    const data = await this.fetch<JellyfinResponse>(`/Items?${params.toString()}`);

    return {
      items: data.Items.map((item) => this.normalizeItem(item)),
      totalCount: data.TotalRecordCount,
    };
  }

  async getItemById(id: string): Promise<NormalizedMediaItem> {
    const item = await this.fetch<JellyfinItem>(`/Items/${id}?Fields=Overview,Genres,Studios,People,DateCreated,Taglines`);
    return this.normalizeItem(item);
  }

  async getLatestItems(limit = 12): Promise<NormalizedMediaItem[]> {
    const data = await this.fetch<JellyfinItem[]>(`/Items/Latest?Limit=${limit}&Fields=Overview,Genres,DateCreated&EnableImageTypes=Primary,Backdrop,Logo&IncludeItemTypes=Movie,Series`);
    return data.map((item) => this.normalizeItem(item));
  }

  async getResumeItems(limit = 10): Promise<NormalizedMediaItem[]> {
    const data = await this.fetch<JellyfinResponse>(`/Items/Resume?Limit=${limit}&Fields=Overview,Genres,DateCreated&EnableImageTypes=Primary,Backdrop&IncludeItemTypes=Movie,Episode&MediaTypes=Video`);
    return data.Items.map((item) => this.normalizeItem(item));
  }

  async getGenres(): Promise<{ id: string; name: string }[]> {
    const data = await this.fetch<JellyfinResponse>(`/Genres?SortBy=SortName&SortOrder=Ascending`);
    return data.Items.map((item) => ({ id: item.Id, name: item.Name }));
  }

  async getSimilarItems(id: string, limit = 12): Promise<NormalizedMediaItem[]> {
    const data = await this.fetch<JellyfinResponse>(`/Items/${id}/Similar?Limit=${limit}&Fields=Overview,Genres,DateCreated`);
    return data.Items.map((item) => this.normalizeItem(item));
  }

  getStreamUrl(itemId: string): string {
    return `/api/stream/${itemId}`;
  }
}

// Singleton instance
export const jellyfinClient = new JellyfinClient();
