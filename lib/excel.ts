import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const DB_FILE = 'database.xlsx';

class ExcelDatabase {
  private static instance: ExcelDatabase;
  private workbook: ExcelJS.Workbook;
  private filePath: string;

  private constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.filePath = path.join(process.cwd(), DB_FILE);
  }

  public static getInstance(): ExcelDatabase {
    if (!ExcelDatabase.instance) {
      ExcelDatabase.instance = new ExcelDatabase();
    }
    return ExcelDatabase.instance;
  }

  public async getWorkbook(): Promise<ExcelJS.Workbook> {
    if (fs.existsSync(this.filePath)) {
      await this.workbook.xlsx.readFile(this.filePath);
    } else {
      await this.initDatabase();
    }
    return this.workbook;
  }

  public async save(): Promise<void> {
    await this.workbook.xlsx.writeFile(this.filePath);
  }

  private async initDatabase() {
    // Create default sheets
    const sheets = ['Productos', 'Salidas', 'Usuarios'];
    sheets.forEach(sheet => {
      if (!this.workbook.getWorksheet(sheet)) {
        const worksheet = this.workbook.addWorksheet(sheet);
        
        if (sheet === 'Productos') {
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 36 },
                { header: 'Nombre', key: 'nombre', width: 30 },
                { header: 'Descripción', key: 'descripcion', width: 50 },
                { header: 'Cantidad', key: 'cantidad', width: 10 },
                { header: 'Precio', key: 'precio', width: 10 },
                { header: 'Categoría', key: 'categoria', width: 20 },
            ];
        } else if (sheet === 'Salidas') {
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 36 },
                { header: 'ProductoID', key: 'productoId', width: 36 },
                { header: 'NombreProducto', key: 'nombreProducto', width: 30 },
                { header: 'Cantidad', key: 'cantidad', width: 10 },
                { header: 'Fecha', key: 'fecha', width: 20 },
                { header: 'Destinatario', key: 'destinatarioNombre', width: 30 },
                { header: 'Ficha', key: 'destinatarioFicha', width: 15 },
                { header: 'Área', key: 'destinatarioArea', width: 20 },
                { header: 'Firma', key: 'firmaDigital', width: 50 },
            ];
        } else if (sheet === 'Usuarios') {
             worksheet.columns = [
                { header: 'ID', key: 'id', width: 36 },
                { header: 'Username', key: 'username', width: 30 },
                { header: 'Role', key: 'role', width: 10 },
            ];
        }
      }
    });
    await this.save();
  }
}

export default ExcelDatabase;
