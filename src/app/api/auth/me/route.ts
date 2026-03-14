import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

// GET /api/auth/me — returns current user
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
