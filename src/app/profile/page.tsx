"use client";

import {
  Stack,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      username: (value) =>
        value.length > 30 ? "Username must be less than 30 characters" : null,
      currentPassword: (value) =>
        value.length < 4 ? "Password must be at least 4 characters" : null,
      newPassword: (value) => {
        if (!value) return null;
        if (value.length < 4) return "Password must be at least 4 characters";
        if (value === form.values.currentPassword)
          return "New password must be different from current password";
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  useEffect(() => {
    form.setFieldValue("username", session?.user?.username || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          username: data.username,
        },
      });

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
      });
      await signOut({ redirectTo: "/login" });
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to update profile",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Title fw={200}>Edit profile details</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="Your username"
            {...form.getInputProps("username")}
          />
          <Divider my="sm" />
          <PasswordInput
            label="Current password"
            placeholder="Enter your current password"
            required
            {...form.getInputProps("currentPassword")}
          />
          <PasswordInput
            label="New password"
            placeholder="Enter new password (optional)"
            {...form.getInputProps("newPassword")}
          />
          <PasswordInput
            label="Confirm new password"
            placeholder="Confirm new password"
            {...form.getInputProps("confirmPassword")}
          />
          <Button type="submit" loading={isLoading}>
            Update profile
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
