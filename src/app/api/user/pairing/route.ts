import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getPairingCode, generatePairingCode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let code = await getPairingCode(user.id);
  
  if (!code) {
    code = await generatePairingCode(user.id);
  }

  return NextResponse.json({ 
    code: code.code, 
    expiresAt: code.expiresAt 
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = await generatePairingCode(user.id);

  return NextResponse.json({ 
    code: code.code, 
    expiresAt: code.expiresAt 
  });
}
