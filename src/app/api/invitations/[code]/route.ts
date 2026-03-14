import { NextRequest, NextResponse } from "next/server";
import { deleteInvitationCode, getAuthUser } from "@/lib/db";

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
