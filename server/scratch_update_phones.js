import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const updates = [
  { nombre: "KAILANI BETANCOURT", telefono: "6181227574" },
  { nombre: "ANAHI MARGARITA", telefono: "8281144890" },
  { nombre: "CESAR EMILIANO CHAVEZ", telefono: "8281485525" },
  { nombre: "MATEO ISRAEL CRUZ", telefono: "8281143253" },
  { nombre: "ELIAM DAMASO", telefono: "8281489584" },
  { nombre: "ANA SOFIA GARZA", telefono: "8281006104" },
  { nombre: "SEBASTIAN GONZALEZ", telefono: "8284577376" },
  { nombre: "AXEL ADRIAN LEYVA", telefono: "8282890706" },
  { nombre: "LUCIANA DEL CARMEN", telefono: "7206048033" },
  { nombre: "JOAQUIN ALONSO", telefono: "8281222157" }, // In DB: JOAQUIN ALONSO MORENO RODRIGUEZ, in img: Joaquin Alonso Mortera Rodriguez
  { nombre: "NATALIA JULIETTE", telefono: "8281442129" },
  { nombre: "JOSE VALENTIN", telefono: "8123675822" },
  { nombre: "GLADYS ISABELLA", telefono: "8129153122" },
  { nombre: "EVAN FERNANDO", telefono: "8282891657" },
  { nombre: "OMAR MATEO", telefono: "8110105665" },
  { nombre: "JOSE MAURICIO", telefono: "8119173172" },
  { nombre: "EVAN SORIANO", telefono: "8281051989" }
]

async function main() {
  const students = await prisma.student.findMany({
    where: {
      nivel: 'preescolar',
      grado: '1°' // from DB check
    }
  })

  for (const update of updates) {
    // Find the student whose name starts with the specified string
    const student = students.find(s => {
      const fullName = (s.nombre + " " + s.apellido).toUpperCase()
      return fullName.startsWith(update.nombre)
    })

    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: { telefono: update.telefono }
      })
      console.log(`Updated: ${student.nombre} ${student.apellido} -> ${update.telefono}`)
    } else {
      console.log(`Not found in DB: ${update.nombre}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
