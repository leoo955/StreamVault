import { NextResponse } from 'next/server'
import { tmdb } from '@/lib/tmdb'
import { verifyJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') as 'movie' | 'tv' || 'movie'

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const details = await tmdb.getDetails(id, type)
    return NextResponse.json(details)
  } catch (error: any) {
    console.error('TMDB details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
