import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    const { profileId, pin } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    })

    if (!profile || profile.userId !== payload.userId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If profile has a PIN, verify it
    if (profile.pin && profile.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
    }

    // In a real app, you might want to set a "selectedProfileId" cookie here
    const response = NextResponse.json({ 
      success: true, 
      profile: {
        id: profile.id,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        isChild: profile.isChild
      }
    })

    response.cookies.set('selectedProfileId', profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Error selecting profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
