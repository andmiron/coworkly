"use client";

import {
  AppShellMain,
  AppShellNavbar,
  Box,
  Grid,
  GridCol,
  Group,
  SimpleGrid,
  Stack,
  Title,
} from "@mantine/core";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack gap="lg">
      <Title fw={200} mb="md">
        Admin Panel
      </Title>
      <Grid>
        <GridCol span={3}>
          <DashboardNavbar />
        </GridCol>
        <GridCol span={9}>
          <Stack>{children}</Stack>
        </GridCol>
      </Grid>
    </Stack>
  );
}
