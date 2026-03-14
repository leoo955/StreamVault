import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let tmdbId = request.nextUrl.searchParams.get("tmdbId");
  const id = request.nextUrl.searchParams.get("id"); // IMDb fallback
  
  if ((!tmdbId || tmdbId === "undefined") && !id) return NextResponse.json({ seasons: [] });

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  try {
    // 0. Resolve TMDB ID from IMDb ID if missing
    if ((!tmdbId || tmdbId === "undefined") && id && apiKey) {
        const findRes = await fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${apiKey}&external_source=imdb_id&language=fr-FR`);
        if (findRes.ok) {
            const findData = await findRes.json();
            if (findData.tv_results && findData.tv_results.length > 0) {
                tmdbId = findData.tv_results[0].id.toString();
            }
        }
    }

    // 1. Fetch perfect French data directly from TMDB
    if (tmdbId && tmdbId !== "undefined" && apiKey) {
        // Fetch series info to get number of seasons
        const seriesRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=fr-FR`, {
            signal: AbortSignal.timeout(5000)
        });
        
        if (seriesRes.ok) {
            const seriesData = await seriesRes.json();
            if (seriesData.seasons) {
               const validSeasons = seriesData.seasons.filter((s:any) => s.season_number > 0);
               
               // Fetch all seasons concurrently to get episode names
               const seasonPromises = validSeasons.map((s:any) => 
                   fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${s.season_number}?api_key=${apiKey}&language=fr-FR`, {
                       signal: AbortSignal.timeout(5000)
                   }).then(res => res.json()).catch(() => null)
               );

               const seasonsDetails = await Promise.all(seasonPromises);
               const formattedSeasons = [];

               for (const detail of seasonsDetails) {
                   if (!detail || !detail.episodes) continue;
                   
                   const episodes = detail.episodes.map((ep:any) => ({
                       number: ep.episode_number,
                       title: ep.name || `Épisode ${ep.episode_number}`,
                       streamUrl: "",
                       runtime: ep.runtime || 0
                   })).sort((a: any, b: any) => a.number - b.number);

                   formattedSeasons.push({
                       number: detail.season_number,
                       episodes
                   });
               }

               formattedSeasons.sort((a, b) => a.number - b.number);
               return NextResponse.json({ seasons: formattedSeasons });
            }
        }
    }

    // 2. Fallback to English Cinemeta (Stremio) if no TMDB ID
    if (id) {
        const res = await fetch(`https://v3-cinemeta.strem.io/meta/series/${id}.json`, {
          signal: AbortSignal.timeout(8000),
        });
        
        if (!res.ok) return NextResponse.json({ seasons: [] });
        const data = await res.json();
        
        if (!data.meta || !data.meta.videos) return NextResponse.json({ seasons: [] });

        const seasonsMap: Record<number, { number: number; episodes: any[] }> = {};

        for (const v of data.meta.videos) {
          const sNum = v.season;
          if (sNum === 0) continue; // Skip specials usually

          if (!seasonsMap[sNum]) {
            seasonsMap[sNum] = { number: sNum, episodes: [] };
          }

          seasonsMap[sNum].episodes.push({
            number: v.episode,
            title: v.name || v.title || `Épisode ${v.episode}`,
            streamUrl: "",
            runtime: 0 
          });
        }

        const seasons = Object.values(seasonsMap).sort((a, b) => a.number - b.number);
        for (const season of seasons) {
          season.episodes.sort((a: any, b: any) => a.number - b.number);
        }

        return NextResponse.json({ seasons });
    }

    return NextResponse.json({ seasons: [] });

  } catch (err) {
    return NextResponse.json({ seasons: [] });
  }
}

