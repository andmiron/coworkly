import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import logDbOperation from "@/lib/logDbOpertaion";

export async function GET() {
  try {
    const timeslots = await prisma.timeSlot.findMany();
    return NextResponse.json(timeslots);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch timeslots" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, date, hour } = await req.json();
    if (!workspaceId || !date || typeof hour !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const timeslot = await prisma.timeSlot.create({
      data: {
        workspaceId,
        date: new Date(date),
        hour,
      },
    });
    await logDbOperation(session.user.id, "create", "timeSlot", timeslot);
    return NextResponse.json(timeslot, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create timeslot" },
      { status: 500 }
    );
  }
}
