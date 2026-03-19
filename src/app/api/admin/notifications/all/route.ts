import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, notifyAllUsers } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { title, message, mediaId } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
    }

    await notifyAllUsers(title, message, mediaId);

    return NextResponse.json({ message: "Annonce envoyée avec succès à tous les utilisateurs" });
  } catch (error) {
    console.error("Admin announcement failed:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'annonce" }, { status: 500 });
  }
}
