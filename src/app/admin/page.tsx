"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Select,
  MultiSelect,
  Text,
  Loader,
  Title,
  Card,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSession } from "next-auth/react";
import type { Amenity, City, TimeSlot, Workspace } from "@/lib/prisma";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { DateInput, TimeGrid } from "@mantine/dates";

export default function AdminPanel() {
  const { data: session } = useSession();
  const [
    openedCreateWorkspace,
    { open: openCreateWorkspace, close: closeCreateWorkspace },
  ] = useDisclosure(false);
  const [
    openedCreateTimeSlot,
    { open: openCreateTimeSlot, close: closeCreateTimeSlot },
  ] = useDisclosure(false);
  const [cities, setCities] = useState<City[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [createWorkspaceFetching, setCreateWorkspaceFetching] = useState(true);
  const [createTimeSlotFetching, setCreateTimeSlotFetching] = useState(true);
  const [createWorkspaceLoading, setCreateWorkspaceLoading] = useState(false);
  const [createTimeSlotLoading, setCreateTimeSlotLoading] = useState(false);
  // const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [workspaces, setWorkspaces] = useState<
    (Workspace & { timeSlots: TimeSlot[] })[]
  >([]);
  // const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
  //   null
  // );
  // const selectedWorkspace =
  //   workspaces.find((w) => w.id === selectedWorkspaceId) || null;
  const [selectedWorkspace, setSelectedWorkspace] = useState<
    (Workspace & { timeSlots: TimeSlot[] }) | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      address: "",
      cityId: "",
      amenitiesIds: [],
    },
    validate: {
      name: (v) => (!v ? "Name required" : null),
      description: (v) => (!v ? "Description required" : null),
      address: (v) => (!v ? "Address required" : null),
      cityId: (v) => (!v ? "City required" : null),
    },
  });

  useEffect(() => {
    setCreateWorkspaceFetching(true);
    Promise.all([
      fetch("/api/cities").then((r) => r.json()),
      fetch("/api/amenities").then((r) => r.json()),
    ]).then(([cities, amenities]) => {
      setCities(cities);
      setAmenities(amenities);
      setCreateWorkspaceFetching(false);
    });
  }, [openedCreateWorkspace]);

  useEffect(() => {
    if (openedCreateTimeSlot) {
      setCreateTimeSlotFetching(true);
      fetch("/api/workspaces")
        .then((r) => r.json())
        .then((workspaces) => {
          setWorkspaces(workspaces);
          setCreateTimeSlotFetching(false);
        });
    }
  }, [openedCreateTimeSlot]);

  const handleCreateWorkspaceSubmit = async (
    values: Omit<Workspace, "id" | "createdAt" | "updatedAt" | "managerId">
  ) => {
    setCreateWorkspaceLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          managerId: session?.user?.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to create workspace");
      form.reset();
      closeCreateWorkspace();
      notifications.show({
        title: "Workspace Created",
        message: "Workspace was created successfully!",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to create workspace.",
        color: "red",
      });
    } finally {
      setCreateWorkspaceLoading(false);
    }
  };

  const handleWorkspaceChange = (workspaceId: string | null) => {
    setSelectedWorkspace(workspaces.find((w) => w.id === workspaceId) || null);
    setSelectedDate(null);
    setSelectedHour(null);
  };

  const handleDateChange = (date: string) => {
    const datePickerDate = new Date(date).toLocaleDateString();

    const reservedTimeSlots = selectedWorkspace?.timeSlots.filter(
      (timeSlot) => {
        const databaseDate = new Date(timeSlot.date).toLocaleDateString();
        return datePickerDate === databaseDate;
      }
    );

    const possibleTimeSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    const reservedHours = reservedTimeSlots?.map((slot) => slot.hour);

    const availableTimeSlots = possibleTimeSlots.filter((slot) => {
      const hour = parseInt(slot.split(":")[0], 10);
      return !reservedHours?.includes(hour);
    });

    setAvailableTimeSlots(availableTimeSlots || []);
    setSelectedDate(date);
    setSelectedHour(null);
  };

  const selectWorkspaceData = workspaces.map((w) => {
    return {
      value: w.id,
      label: w.name,
    };
  });

  const handleTimeSlotChange = (hour: string | null) => {
    setSelectedHour(hour);
  };

  const handleCreateTimeSlot = async () => {
    setCreateTimeSlotLoading(true);
    try {
      const res = await fetch("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspace?.id,
          date: selectedDate,
          hour: parseInt(selectedHour?.split(":")[0] || "0"),
        }),
      });
      if (!res.ok) throw new Error("Failed to create time slot");
      closeCreateTimeSlot();
      notifications.show({
        title: "Time Slot Created",
        message: "Time slot was created successfully!",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to create time slot.",
        color: "red",
      });
    } finally {
      setCreateTimeSlotLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Title fw={200} mb="md">
        Admin Panel
      </Title>
      <Group gap="lg" justify="space-around">
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text fw={500} size="lg" ta="center">
            Create a new workspace by filling the form
          </Text>
          <Group justify="center" mt="sm">
            <Button onClick={openCreateWorkspace}>Create</Button>
          </Group>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text fw={500} size="lg" ta="center">
            Create time slot for a workspace
          </Text>
          <Group justify="center" mt="sm">
            <Button onClick={openCreateTimeSlot}>Create</Button>
          </Group>
        </Card>
      </Group>

      <Modal
        opened={openedCreateWorkspace}
        onClose={closeCreateWorkspace}
        title="Create Workspace"
        centered
      >
        {createWorkspaceFetching ? (
          <Stack align="center">
            <Loader />
          </Stack>
        ) : (
          <form onSubmit={form.onSubmit(handleCreateWorkspaceSubmit)}>
            <Stack>
              <TextInput
                label="Name"
                {...form.getInputProps("name")}
                placeholder="Name"
                required
              />
              <TextInput
                label="Description"
                {...form.getInputProps("description")}
                placeholder="Description"
                required
              />
              <TextInput
                label="Address"
                {...form.getInputProps("address")}
                placeholder="Address"
                required
              />
              <Select
                label="City"
                data={cities.map((c) => ({ value: c.id, label: c.name }))}
                {...form.getInputProps("cityId")}
                placeholder="City"
                required
              />
              <MultiSelect
                label="Amenities"
                data={amenities.map((a) => ({ value: a.id, label: a.name }))}
                {...form.getInputProps("amenitiesIds")}
                placeholder="Amenities"
                clearable
              />
              <Button type="submit" loading={createWorkspaceLoading} fullWidth>
                Create
              </Button>
            </Stack>
          </form>
        )}
      </Modal>

      <Modal
        opened={openedCreateTimeSlot}
        onClose={closeCreateTimeSlot}
        title="Create Time Slot"
        centered
      >
        {createTimeSlotFetching ? (
          <Stack align="center">
            <Loader />
          </Stack>
        ) : (
          <Stack>
            <Select
              label="Workspace"
              data={selectWorkspaceData}
              value={selectedWorkspace?.id}
              onChange={handleWorkspaceChange}
            />
            {selectedWorkspace && (
              <DateInput
                label="Date"
                minDate={new Date()}
                value={selectedDate}
                onChange={handleDateChange}
              />
            )}
            {selectedWorkspace && selectedDate && (
              <TimeGrid
                size="lg"
                value={selectedHour}
                data={availableTimeSlots}
                onChange={handleTimeSlotChange}
              />
            )}
            {selectedHour && (
              <Button
                onClick={handleCreateTimeSlot}
                loading={createTimeSlotLoading}
              >
                Create
              </Button>
            )}
            {availableTimeSlots.length === 0 && (
              <Text>
                Slots already exist or booked for this date, please select
                another date
              </Text>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
