import prisma from "@/lib/prisma";
import { Prisma, Role } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function seedUsers() {
  console.log("Seeding users... ⌛");

  const testUsers: Prisma.UserCreateInput[] = [
    await createUser("superadmin", "superadmin", Role.SUPER_ADMIN),
    await createUser("admin", "admin", Role.ADMIN),
    await createUser("user", "user", Role.USER),
    await createUser("test", "test", Role.USER),
  ];

  async function createUser(username: string, password: string, role: Role) {
    return {
      username,
      password: await hashPassword(password),
      role,
    };
  }

  async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  for (const user of testUsers) {
    await prisma.user.create({ data: user });
  }
  console.log("Users seeded. ✅");
}
