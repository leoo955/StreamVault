import { NextRequest, NextResponse } from "next/server";
import { getUsers, toPublicUser, getAuthUser } from "@/lib/db";

// GET /api/users — list all users (admin only)
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const users = await getUsers();
  const publicUsers = users.map(toPublicUser).sort((a, b) => {
    // Admins first, then by date
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ users: publicUsers });
}
