import { NextResponse } from 'next/server';

export async function POST() {
  // Handle webhook events
  return NextResponse.json({ message: 'Webhook received' });
}
