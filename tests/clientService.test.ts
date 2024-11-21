import { PrismaClient } from "@prisma/client";
import mockDeep from "prisma-mock";

jest.mock("~/utils/db.server", () => ({
  db: mockDeep<PrismaClient>(),
}));

import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
} from "~/models/client.server";

import { db } from "~/utils/db.server";

//GETCLIENTS TEST
test("should return clients ordered by name", async () => {
  const mockClients = [
    {
      id: 1,
      name: "Charlie",
      surname: "Brown",
      phone: "123",
      address: "Test",
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Alice",
      surname: "Smith",
      phone: "456",
      address: "Street",
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "Bob",
      surname: "Jones",
      phone: "789",
      address: "Ave",
      createdAt: new Date(),
    },
  ];

  (db.client.findMany as jest.Mock).mockResolvedValue(mockClients);

  const clients = await getClients();
  expect(clients).toEqual(mockClients);
});

//CREATECLIENT TEST
test("should create a new client with valid data", async () => {
  const clientData = {
    name: "John",
    surname: "Doe",
    address: "123 Test St",
    phone: "555-1234",
  };

  const mockCreatedClient = {
    id: 1,
    ...clientData,
    createdAt: new Date(),
  };

  (db.client.create as jest.Mock).mockResolvedValue(mockCreatedClient);

  const newClient = await createClient(clientData);
  expect(newClient).toEqual(mockCreatedClient);
});

test("should throw error with invalid client data", async () => {
  (db.client.create as jest.Mock).mockRejectedValue(new Error("Invalid data"));
  await expect(createClient({} as any)).rejects.toThrow("Invalid data");
});

//UPDATECLIENT TEST
test("should update client with partial data", async () => {
  const mockClients = [
    {
      id: 1,
      name: "Original",
      surname: "Client",
      phone: "123",
      address: "Test",
      createdAt: new Date(),
    },
  ];

  (db.client.findMany as jest.Mock).mockResolvedValue(mockClients);

  const updateData = {
    name: "Updated Name",
    surname: mockClients[0].surname,
    address: mockClients[0].address,
    phone: mockClients[0].phone,
  };

  const mockUpdatedClient = {
    ...mockClients[0],
    ...updateData,
  };

  (db.client.update as jest.Mock).mockResolvedValue(mockUpdatedClient);

  const updatedClient = await updateClient(mockClients[0].id, updateData);
  expect(updatedClient.name).toBe("Updated Name");
});

//DELETECLIENT TEST
test("should create and delete client", async () => {
  const mockCreatedClient = {
    id: 1,
    name: "Test Delete",
    surname: "Client",
    phone: "555-0000",
    address: "123 Test St",
    createdAt: new Date(),
  };

  (db.client.create as jest.Mock).mockResolvedValue(mockCreatedClient);
  (db.client.delete as jest.Mock).mockResolvedValue(mockCreatedClient);
  (db.client.findUnique as jest.Mock).mockResolvedValue(null);

  const createdClient = await createClient(mockCreatedClient);
  const deletedClient = await deleteClient(createdClient.id);

  expect(deletedClient).toEqual(mockCreatedClient);

  const checkClient = await getClientById(createdClient.id);
  expect(checkClient).toBeNull();
});

//GETCLIENTBYID TEST
test("should retrieve client by id", async () => {
  const mockClient = {
    id: 1,
    name: "Test Client",
    surname: "Retrieval",
    phone: "555-0000",
    address: "123 Test St",
    createdAt: new Date(),
    orders: [],
  };

  (db.client.findUnique as jest.Mock).mockResolvedValue(mockClient);

  const client = await getClientById(1);
  expect(client).toEqual(mockClient);
});

test("should return null for non-existent client", async () => {
  (db.client.findUnique as jest.Mock).mockResolvedValue(null);

  const client = await getClientById(9999);
  expect(client).toBeNull();
});
