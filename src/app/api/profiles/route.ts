import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  getProfilesForUser,
  createProfile,
  updateProfile,
  deleteProfile,
} from "@/lib/db";
import crypto from "crypto";

// GET /api/profiles — list profiles for logged-in user
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await getProfilesForUser(user.id);
  return NextResponse.json({ profiles });
}

// POST /api/profiles — create a new profile
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, avatarUrl, isKids, pin } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Max 5 profiles per user
  const existing = await getProfilesForUser(user.id);
  if (existing.length >= 5) {
    return NextResponse.json({ error: "Maximum 5 profiles" }, { status: 400 });
  }

  // Hash pin if provided
  const hashedPin = pin ? crypto.createHash("sha256").update(pin).digest("hex") : undefined;

  const profile = await createProfile(
    user.id,
    name,
    avatarUrl || "",
    isKids || false,
    hashedPin
  );

  return NextResponse.json({ profile }, { status: 201 });
}

// PUT /api/profiles — update profile
export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, avatarUrl, isKids, pin } = body;

  if (!id) return NextResponse.json({ error: "Profile ID required" }, { status: 400 });

  const updates: any = { name, avatarUrl, isKids };
  if (pin !== undefined) {
    updates.pin = pin ? crypto.createHash("sha256").update(pin).digest("hex") : null;
  }

  const profile = await updateProfile(id, updates);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ profile });
}

// DELETE /api/profiles — delete profile
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Profile ID required" }, { status: 400 });

  const success = await deleteProfile(id);
  return NextResponse.json({ success });
}
