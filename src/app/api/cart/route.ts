import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get cart items
  return NextResponse.json({ message: 'Cart API endpoint' });
}

export async function POST(request: NextRequest) {
  // Add item to cart
  return NextResponse.json({ message: 'Item added to cart' });
}
