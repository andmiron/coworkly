import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default async function seedTimeslots() {
  console.log("Seeding time slots... ⌛");
  const workspaces = await prisma.workspace.findMany();

  const timeSlotsToCreate: Prisma.TimeSlotCreateManyInput[] = [];

  const numberOfDaysToSeed = 7; // Seed for the next 7 days
  const startHour = 9; // 9:00
  const endHour = 17; // 17:00
  let createdSlotsCount = 0;
  const targetSlotCount = 50;

  // Helper to ensure we only use the date part (no time) for unique checks and storage
  const getUTCDateOnly = (date: Date): Date => {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  };

  // Keep track of created slots to ensure uniqueness (workspaceId_dateISO_hour)
  const existingSlotKeys = new Set<string>();

  // Pre-populate with existing slots from the DB to avoid duplicates if seed is run multiple times
  const dbTimeSlots = await prisma.timeSlot.findMany({
    select: { workspaceId: true, date: true, hour: true },
  });
  dbTimeSlots.forEach((slot) => {
    existingSlotKeys.add(
      `${slot.workspaceId}_${getUTCDateOnly(slot.date).toISOString()}_${
        slot.hour
      }`
    );
  });

  // Loop through workspaces, then days, then hours
  // Label for breaking out of nested loops
  outerLoop: for (const workspace of workspaces) {
    for (let dayOffset = 0; dayOffset < numberOfDaysToSeed; dayOffset++) {
      const currentDate = new Date();
      currentDate.setUTCDate(currentDate.getUTCDate() + dayOffset); // Work with UTC dates
      const slotDate = getUTCDateOnly(currentDate);

      for (let hour = startHour; hour <= endHour; hour++) {
        if (createdSlotsCount >= targetSlotCount) {
          break outerLoop; // Reached target, stop all loops
        }

        const slotKey = `${workspace.id}_${slotDate.toISOString()}_${hour}`;
        if (!existingSlotKeys.has(slotKey)) {
          timeSlotsToCreate.push({
            workspaceId: workspace.id,
            date: slotDate,
            hour: hour,
            // isBooked defaults to false, so not strictly necessary here
          });
          existingSlotKeys.add(slotKey); // Add to set to prevent duplicates in this run
          createdSlotsCount++;
        }
      }
    }
  }

  if (timeSlotsToCreate.length > 0) {
    console.log(
      `Attempting to create ${timeSlotsToCreate.length} new time slots...`
    );

    try {
      const result = await prisma.timeSlot.createMany({
        data: timeSlotsToCreate,
        skipDuplicates: true, // This will silently skip if a unique constraint is violated
      });
      console.log(`Successfully created ${result.count} time slots. ✅`);
      if (result.count < timeSlotsToCreate.length) {
        console.warn(
          `${
            timeSlotsToCreate.length - result.count
          } time slots were skipped, likely due to already existing (unique constraint).`
        );
      }
    } catch (error) {
      // createMany with skipDuplicates should ideally prevent P2002, but as a fallback:
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        console.warn(
          "A unique constraint violation occurred even with skipDuplicates. This is unexpected. Some time slots might not have been created."
        );
      } else {
        console.error("Error creating time slots:", error);
        // Decide if you want to re-throw or not.
        // For seeding, often it's okay to continue if some non-critical parts fail.
        // throw error;
      }
    }
  } else {
    console.log(
      "No new time slots to create (either target met or all potential slots for the period already exist)."
    );
  }
}
