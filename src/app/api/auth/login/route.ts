import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, toPublicUser } from "@/lib/db";
import { createJWT } from "@/lib/jwt";
import { logActivity } from "@/lib/logger";

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await verifyPassword(username, password);
    if (!user) {
      await logActivity(request, "Connexion Échouée", `Tentative avec l'utilisateur: ${username}`);
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Create JWT token (4 days)
    const token = await createJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    await logActivity(request, "Connexion", `Utilisateur ${username} connecté`);

    const response = NextResponse.json({
      user: toPublicUser(user),
      message: "Connexion réussie",
    });

    // Set secure httpOnly cookie with JWT
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 24 * 60 * 60, // 4 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Erreur de connexion" }, { status: 500 });
  }
}
