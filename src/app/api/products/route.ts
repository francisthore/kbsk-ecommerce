import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get all products
  return NextResponse.json({ message: 'Products API endpoint' });
}

export async function POST(request: NextRequest) {
  // Create a new product
  return NextResponse.json({ message: 'Product created' });
}
