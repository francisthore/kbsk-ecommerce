import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Cart API endpoint" });
}

export async function POST() {
  return NextResponse.json({ message: "Item added to cart" });
}
