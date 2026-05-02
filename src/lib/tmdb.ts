const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_API_KEY}`,
      'Content-Type': 'application/json;charset=utf-8'
    }
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return response.json()
}

export const tmdb = {
  search: (query: string, type: 'movie' | 'tv' = 'movie') => 
    fetchTMDB(`/search/${type}`, { query, language: 'fr-FR' }),
  
  getDetails: (id: string, type: 'movie' | 'tv' = 'movie') => 
    fetchTMDB(`/${type}/${id}`, { language: 'fr-FR', append_to_response: 'credits,videos,images' }),

  getTrending: (type: 'movie' | 'tv' = 'movie') => 
    fetchTMDB(`/trending/${type}/week`, { language: 'fr-FR' }),

  getSeasonDetails: (seriesId: string, seasonNumber: number) =>
    fetchTMDB(`/tv/${seriesId}/season/${seasonNumber}`, { language: 'fr-FR' })
}
