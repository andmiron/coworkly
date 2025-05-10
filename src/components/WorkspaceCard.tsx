"use client";

import { Card, Text, Group, Badge, Stack, Button } from "@mantine/core";
import Link from "next/link";

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: {
      name: string;
    };
    amenities: Array<{
      name: string;
      icon: string | null;
    }>;
  };
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs" justify="space-between" h="100%">
        <Stack>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={500} size="lg">
                {workspace.name}
              </Text>
              <Badge variant="dot">{workspace.city.name}</Badge>
            </div>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {workspace.description}
          </Text>

          {workspace.amenities.length > 0 && (
            <Group gap="xs">
              {workspace.amenities.map((amenity) => (
                <Badge key={amenity.name} color="teal" variant="light">
                  {amenity.name}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>

        <Button
          component={Link}
          href={`/workspaces/${workspace.id}`}
          variant="light"
          fullWidth
          mt="md"
          radius="md"
        >
          View Details
        </Button>
      </Stack>
    </Card>
  );
}
