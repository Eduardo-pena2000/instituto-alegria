import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany({
    where: {
      nivel: 'preescolar',
      grado: '1'
    }
  })
  console.log("Found students:", students.length);
  students.forEach(s => console.log(`- ${s.nombre} ${s.apellido} (${s.grupo})`));
}

main().catch(console.error).finally(() => prisma.$disconnect())
