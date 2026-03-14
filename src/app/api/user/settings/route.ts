import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, updateUserPreferences, changePassword, getUserById } from "@/lib/db";

// GET /api/user/settings
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

// PUT /api/user/settings — update preferences
export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { preferences, oldPassword, newPassword } = body;

    // Change password if requested
    if (oldPassword && newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Le nouveau mot de passe doit faire au moins 6 caractères" },
          { status: 400 }
        );
      }
      const success = await changePassword(user.id, oldPassword, newPassword);
      if (!success) {
        return NextResponse.json(
          { error: "Ancien mot de passe incorrect" },
          { status: 400 }
        );
      }
    }

    // Update preferences if provided
    if (preferences) {
      const updated = await updateUserPreferences(user.id, preferences);
      if (!updated) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }
      return NextResponse.json({ user: updated, message: "Préférences mises à jour" });
    }

    return NextResponse.json({ message: "Paramètres mis à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
