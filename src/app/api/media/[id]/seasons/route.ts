import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: mediaId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { number } = await request.json()

    if (number === undefined) {
      return NextResponse.json({ error: 'Season number is required' }, { status: 400 })
    }

    const season = await prisma.season.create({
      data: {
        number,
        mediaId
      }
    })

    return NextResponse.json(season)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Season already exists' }, { status: 400 })
    }
    console.error('Error creating season:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
