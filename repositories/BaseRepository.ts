import ExcelDatabase from '../lib/excel';
import { Worksheet } from 'exceljs';

export abstract class BaseRepository<T> {
  protected db: ExcelDatabase;
  protected abstract sheetName: string;

  constructor() {
    this.db = ExcelDatabase.getInstance();
  }

  protected async getSheet(): Promise<Worksheet> {
    const workbook = await this.db.getWorkbook();
    let sheet = workbook.getWorksheet(this.sheetName);
    if (!sheet) {
        // If sheet doesn't exist, we might need to initialize it properly with headers
        // This should be handled by the database init, but as a fallback:
        sheet = workbook.addWorksheet(this.sheetName);
    }
    return sheet;
  }

  abstract getAll(): Promise<T[]>;
  abstract getById(id: string): Promise<T | null>;
  abstract create(item: T): Promise<T>;
  abstract update(id: string, item: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
