const ExcelJS = require('exceljs');
const path = require('path');

const DB_FILE = 'database.xlsx';

async function generateDatabase() {
    const workbook = new ExcelJS.Workbook();
    
    // 1. Hoja: Productos
    const productsSheet = workbook.addWorksheet('Productos');
    productsSheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Descripción', key: 'descripcion', width: 50 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Precio', key: 'precio', width: 10 },
        { header: 'Categoría', key: 'categoria', width: 20 },
    ];
    
    // Datos de ejemplo
    productsSheet.addRow({
        id: 'p-001',
        nombre: 'Martillo',
        descripcion: 'Martillo de acero forjado',
        cantidad: 50,
        precio: 25.50,
        categoria: 'Herramientas'
    });
    productsSheet.addRow({
        id: 'p-002',
        nombre: 'Casco Seguridad',
        descripcion: 'Casco industrial amarillo',
        cantidad: 100,
        precio: 15.00,
        categoria: 'EPP'
    });

    // 2. Hoja: Salidas
    const outputsSheet = workbook.addWorksheet('Salidas');
    outputsSheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'ProductoID', key: 'productoId', width: 36 },
        { header: 'NombreProducto', key: 'nombreProducto', width: 30 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Fecha', key: 'fecha', width: 25 },
        { header: 'Destinatario', key: 'destinatarioNombre', width: 30 },
        { header: 'Ficha', key: 'destinatarioFicha', width: 15 },
        { header: 'Área', key: 'destinatarioArea', width: 20 },
        { header: 'Firma', key: 'firmaDigital', width: 50 },
    ];

    // 3. Hoja: Usuarios (Opcional por ahora)
    const usersSheet = workbook.addWorksheet('Usuarios');
    usersSheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Username', key: 'username', width: 30 },
        { header: 'Role', key: 'role', width: 10 },
    ];

    const filePath = path.join(process.cwd(), DB_FILE);
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Archivo maestro generado exitosamente en: ${filePath}`);
}

generateDatabase().catch(console.error);
