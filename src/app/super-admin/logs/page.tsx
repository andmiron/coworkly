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
  Modal,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";

type Log = {
  id: string;
  userId: string | null;
  operationType: string;
  model: string;
  data: string;
  createdAt: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [expandedLog, setExpandedLog] = useState<Log | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        notifications.show({ color: "red", message: `Error: ${message}` });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Get unique userIds and actions
  const userOptions = Array.from(
    new Set(logs.map((l) => l.userId ?? "-").filter(Boolean))
  ).map((u) => ({ value: u, label: u }));
  const actionOptions = Array.from(
    new Set(logs.map((l) => l.operationType).filter(Boolean))
  ).map((a) => ({ value: a, label: a }));

  // Filtering logic
  const filteredLogs = logs.filter((l) => {
    if (filterUser && l.userId !== filterUser) return false;
    if (filterAction && l.operationType !== filterAction) return false;
    if (filterDate) {
      const d = l.createdAt ? new Date(l.createdAt) : null;
      if (!d || d.toDateString() !== filterDate.toDateString()) return false;
    }
    return true;
  });

  return (
    <Stack gap="lg">
      <Group gap="md" align="end" justify="space-between">
        <Group>
          <Select
            label="User"
            data={userOptions}
            value={filterUser}
            onChange={setFilterUser}
            clearable
            searchable
            placeholder="All users"
            w={180}
          />
          <Select
            label="Action"
            data={actionOptions}
            value={filterAction}
            onChange={setFilterAction}
            clearable
            searchable
            placeholder="All actions"
            w={140}
          />
          <DateInput
            label="Date"
            value={filterDate}
            onChange={(val) => setFilterDate(val ? new Date(val) : null)}
            clearable
            placeholder="All dates"
            w={120}
          />
        </Group>
        <Button
          variant="light"
          onClick={() => {
            setFilterUser(null);
            setFilterAction(null);
            setFilterDate(null);
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
                <Table.Th>User</Table.Th>
                <Table.Th>Action</Table.Th>
                <Table.Th>Model</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Data</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredLogs.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                    <Text c="dimmed">No logs found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredLogs.map((l) => (
                  <Table.Tr key={l.id}>
                    <Table.Td>{l.userId || "-"}</Table.Td>
                    <Table.Td>{l.operationType}</Table.Td>
                    <Table.Td>{l.model}</Table.Td>
                    <Table.Td>
                      {l.createdAt
                        ? new Date(l.createdAt).toLocaleString()
                        : "-"}
                    </Table.Td>
                    <Table.Td>
                      <UnstyledButton
                        onClick={() => setExpandedLog(l)}
                        style={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                        title={l.data}
                      >
                        {l.data.length > 60
                          ? l.data.slice(0, 60) + "..."
                          : l.data}
                      </UnstyledButton>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
      <Modal
        opened={!!expandedLog}
        onClose={() => setExpandedLog(null)}
        title="Log Data"
        size="lg"
      >
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {expandedLog?.data}
        </pre>
      </Modal>
    </Stack>
  );
}
