import { PrismaClient } from '../src/generated/client/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const adminEmail = 'admin@streamvault.test'
  const adminPassword = 'adminpassword'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(adminPassword, salt)

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        salt,
        role: 'admin',
        plan: 'ULTIMATE',
      }
    })
    console.log('Admin user created: admin@streamvault.test / adminpassword')
  } else {
    console.log('Admin user already exists')
  }

  // Create an initial invitation code
  const code = 'FIRST-INVITE'
  const existingCode = await prisma.invitationCode.findUnique({
    where: { code }
  })

  if (!existingCode) {
    await prisma.invitationCode.create({
      data: {
        code,
        maxUses: 100,
        role: 'user',
        plan: 'STARTER',
        note: 'Initial invitation code'
      }
    })
    console.log('Initial invitation code created: FIRST-INVITE')
  } else {
    console.log('Invitation code already exists')
  }

  // Seed Media
  const movies = [
    {
      title: "Minecraft, le film",
      type: "movie",
      description: "Bienvenue dans le monde de Minecraft, où la créativité n'a pas de limites.",
      posterPath: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3676pT65yK3iXNf7w6IayP74l28.jpg",
      backdropPath: "https://image.tmdb.org/t/p/original/9v969O5N7YgEgh9pS6nshlR26tO.jpg",
      voteAverage: 7.8,
      runtime: 105
    },
    {
      title: "Pixels",
      type: "movie",
      description: "Des experts en jeux vidéo sont recrutés par l'armée pour combattre des personnages de jeux vidéo des années 80 qui attaquent New York.",
      posterPath: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      backdropPath: "https://image.tmdb.org/t/p/original/m99p9u3e9W6S5v6eM1hH9Yy9p6j.jpg",
      voteAverage: 5.7,
      runtime: 106
    }
  ]

  for (const movie of movies) {
    const existing = await prisma.media.findFirst({ where: { title: movie.title } })
    if (!existing) {
      await prisma.media.create({ data: movie })
      console.log(`Movie created: ${movie.title}`)
    }
  }

  const series = [
    {
      title: "L'Incroyable Cirque Numérique",
      type: "series",
      description: "Une femme se retrouve piégée dans un monde virtuel sur le thème du cirque avec cinq autres entités.",
      posterPath: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
      backdropPath: "https://image.tmdb.org/t/p/original/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg",
      voteAverage: 8.5
    }
  ]

  for (const s of series) {
    const existing = await prisma.media.findFirst({ where: { title: s.title } })
    if (!existing) {
      await prisma.media.create({ data: s })
      console.log(`Series created: ${s.title}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
