import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getComments, addComment, deleteComment } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/comments?mediaId=xxx
export async function GET(request: NextRequest) {
  const mediaId = request.nextUrl.searchParams.get("mediaId");
  if (!mediaId) return NextResponse.json({ error: "mediaId requis" }, { status: 400 });

  const comments = await getComments(mediaId);
  return NextResponse.json({ comments });
}

// POST /api/comments
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { mediaId, text } = await request.json();
  if (!mediaId || !text?.trim()) {
    return NextResponse.json({ error: "mediaId et text requis" }, { status: 400 });
  }
  if (text.trim().length > 500) {
    return NextResponse.json({ error: "Commentaire trop long (500 max)" }, { status: 400 });
  }

  const comment = await addComment({
    mediaId,
    userId: user.id,
    username: user.username,
    text: text.trim(),
  });

  return NextResponse.json({ comment }, { status: 201 });
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const success = await deleteComment(id, user.id, user.role === "admin");
  if (!success) return NextResponse.json({ error: "Commentaire introuvable" }, { status: 404 });

  return NextResponse.json({ message: "Commentaire supprimé" });
}
