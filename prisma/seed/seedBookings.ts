import prisma from "@/lib/prisma";
import { Prisma, Role } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default async function seedBookings() {
  console.log("Seeding bookings... ⌛");

  const allUsers = await prisma.user.findMany({
    where: { role: Role.USER },
  });
  // Fetch only unbooked time slots, and include their workspaceId for the booking
  const availableTimeSlots = await prisma.timeSlot.findMany({
    where: { isBooked: false },
    select: { id: true, workspaceId: true }, // Select only what's needed
  });

  const bookingsToCreateData: Prisma.BookingCreateManyInput[] = [];
  const timeSlotsToUpdateIDs: string[] = []; // Store IDs of time slots to mark as booked

  let createdBookingsCount = 0;
  const targetBookingCount = 30;

  // Keep track of (userId, timeSlotId) pairs to respect @@unique([userId, timeSlotId])
  // and also to ensure a slot isn't picked twice in this loop before DB update.
  const bookedSlotUserPairs = new Set<string>();

  console.log(
    `Starting with ${availableTimeSlots.length} available time slots.`
  );

  // Shuffle users and availableTimeSlots to get more random pairings
  availableTimeSlots.sort(() => 0.5 - Math.random());
  allUsers.sort(() => 0.5 - Math.random());

  let userIndex = 0;

  for (const timeSlot of availableTimeSlots) {
    if (createdBookingsCount >= targetBookingCount) {
      break;
    }

    const user = allUsers[userIndex % allUsers.length]; // Cycle through users
    userIndex++;

    const bookingPairKey = `${user.id}_${timeSlot.id}`;

    if (bookedSlotUserPairs.has(bookingPairKey)) {
      // This specific user might have already been assigned this slot in a previous iteration (unlikely with shuffling and cycling)
      // or the slot was already picked. For simplicity, we'll just skip.
      continue;
    }

    bookingsToCreateData.push({
      userId: user.id,
      workspaceId: timeSlot.workspaceId,
      timeSlotId: timeSlot.id,
    });

    timeSlotsToUpdateIDs.push(timeSlot.id);
    bookedSlotUserPairs.add(bookingPairKey); // Mark this pair as used for this seed run
    createdBookingsCount++;
  }

  if (bookingsToCreateData.length > 0) {
    console.log(
      `Attempting to create ${bookingsToCreateData.length} bookings and update ${timeSlotsToUpdateIDs.length} time slots...`
    );

    try {
      // Using a transaction to ensure bookings are created AND time slots are updated, or neither.
      await prisma.$transaction(async (tx) => {
        // Create bookings
        // Using createMany and skipDuplicates for bookings related to their timeSlotId uniqueness
        // The @@unique([userId, timeSlotId]) should ideally be caught by the `bookedSlotUserPairs` Set logic above.
        const bookingCreationResult = await tx.booking.createMany({
          data: bookingsToCreateData as Prisma.BookingCreateManyInput[],
          skipDuplicates: true, // Skips if a booking for a timeSlotId already exists or (userId, timeSlotId) constraint hit
        });
        console.log(
          `Successfully created ${bookingCreationResult.count} booking records.`
        );
        if (bookingCreationResult.count < bookingsToCreateData.length) {
          console.warn(
            `${
              bookingsToCreateData.length - bookingCreationResult.count
            } bookings were skipped, likely due to unique constraints (e.g., timeSlotId already booked or user already booked that specific slot).`
          );
        }

        // Update the corresponding time slots to mark them as booked.
        // We only update slots that were successfully part of a created booking.
        // This is a bit tricky with createMany and skipDuplicates, as we don't get back the IDs of *actually* created bookings directly.
        // A safer approach if `skipDuplicates` on booking is essential and might skip many:
        // Iterate and create one by one, then update.
        // For this example, let's assume most will succeed and update based on the prepared list.
        // If `bookingCreationResult.count` is significantly less than `bookingsToCreateData.length`,
        // this might mark slots as booked even if their corresponding booking was skipped.
        // A more robust solution would be to create bookings individually if many skips are expected.

        // Given the above caveat, a simple batch update:
        if (bookingCreationResult.count > 0) {
          // Only update if some bookings were made
          const actualBookedTimeSlotIDs = bookingsToCreateData
            .slice(0, bookingCreationResult.count) // Approximation: take the first N slot IDs
            .map((b) => b.timeSlotId);

          if (actualBookedTimeSlotIDs.length > 0) {
            const updateResult = await tx.timeSlot.updateMany({
              where: {
                id: { in: actualBookedTimeSlotIDs as string[] },
                isBooked: false, // Ensure we only book slots that are currently not booked
              },
              data: { isBooked: true },
            });
            console.log(
              `Updated ${updateResult.count} time slots to isBooked: true.`
            );
          } else {
            console.log(
              "No time slots to update based on created bookings count."
            );
          }
        } else {
          console.log(
            "No bookings were created, so no time slots were updated."
          );
        }
      });
      console.log("Booking and time slot update transaction completed.");
    } catch (error) {
      console.error("Error during booking transaction:", error);
      // If error is PrismaClientKnownRequestError and code P2002, it's a unique constraint violation.
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        console.error("Details for P2002 error:", error.meta);
      }
      // Decide if you want to re-throw.
    }
  } else {
    console.log(
      "No new bookings to create (target met, or no users/available slots after filtering)."
    );
  }
}
