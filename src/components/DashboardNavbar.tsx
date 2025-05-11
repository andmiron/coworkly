"use client";

import { AppShellNavbar, NavLink, Stack, Title } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <Stack gap="md">
      <NavLink
        component={Link}
        href="/admin/workspaces"
        label="Workspaces"
        active={pathname === "/admin/workspaces"}
      />
      <NavLink
        component={Link}
        href="/admin/users"
        label="Users"
        active={pathname === "/admin/users"}
      />
      <NavLink
        component={Link}
        href="/admin/bookings"
        label="Bookings"
        active={pathname === "/admin/bookings"}
      />
      <NavLink
        component={Link}
        href="/admin/database"
        label="Database"
        active={pathname === "/admin/database"}
      />
    </Stack>
  );
}
