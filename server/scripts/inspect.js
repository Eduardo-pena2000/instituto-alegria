import xlsx from 'xlsx';
import fs from 'fs';

try {
    const file = 'C:\\Users\\super\\Desktop\\instituto alumnos\\Preescolar A\\Preescolar Pimero.xls';
    const workbook = xlsx.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    fs.writeFileSync('parsed.json', JSON.stringify(data.slice(0, 2), null, 2));
} catch (e) {
    console.error(e);
}
