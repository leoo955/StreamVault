import { NextResponse } from "next/server";
import { getAuthUser, resetUserPassword } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getAuthUser(request);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { newPassword } = await request.json();
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });
  }

  const success = await resetUserPassword(id, newPassword);
  if (!success) {
    return NextResponse.json({ error: "Échec de la réinitialisation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
