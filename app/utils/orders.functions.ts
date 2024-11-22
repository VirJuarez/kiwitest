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
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("edit");
    const restaurantId = url.searchParams.get("restaurantId");
    const clientId = url.searchParams.get("clientId");

    const filters = {
      ...(restaurantId && { restaurantId: Number(restaurantId) }),
      ...(clientId && { clientId: Number(clientId) }),
    };

    const [orders, { restaurants, clients }] = await Promise.all([
      getOrders(filters),
      getRestaurantsAndClients(),
    ]);

    let editingOrder = null;
    if (orderId) {
      editingOrder = await getOrderById(Number(orderId));
      if (!editingOrder) {
        throw new Error(`Order with id ${orderId} not found`);
      }
    }

    return json({
      orders,
      restaurants,
      clients,
      editingOrder,
      orderStatuses: ORDER_STATUSES,
    });
  } catch (error) {
    console.error("Error in orders loader:", error);
    throw json(
      { error: "An error occurred while loading orders" },
      { status: 500 }
    );
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const restaurantId = Number(formData.get("restaurantId"));
    const clientId = Number(formData.get("clientId"));
    const status = formData.get("status")?.toString() as OrderStatus;

    const itemsJson = formData.get("items")?.toString() || "[]";
    const items = JSON.parse(itemsJson);

    if (!Array.isArray(items)) {
      throw new Error("Invalid items data");
    }

    const total = items.reduce(
      (sum: number, item: OrderItem) => sum + item.quantity * item.unitPrice,
      0
    );

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
    console.error("Error in orders action:", error);
    return json(
      { error: "An error occurred while processing the order" },
      { status: 500 }
    );
  }
};
