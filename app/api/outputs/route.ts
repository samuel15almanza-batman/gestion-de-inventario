import { NextResponse } from 'next/server';
import { OutputService } from '@/modules/outputs/services/OutputService';
import { getAppMode } from '@/lib/app-config';

export async function GET() {
  const mode = getAppMode();
  const outputService = new OutputService(mode);
  try {
    const outputs = await outputService.getAll();
    return NextResponse.json(outputs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch outputs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const mode = getAppMode();
  const outputService = new OutputService(mode);
  try {
    const body = await request.json();
    const result = await outputService.register(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.output, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to register output' }, { status: 500 });
  }
}
