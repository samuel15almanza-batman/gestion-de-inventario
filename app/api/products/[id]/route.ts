import { NextResponse } from 'next/server';
import { ProductService } from '@/modules/inventory/services/ProductService';
import { getAppMode } from '@/lib/app-config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mode = getAppMode();
  const productService = new ProductService(mode);
  try {
    const product = await productService.getById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mode = getAppMode();
  const productService = new ProductService(mode);
  try {
    const body = await request.json();
    const updatedProduct = await productService.update(id, body);
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mode = getAppMode();
  const productService = new ProductService(mode);
  try {
    await productService.delete(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error(error);
    // Si el error es por salidas registradas, devolvemos un 400 Bad Request con el mensaje
    if (error.message && error.message.includes('salidas registradas')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
