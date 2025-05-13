import prisma from "./prisma";

export default async function logDbOperation(
  userId: string | undefined,
  operationType: "create" | "update" | "delete",
  model: "workspace" | "user" | "timeSlot" | "booking",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  try {
    await prisma.log.create({
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
