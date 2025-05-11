import { Stack, Title, Text, Badge, Group } from "@mantine/core";

export interface WorkspacePageCardProps {
  workspace: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: { name: string };
    amenities: { name: string }[];
  };
}

export default function WorkspacePageCard({
  workspace,
}: WorkspacePageCardProps) {
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={3} fw={300}>
          Description:
        </Title>
        <Text>{workspace.description}</Text>
      </Stack>
      <Stack gap="xs">
        <Title order={3} fw={300}>
          Amenities:
        </Title>
        <Group gap="xs">
          {workspace.amenities.map((amenity) => {
            return (
              <Badge variant="light" color="teal" key={amenity.name}>
                {amenity.name}
              </Badge>
            );
          })}
        </Group>
      </Stack>
      <Stack gap="xs">
        <Title order={3} fw={300}>
          Address:
        </Title>
        <Text>{workspace.address}</Text>
      </Stack>
      <Stack gap="xs">
        <Title order={3} fw={300}>
          City:
        </Title>
        <Text>{workspace.city.name}</Text>
      </Stack>
    </Stack>
  );
}
