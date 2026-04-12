export interface Output {
  id: string;
  fecha: string;
  destinatarioNombre: string;
  destinatarioFicha: string;
  destinatarioArea: string;
  firmaDigital: string;
  totalProductos: number;
  totalCantidad: number;
  items: OutputItem[];
}

export interface OutputItem {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
}

export interface OutputCreateItemInput {
  productoId: string;
  cantidad: number;
}

export interface OutputCreateInput {
  items: OutputCreateItemInput[];
  destinatarioNombre: string;
  destinatarioFicha: string;
  destinatarioArea: string;
  firmaDigital: string;
}
