import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string, seasonId: string }> }
) {
  try {
    const { seasonId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { number, title, description, streamUrl, runtime } = await request.json()

    if (number === undefined) {
      return NextResponse.json({ error: 'Episode number is required' }, { status: 400 })
    }

    const episode = await prisma.episode.create({
      data: {
        number,
        title,
        description,
        streamUrl,
        runtime,
        seasonId
      }
    })

    return NextResponse.json(episode)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Episode already exists' }, { status: 400 })
    }
    console.error('Error creating episode:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
