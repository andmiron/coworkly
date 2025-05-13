"use client";

import {
  Card,
  Button,
  Stack,
  Title,
  Text,
  Group,
  FileInput,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export default function DatabasePage() {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("http://95.217.234.229/db");
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database_dump_${
        new Date().toISOString().split("T")[0]
      }.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notifications.show({
        color: "green",
        message: "Database dump downloaded.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      notifications.show({
        color: "red",
        message: `Download failed: ${message}`,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      notifications.show({
        color: "red",
        message: "Please select a file first.",
      });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("dumpFile", file);
      const res = await fetch("http://95.217.234.229/db", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload");
      const data = await res.json();
      if (data) {
        console.log(data);
        notifications.show({
          color: "green",
          message: data.message,
        });
        setFile(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      notifications.show({
        color: "red",
        message: `Upload failed: ${message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack gap="lg">
      <Group align="stretch" grow>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack justify="space-between" h="100%">
            <Text fw={500}>Download Database Dump</Text>
            <Text c="dimmed" size="sm">
              Get the latest backup of the database as a dump file.
            </Text>
            <Button
              onClick={handleDownload}
              loading={downloading}
              disabled={downloading}
            >
              {downloading ? <Loader size="xs" /> : "Download"}
            </Button>
          </Stack>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack justify="space-between" h="100%">
            <Text fw={500}>Upload Database Dump</Text>
            <Text c="dimmed" size="sm">
              Restore the database from a dump file.
            </Text>
            <FileInput
              value={file}
              onChange={setFile}
              placeholder="Select .sql file"
              accept=".sql,.dump,.gz,.zip"
              disabled={uploading}
            />
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={uploading}
            >
              {uploading ? <Loader size="xs" /> : "Upload"}
            </Button>
          </Stack>
        </Card>
      </Group>
    </Stack>
  );
}
