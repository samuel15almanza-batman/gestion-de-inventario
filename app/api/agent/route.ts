import { NextResponse } from 'next/server';
import { InventoryQueryService } from '@/modules/agent/services/InventoryQueryService';
import { getAppMode } from '@/lib/app-config';

export async function POST(request: Request) {
  const mode = getAppMode();
  const inventoryQueryService = new InventoryQueryService(mode);
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await inventoryQueryService.processQuery(query);
    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}
