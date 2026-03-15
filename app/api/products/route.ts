import { NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/ProductRepository';
import { ProductFactory } from '@/factories/ProductFactory';

const productRepo = new ProductRepository();

export async function GET() {
  try {
    const products = await productRepo.getAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const product = ProductFactory.create(body);
    await productRepo.create(product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
