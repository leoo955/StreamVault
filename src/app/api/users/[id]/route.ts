import { NextRequest, NextResponse } from "next/server";
import { updateUserRole, deleteUser, getAuthUser } from "@/lib/db";

// PATCH /api/users/[id] — update user role
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const adminUser = await getAuthUser(request);
  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Prevent admin from modifying their own role to avoid lockout
  if (params.id === adminUser.id) {
     return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle" }, { status: 400 });
  }

  try {
    const { role, plan } = await request.json();
    
    if (role && role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    if (plan && !["Starter", "Premium", "Ultimate"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const { updateUserRole, updateUserPlan } = await import("@/lib/db");
    
    let success = false;
    if (role) {
      success = await updateUserRole(params.id, role);
    }
    if (plan) {
      success = await updateUserPlan(params.id, plan);
    }

    if (!success && (role || plan)) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Utilisateur mis à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — delete user
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const adminUser = await getAuthUser(request);
  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Prevent admin from deleting themselves
  if (params.id === adminUser.id) {
     return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  const success = await deleteUser(params.id);
  if (!success) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
}
