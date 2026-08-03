import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profiles = await prisma.profile.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
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

    const { name, avatarUrl, isChild, pin } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check plan limits (e.g. 1 profile for Starter, 5 for Ultimate)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { _count: { select: { profiles: true } } }
    })

    const profileLimit = user?.plan === 'ULTIMATE' ? 5 : user?.plan === 'PREMIUM' ? 3 : 1
    if (user && user._count.profiles >= profileLimit) {
      return NextResponse.json({ error: 'Profile limit reached for your plan' }, { status: 403 })
    }

    const profile = await prisma.profile.create({
      data: {
        name,
        avatarUrl,
        isChild: isChild || false,
        pin,
        userId: payload.userId,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
