"use client";

import { SimpleGrid } from "@mantine/core";
import { WorkspaceCard } from "./WorkspaceCard";

interface WorkspaceGridProps {
  workspaces: Array<{
    id: string;
    name: string;
    description: string;
    address: string;
    city: {
      name: string;
    };
    amenities: Array<{
      name: string;
    }>;
  }>;
}

export function WorkspaceGrid({ workspaces }: WorkspaceGridProps) {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing={{ base: "sm", sm: "lg" }}
      verticalSpacing={{ base: "sm", sm: "lg" }}
    >
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </SimpleGrid>
  );
}
