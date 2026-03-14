import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/notifications
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const notifications = await getNotificationsForUser(user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark as read
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  if (body.markAll) {
    await markAllNotificationsRead(user.id);
  } else if (body.id) {
    await markNotificationRead(body.id, user.id);
  } else {
    return NextResponse.json({ error: "id ou markAll requis" }, { status: 400 });
  }

  return NextResponse.json({ message: "Mis à jour" });
}
