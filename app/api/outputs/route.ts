import { NextResponse } from 'next/server';
import { OutputRepository } from '@/repositories/OutputRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import { OutputFactory } from '@/factories/OutputFactory';

const outputRepo = new OutputRepository();
const productRepo = new ProductRepository();

export async function GET() {
  try {
    const outputs = await outputRepo.getAll();
    return NextResponse.json(outputs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch outputs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productoId, cantidad, destinatarioNombre, destinatarioFicha, destinatarioArea, firmaDigital } = body;

    // Validation
    if (!productoId || typeof productoId !== 'string') {
        return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }
    if (!cantidad || typeof cantidad !== 'number' || cantidad <= 0) {
        return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
    }
    if (!destinatarioNombre || typeof destinatarioNombre !== 'string') {
        return NextResponse.json({ error: 'Nombre del destinatario requerido' }, { status: 400 });
    }
    if (!destinatarioFicha || typeof destinatarioFicha !== 'string') {
        return NextResponse.json({ error: 'Ficha requerida' }, { status: 400 });
    }
    if (!destinatarioArea || typeof destinatarioArea !== 'string') {
        return NextResponse.json({ error: 'Área requerida' }, { status: 400 });
    }
    if (!firmaDigital || typeof firmaDigital !== 'string') {
        return NextResponse.json({ error: 'Firma digital requerida' }, { status: 400 });
    }

    // 1. Validate Product Availability
    const product = await productRepo.getById(productoId);
    if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    if (product.cantidad < cantidad) {
        return NextResponse.json({ error: `Stock insuficiente. Disponible: ${product.cantidad}` }, { status: 400 });
    }

    // 2. Decrement Product Quantity
    const updatedProduct = await productRepo.update(productoId, { cantidad: product.cantidad - cantidad });
    if (!updatedProduct) {
        return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 500 });
    }

    // 3. Create Output Record
    const outputData = {
        ...body,
        nombreProducto: product.nombre // Store snapshot of name
    };
    
    const output = OutputFactory.create(outputData);
    await outputRepo.create(output);

    return NextResponse.json(output, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process output' }, { status: 500 });
  }
}
