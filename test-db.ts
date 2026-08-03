import { PrismaClient } from './src/generated/client/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./streamvault.db' })
const prisma = new PrismaClient({ adapter } as any)

async function promoteUsers() {
  try {
    const updatedUsers = await prisma.user.updateMany({
      data: {
        role: 'admin',
        plan: 'ULTIMATE'
      }
    })
    console.log(`Updated ${updatedUsers.count} users to admin/ULTIMATE.`)

    // Mettre aussi à jour le code FIRST-INVITE pour donner le rôle admin et le plan ULTIMATE aux prochains inscrits
    await prisma.invitationCode.upsert({
      where: { code: 'FIRST-INVITE' },
      update: { role: 'admin', plan: 'ULTIMATE' },
      create: {
        code: 'FIRST-INVITE',
        maxUses: 1000,
        role: 'admin',
        plan: 'ULTIMATE',
        note: 'Code administrateur ultime'
      }
    })

    const users = await prisma.user.findMany()
    console.log('--- Current Users in Database ---')
    users.forEach(u => {
      console.log(`ID: ${u.id} | Email/User: ${u.email || u.username} | Role: ${u.role} | Plan: ${u.plan}`)
    })
    process.exit(0)
  } catch (err) {
    console.error('Failed:', err)
    process.exit(1)
  }
}

promoteUsers()
