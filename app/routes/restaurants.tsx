import { useState } from "react";
import {
  Link,
  useSearchParams,
  Form,
  useNavigation,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantById,
} from "~/models/restaurant.server";
import Layout from "~/components/Layout";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Card from "~/components/Card/Card";
import DeleteModal from "~/components/Modals/DeleteModal";
import FormModal from "~/components/Modals/FormModal";
import OrderAZ from "~/components/OrderFilter/OrderAZ";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get("edit");
  const sortOrder =
    (url.searchParams.get("sortOrder") as "asc" | "desc") || "asc";

  const restaurants = await getRestaurants(sortOrder);
  const editingRestaurant = restaurantId
    ? await getRestaurantById(Number(restaurantId))
    : null;

  return json({
    restaurants,
    editingRestaurant,
    sortOrder,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action")?.toString();

  try {
    if (action === "delete") {
      const id = Number(formData.get("id"));
      await deleteRestaurant(id);
      return redirect("/restaurants");
    }

    const id = formData.get("id")?.toString();
    const name = formData.get("name")?.toString() || "";
    const address = formData.get("address")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";

    if (id) {
      await updateRestaurant(Number(id), { name, address, phone });
    } else {
      await createRestaurant({ name, address, phone });
    }
    return redirect("/restaurants");
  } catch (error) {
    return json(
      {
        error: "Error saving the restaurant",
      },
      { status: 500 }
    );
  }
};

export default function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { restaurants, editingRestaurant, sortOrder } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const isModalOpen =
    searchParams.get("modal") === "new" || searchParams.get("edit") !== null;

  const openNewModal = () => {
    setSearchParams({ modal: "new" });
  };

  const closeModal = () => {
    setSearchParams({});
  };

  const openDeleteModal = (clientId: number) => {
    setSearchParams({ delete: clientId.toString() });
  };

  const isDeleteModalOpen = searchParams.get("delete") !== null;

  return (
    <div className="bg-orange-100 w-full min-h-screen m-0 ">
      <Layout title="Restaurants" action={openNewModal} color="bg-orange-700">
        <OrderAZ sortOrder={sortOrder} color="bg-orange-700" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {restaurants.map(
            (restaurant: {
              name: string;
              address: string;
              phone: string;
              id: number;
            }) => (
              <Card
                id={restaurant.id}
                avatar={restaurant.name}
                title={restaurant.name}
                attributes={[
                  { key: "Address", label: restaurant.address },
                  { key: "Phone", label: restaurant.phone },
                ]}
                editAction={() =>
                  setSearchParams({ edit: restaurant.id.toString() })
                }
                deleteAction={(e) => {
                  e.preventDefault();
                  openDeleteModal(restaurant.id);
                }}
              />
            )
          )}
        </div>

        {isModalOpen && (
          <FormModal
            navigation={navigation}
            fields={["name", "address", "phone"]}
            closeModal={closeModal}
            editingClient={editingRestaurant}
            actionData={actionData}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteModal
            navigation={navigation}
            text="Are you sure you want to delete this restaurant? Associated orders will be deleted too"
            closeModal={closeModal}
            searchParams={searchParams}
          />
        )}
      </Layout>
    </div>
  );
}
