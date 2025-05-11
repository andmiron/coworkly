"use client";

import { signIn } from "next-auth/react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Text,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { hasLength } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        username,
        password,
        // rediectTo: "/workspaces",
        redirect: false,
      });

      if (result.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid username or password"
            : "An error occurred during login";

        setLoading(false);
        return notifications.show({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
      }

      if (!result.error && result.ok) {
        setLoading(false);
        notifications.show({
          title: "Success",
          message: "Login successful",
          color: "green",
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/workspaces");
      }
    } catch {
      setLoading(false);
      notifications.show({
        title: "Error",
        message: "Login failed",
        color: "red",
      });
    }
  };

  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: hasLength(
        { max: 30 },
        "Username must be less than 30 characters"
      ),
      password: hasLength(
        { min: 4 },
        "Password must be at least 4 characters long"
      ),
    },
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center" style={{ fontWeight: "200" }}>
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor size="sm" component={Link} href="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={loginForm.onSubmit(handleLogin)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...loginForm.getInputProps("username")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...loginForm.getInputProps("password")}
          />
          <Button loading={loading} fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
