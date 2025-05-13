import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import logDbOperation from "@/lib/logDbOpertaion";

const timeSlotBookSchema = z.object({
  timeSlotId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { timeSlotId } = await timeSlotBookSchema.parseAsync(
      await request.json()
    );

    if (!timeSlotId) {
      return NextResponse.json(
        { error: "Time slot ID is required" },
        { status: 400 }
      );
    }

    // Get the time slot and check if it's available
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { workspace: true },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    if (timeSlot.isBooked) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }

    // Create booking and update time slot in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      console.log(session.user, timeSlot.workspaceId, timeSlot.id);
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          workspaceId: timeSlot.workspaceId,
          timeSlotId: timeSlot.id,
        },
      });

      // Update the time slot
      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: { isBooked: true },
      });

      return newBooking;
    });

    await logDbOperation(session.user.id, "create", "booking", booking);

    // After successful booking, revalidate the workspace page
    revalidatePath(`/workspaces/${timeSlot.workspaceId}`);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error booking time slot:", error);
    return NextResponse.json(
      { error: "Failed to book time slot" },
      { status: 500 }
    );
  }
}
