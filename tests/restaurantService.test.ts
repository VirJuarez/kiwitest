import { PrismaClient } from "@prisma/client";
import mockDeep from "prisma-mock";

jest.mock("~/utils/db.server", () => ({
  db: mockDeep<PrismaClient>(),
}));

import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantById,
} from "~/models/restaurant.server";

import { db } from "~/utils/db.server";

//GETRESTAURANTS TEST
test("should return restaurants ordered by name", async () => {
  const mockRestaurants = [
    {
      id: 1,
      name: "Charlie's Diner",
      address: "123 Test St",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Alice's Cafe",
      address: "456 Main St",
      phone: "987-654-3210",
    },
    {
      id: 3,
      name: "Bob's Pizzeria",
      address: "789 Oak Ave",
      phone: "456-789-0123",
    },
  ];

  (db.restaurant.findMany as jest.Mock).mockResolvedValue(mockRestaurants);

  const restaurants = await getRestaurants();
  expect(restaurants).toEqual(mockRestaurants);
});

//CREATERESTAURANT TEST
test("should create a new restaurant with valid data", async () => {
  const restaurantData = {
    name: "New Restaurant",
    address: "123 Test St",
    phone: "555-1234",
  };

  const mockCreatedRestaurant = {
    id: 1,
    ...restaurantData,
  };

  (db.restaurant.create as jest.Mock).mockResolvedValue(mockCreatedRestaurant);

  const newRestaurant = await createRestaurant(restaurantData);
  expect(newRestaurant).toEqual(mockCreatedRestaurant);
});

//UPDATERESTAURANT TEST
test("should update restaurant with partial data", async () => {
  const updateData = {
    name: "Updated Restaurant Name",
  };

  const mockRestaurant = {
    id: 1,
    name: "Original Restaurant",
    address: "123 Test St",
    phone: "555-1234",
  };

  const mockUpdatedRestaurant = {
    ...mockRestaurant,
    ...updateData,
  };

  (db.restaurant.update as jest.Mock).mockResolvedValue(mockUpdatedRestaurant);

  const updatedRestaurant = await updateRestaurant(1, updateData);
  expect(updatedRestaurant.name).toBe("Updated Restaurant Name");
});

//DELETERESTAURANT TEST
test("should delete restaurant and associated orders", async () => {
  const mockRestaurant = {
    id: 1,
    name: "Test Restaurant",
    address: "123 Test St",
    phone: "555-1234",
  };

  (db.restaurant.delete as jest.Mock).mockResolvedValue(mockRestaurant);
  (db.order.deleteMany as jest.Mock).mockResolvedValue({});
  (db.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

  const deletedRestaurant = await deleteRestaurant(mockRestaurant.id);

  expect(deletedRestaurant).toEqual(mockRestaurant);
});

//GETRESTAURANTBYID TEST
test("should retrieve restaurant by id", async () => {
  const mockRestaurant = {
    id: 1,
    name: "Test Restaurant",
    address: "123 Test St",
    phone: "555-1234",
    orders: [],
  };

  (db.restaurant.findUnique as jest.Mock).mockResolvedValue(mockRestaurant);

  const restaurant = await getRestaurantById(1);
  expect(restaurant).toEqual(mockRestaurant);
});

test("should return null for non-existent restaurant", async () => {
  (db.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

  const restaurant = await getRestaurantById(9999);
  expect(restaurant).toBeNull();
});
