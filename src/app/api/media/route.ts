import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // "movie" or "series"
    const saga = searchParams.get('saga')

    const where: any = {}
    if (type) where.type = type
    if (saga) where.saga = saga

    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { seasons: true }
        }
      }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      tmdbId,
      type,
      title,
      description,
      posterPath,
      backdropPath,
      releaseDate,
      genres,
      studios,
      cast,
      voteAverage,
      runtime,
      saga
    } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and Title are required' }, { status: 400 })
    }

    const newMedia = await prisma.media.create({
      data: {
        tmdbId: tmdbId?.toString(),
        type,
        title,
        description,
        posterPath,
        backdropPath,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        genres: genres || [],
        studios: studios || [],
        cast: cast || [],
        voteAverage: voteAverage || 0,
        runtime: runtime || 0,
        saga
      }
    })

    return NextResponse.json(newMedia)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Media already exists' }, { status: 400 })
    }
    console.error('Error creating media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
