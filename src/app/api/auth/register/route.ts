import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import prisma, { Role } from "@/lib/prisma";
import logDbOperation from "@/lib/logDbOpertaion";

const registerSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .max(30, "Username must be less than 30 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(4, "Password must be at least 4 characters"),
  role: z.nativeEnum(Role).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      username,
      password,
      role = Role.USER,
    } = await registerSchema.parseAsync(body);

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    await logDbOperation(user.id, "create", "user", user);
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 400 }
    );
  }
}
