import { BaseRepository } from './BaseRepository';
import { Output } from '../models/Output';
import { Row } from 'exceljs';

export class OutputRepository extends BaseRepository<Output> {
  protected sheetName = 'Salidas';

  async getAll(): Promise<Output[]> {
    const sheet = await this.getSheet();
    const outputs: Output[] = [];
    sheet.eachRow((row: Row, rowNumber) => {
      if (rowNumber > 1) {
        outputs.push(this.mapRowToOutput(row));
      }
    });
    return outputs;
  }

  async getById(id: string): Promise<Output | null> {
    const sheet = await this.getSheet();
    let found: Output | null = null;
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && row.getCell('id').value === id) {
            found = this.mapRowToOutput(row);
        }
    });
    return found;
  }

  async create(output: Output): Promise<Output> {
    const sheet = await this.getSheet();
    sheet.addRow({
        id: output.id,
        productoId: output.productoId,
        nombreProducto: output.nombreProducto,
        cantidad: output.cantidad,
        fecha: output.fecha,
        destinatarioNombre: output.destinatarioNombre,
        destinatarioFicha: output.destinatarioFicha,
        destinatarioArea: output.destinatarioArea,
        firmaDigital: output.firmaDigital
    });
    await this.db.save();
    return output;
  }

  async delete(id: string): Promise<boolean> {
      const sheet = await this.getSheet();
      let rowNumberToDelete = -1;
      sheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1 && row.getCell('id').value === id) {
              rowNumberToDelete = rowNumber;
          }
      });

      if (rowNumberToDelete !== -1) {
          sheet.spliceRows(rowNumberToDelete, 1);
          await this.db.save();
          return true;
      }
      return false;
  }

  async update(id: string, updates: Partial<Output>): Promise<Output | null> {
       // Generally outputs are immutable logs, but for completeness:
       return null; // Not implemented for safety
  }

  private mapRowToOutput(row: Row): Output {
      return {
          id: row.getCell('id').value as string,
          productoId: row.getCell('productoId').value as string,
          nombreProducto: row.getCell('nombreProducto').value as string,
          cantidad: Number(row.getCell('cantidad').value),
          fecha: row.getCell('fecha').value as string,
          destinatarioNombre: row.getCell('destinatarioNombre').value as string,
          destinatarioFicha: row.getCell('destinatarioFicha').value as string,
          destinatarioArea: row.getCell('destinatarioArea').value as string,
          firmaDigital: row.getCell('firmaDigital').value as string,
      };
  }
}
