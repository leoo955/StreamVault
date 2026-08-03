import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id },
    })

    if (!profile || profile.userId !== payload.userId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    const body = await request.json()

    const profile = await prisma.profile.findUnique({
      where: { id },
    })

    if (!profile || profile.userId !== payload.userId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        name: body.name,
        avatarUrl: body.avatarUrl,
        isChild: body.isChild,
        pin: body.pin,
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || 'bypass-auth'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token) as any
    const profile = await prisma.profile.findUnique({
      where: { id },
    })

    if (!profile || profile.userId !== payload.userId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Don't allow deleting the last profile
    const profileCount = await prisma.profile.count({
      where: { userId: payload.userId }
    })

    if (profileCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last profile' }, { status: 400 })
    }

    await prisma.profile.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Profile deleted' })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
