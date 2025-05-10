import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/prisma";

export default async function seedAmenities() {
  console.log("Seeding amenities... ⌛");
  const testAmenities: Prisma.AmenityCreateInput[] = [
    { name: "Wi-Fi" },
    { name: "Parking" },
    { name: "Coffee" },
    { name: "Tea" },
    { name: "Water" },
    { name: "Snacks" },
    { name: "Private Rooms" },
    { name: "Meeting Rooms" },
    { name: "Conference Rooms" },
    { name: "Event Spaces" },
    { name: "Private Offices" },
    { name: "Shared Offices" },
    { name: "Desks" },
  ];

  for (const amenity of testAmenities) {
    await prisma.amenity.create({ data: amenity });
  }
  console.log("Amenities seeded. ✅");
}
