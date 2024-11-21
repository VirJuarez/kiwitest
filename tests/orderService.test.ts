import { PrismaClient } from "@prisma/client";
import mockDeep from "prisma-mock";

jest.mock("~/utils/db.server", () => ({
  db: mockDeep<PrismaClient>(),
}));

import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getRestaurantsAndClients,
} from "~/models/order.server";

import { db } from "~/utils/db.server";

// Mock data for orders
const mockOrders = [
  {
    id: 1,
    restaurantId: 1,
    clientId: 1,
    status: "PENDING",
    items: [{ quantity: 2, unitPrice: 10, description: "Pizza" }],
    total: 20,
    createdAt: new Date(),
    restaurant: { id: 1, name: "Test Restaurant" },
    client: { id: 1, name: "John", surname: "Doe" },
  },
  {
    id: 2,
    restaurantId: 2,
    clientId: 2,
    status: "IN_PROGRESS",
    items: [{ quantity: 1, unitPrice: 15, description: "Burger" }],
    total: 15,
    createdAt: new Date(),
    restaurant: { id: 2, name: "Another Restaurant" },
    client: { id: 2, name: "Jane", surname: "Smith" },
  },
];

// GET ORDERS TEST
test("should return orders ordered by creation date", async () => {
  (db.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

  const orders = await getOrders();
  expect(orders).toEqual(mockOrders);
});

// CREATE ORDER TEST
test("should create a new order with valid data", async () => {
  const orderData = {
    restaurantId: 1,
    clientId: 1,
    status: "PENDING" as const,
    items: [{ quantity: 1, unitPrice: 10, description: "Salad" }],
    total: 10,
  };

  const mockCreatedOrder = {
    id: 3,
    ...orderData,
    createdAt: new Date(),
  };

  (db.order.create as jest.Mock).mockResolvedValue(mockCreatedOrder);

  const newOrder = await createOrder(orderData);
  expect(newOrder).toEqual(mockCreatedOrder);
});

test("should throw error with invalid order data", async () => {
  (db.order.create as jest.Mock).mockRejectedValue(new Error("Invalid data"));
  await expect(createOrder({} as any)).rejects.toThrow("Invalid data");
});

// UPDATE ORDER TEST
test("should update order with partial data", async () => {
  const updateData = {
    status: "COMPLETED" as const,
    total: 25,
  };

  const mockUpdatedOrder = {
    ...mockOrders[0],
    ...updateData,
  };

  (db.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

  const updatedOrder = await updateOrder(mockOrders[0].id, updateData);
  expect(updatedOrder.status).toBe("COMPLETED");
  expect(updatedOrder.total).toBe(25);
});

// DELETE ORDER TEST
test("should delete order", async () => {
  const mockOrderToDelete = mockOrders[0];

  (db.order.delete as jest.Mock).mockResolvedValue(mockOrderToDelete);
  (db.order.findUnique as jest.Mock).mockResolvedValue(null);

  const deletedOrder = await deleteOrder(mockOrderToDelete.id);

  expect(deletedOrder).toEqual(mockOrderToDelete);

  const checkOrder = await getOrderById(mockOrderToDelete.id);
  expect(checkOrder).toBeNull();
});

// GET ORDER BY ID TEST
test("should retrieve order by id", async () => {
  const mockOrder = mockOrders[0];

  (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

  const order = await getOrderById(mockOrder.id);
  expect(order).toEqual(mockOrder);
});

test("should return null for non-existent order", async () => {
  (db.order.findUnique as jest.Mock).mockResolvedValue(null);

  const order = await getOrderById(9999);
  expect(order).toBeNull();
});

// GET RESTAURANTS AND CLIENTS TEST
test("should retrieve restaurants and clients", async () => {
  const mockRestaurants = [
    { id: 1, name: "Restaurant A" },
    { id: 2, name: "Restaurant B" },
  ];

  const mockClients = [
    { id: 1, name: "Client A", surname: "Last A" },
    { id: 2, name: "Client B", surname: "Last B" },
  ];

  (db.restaurant.findMany as jest.Mock).mockResolvedValue(mockRestaurants);
  (db.client.findMany as jest.Mock).mockResolvedValue(mockClients);

  const result = await getRestaurantsAndClients();
  expect(result.restaurants).toEqual(mockRestaurants);
  expect(result.clients).toEqual(mockClients);
});
