import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: id,
      },
      include: {
        city: true,
        amenities: true,
        timeSlots: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace details:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace details" },
      { status: 500 }
    );
  }
}
