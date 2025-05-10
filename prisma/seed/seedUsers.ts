import prisma from "@/lib/prisma";
import { Prisma, Role } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function seedUsers() {
  console.log("Seeding users... ⌛");

  const testUsers: Prisma.UserCreateInput[] = [
    await createUser("admin", "admin", Role.SUPER_ADMIN),
    await createUser("manager", "manager", Role.WORKSPACE_MANAGER),
    await createUser("manager2", "manager2", Role.WORKSPACE_MANAGER),
    await createUser("manager3", "manager3", Role.WORKSPACE_MANAGER),
    await createUser("user", "user", Role.USER),
    await createUser("user2", "user2", Role.USER),
    await createUser("user3", "user3", Role.USER),
    await createUser("user4", "user4", Role.USER),
    await createUser("user5", "user5", Role.USER),
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
