const XLSX = require('xlsx');
const path = require('path');

function readExcel(filePath) {
    try {
        console.log("Leyendo archivo:", filePath);
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        console.log("Hojas encontradas:", sheetNames);

        sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            // Get raw data to inspect headers
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(`\n--- Hoja: '${sheetName}' ---`);
            if (data.length > 0) {
                console.log("Encabezados:", data[0]);
                console.log("Ejemplo de datos (fila 2):", data[1] || "Sin datos");
            } else {
                console.log("Hoja vacía");
            }
        });
    } catch (error) {
        console.error("Error al leer el archivo Excel:", error.message);
    }
}

const filePath = 'c:\\Users\\erian\\OneDrive\\Escritorio\\proyecto samuel\\contabilidad bodega.xlsx';
readExcel(filePath);
