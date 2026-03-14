import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getProfileById } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET /api/profiles/verify-pin?id=xxx&pin=1234
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  const pin = request.nextUrl.searchParams.get("pin");

  if (!id || !pin) return NextResponse.json({ error: "id et pin requis" }, { status: 400 });

  const profile = await getProfileById(id);
  if (!profile || profile.userId !== user.id) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  if (!profile.pin) {
    // No PIN set — any access is valid
    return NextResponse.json({ valid: true });
  }

  // Hash the submitted PIN for comparison
  const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
  if (pinHash === profile.pin) {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ error: "Code PIN incorrect" }, { status: 403 });
}
