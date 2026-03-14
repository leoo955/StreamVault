import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSagasMetadata, updateSagaMetadata } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const sagas = await getSagasMetadata();
  return NextResponse.json({ sagas });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  try {
    const { name, bannerUrl } = await req.json();
    if (!name || !bannerUrl) {
      return NextResponse.json({ error: "Nom et URL requis" }, { status: 400 });
    }

    await updateSagaMetadata(name, bannerUrl);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
