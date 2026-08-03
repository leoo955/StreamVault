import { NextResponse } from 'next/server'
import prisma, { formatMedia } from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
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

    const userCount = await prisma.user.count()
    const mediaCount = await prisma.media.count()
    const movieCount = await prisma.media.count({ where: { type: 'movie' } })
    const seriesCount = await prisma.media.count({ where: { type: 'series' } })
    
    // Recent activity
    const recentLogs = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' }
    })

    // Most viewed (mock logic based on progress count)
    const mostViewed = await prisma.media.findMany({
      take: 5,
      include: { _count: { select: { progress: true } } },
      orderBy: { progress: { _count: 'desc' } }
    })

    return NextResponse.json({
      stats: {
        users: userCount,
        media: mediaCount,
        movies: movieCount,
        series: seriesCount
      },
      recentLogs,
      mostViewed: formatMedia(mostViewed)
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
