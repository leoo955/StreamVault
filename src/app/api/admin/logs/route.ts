import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getActivityLogs } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const logs = await getActivityLogs();
  return NextResponse.json({ logs });
}
