import { NextRequest, NextResponse } from "next/server";
import { getInvitationCodes, createInvitationCode, getAuthUser } from "@/lib/db";

// GET /api/invitations — list all invitations (admin only)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const codes = await getInvitationCodes();
  // Sort newest first
  codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ codes });
}

// POST /api/invitations — create a new invitation (admin only)
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { code, maxUses } = await request.json();

    if (!code || typeof code !== "string" || code.trim().length < 3) {
      return NextResponse.json({ error: "Code invalide (min 3 caractères)" }, { status: 400 });
    }

    if (!maxUses || typeof maxUses !== "number" || maxUses < 1) {
      return NextResponse.json({ error: "Nombre d'utilisations invalide" }, { status: 400 });
    }

    const newCode = await createInvitationCode(code, maxUses, user.id);
    return NextResponse.json({ code: newCode, message: "Code créé avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
