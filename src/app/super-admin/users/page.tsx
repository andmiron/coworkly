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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

export type User = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type SortField = "username" | "role" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterUsername, setFilterUsername] = useState<string | null>(null);

  // Unique filter options
  const roleOptions = Array.from(new Set(users.map((u) => u.role))).map(
    (r) => ({ value: r, label: r })
  );
  const usernameOptions = Array.from(new Set(users.map((u) => u.username))).map(
    (u) => ({ value: u, label: u })
  );

  // Filtering logic
  const filteredUsers = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (filterUsername && u.username !== filterUsername) return false;
    return true;
  });

  // Sorting logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string = "";
    let bValue: string = "";
    switch (sortField) {
      case "username":
        aValue = a.username;
        bValue = b.username;
        break;
      case "role":
        aValue = a.role;
        bValue = b.role;
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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        notifications.show({ color: "red", message: `Error: ${message}` });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Stack gap="lg">
      <Group gap="md" align="end">
        <Select
          label="Role"
          data={roleOptions}
          value={filterRole}
          onChange={setFilterRole}
          clearable
          searchable
          placeholder="All roles"
          w={160}
        />
        <Select
          label="Username"
          data={usernameOptions}
          value={filterUsername}
          onChange={setFilterUsername}
          clearable
          searchable
          placeholder="All users"
          w={180}
        />
        <Button
          variant="light"
          onClick={() => {
            setFilterRole(null);
            setFilterUsername(null);
          }}
        >
          Clear Filters
        </Button>
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
                  <UnstyledButton onClick={() => handleSort("username")}>
                    Username {sortIcon("username")}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => handleSort("role")}>
                    Role {sortIcon("role")}
                  </UnstyledButton>
                </Table.Th>
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
              {sortedUsers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} style={{ textAlign: "center" }}>
                    <Text c="dimmed">No users found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sortedUsers.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>{u.username}</Table.Td>
                    <Table.Td>{u.role}</Table.Td>
                    <Table.Td>
                      {new Date(u.createdAt).toLocaleString()}
                    </Table.Td>
                    <Table.Td>
                      {new Date(u.updatedAt).toLocaleString()}
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
