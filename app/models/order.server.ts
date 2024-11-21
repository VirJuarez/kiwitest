import { db } from "~/utils/db.server";

export type OrderItem = {
  quantity: number;
  unitPrice: number;
  description: string;
};

export type Order = {
  id: number;
  restaurantId: number;
  clientId: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  items: OrderItem[];
  total: number;
  createdAt: Date;
  completedAt?: Date;
};

export type DetailedOrder = {
  id: number;
  restaurant: { name: string; id: number };
  client: { name: string; surname: string; id: number };
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  items: OrderItem[];
  total: number;
  createdAt: Date;
  completedAt?: Date;
};

export async function getOrders(filters?: {
  restaurantId?: number;
  clientId?: number;
}) {
  return db.order.findMany({
    where: {
      ...(filters?.restaurantId && { restaurantId: filters.restaurantId }),
      ...(filters?.clientId && { clientId: filters.clientId }),
    },
    include: {
      restaurant: {
        select: { id: true, name: true },
      },
      client: {
        select: { id: true, name: true, surname: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrder(
  data: Pick<Order, "restaurantId" | "clientId" | "status" | "items" | "total">
) {
  return db.order.create({
    data: {
      restaurantId: data.restaurantId,
      clientId: data.clientId,
      status: data.status,
      items: data.items as any,
      total: data.total,
    },
  });
}

export async function updateOrder(
  id: number,
  data: Partial<
    Pick<
      Order,
      "status" | "items" | "total" | "completedAt" | "restaurantId" | "clientId"
    >
  >
) {
  return db.order.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === "COMPLETED" && { completedAt: new Date() }),
      ...(data.items && { items: data.items as any }),
    },
  });
}

export async function deleteOrder(id: number) {
  return db.order.delete({
    where: { id },
  });
}

export async function getOrderById(id: number) {
  return db.order.findUnique({
    where: { id },
    include: {
      restaurant: true,
      client: true,
    },
  });
}

export async function getRestaurantsAndClients() {
  const restaurants = await db.restaurant.findMany({
    orderBy: { name: "asc" },
  });

  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
  });

  return { restaurants, clients };
}
