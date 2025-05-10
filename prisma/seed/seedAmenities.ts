import { prisma } from "../seed";
import { Prisma } from "@prisma/client";

export default async function seedAmenities() {
  console.log("Seeding amenities... ⌛");
  const testAmenities: Prisma.AmenityCreateInput[] = [
    { name: "Wi-Fi", icon: "FaWifi" },
    { name: "Parking", icon: "FaParking" },
    { name: "Coffee", icon: "FaCoffee" },
    { name: "Tea", icon: "FaCoffee" },
    { name: "Water", icon: "FaGlassWaterDroplet" },
    { name: "Snacks", icon: "FaCookieBite" },
    { name: "Private Rooms", icon: "FaUserSecret" },
    { name: "Meeting Rooms", icon: "FaUsers" },
    { name: "Conference Rooms", icon: "FaUsersRectangle" },
    { name: "Event Spaces", icon: "FaCalendar" },
    { name: "Private Offices", icon: "FaLock" },
    { name: "Shared Offices", icon: "FaUserLock" },
    { name: "Desks", icon: "FaDesktop" },
  ];

  for (const amenity of testAmenities) {
    await prisma.amenity.create({ data: amenity });
  }
  console.log("Amenities seeded. ✅");
}
