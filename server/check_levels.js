import prisma from './lib/prisma.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  console.log('--- Conectando a la base de datos ---');
  try {
    const stats = await prisma.student.groupBy({
      by: ['nivel', 'grado'],
      _count: { id: true },
      orderBy: [
        { nivel: 'asc' },
        { grado: 'asc' },
      ]
    });
    console.log('--- Distribución de Estudiantes ---');
    console.table(stats.map(s => ({
      Nivel: s.nivel,
      Grado: s.grado,
      Cantidad: s._count.id
    })));

    const total = await prisma.student.count();
    console.log('\nTotal de estudiantes en la base de datos:', total);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
