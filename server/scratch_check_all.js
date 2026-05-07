import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany()
  console.log("Total students:", students.length);
  students.forEach(s => console.log(`- ${s.nombre} ${s.apellido} (${s.nivel} ${s.grado})`));
}

main().catch(console.error).finally(() => prisma.$disconnect())
