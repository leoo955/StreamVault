import { NextRequest, NextResponse } from "next/server";
import { deleteInvitationCode, getAuthUser, prisma } from "@/lib/db";

// GET /api/invitations/[code] — validate a code without consuming it
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  const params = await props.params;
  const code = params.code.toUpperCase();

  const invite = await prisma.invitationCode.findUnique({
    where: { code }
  });

  if (!invite) {
    return NextResponse.json({ error: "Code invalide" }, { status: 404 });
  }

  // Check usage
  if (invite.usedCount >= invite.maxUses) {
    return NextResponse.json({ error: "Code déjà utilisé au maximum" }, { status: 403 });
  }

  // Check expiration
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code expiré" }, { status: 403 });
  }

  return NextResponse.json({ 
    valid: true, 
    role: invite.role, 
    plan: invite.plan 
  });
}

// DELETE /api/invitations/[code] — delete an invitation code
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  const params = await props.params;
  const adminUser = await getAuthUser(request);
  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const success = await deleteInvitationCode(params.code);
  if (!success) {
    return NextResponse.json({ error: "Code non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Code supprimé" });
}
