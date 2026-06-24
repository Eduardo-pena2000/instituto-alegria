/**
 * One-time migration script to hash all existing plain-text PINs.
 *
 * Run ONCE after deploying the bcrypt PIN changes:
 *   cd server && node scripts/migrate-pins.js
 *
 * This script detects plain-text PINs (short strings not starting with '$2')
 * and hashes them in place. Already-hashed PINs are skipped.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany({ select: { id: true, nombre: true, apellido: true, pin: true } })

  let migrated = 0
  let skipped = 0

  for (const student of students) {
    // Already hashed PINs start with '$2a$' or '$2b$'
    if (student.pin.startsWith('$2')) {
      skipped++
      continue
    }

    const hashedPin = await bcrypt.hash(student.pin, 10)
    await prisma.student.update({
      where: { id: student.id },
      data: { pin: hashedPin },
    })
    migrated++
    console.log(`✔ ${student.nombre} ${student.apellido} — PIN migrado`)
  }

  console.log(`\nMigración completada: ${migrated} PINs hasheados, ${skipped} ya estaban hasheados`)
}

main()
  .catch((e) => {
    console.error('Migration error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
