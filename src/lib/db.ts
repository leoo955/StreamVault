import { PrismaClient } from '../generated/client/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const prismaClientSingleton = () => {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./streamvault.db' })
  return new PrismaClient({ adapter } as any)
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export function formatMedia(media: any): any {
  if (!media) return media
  if (Array.isArray(media)) {
    return media.map(formatMedia)
  }
  const formatted = { ...media }
  if (formatted.media) {
    formatted.media = formatMedia(formatted.media)
  }
  const parseJson = (val: any) => {
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch {
        return []
      }
    }
    return []
  }
  if ('genres' in formatted) formatted.genres = parseJson(formatted.genres)
  if ('studios' in formatted) formatted.studios = parseJson(formatted.studios)
  if ('cast' in formatted) formatted.cast = parseJson(formatted.cast)
  return formatted
}
