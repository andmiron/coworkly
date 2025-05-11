import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Container,
  Grid,
  Title,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { FaMapPin } from "react-icons/fa";
import WorkspacePageGrid from "@/components/WorkspacePageGrid";

export default async function WorkspaceInfoPage({
  params,
}: {
  params: { id: string };
}) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: {
      city: true,
      amenities: true,
    },
  });

  if (!workspace) return notFound();

  return (
    <Stack gap="lg">
      <Title fw={200}>{workspace.name}</Title>
      <WorkspacePageGrid workspace={workspace} />
    </Stack>

    // <SimpleGrid
    //   cols={{ base: 1, md: 2 }}
    //   spacing={{ base: "sm", sm: "lg" }}
    //   verticalSpacing={{ base: "lg", sm: "lg" }}
    // >
    //   <Group align="flex-start">
    //     <Group>
    //       <Title order={2} fw={200}>
    //         {workspace.name}
    //       </Title>
    //       <Text c="dimmed">
    //         <FaMapPin />
    //         {workspace.address}
    //       </Text>
    //     </Group>
    //     <Group>
    //       <Text>Amenities</Text>
    //       {workspace.amenities.map((amenity) => (
    //         <Badge variant="light" color="teal" key={amenity.id}>
    //           {amenity.name}
    //         </Badge>
    //       ))}
    //     </Group>
    //   </Group>
    //   <Stack align="center">
    //     <Title order={2} fw={200}>
    //       See availability
    //     </Title>
    //     <DatePicker
    //       size="md"
    //       minDate={new Date()}
    //       // onChange={...} // Add your booking logic here
    //     />
    //   </Stack>
    // </SimpleGrid>
  );
}
