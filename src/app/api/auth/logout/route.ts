import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  
  // Clear auth and profile cookies
  response.cookies.delete('token')
  response.cookies.delete('selectedProfileId')
  
  return response
}
