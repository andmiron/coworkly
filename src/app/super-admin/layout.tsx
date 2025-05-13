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

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack gap="lg">
      <Title fw={200} mb="md">
        Super Admin Panel
      </Title>
      <Grid>
        <GridCol span={2}>
          <DashboardNavbar />
        </GridCol>
        <GridCol span={10}>
          <Stack>{children}</Stack>
        </GridCol>
      </Grid>
    </Stack>
  );
}
