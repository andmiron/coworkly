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
  const slotsPerWorkspace = 50; // Slots per workspace
  let totalCreatedSlots = 0;

  // Helper to ensure we only use the date part (no time) for unique checks and storage
  const getUTCDateOnly = (date: Date): Date => {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  };

  // Keep track of created slots to ensure uniqueness
  const existingSlotKeys = new Set<string>();

  // Pre-populate with existing slots from the DB
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

  // Loop through workspaces
  for (const workspace of workspaces) {
    let workspaceSlotCount = 0;

    // Loop through days and hours for each workspace
    for (let dayOffset = 0; dayOffset < numberOfDaysToSeed; dayOffset++) {
      const currentDate = new Date();
      currentDate.setUTCDate(currentDate.getUTCDate() + dayOffset);
      const slotDate = getUTCDateOnly(currentDate);

      for (let hour = startHour; hour <= endHour; hour++) {
        if (workspaceSlotCount >= slotsPerWorkspace) {
          break; // Move to next workspace
        }

        const slotKey = `${workspace.id}_${slotDate.toISOString()}_${hour}`;
        if (!existingSlotKeys.has(slotKey)) {
          timeSlotsToCreate.push({
            workspaceId: workspace.id,
            date: slotDate,
            hour: hour,
          });
          existingSlotKeys.add(slotKey);
          workspaceSlotCount++;
          totalCreatedSlots++;
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
        skipDuplicates: true,
      });
      console.log(`Successfully created ${result.count} time slots. ✅`);
      console.log(
        `Total slots created across ${workspaces.length} workspaces.`
      );
      if (result.count < timeSlotsToCreate.length) {
        console.warn(
          `${timeSlotsToCreate.length - result.count} time slots were skipped.`
        );
      }
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        console.warn("A unique constraint violation occurred.");
      } else {
        console.error("Error creating time slots:", error);
      }
    }
  } else {
    console.log("No new time slots to create.");
  }
}
