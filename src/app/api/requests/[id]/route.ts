import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const { status, note } = await req.json();

    if (!status || !["PENDING", "FULFILLED", "REJECTED"].includes(status)) {
      return new NextResponse("Statut invalide", { status: 400 });
    }

    const updated = await prisma.mediaRequest.update({
      where: { id },
      data: { status, note }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.mediaRequest.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
