import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany();
    return NextResponse.json(amenities);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch amenities" },
      { status: 500 }
    );
  }
}
