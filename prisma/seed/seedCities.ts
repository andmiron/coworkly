import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/prisma";

export default async function seedCities() {
  console.log("Seeding cities... ⌛");
  const testCities: Prisma.CityCreateInput[] = [
    { name: "Kyiv" },
    { name: "Lviv" },
    { name: "Odesa" },
    { name: "Kharkiv" },
    { name: "Dnipro" },
    { name: "Zaporizhzhia" },
    { name: "Donetsk" },
    { name: "Luhansk" },
    { name: "Mykolaiv" },
    { name: "Khmelnytskyi" },
    { name: "Vinnytsia" },
    { name: "Zhytomyr" },
    { name: "Rivne" },
    { name: "Ivano-Frankivsk" },
    { name: "Sumy" },
    { name: "Kirovohrad" },
    { name: "Poltava" },
    { name: "Cherkasy" },
    { name: "Chernihiv" },
    { name: "Chernivtsi" },
    { name: "Lutsk" },
    { name: "Uzhhorod" },
    { name: "Ternopil" },
  ];

  for (const city of testCities) {
    await prisma.city.create({ data: city });
  }
  console.log("Cities seeded. ✅");
}
