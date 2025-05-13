"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Loader,
  Stack,
  Text,
  Group,
  Paper,
  UnstyledButton,
  Checkbox,
  Button,
  Title,
  Select,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { DateInput } from "@mantine/dates";

type Booking = {
  id: string;
  user: { username: string } | null;
  workspace: { name: string } | null;
  timeSlot: { date: string; hour: number } | null;
  createdAt: string;
};

type SortField = "workspace" | "date" | "hour" | "createdAt";
type SortDirection = "asc" | "desc";

export default function MyBookingsPage() {
  const { status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [filterWorkspace, setFilterWorkspace] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  const allIds = bookings.map((b) => b.id);
  const allSelected = selected.length === allIds.length && allIds.length > 0;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? [] : allIds);
  };
  const toggleOne = (id: string) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) throw new Error("Failed to delete bookings");
      setBookings((prev) => prev.filter((b) => !selected.includes(b.id)));
      setSelected([]);
      notifications.show({ color: "green", message: "Bookings deleted." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      notifications.show({
        color: "red",
        message: `Delete failed: ${message}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const workspaceOptions = Array.from(
    new Set(bookings.map((b) => b.workspace?.name).filter(Boolean))
  ).map((w) => ({ value: w!, label: w! }));

  const filteredBookings = bookings.filter((b) => {
    if (filterWorkspace && b.workspace?.name !== filterWorkspace) return false;
    if (filterDate) {
      const d = b.timeSlot?.date ? new Date(b.timeSlot.date) : null;
      if (!d || d.toDateString() !== filterDate.toDateString()) return false;
    }
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";
    switch (sortField) {
      case "workspace":
        aValue = a.workspace?.name || "";
        bValue = b.workspace?.name || "";
        break;
      case "date":
        aValue = a.timeSlot?.date || "";
        bValue = b.timeSlot?.date || "";
        break;
      case "hour":
        aValue = a.timeSlot?.hour ?? -1;
        bValue = b.timeSlot?.hour ?? -1;
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
    }
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "";

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings/user");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        notifications.show({ color: "red", message: `Error: ${message}` });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [status]);

  if (status !== "authenticated") {
    return <Text ta="center">Please log in to view your bookings.</Text>;
  }

  return (
    <Stack gap="lg">
      <Title fw={200}>My Bookings</Title>
      <Group gap="md" align="end" justify="space-between">
        <Group>
          <Select
            label="Workspace"
            data={workspaceOptions}
            value={filterWorkspace}
            onChange={setFilterWorkspace}
            clearable
            searchable
            placeholder="All workspaces"
            w={180}
          />
          <DateInput
            label="Date"
            value={filterDate}
            onChange={(val) => setFilterDate(val ? new Date(val) : null)}
            clearable
            placeholder="All dates"
            w={100}
          />
        </Group>
        <Button
          variant="light"
          onClick={() => {
            setFilterWorkspace(null);
            setFilterDate(null);
          }}
        >
          Clear Filters
        </Button>
      </Group>
      <Group justify="space-between">
        <Group>
          <Button
            color="red"
            disabled={selected.length === 0 || deleting}
            loading={deleting}
            onClick={handleDelete}
          >
            Delete Selected
          </Button>
          <Text c="dimmed" size="sm">
            {selected.length > 0 && `${selected.length} selected`}
          </Text>
        </Group>
      </Group>
      {loading ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : (
        <Paper radius="md">
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("workspace")}>
                    Workspace {sortIcon("workspace")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("date")}>
                    Date {sortIcon("date")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("hour")}>
                    Hour {sortIcon("hour")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("createdAt")}>
                    Created At {sortIcon("createdAt")}
                  </UnstyledButton>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedBookings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                    <Text c="dimmed">No bookings found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sortedBookings.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.includes(b.id)}
                        onChange={() => toggleOne(b.id)}
                        aria-label={`Select booking ${b.id}`}
                      />
                    </Table.Td>
                    <Table.Td>{b.workspace?.name || "-"}</Table.Td>
                    <Table.Td>
                      {b.timeSlot?.date
                        ? new Date(b.timeSlot.date).toLocaleDateString()
                        : "-"}
                    </Table.Td>
                    <Table.Td>{b.timeSlot?.hour ?? "-"}</Table.Td>
                    <Table.Td>
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleString()
                        : "-"}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
