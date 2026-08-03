import { NextResponse } from 'next/server'
import prisma, { formatMedia } from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')
    const episodeId = searchParams.get('episodeId')

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!mediaId) {
      // Get all progress for user (for "Continue Watching" row)
      const allProgress = await prisma.progress.findMany({
        where: { userId: payload.userId },
        include: { media: true, episode: true },
        orderBy: { updatedAt: 'desc' }
      })
      return NextResponse.json(formatMedia(allProgress))
    }

    const progress = await prisma.progress.findFirst({
      where: {
        userId: payload.userId,
        mediaId,
        episodeId: episodeId || null
      }
    })

    return NextResponse.json(progress || { position: 0, isCompleted: false })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mediaId, episodeId, position, duration, isCompleted } = await request.json()

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_mediaId_episodeId: {
          userId: payload.userId,
          mediaId,
          episodeId: episodeId || (null as any)
        }
      },
      update: {
        position: position || 0,
        duration: duration || 0,
        isCompleted: isCompleted || false,
      },
      create: {
        userId: payload.userId,
        mediaId,
        episodeId: episodeId || null,
        position: position || 0,
        duration: duration || 0,
        isCompleted: isCompleted || false,
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
