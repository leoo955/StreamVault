import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, details, userId } = await request.json()

    const log = await prisma.activityLog.create({
      data: {
        action,
        details: details || {},
        userId,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
