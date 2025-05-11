import { SimpleGrid, Stack, Title } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import WorkspacePageCard, { WorkspacePageCardProps } from "./WorkspacePageCard";

export default function WorkspacePageGrid({
  workspace,
}: {
  workspace: WorkspacePageCardProps;
}) {
  return (
    <SimpleGrid
      cols={{ base: 1, md: 2 }}
      spacing={{ base: "sm", sm: "lg" }}
      verticalSpacing={{ base: "lg", sm: "lg" }}
    >
      <Stack>
        <WorkspacePageCard workspace={workspace} />
      </Stack>
      <Stack align="center">
        <Title order={3} fw={300}>
          Choose available spots
        </Title>
        <DatePicker
          size="md"
          minDate={new Date()}
          // onChange={...} // Add your booking logic here
        />
      </Stack>
    </SimpleGrid>
  );
}
