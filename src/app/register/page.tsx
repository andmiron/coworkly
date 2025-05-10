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

export default function RegisterPage() {
  const registerForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      username: hasLength({ max: 30 }, "Maximum of 30 characters long"),
      password: hasLength({ min: 6 }, "At least 6 characters long"),
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleSubmitRegister = async (values) => {
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
            description="Password must have at least 6 characters"
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
          <Button fullWidth mt="xl" type="submit">
            Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
