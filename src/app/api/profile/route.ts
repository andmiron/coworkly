import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import logDbOperation from "@/lib/logDbOpertaion";

const updateProfileSchema = z.object({
  username: z
    .string()
    .max(30, "Username must be less than 30 characters")
    .optional(),
  currentPassword: z.string().min(4, "Password must be at least 4 characters"),
  newPassword: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log(body);
    const { username, currentPassword, newPassword } =
      await updateProfileSchema.parseAsync(body);

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new username is already taken
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: { username?: string; password?: string } = {};
    if (username) updateData.username = username;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;
    await logDbOperation(
      session.user.id,
      "update",
      "user",
      userWithoutPassword
    );
    revalidatePath("/");
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
