import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import logDbOperation from "@/lib/logDbOpertaion";
import { auth } from "@/auth";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        workspace: true,
        timeSlot: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
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

    const deletedBookings = await prisma.$transaction(async (tx) => {
      const bookings = await tx.booking.findMany({
        where: { id: { in: ids } },
        select: { timeSlotId: true },
      });
      const timeSlotIds = bookings.map((b) => b.timeSlotId);
      await tx.booking.deleteMany({ where: { id: { in: ids } } });
      await tx.timeSlot.updateMany({
        where: { id: { in: timeSlotIds } },
        data: { isBooked: false },
      });
      return bookings;
    });
    await logDbOperation(session.user.id, "delete", "booking", deletedBookings);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete bookings" },
      { status: 500 }
    );
  }
}
