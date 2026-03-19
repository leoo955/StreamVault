import { NextRequest, NextResponse } from "next/server";
import { consumePairingCode, prisma } from "@/lib/db";
import { createJWT, setAuthCookie } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    const userId = await consumePairingCode(code);

    if (!userId) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }

    // Generate JWT and set secure session cookie
    const token = await createJWT({
      userId: dbUser.id,
      username: dbUser.username,
      role: dbUser.role,
    });

    const response = NextResponse.json({ success: true, message: "Appareil couplé avec succès" });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Pairing Error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
