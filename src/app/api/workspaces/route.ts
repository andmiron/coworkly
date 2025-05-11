import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        city: true,
        amenities: true,
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}
