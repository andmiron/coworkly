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
  LoadingOverlay,
} from "@mantine/core";
import Link from "next/link";
import Header from "./Header";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications position="bottom-center" zIndex={1000} />
        <AppShell header={{ height: 80 }} padding="md">
          <LoadingOverlay visible={status === "loading"} />
          <AppShellHeader>
            <Header session={session} />
          </AppShellHeader>
          <AppShellMain>
            <Container>{children}</Container>
          </AppShellMain>
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
}
