import Layout from "~/components/Layout";
import { useState, useEffect } from "react";
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

const ORDER_STATUSES = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

type OrderStatus = keyof typeof ORDER_STATUSES;

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
    (sum: number, item: any) => sum + item.quantity * item.unitPrice,
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

  // State for dynamic order items
  const [orderItems, setOrderItems] = useState(
    editingOrder
      ? (editingOrder.items as any[])
      : [{ quantity: "1", unitPrice: "", description: "" }]
  );

  const isNewModalOpen = searchParams.get("modal") === "new";
  const isEditModalOpen = searchParams.get("edit") !== null;

  const openNewModal = () => {
    setSearchParams({ modal: "new" });
    setOrderItems([{ quantity: 1, unitPrice: "", description: "" }]);
  };

  const closeModal = () => {
    setSearchParams({});
  };

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { quantity: 1, unitPrice: 0, description: "" },
    ]);
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const removeOrderItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
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
              id={order.id}
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

        {/* New Order Modal (Unchanged) */}
        {isNewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">New Order</h2>
              <Form method="post" className="space-y-4">
                {/* Restaurant Dropdown */}
                <div>
                  <label className="block mb-2">Restaurant</label>
                  <select
                    name="restaurantId"
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map((restaurant: Restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Dropdown */}
                <div>
                  <label className="block mb-2">Client</label>
                  <select
                    name="clientId"
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map((client: Client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.surname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Dropdown with predefined options */}
                <div>
                  <label className="block mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue="PENDING"
                    className="w-full border rounded p-2"
                    required
                  >
                    {Object.entries(orderStatuses).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label as string}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Items Section */}
                <div>
                  <label className="block mb-2">Items</label>
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <div className="flex flex-col w-1/5">
                        <label className="text-xs">Quantity</label>
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) =>
                            updateOrderItem(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          className="border rounded p-2"
                          min="1"
                          required
                        />
                      </div>
                      <div className="flex flex-col w-1/5">
                        <label className="text-xs">Unit Price</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateOrderItem(
                              index,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                          className="border rounded p-2"
                          step="1"
                          min="1"
                          required
                        />
                      </div>
                      <div className="flex flex-col w-2/4">
                        <label className="text-xs">Description</label>
                        <input
                          type="text"
                          placeholder="Item"
                          value={item.description}
                          onChange={(e) =>
                            updateOrderItem(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="border rounded p-2"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-4"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="bg-green-500 text-white px-2 py-1 rounded mt-2"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Hidden input to pass items as JSON */}
                <input
                  type="hidden"
                  name="items"
                  value={JSON.stringify(orderItems)}
                />

                {/* Total Display */}
                <div className="mt-4 text-right">
                  <strong>Total: ${calculateTotal()}</strong>
                </div>

                {actionData?.error && (
                  <div className="text-red-500">{actionData.error}</div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    {navigation.state === "submitting" ? "Saving..." : "Save"}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Edit Status Modal */}
        {isEditModalOpen && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Detail</h2>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="id" value={editingOrder.id} />

                {/* Read-only restaurant information */}
                <div>
                  <label className="block mb-2">Restaurant</label>
                  <input
                    type="text"
                    value={editingOrder.restaurant.name}
                    className="w-full border rounded p-2 bg-gray-100"
                    readOnly
                  />
                </div>

                {/* Read-only client information */}
                <div>
                  <label className="block mb-2">Client</label>
                  <input
                    type="text"
                    value={`${editingOrder.client.name} ${editingOrder.client.surname}`}
                    className="w-full border rounded p-2 bg-gray-100"
                    readOnly
                  />
                </div>

                {/* Read-only order items */}
                <div>
                  <label className="block mb-2">Items</label>
                  {editingOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={`${item.quantity} x ${item.description}`}
                        className="w-full border rounded p-2 bg-gray-100"
                        readOnly
                      />
                    </div>
                  ))}
                </div>

                {/* Status Dropdown with only status modification */}
                <div>
                  <label className="block mb-2">
                    {editingOrder.status !== "COMPLETED"
                      ? "Edit Status"
                      : "Status"}
                  </label>
                  {editingOrder.status !== "COMPLETED" ? (
                    <select
                      name="status"
                      defaultValue={editingOrder.status}
                      className="w-full border rounded p-2"
                      required
                    >
                      {Object.entries(orderStatuses)
                        .filter(([key]) => {
                          if (editingOrder.status === "IN_PROGRESS") {
                            return key !== "PENDING";
                          } else if (editingOrder.status === "COMPLETED") {
                            return key === "COMPLETED";
                          }
                          return true;
                        })
                        .map(([key, label]) => (
                          <option key={key} value={key}>
                            {label as string}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={"Completed"}
                      className="w-full border rounded p-2 bg-gray-100"
                      readOnly
                    />
                  )}
                </div>

                {/* Read-only total */}
                <div className="mt-4 text-right">
                  <strong>Total: ${editingOrder.total.toFixed(2)}</strong>
                </div>

                {actionData?.error && (
                  <div className="text-red-500">{actionData.error}</div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    {navigation.state === "submitting" ? "Saving..." : "Save"}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
}
