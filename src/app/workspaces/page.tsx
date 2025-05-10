import { WorkspaceGrid } from "@/components/WorkspaceGrid";
import prisma from "@/lib/prisma";
import { Button, Stack, Title } from "@mantine/core";

export default async function WorkspacesPage() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      city: true,
      amenities: true,
    },
  });

  return (
    <Stack>
      <Title fw={200}>Available Workspaces</Title>

      <WorkspaceGrid workspaces={workspaces} />
    </Stack>
  );
}
