import { prisma } from "../seed";
import { Prisma, Role } from "@prisma/client";

export default async function seedWorkspaces() {
  console.log("Seeding workspaces... ⌛");
  const cities = await prisma.city.findMany();
  const amenities = await prisma.amenity.findMany();
  const workspaceManagers = await prisma.user.findMany({
    where: { role: Role.WORKSPACE_MANAGER },
  });

  const testWorkspaces: Prisma.WorkspaceCreateInput[] = [];

  for (let i = 0; i < 20; i++) {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomManager =
      workspaceManagers[Math.floor(Math.random() * workspaceManagers.length)];
    const uniqueName = `Workspace ${i + 1} - ${randomCity.name} (${
      Date.now().toString().slice(-5) + i
    })`;
    const uniqueAddress = `123 Main St, Suite ${
      Date.now().toString().slice(-5) + i
    }, ${randomCity.name}`;

    const amenitiesForWorkspace: { id: string }[] = [];
    if (amenities.length > 0) {
      const numAmenitiesToSelect =
        Math.floor(Math.random() * Math.min(5, amenities.length)) + 1;
      const availableAmenities = [...amenities];

      for (let k = 0; k < numAmenitiesToSelect; k++) {
        if (availableAmenities.length === 0) break;
        const randomIndex = Math.floor(
          Math.random() * availableAmenities.length
        );
        amenitiesForWorkspace.push({ id: availableAmenities[randomIndex].id });
        availableAmenities.splice(randomIndex, 1);
      }
    }

    testWorkspaces.push({
      name: uniqueName,
      description: `A cool co-working space in ${
        randomCity.name
      }, perfect for productivity. Workspace number ${i + 1}.`,
      address: uniqueAddress,
      latitude: parseFloat((Math.random() * (90 - -90) + -90).toFixed(6)),
      longitude: parseFloat((Math.random() * (180 - -180) + -180).toFixed(6)),
      city: {
        connect: { id: randomCity.id },
      },
      manager: {
        connect: { id: randomManager.id },
      },
      amenities: {
        connect: amenitiesForWorkspace,
      },
    });
  }

  for (const workspace of testWorkspaces) {
    await prisma.workspace.create({ data: workspace });
  }
  console.log("Workspaces seeded. ✅");
}
