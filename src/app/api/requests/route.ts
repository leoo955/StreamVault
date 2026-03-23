import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { title, type, tmdbId } = await req.json();

    if (!title || !type) {
      return new NextResponse("Titre et type requis", { status: 400 });
    }

    const request = await prisma.mediaRequest.create({
      data: {
        title,
        type,
        tmdbId: tmdbId ? parseInt(tmdbId) : null,
        requestedById: user.id,
        status: "PENDING"
      }
    });

    return NextResponse.json(request);
  } catch (error: any) {
    console.error("Failed to create request:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    let requests;
    if (user.role === "admin") {
      // Admins see all requests
      requests = await prisma.mediaRequest.findMany({
        orderBy: { createdAt: "desc" }
      });
    } else {
      // Users see only their own requests
      requests = await prisma.mediaRequest.findMany({
        where: { requestedById: user.id },
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Failed to fetch requests:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
