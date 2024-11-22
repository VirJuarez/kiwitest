import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getOrders,
  createOrder,
  updateOrder,
  getOrderById,
  getRestaurantsAndClients,
} from "~/models/order.server";

const ORDER_STATUSES = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

type OrderStatus = keyof typeof ORDER_STATUSES;

type OrderItem = {
  quantity: number;
  unitPrice: number;
  description: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("edit");
  const restaurantId = url.searchParams.get("restaurantId");
  const clientId = url.searchParams.get("clientId");

  const filters = {
    ...(restaurantId && { restaurantId: Number(restaurantId) }),
    ...(clientId && { clientId: Number(clientId) }),
  };

  const orders = await getOrders(filters);
  const { restaurants, clients } = await getRestaurantsAndClients();
  const editingOrder = orderId ? await getOrderById(Number(orderId)) : null;

  return json({
    orders,
    restaurants,
    clients,
    editingOrder,
    orderStatuses: ORDER_STATUSES,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id")?.toString();
  const restaurantId = Number(formData.get("restaurantId"));
  const clientId = Number(formData.get("clientId"));
  const status = formData.get("status")?.toString() as OrderStatus;

  const itemsJson = formData.get("items")?.toString() || "[]";
  const items = JSON.parse(itemsJson);

  const total = items.reduce(
    (sum: number, item: OrderItem) => sum + item.quantity * item.unitPrice,
    0
  );

  try {
    if (id) {
      // Update only status when editing
      await updateOrder(Number(id), { status });
    } else {
      // Create new order
      await createOrder({
        restaurantId,
        clientId,
        status,
        items,
        total,
      });
    }
    return redirect("/orders");
  } catch (error) {
    return json(
      {
        error: "Error saving the order",
      },
      { status: 500 }
    );
  }
};
