import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export const revalidate = 0 // Disable cache

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

    // Fetch counts
    const [userCount, moviesCount, seriesCount, inviteCount] = await Promise.all([
      prisma.user.count(),
      prisma.media.count({ where: { type: 'movie' } }),
      prisma.media.count({ where: { type: 'series' } }),
      prisma.invitationCode.count({ where: { used: { lt: prisma.invitationCode.fields.maxUses } } })
    ])

    // Fetch recent activities
    const [recentUsers, recentMedia, recentInvites] = await Promise.all([
      prisma.user.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 3,
        select: { username: true, createdAt: true, email: true }
      }),
      prisma.media.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 3,
        select: { title: true, type: true, createdAt: true }
      }),
      prisma.invitationCode.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 3,
        select: { code: true, createdAt: true }
      })
    ])

    // Format activities
    const activities = [
      ...recentUsers.map(u => ({ 
        id: `u-${u.username}`, 
        action: 'Nouvel utilisateur', 
        user: u.username || u.email?.split('@')[0], 
        time: u.createdAt, 
        type: 'user' 
      })),
      ...recentMedia.map(m => ({ 
        id: `m-${m.title}`, 
        action: `${m.type === 'movie' ? 'Film' : 'Série'} ajouté`, 
        user: 'admin', 
        details: m.title, 
        time: m.createdAt, 
        type: 'media' 
      })),
      ...recentInvites.map(i => ({ 
        id: `i-${i.code}`, 
        action: 'Invitation créée', 
        user: 'admin', 
        details: i.code, 
        time: i.createdAt, 
        type: 'invite' 
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

    return NextResponse.json({
      stats: {
        users: userCount,
        movies: moviesCount,
        series: seriesCount,
        invites: inviteCount
      },
      activities
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
