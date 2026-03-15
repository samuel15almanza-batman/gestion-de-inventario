import { BaseRepository } from './BaseRepository';
import { Product } from '../models/Product';
import { Row } from 'exceljs';

export class ProductRepository extends BaseRepository<Product> {
  protected sheetName = 'Productos';

  async getAll(): Promise<Product[]> {
    const sheet = await this.getSheet();
    const products: Product[] = [];
    sheet.eachRow((row: Row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        products.push(this.mapRowToProduct(row));
      }
    });
    return products;
  }

  async getById(id: string): Promise<Product | null> {
    const sheet = await this.getSheet();
    let found: Product | null = null;
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && row.getCell('id').value === id) {
            found = this.mapRowToProduct(row);
        }
    });
    return found;
  }

  async create(product: Product): Promise<Product> {
    const sheet = await this.getSheet();
    sheet.addRow({
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion,
        cantidad: product.cantidad,
        precio: product.precio,
        categoria: product.categoria
    });
    await this.db.save();
    return product;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
      const sheet = await this.getSheet();
      let foundRow: Row | null = null;
      sheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1 && row.getCell('id').value === id) {
              foundRow = row;
          }
      });

      if (foundRow) {
          if (updates.nombre !== undefined) foundRow.getCell('nombre').value = updates.nombre;
          if (updates.descripcion !== undefined) foundRow.getCell('descripcion').value = updates.descripcion;
          if (updates.cantidad !== undefined) foundRow.getCell('cantidad').value = updates.cantidad;
          if (updates.precio !== undefined) foundRow.getCell('precio').value = updates.precio;
          if (updates.categoria !== undefined) foundRow.getCell('categoria').value = updates.categoria;
          
          await this.db.save();
          return this.mapRowToProduct(foundRow);
      }
      return null;
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

  private mapRowToProduct(row: Row): Product {
      return {
          id: row.getCell('id').value as string,
          nombre: row.getCell('nombre').value as string,
          descripcion: row.getCell('descripcion').value as string,
          cantidad: Number(row.getCell('cantidad').value),
          precio: Number(row.getCell('precio').value),
          categoria: row.getCell('categoria').value as string,
      };
  }
}
