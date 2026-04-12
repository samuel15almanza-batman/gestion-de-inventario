import { NextResponse } from 'next/server';
import { ProductService } from '@/modules/inventory/services/ProductService';
import { getAppMode } from '@/lib/app-config';

export async function GET() {
  const mode = getAppMode();
  const productService = new ProductService(mode);
  try {
    const products = await productService.getAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const mode = getAppMode();
  const productService = new ProductService(mode);
  try {
    const body = await request.json();
    
    // Validation
    const { nombre, cantidad, precio, categoria } = body;
    
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    if (cantidad === undefined || typeof cantidad !== 'number' || cantidad < 0) {
        return NextResponse.json({ error: 'La cantidad debe ser un número positivo' }, { status: 400 });
    }
    if (precio === undefined || typeof precio !== 'number' || precio < 0) {
        return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 });
    }
    if (!categoria || typeof categoria !== 'string') {
        return NextResponse.json({ error: 'La categoría es requerida' }, { status: 400 });
    }

    const product = await productService.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
