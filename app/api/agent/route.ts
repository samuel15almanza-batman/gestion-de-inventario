import { NextResponse } from 'next/server';
import { InventoryAgent } from '@/lib/agent';

// Instantiate agent per request to ensure fresh data or use singleton if repository handles freshness
// Since repository fetches fresh data on each call (via getWorkbook), it's safe.
const agent = new InventoryAgent();

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    const response = await agent.processQuery(query);
    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}
