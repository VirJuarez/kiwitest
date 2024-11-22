import Layout from "~/components/Layout";
import {
  useSearchParams,
  Form,
  useNavigation,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { DetailedOrder } from "~/models/order.server";
import Card from "~/components/Card/Card";
import dayjs from "dayjs";
import { useState } from "react";
import OrderModal from "~/components/Modals/OrderModal";
import Filter from "~/components/OrderFilter/Filter";
import { loader, action } from "~/utils/orders.functions";
import NoObjectCard from "~/components/Card/NoObjectCard";
export { loader, action };

const ORDER_STATUSES = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

type OrderItem = {
  quantity: number;
  unitPrice: number;
  description: string;
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
        {orders.length === 0 ? (
          <NoObjectCard
            onClickAction={openNewModal}
            title="No orders yet"
            text="Click here to add your first order"
            buttontext="Add Order"
            color="bg-purple-700"
          />
        ) : (
          <div>
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
                  createdAt={`${dayjs(order.createdAt).format(
                    "MM-DD-YYYY HH:mm"
                  )}`}
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
                  editAction={() =>
                    setSearchParams({ edit: order.id.toString() })
                  }
                />
              ))}
            </div>
          </div>
        )}

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
