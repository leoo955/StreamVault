import { NextRequest, NextResponse } from "next/server";
import { getMediaItems, getAuthUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  try {
    const items = await getMediaItems();

    const stats = {
      total: items.length,
      missingPosters: 0,
      missingBackdrops: 0,
      missingOverviews: 0,
      deadLinks: 0, // Placeholder for future link checking
      missingCast: 0,
    };

    const issues: Record<string, string[]> = {};

    items.forEach(item => {
      const itemIssues: string[] = [];
      if (!item.posterUrl) { stats.missingPosters++; itemIssues.push("Affiche manquante"); }
      if (!item.backdropUrl) { stats.missingBackdrops++; itemIssues.push("Fond manquant"); }
      if (!item.overview || item.overview.length < 10) { stats.missingOverviews++; itemIssues.push("Synopsis trop court"); }
      if (!item.cast || item.cast.length === 0) { stats.missingCast++; itemIssues.push("Casting vide"); }
      
      if (itemIssues.length > 0) {
        issues[item.id] = itemIssues;
      }
    });

    return NextResponse.json({ stats, issues });
  } catch (error) {
    return NextResponse.json({ error: "Failed to scan library" }, { status: 500 });
  }
}
