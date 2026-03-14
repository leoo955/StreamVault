import { NextRequest, NextResponse } from "next/server";
import { createUser, validateAndUseInvitationCode } from "@/lib/db";
import { createJWT } from "@/lib/jwt";

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const { username, password, inviteCode } = await request.json();

    if (!username || !password || !inviteCode) {
      return NextResponse.json(
        { error: "Nom d'utilisateur, mot de passe et code d'invitation requis" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Validate and consume the invitation code BEFORE creating user
    const isValidCode = await validateAndUseInvitationCode(inviteCode);
    if (!isValidCode) {
      return NextResponse.json(
        { error: "Code d'invitation invalide ou expiré" },
        { status: 403 }
      );
    }

    const user = await createUser(username, password);

    // Auto-login after register: create JWT
    const token = await createJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({ user, message: "Compte créé avec succès" });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 24 * 60 * 60, // 4 days
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la création du compte";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
