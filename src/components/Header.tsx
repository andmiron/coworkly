import {
  Container,
  Group,
  Text,
  UnstyledButton,
  Menu,
  Avatar,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Role } from "@/lib/prisma";

export default function Header({ session }: { session: Session | null }) {
  return (
    <Container p="md" h="100%">
      <Group h="100%" justify="space-between">
        <Group align="flex-end" gap="lg">
          <UnstyledButton component={Link} href="/">
            <Title order={3} fw={400}>
              Coworkly
            </Title>
          </UnstyledButton>
          <UnstyledButton component={Link} href="/workspaces">
            <Title order={4} fw={400}>
              Workspaces
            </Title>
          </UnstyledButton>
        </Group>
        <Group>
          {session ? (
            <Menu withArrow>
              <Menu.Target>
                <UnstyledButton>
                  <Avatar color="blue" radius="xl">
                    {session.user?.username?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} href="/profile">
                  <Text fw={400}>Profile</Text>
                </Menu.Item>
                {session.user.role === Role.SUPER_ADMIN && (
                  <Menu.Item component={Link} href="/admin">
                    <Text fw={400}>Admin Panel</Text>
                  </Menu.Item>
                )}
                {session.user.role !== Role.SUPER_ADMIN && (
                  <>
                    <Menu.Item component={Link} href="/my-workspaces">
                      <Text fw={400}>My Workspaces</Text>
                    </Menu.Item>

                    <Menu.Item component={Link} href="/bookings">
                      <Text fw={400}>My Bookings</Text>
                    </Menu.Item>
                  </>
                )}
                <Menu.Divider />
                <Menu.Item onClick={() => signOut({ redirectTo: "/login" })}>
                  <Text fw={400}>Logout</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <>
              <UnstyledButton component={Link} href="/login">
                Login
              </UnstyledButton>
              <UnstyledButton component={Link} href="/register">
                Register
              </UnstyledButton>
            </>
          )}
        </Group>
      </Group>
    </Container>
  );
}
