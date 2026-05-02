import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { signJWT } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const { identifier, password, invitationCode } = await request.json()

    if (!identifier || !password || !invitationCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify invitation code
    const code = await prisma.invitationCode.findUnique({
      where: { code: invitationCode },
    })

    if (!code || (code.expiresAt && code.expiresAt < new Date()) || code.used >= code.maxUses) {
      return NextResponse.json({ error: 'Invalid or expired invitation code' }, { status: 400 })
    }

    const isEmail = identifier.includes('@')
    const email = isEmail ? identifier : null
    const username = isEmail ? identifier.split('@')[0] : identifier

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          { username }
        ]
      }
    })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        salt,
        role: code.role,
        plan: code.plan,
      },
    })

    // Increment code usage
    await prisma.invitationCode.update({
      where: { code: code.code },
      data: { used: { increment: 1 } },
    })

    // Sign JWT
    const token = await signJWT({ userId: user.id, email: user.email, role: user.role })

    const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
