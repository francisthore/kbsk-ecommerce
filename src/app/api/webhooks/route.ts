import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Handle webhook events
  return NextResponse.json({ message: 'Webhook received' });
}
