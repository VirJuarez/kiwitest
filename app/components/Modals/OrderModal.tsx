import { Form, Navigation } from "@remix-run/react";
import { Client } from "~/models/client.server";
import { Restaurant } from "~/models/restaurant.server";
import { OrderItem, DetailedOrder } from "~/models/order.server";

interface ModalProps {
  navigation: Navigation;
  closeModal: () => void;
  actionData: any;
  restaurants: Restaurant[];
  clients: Client[];
  orderStatuses: Record<string, string>;
  orderItems: OrderItem[];
  setOrderItems: (value: React.SetStateAction<any[]>) => void;
  edit: boolean;
  editingOrder?: DetailedOrder;
}

export default function OrderModal({
  navigation,
  closeModal,
  restaurants,
  clients,
  orderStatuses,
  actionData,
  orderItems,
  setOrderItems,
  edit,
  editingOrder,
}: ModalProps) {
  const calculateTotal = () => {
    return orderItems
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      .toFixed(2);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[30rem]">
        <h2 className="text-xl font-bold mb-4">
          {edit ? "Detail" : "New Order"}
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="id" value={editingOrder?.id} />
          {/* Restaurant Dropdown */}
          <div>
            <label className="block mb-2">Restaurant</label>
            {edit ? (
              <input
                type="text"
                value={editingOrder?.restaurant.name}
                className="w-full border rounded p-2 bg-gray-100"
                readOnly
              />
            ) : (
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
            )}
          </div>

          {/* Client Dropdown */}
          <div>
            <label className="block mb-2">Client</label>
            {edit ? (
              <input
                type="text"
                value={`${editingOrder?.client.name} ${editingOrder?.client.surname}`}
                className="w-full border rounded p-2 bg-gray-100"
                readOnly
              />
            ) : (
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
            )}
          </div>

          {/* Order Items Section */}
          <div>
            <label className="block mb-2">Items</label>
            {edit
              ? editingOrder?.items.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={`${item.quantity} x ${item.description} = ${
                        item.quantity * item.unitPrice
                      }`}
                      className="w-full border rounded p-2 bg-gray-100"
                      readOnly
                    />
                  </div>
                ))
              : orderItems.map((item, index) => (
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
                        type="text"
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
                          updateOrderItem(index, "description", e.target.value)
                        }
                        className="border rounded p-2"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg mt-4"
                    >
                      X
                    </button>
                  </div>
                ))}
            {!edit && (
              <button
                type="button"
                onClick={addOrderItem}
                className="bg-green-500 text-white px-2 py-1 rounded-lg mt-2"
              >
                + Add Item
              </button>
            )}
          </div>

          {/* Status Dropdown with predefined options */}
          <div>
            <label className="block mb-2">Status</label>
            {editingOrder?.status !== "COMPLETED" ? (
              <select
                name="status"
                defaultValue={edit ? editingOrder?.status : "PENDING"}
                className="w-full border rounded p-2"
                required
              >
                {Object.entries(orderStatuses)
                  .filter(([key]) => {
                    if (editingOrder?.status === "IN_PROGRESS") {
                      return key !== "PENDING";
                    } else if (editingOrder?.status === "COMPLETED") {
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

          {/* Hidden input to pass items as JSON */}
          {!edit && (
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(orderItems)}
            />
          )}

          {/* Total Display */}
          <div className="mt-4 text-right">
            <strong>
              Total: {edit ? editingOrder?.total.toFixed(2) : calculateTotal()}
            </strong>
          </div>

          {actionData?.error && (
            <div className="text-red-500">{actionData.error}</div>
          )}

          {editingOrder?.status !== "COMPLETED" ? (
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                {navigation.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
