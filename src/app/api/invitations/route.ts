import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
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

    const codes = await prisma.invitationCode.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(codes)
  } catch (error) {
    console.error('Error fetching invitation codes:', error)
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

    const { code, maxUses, role, plan, expiresAt, note } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const newCode = await prisma.invitationCode.create({
      data: {
        code,
        maxUses: maxUses || 1,
        role: role || 'user',
        plan: plan || 'STARTER',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        note,
      },
    })

    return NextResponse.json(newCode)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
    }
    console.error('Error creating invitation code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.invitationCode.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Code deleted' })
  } catch (error) {
    console.error('Error deleting invitation code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
