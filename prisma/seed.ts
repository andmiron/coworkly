import { PrismaClient } from "@prisma/client";
import seedUsers from "./seed/seedUsers";
import seedCities from "./seed/seedCities";
import seedAmenities from "./seed/seedAmenities";
import seedWorkspaces from "./seed/seedWorkspaces";
import seedTimeslots from "./seed/seedTimeslots";
import seedBookings from "./seed/seedBookings";

export const prisma = new PrismaClient();

export async function main() {
  await seedUsers();
  await seedCities();
  await seedAmenities();
  await seedWorkspaces();
  await seedTimeslots();
  await seedBookings();
}

main()
  .then(async () => {
    console.log("Seeding completed ✅✅✅");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
