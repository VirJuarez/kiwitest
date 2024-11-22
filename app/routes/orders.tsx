import Layout from "~/components/Layout";
import {
  useSearchParams,
  Form,
  useNavigation,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getOrders,
  createOrder,
  updateOrder,
  getOrderById,
  getRestaurantsAndClients,
  Order,
  DetailedOrder,
} from "~/models/order.server";
import { Client } from "~/models/client.server";
import { Restaurant } from "~/models/restaurant.server";
import Card from "~/components/Card/Card";
import dayjs from "dayjs";
import { useState } from "react";
import OrderModal from "~/components/Modals/OrderModal";
import Filter from "~/components/OrderFilter/Filter";

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

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, restaurants, clients, editingOrder, orderStatuses } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { quantity: 1, unitPrice: 0, description: "" },
  ]);

  const isNewModalOpen = searchParams.get("modal") === "new";
  const isEditModalOpen = searchParams.get("edit") !== null;

  const openNewModal = () => {
    setSearchParams({ modal: "new" });
    setOrderItems([{ quantity: 1, unitPrice: 0, description: "" }]);
  };

  const closeModal = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-purple-100 w-full min-h-screen m-0 ">
      <Layout title="Orders" action={openNewModal} color="bg-purple-700">
        <Filter
          restaurants={restaurants}
          clients={clients}
          searchParams={searchParams}
          submit={submit}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orders.map((order: DetailedOrder) => (
            <Card
              key={order.id}
              id={order.id}
              avatar={`# ${order.id}`}
              title={`Order #${order.id}`}
              createdAt={`${dayjs(order.createdAt).format("MM-DD-YYYY HH:mm")}`}
              attributes={[
                { key: "Restaurant", label: order.restaurant.name },
                {
                  key: "Client",
                  label: `${order.client.name} ${order.client.surname}`,
                },
                {
                  key: "Status",
                  label:
                    order.status === "COMPLETED"
                      ? `${ORDER_STATUSES[order.status]} (${dayjs(
                          order.completedAt
                        ).format("MM-DD-YYYY HH:mm")})`
                      : ORDER_STATUSES[order.status],
                },
                { key: "Total", label: order.total.toFixed(2) },
              ]}
              editAction={() => setSearchParams({ edit: order.id.toString() })}
            />
          ))}
        </div>

        {isNewModalOpen && (
          <OrderModal
            navigation={navigation}
            closeModal={closeModal}
            restaurants={restaurants}
            clients={clients}
            orderStatuses={orderStatuses}
            actionData={actionData}
            orderItems={orderItems}
            setOrderItems={setOrderItems}
            edit={false}
          />
        )}

        {isEditModalOpen && editingOrder && (
          <OrderModal
            navigation={navigation}
            closeModal={closeModal}
            restaurants={restaurants}
            clients={clients}
            orderStatuses={orderStatuses}
            actionData={actionData}
            orderItems={orderItems}
            setOrderItems={setOrderItems}
            edit={true}
            editingOrder={editingOrder}
          />
        )}
      </Layout>
    </div>
  );
}
