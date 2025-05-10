import prisma from "@/lib/prisma";
import { Title } from "@mantine/core";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { id },
  });

  return (
    <div>
      <Title fw={200}>{workspace?.name}</Title>
    </div>
  );
}
