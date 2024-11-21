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
import Card from "~/components/Card";
import dayjs from "dayjs";
import { useState } from "react";
import OrderModal from "~/components/OrderModal";

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

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(name, value);
    } else {
      newSearchParams.delete(name);
    }
    submit(newSearchParams);
  };

  const resetFilters = () => {
    submit({});
  };

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { quantity: 1, unitPrice: 0, description: "" },
    ]);
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: number | string
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      .toFixed(2);
  };

  return (
    <div className="bg-purple-100 w-full min-h-screen m-0 ">
      <Layout title="Orders" action={openNewModal} color="bg-purple-700">
        <Form method="get" className="mb-4 flex space-x-4 items-end">
          <div>
            <label
              htmlFor="restaurantId"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Restaurant
            </label>
            <select
              id="restaurantId"
              name="restaurantId"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={handleFilterChange}
              value={searchParams.get("restaurantId") || ""}
            >
              <option value="">All Restaurants</option>
              {restaurants.map((restaurant: Restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Client
            </label>
            <select
              id="clientId"
              name="clientId"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={handleFilterChange}
              value={searchParams.get("clientId") || ""}
            >
              <option value="">All Clients</option>
              {clients.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.surname}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset Filters
          </button>
        </Form>

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
