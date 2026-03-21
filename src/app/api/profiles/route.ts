import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getAuthUser,
  getProfilesForUser,
  createProfile,
  updateProfile,
  deleteProfile,
  getUserById,
} from "@/lib/db";
import { getPlanFeatures } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await getProfilesForUser(user.id);
  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, avatarUrl, isKids, pin } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Enforce Plan Limits
  const fullUser = await getUserById(user.id);
  const plan = getPlanFeatures(fullUser?.plan || "Starter");
  const existing = await getProfilesForUser(user.id);

  if (existing.length >= plan.maxProfiles) {
    return NextResponse.json({ 
      error: `Limite de profils atteinte pour votre plan ${plan.name} (${plan.maxProfiles}). Passez au plan supérieur pour en ajouter d'autres.` 
    }, { status: 403 });
  }

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

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, avatarUrl, isKids, pin } = body;

  if (!id) return NextResponse.json({ error: "Profile ID required" }, { status: 400 });

  const updates: any = { name, avatarUrl, isKids };
  if (pin !== undefined) {
    updates.pin = pin === "" ? null : crypto.createHash("sha256").update(pin).digest("hex");
  }

  const profile = await updateProfile(id, updates);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ profile });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Profile ID required" }, { status: 400 });

  const success = await deleteProfile(id);
  return NextResponse.json({ success });
}
