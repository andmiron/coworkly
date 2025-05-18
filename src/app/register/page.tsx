"use client";

import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, hasLength } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const registerForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
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
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleSubmitRegister = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        notifications.show({
          title: "Register failed!",
          message: data.error,
          color: "red",
        });
        return;
      }

      if (response.ok && data.user) {
        setIsLoading(false);
        notifications.show({
          title: "Register successful!",
          message: "You have successfully created an account.",
          color: "green",
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      notifications.show({
        title: "Register failed!",
        message: "Register failed, please try again.",
        color: "red",
      });
    }

    // try {
    //   await register(
    //     values.email,
    //     values.password,
    //     values.name,
    //     values.company
    //   );
    //   notifications.show({
    //     title: "Welcome!",
    //     message: "You have successfully created an account.",
    //     color: "green",
    //   });
    //   await new Promise((resolve) => setTimeout(resolve, 200));
    //   navigate("/login");
    // } catch (err) {
    //   notifications.show({
    //     title: "Register failed!",
    //     message: err.message,
    //     color: "red",
    //   });
    // }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" style={{ fontWeight: "200" }}>
        Create an account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor size="sm" component={Link} href="/login">
          Login
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={registerForm.onSubmit(handleSubmitRegister)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            description="Maximum of 30 characters long"
            required
            {...registerForm.getInputProps("username")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            description="Password must have at least 4 characters"
            required
            mt="md"
            {...registerForm.getInputProps("password")}
          />
          <PasswordInput
            label="Confirm password"
            placeholder="Confirm your password"
            required
            mt="md"
            {...registerForm.getInputProps("confirmPassword")}
          />
          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
