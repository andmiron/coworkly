import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [users, workspaces, bookings, cities, amenities] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.booking.count(),
      prisma.city.count(),
      prisma.amenity.count(),
    ]);
    return NextResponse.json({
      users,
      workspaces,
      bookings,
      cities,
      amenities,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
