"use client";

import { NavLink, Stack } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Role } from "@/lib/prisma";
export default function DashboardNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Stack gap="md">
      {session?.user.role === Role.SUPER_ADMIN && (
        <>
          <NavLink
            component={Link}
            href="/super-admin/workspaces"
            label="Workspaces"
            active={pathname === "/super-admin/workspaces"}
          />
          <NavLink
            component={Link}
            href="/super-admin/users"
            label="Users"
            active={pathname === "/super-admin/users"}
          />
          <NavLink
            component={Link}
            href="/super-admin/bookings"
            label="Bookings"
            active={pathname === "/super-admin/bookings"}
          />
          <NavLink
            component={Link}
            href="/super-admin/database"
            label="Database"
            active={pathname === "/super-admin/database"}
          />
          <NavLink
            component={Link}
            href="/super-admin/logs"
            label="Logs"
            active={pathname === "/super-admin/logs"}
          />
        </>
      )}
      {session?.user.role === Role.ADMIN && (
        <>
          <NavLink
            component={Link}
            href="/admin/create-workspace"
            label="Create Workspace"
            active={pathname === "/admin/create-workspace"}
          />
          <NavLink
            component={Link}
            href="/admin/create-amenity"
            label="Create Amenity"
            active={pathname === "/admin/create-amenity"}
          />
        </>
      )}
    </Stack>
  );
}
