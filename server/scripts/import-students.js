import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DATA_DIR = 'C:\\Users\\super\\Desktop\\instituto alumnos';

function getGradoFromFilename(filename) {
    const fn = filename.toLowerCase();
    if (fn.includes('primer')) return '1°';
    if (fn.includes('segundo')) return '2°';
    if (fn.includes('tercer')) return '3°';
    if (fn.includes('cuarto')) return '4°';
    if (fn.includes('quinto')) return '5°';
    if (fn.includes('sexto')) return '6°';
    return '1°'; // default fallback
}

function getNivelFromFolder(folderName) {
    const fn = folderName.toLowerCase();
    if (fn.includes('preescolar')) return 'preescolar';
    if (fn.includes('primaria')) return 'primaria';
    if (fn.includes('secundaria')) return 'secundaria';
    return 'primaria';
}

function processApellido(str) {
    if (!str) return '';
    // Fix messed up characters in names like 'я' for 'Ñ'
    return str.replace(/я/g, 'Ñ').trim();
}

async function main() {
    console.log('--- EMPEZANDO IMPORTACIÓN DE ALUMNOS ---');

    // 1. Borrar todos los estudiantes actuales y admin info de prueba si la hay (no borramos admin)
    console.log('Borrando estudiantes de prueba y sus pagos...');
    await prisma.student.deleteMany({});
    console.log('Estudiantes borrados.');

    const folders = fs.readdirSync(DATA_DIR).filter(f => fs.statSync(path.join(DATA_DIR, f)).isDirectory());

    let totalImported = 0;

    for (const folder of folders) {
        const nivel = getNivelFromFolder(folder);
        const folderPath = path.join(DATA_DIR, folder);

        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));

        for (const file of files) {
            const grado = getGradoFromFilename(file);
            console.log(`Procesando archivo: ${file} -> Nivel: ${nivel}, Grado: ${grado}`);

            const workbook = xlsx.readFile(path.join(folderPath, file));
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            for (const row of data) {
                // Find dynamic keys due to encoding issues
                const matriculaKey = Object.keys(row).find(k => k.toLowerCase().includes('matr')) || 'Matrícula';
                const matriculaStr = row[matriculaKey]?.toString()?.trim();

                const curp = row['CURP']?.toString()?.trim() || '';
                if (!curp) continue; // Skip empty rows

                const grupo = row['Grupo']?.toString()?.trim() || 'A';
                const apePaterno = processApellido(row['Apellido Paterno']);
                const apeMaterno = processApellido(row['Apellido Materno']);
                const nombre = row['Nombre']?.toString()?.trim() || '';
                const fechaNac = row['Fecha Nacimiento']?.toString()?.trim() || '';

                // Fallback email/phone since Excel doesn't have it
                const email = 'pendiente@' + curp.slice(0, 10).toLowerCase() + '.com';

                try {
                    await prisma.student.create({
                        data: {
                            matricula: matriculaStr || curp.substring(0, 8),
                            nombre: nombre,
                            apellido: `${apePaterno} ${apeMaterno}`.trim(),
                            nivel: nivel,
                            grado: grado,
                            grupo: grupo,
                            fechaNacimiento: fechaNac,
                            curp: curp,
                            telefono: 'Pendiente',
                            email: email,
                            direccion: 'Pendiente',
                            fechaInscripcion: new Date().toISOString().split('T')[0],
                            ultimoPago: null
                        }
                    });
                    totalImported++;
                } catch (err) {
                    console.error(`Error importando CURP: ${curp} - ${err.message}`);
                }
            }
        }
    }

    console.log(`--- IMPORTACIÓN COMPLETADA: ${totalImported} alumnos insertados ---`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
