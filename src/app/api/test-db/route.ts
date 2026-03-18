import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

// Admin-only diagnostic endpoint
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return NextResponse.json({ status: "ok" });
}
