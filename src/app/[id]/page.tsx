"use client";

import type { Amenity, City, TimeSlot, Workspace } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Title,
  Text,
  Group,
  Badge,
  Stack,
  SimpleGrid,
  Loader,
  Modal,
  Button,
} from "@mantine/core";
import { use, useEffect } from "react";
import { DatePicker, TimeGrid } from "@mantine/dates";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type WorkspaceFull = Workspace & {
  city: City;
  amenities: Amenity[];
  timeSlots: TimeSlot[];
};

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const { id } = use(params);
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceFull | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[] | []>(
    []
  );
  const [timeSlotId, setTimeSlotId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [isBooking, setIsBooking] = useState(false);

  console.log(selectedDate, selectedHour);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await fetch(`/api/workspaces/${id}`);
        const data = await response.json();
        console.log(data);
        setWorkspace(data);
      } catch (error) {
        console.error("Error fetching workspace details:", error);
        notFound();
      }
    };
    fetchWorkspace();
  }, [id]);

  const handleDateChange = (date: string) => {
    const datePickerDate = new Date(date).toLocaleDateString();

    const timeSlotsForDate = workspace?.timeSlots.filter((timeSlot) => {
      const databaseDate = new Date(timeSlot.date).toLocaleDateString();
      return datePickerDate === databaseDate;
    });

    const availableTimeSlots = timeSlotsForDate?.filter((timeSlot) => {
      return timeSlot.isBooked === false;
    });

    setAvailableTimeSlots(availableTimeSlots || []);

    setSelectedDate(date);
    setSelectedHour(null);
    open();
  };

  const handleBookTimeSlot = async () => {
    try {
      setIsBooking(true);
      const response = await fetch("/api/timeslots/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeSlotId }),
      });

      if (!response.ok) {
        notifications.show({
          title: "Error",
          message: "Error booking time slot",
          color: "red",
        });
        setIsBooking(false);
        close();
        return;
      }

      setIsBooking(false);
      close();
      notifications.show({
        title: "Success",
        message: "Time slot booked successfully",
        color: "green",
      });
      router.push("/bookings");
    } catch (error) {
      console.error("Error booking time slot:", error);
      setIsBooking(false);
      close();
      notifications.show({
        title: "Error",
        message: "Error booking time slot",
        color: "red",
      });
    }
  };

  const handleTimeSlotChange = (hour: string | null) => {
    const timeSlotId = availableTimeSlots.find((timeSlot) => {
      return timeSlot.hour === parseInt(hour?.split(":")[0] || "0");
    })?.id;
    setTimeSlotId(timeSlotId || null);
    setSelectedHour(hour);
  };

  if (!workspace) {
    return (
      <Stack gap="lg" h="100%">
        <Title fw={200}>Workspace Details</Title>
        <Loader />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Title fw={200}>Workspace Details</Title>
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        spacing={{ base: "sm", sm: "lg" }}
        verticalSpacing={{ base: "lg", sm: "lg" }}
      >
        <Stack>
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={3}>Name:</Title>
              <Text>{workspace.name}</Text>
            </Stack>
            <Stack gap="xs">
              <Title order={3}>Description:</Title>
              <Text>{workspace.description}</Text>
            </Stack>
            <Stack gap="xs">
              <Title order={3}>Amenities:</Title>
              <Group gap="xs">
                {workspace.amenities.map((amenity) => {
                  return (
                    <Badge variant="light" color="teal" key={amenity.name}>
                      {amenity.name}
                    </Badge>
                  );
                })}
              </Group>
            </Stack>
            <Stack gap="xs">
              <Title order={3}>Address:</Title>
              <Text>{workspace.address}</Text>
            </Stack>
            <Stack gap="xs">
              <Title order={3}>City:</Title>
              <Text>{workspace.city.name}</Text>
            </Stack>
          </Stack>
        </Stack>
        {session?.user ? (
          <Stack>
            <Title order={3}>Choose available dates:</Title>
            <DatePicker
              hideOutsideDates
              size="lg"
              minDate={new Date()}
              value={selectedDate}
              onChange={handleDateChange}
            />
          </Stack>
        ) : (
          <Text>Please login to book a time slot</Text>
        )}
      </SimpleGrid>

      <Modal opened={opened} onClose={close} title="Book time slot">
        <Stack align="center">
          {availableTimeSlots.length ? (
            <TimeGrid
              size="lg"
              value={selectedHour}
              data={availableTimeSlots.map((timeSlot) => {
                return `${timeSlot.hour.toString()}:00`;
              })}
              onChange={handleTimeSlotChange}
              simpleGridProps={{
                type: "container",
                cols: 3,
                spacing: "xs",
              }}
              withSeconds={false}
              w="100%"
            />
          ) : (
            <Text>No available hours for this date</Text>
          )}
          <Button
            w="100%"
            variant="light"
            loading={isBooking}
            disabled={!selectedHour}
            onClick={handleBookTimeSlot}
          >
            Book time slot
          </Button>
        </Stack>
      </Modal>
      {/* {selectedDate && (
        <Stack w="100%" align="center">
          <Title order={3}>Choose available hours for {selectedDate}:</Title>
          {availableHours.length ? (
            <TimeGrid
              value={selectedHour}
              data={availableHours}
              simpleGridProps={{
                type: "container",
                cols: { base: 1, "180px": 2, "320px": 3 },
                spacing: "xs",
              }}
              withSeconds={false}
              onChange={setSelectedHour}
              w="50%"
            />
          ) : (
            <Text>No available hours for this date</Text>
          )}
        </Stack>
      )} */}
    </Stack>
  );
}
