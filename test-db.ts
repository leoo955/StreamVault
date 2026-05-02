import { PrismaClient } from './src/generated/client/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function test() {
  try {
    const invitations = await prisma.invitationCode.findMany()
    console.log('--- Invitation Codes Final Verification ---')
    invitations.forEach(c => {
        console.log(`Code: ${c.code} | Used: ${c.used}/${c.maxUses}`)
    })
    process.exit(0)
  } catch (err) {
    console.error('Verification failed:', err)
    process.exit(1)
  }
}

test()
