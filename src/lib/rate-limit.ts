const cache = new Map<string, { count: number; lastRequest: number }>()

export async function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now()
  const userData = cache.get(ip) || { count: 0, lastRequest: now }

  if (now - userData.lastRequest > windowMs) {
    userData.count = 1
    userData.lastRequest = now
  } else {
    userData.count++
  }

  cache.set(ip, userData)

  return userData.count <= limit
}
