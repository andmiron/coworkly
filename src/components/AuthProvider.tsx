"use client";

import { MantineProvider } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import { theme } from "@/theme";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Container,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications position="top-center" zIndex={1000} />
        <AppShell header={{ height: 60 }} padding="md">
          <AppShellHeader>
            <Container p="md" h="100%">
              <Group h="100%" justify="space-between">
                <UnstyledButton component={Link} href="/">
                  <Text size="xl" fw={400}>
                    Coworkly
                  </Text>
                </UnstyledButton>
                <UnstyledButton component={Link} href="/workspaces">
                  <Text fw={400}>Workspaces</Text>
                </UnstyledButton>
                <Group>
                  {session ? (
                    <UnstyledButton onClick={() => signOut()}>
                      Logout
                    </UnstyledButton>
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
          </AppShellHeader>
          <AppShellMain>
            <Container>{children}</Container>
          </AppShellMain>
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
}
