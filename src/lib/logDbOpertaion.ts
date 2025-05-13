import prisma from "./prisma";

export default async function logDbOperation(
  userId: string | undefined,
  operationType: "create" | "update" | "delete",
  model: "workspace" | "user" | "timeSlot" | "booking",
  data: any
) {
  try {
    const log = await prisma.log.create({
      data: {
        userId,
        operationType,
        model,
        data: JSON.stringify(data),
      },
    });
  } catch (error) {
    console.error(error);
  }
}
