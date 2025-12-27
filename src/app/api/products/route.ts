import { NextResponse } from 'next/server';

export async function GET() {
  // Get all products
  return NextResponse.json({ message: 'Products API endpoint' });
}

export async function POST() {
  // Create a new product
  return NextResponse.json({ message: 'Product created' });
}
