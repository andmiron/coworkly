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
  Select,
  Button,
  Checkbox,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

export type Workspace = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: { id: string; name: string } | null;
  manager: { id: string; username: string } | null;
  createdAt: string;
  updatedAt: string;
};

type SortField = "name" | "city" | "manager" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterName, setFilterName] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [filterManager, setFilterManager] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Unique filter options
  const nameOptions = Array.from(new Set(workspaces.map((w) => w.name))).map(
    (n) => ({ value: n, label: n })
  );
  const cityOptions = Array.from(
    new Set(workspaces.map((w) => w.city?.name).filter(Boolean))
  ).map((c) => ({ value: c!, label: c! }));
  const managerOptions = Array.from(
    new Set(workspaces.map((w) => w.manager?.username).filter(Boolean))
  ).map((m) => ({ value: m!, label: m! }));

  // Filtering logic
  const filteredWorkspaces = workspaces.filter((w) => {
    if (filterName && w.name !== filterName) return false;
    if (filterCity && w.city?.name !== filterCity) return false;
    if (filterManager && w.manager?.username !== filterManager) return false;
    return true;
  });

  // Sorting logic
  const sortedWorkspaces = [...filteredWorkspaces].sort((a, b) => {
    let aValue: string = "";
    let bValue: string = "";
    switch (sortField) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "city":
        aValue = a.city?.name || "";
        bValue = b.city?.name || "";
        break;
      case "manager":
        aValue = a.manager?.username || "";
        bValue = b.manager?.username || "";
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case "updatedAt":
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
    }
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Multi-select logic
  const allIds = sortedWorkspaces.map((w) => w.id);
  const allSelected = selected.length === allIds.length && allIds.length > 0;
  const someSelected = selected.length > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? [] : allIds);
  const toggleOne = (id: string) =>
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) throw new Error("Failed to delete workspaces");
      setWorkspaces((prev) => prev.filter((w) => !selected.includes(w.id)));
      setSelected([]);
      notifications.show({ color: "green", message: "Workspaces deleted." });
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

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) throw new Error("Failed to fetch workspaces");
        const data = await res.json();
        setWorkspaces(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        notifications.show({ color: "red", message: `Error: ${message}` });
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  return (
    <Stack gap="lg">
      <Group gap="md" align="end">
        <Select
          label="Name"
          data={nameOptions}
          value={filterName}
          onChange={setFilterName}
          clearable
          searchable
          placeholder="All names"
          w={180}
        />
        <Select
          label="City"
          data={cityOptions}
          value={filterCity}
          onChange={setFilterCity}
          clearable
          searchable
          placeholder="All cities"
          w={160}
        />
        <Select
          label="Manager"
          data={managerOptions}
          value={filterManager}
          onChange={setFilterManager}
          clearable
          searchable
          placeholder="All managers"
          w={180}
        />
        <Button
          variant="light"
          onClick={() => {
            setFilterName(null);
            setFilterCity(null);
            setFilterManager(null);
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
                  <UnstyledButton onClick={() => handleSort("name")}>
                    Name {sortIcon("name")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("city")}>
                    City {sortIcon("city")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("manager")}>
                    Manager {sortIcon("manager")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Address</Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("createdAt")}>
                    Created At {sortIcon("createdAt")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("updatedAt")}>
                    Updated At {sortIcon("updatedAt")}
                  </UnstyledButton>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedWorkspaces.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} style={{ textAlign: "center" }}>
                    <Text c="dimmed">No workspaces found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sortedWorkspaces.map((w) => (
                  <Table.Tr key={w.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.includes(w.id)}
                        onChange={() => toggleOne(w.id)}
                        aria-label={`Select workspace ${w.id}`}
                      />
                    </Table.Td>
                    <Table.Td>{w.name}</Table.Td>
                    <Table.Td>{w.city?.name || "-"}</Table.Td>
                    <Table.Td>{w.manager?.username || "-"}</Table.Td>
                    <Table.Td>{w.description}</Table.Td>
                    <Table.Td>{w.address}</Table.Td>
                    <Table.Td>
                      {new Date(w.createdAt).toLocaleString()}
                    </Table.Td>
                    <Table.Td>
                      {new Date(w.updatedAt).toLocaleString()}
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
