import { NextResponse } from 'next/server';
import { OutputService } from '@/modules/outputs/services/OutputService';
import { getAppMode } from '@/lib/app-config';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const mode = getAppMode();
  const outputService = new OutputService(mode);
  
  try {
    const success = await outputService.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'No se pudo eliminar la salida' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error al eliminar salida' }, { status: 500 });
  }
}
