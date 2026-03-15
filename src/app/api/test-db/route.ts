import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Try a simple query
    const count = await prisma.user.count();
    return NextResponse.json({ 
      status: "success", 
      message: "Database connected", 
      userCount: count,
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    console.error("DB Test Error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}
