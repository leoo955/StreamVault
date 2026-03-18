import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  getMediaItemById,
  updateMediaItem,
  deleteMediaItem,
} from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/media/[id] (auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const item = await getMediaItemById(id);
  if (!item) {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

// PUT /api/media/[id] — update (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateMediaItem(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
    }

    return NextResponse.json({ item: updated, message: "Média mis à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/media/[id] — delete (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const success = await deleteMediaItem(id);
  if (!success) {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }

  return NextResponse.json({ message: "Média supprimé" });
}
