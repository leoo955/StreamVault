import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "data", "announcements.json");

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "promo";
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  createdAt: string;
  active: boolean;
}

async function readAnnouncements(): Promise<Announcement[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAnnouncements(data: Announcement[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * GET /api/announcements — Get active announcements (public)
 */
export async function GET() {
  const all = await readAnnouncements();
  const active = all.filter((a) => a.active);
  return NextResponse.json({ announcements: active });
}

/**
 * POST /api/announcements — Create a new announcement (admin only)
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const { title, message, type, imageUrl, buttonText, buttonUrl } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
  }

  const announcements = await readAnnouncements();
  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    message,
    type: type || "info",
    imageUrl: imageUrl || undefined,
    buttonText: buttonText || undefined,
    buttonUrl: buttonUrl || undefined,
    createdAt: new Date().toISOString(),
    active: true,
  };

  announcements.unshift(newAnnouncement);
  await writeAnnouncements(announcements);

  return NextResponse.json({ announcement: newAnnouncement });
}

/**
 * DELETE /api/announcements — Delete/deactivate an announcement (admin only)
 */
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await request.json();
  const announcements = await readAnnouncements();
  const updated = announcements.filter((a) => a.id !== id);
  await writeAnnouncements(updated);

  return NextResponse.json({ ok: true });
}
