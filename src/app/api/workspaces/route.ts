import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import logDbOperation from "@/lib/logDbOpertaion";

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        city: true,
        manager: true,
        amenities: true,
        timeSlots: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(workspaces);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const deletedWorkspaces = await prisma.$transaction(async (tx) => {
      const workspaces = await tx.workspace.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
        },
      });
      await tx.workspace.deleteMany({
        where: { id: { in: ids } },
      });
      return workspaces;
    });

    await logDbOperation(
      session.user.id,
      "delete",
      "workspace",
      deletedWorkspaces
    );
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, address, cityId, managerId, amenitiesIds } =
      await req.json();

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        address,
        cityId,
        managerId,
        amenities: {
          connect: amenitiesIds.map((id: string) => ({ id })),
        },
      },
      include: {
        city: true,
        manager: true,
        amenities: true,
      },
    });

    await logDbOperation(session.user.id, "create", "workspace", workspace);
    return NextResponse.json(workspace, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
