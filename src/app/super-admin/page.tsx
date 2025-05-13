"use client";

import { useEffect, useState } from "react";
import { Card, Group, Stack, Title, Text, Loader, Badge } from "@mantine/core";

export default function SuperAdminPage() {
  const [data, setData] = useState<null | {
    users: number;
    workspaces: number;
    bookings: number;
    cities: number;
    amenities: number;
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin-overview");
        const d = await res.json();
        setData(d);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Stack gap="lg">
      {loading || !data ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : (
        <Group gap="lg" justify="space-around">
          {Object.entries(data).map(([key, value]) => (
            <Card key={key} shadow="sm" padding="md" radius="md" withBorder>
              <Text
                fw={500}
                size="lg"
                ta="center"
                style={{ textTransform: "capitalize" }}
              >
                {key}
              </Text>
              <Group justify="center" mt="sm">
                <Badge size="xl">{value}</Badge>
              </Group>
            </Card>
          ))}
        </Group>
      )}
    </Stack>
  );
}
