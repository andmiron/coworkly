"use client";

import prisma, { Workspace, City, Amenity } from "@/lib/prisma";
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Title,
  Text,
  LoadingOverlay,
  Loader,
  MultiSelect,
  Combobox,
  useCombobox,
  Input,
  InputBase,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

type WorkspacesWithCityAndAmenities = Workspace & {
  city: City;
  amenities: Amenity[];
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<
    WorkspacesWithCityAndAmenities[] | null
  >(null);
  const [cities, setCities] = useState<City[]>([]);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch("/api/workspaces");
        const data = await response.json();
        setWorkspaces(data);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        notFound();
      }
    };

    const fetchCities = async () => {
      const response = await fetch("/api/cities");
      const data = await response.json();
      setCities(data);
    };

    const fetchAmenities = async () => {
      const response = await fetch("/api/amenities");
      const data = await response.json();
      setAmenities(data);
    };

    fetchWorkspaces();
    fetchCities();
    fetchAmenities();
  }, []);

  const cityCombobox = useCombobox({
    onDropdownClose: () => cityCombobox.resetSelectedOption(),
  });

  const cityComboboxOptions = cities.map((city) => (
    <Combobox.Option value={city.name} key={city.id}>
      {city.name}
    </Combobox.Option>
  ));

  const filteredWorkspaces = workspaces?.filter((workspace) => {
    const matchesCity = filterCity ? workspace.city.name === filterCity : true;

    const matchesAmenities =
      filterAmenities.length > 0
        ? filterAmenities.every((amenity) =>
            workspace.amenities.some((a) => a.name === amenity)
          )
        : true;

    return matchesCity && matchesAmenities;
  });

  if (!workspaces) {
    return (
      <Stack gap="lg" h="100%">
        <Title fw={200}>Available Workspaces</Title>
        <Loader />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Title fw={200}>Available Workspaces</Title>
      <Group>
        <Text>Filter by:</Text>
        <Combobox
          width="200px"
          store={cityCombobox}
          onOptionSubmit={(val) => {
            setFilterCity(val);

            cityCombobox.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
              component="button"
              type="button"
              pointer
              rightSection={<Combobox.Chevron />}
              rightSectionPointerEvents="none"
              onClick={() => cityCombobox.toggleDropdown()}
            >
              {filterCity || <Input.Placeholder>Pick a city</Input.Placeholder>}
            </InputBase>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
              {cityComboboxOptions}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
        <MultiSelect
          data={amenities.map((amenity) => amenity.name)}
          placeholder="Filter by amenities"
          value={filterAmenities}
          onChange={setFilterAmenities}
        />
        <Button
          variant="light"
          c="gray"
          onClick={() => {
            setFilterCity(null);
            setFilterAmenities([]);
          }}
        >
          Clear Filters
        </Button>
      </Group>

      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing={{ base: "sm", sm: "lg" }}
        verticalSpacing={{ base: "sm", sm: "lg" }}
        style={{ position: "relative" }}
      >
        {filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Stack gap="xs" justify="space-between" h="100%">
                <Stack>
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text fw={500} size="lg">
                        {workspace.name}
                      </Text>
                      <Badge variant="dot">{workspace.city.name}</Badge>
                    </div>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {workspace.description}
                  </Text>

                  {workspace.amenities.length > 0 && (
                    <Group gap="xs">
                      {workspace.amenities.map((amenity) => (
                        <Badge key={amenity.name} color="teal" variant="light">
                          {amenity.name}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </Stack>

                <Button
                  component={Link}
                  href={`/workspaces/${workspace.id}`}
                  variant="light"
                  fullWidth
                  mt="md"
                  radius="md"
                >
                  View Details
                </Button>
              </Stack>
            </Card>
          ))
        ) : (
          <Text size="lg" fw={500} c="red">
            No workspaces found
          </Text>
        )}
      </SimpleGrid>
    </Stack>
  );
}
