import {
  PrismaClient,
  Prisma,
  Role,
  City,
  Workspace,
  Amenity,
  TimeSlot,
} from "../../prisma_generated/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export { Prisma, Role };

export type { Workspace, City, Amenity, TimeSlot };
