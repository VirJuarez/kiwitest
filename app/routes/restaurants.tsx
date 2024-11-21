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
import Card from "~/components/Card";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get("edit");

  const restaurants = await getRestaurants();
  const editingRestaurant = restaurantId
    ? await getRestaurantById(Number(restaurantId))
    : null;

  return json({
    restaurants,
    editingRestaurant,
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
  const { restaurants, editingRestaurant } = useLoaderData<typeof loader>();
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

        {/* Rest of the component remains the same as in the previous version */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">
                {editingRestaurant ? "Edit Restaurant" : "New Restaurant"}
              </h2>
              <Form method="post" className="space-y-4">
                {editingRestaurant && (
                  <input type="hidden" name="id" value={editingRestaurant.id} />
                )}
                <div>
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingRestaurant?.name}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingRestaurant?.address}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingRestaurant?.phone}
                    className="w-full border rounded p-2"
                    required
                  />
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

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div
              className="bg-white p-6 rounded-lg w-96"
              role="dialog"
              aria-labelledby="delete-modal-title"
            >
              <h2 id="delete-modal-title" className="text-xl font-bold mb-4">
                Confirm Delete
              </h2>
              <p>Are you sure you want to delete this restaurant?</p>
              <p>Associated orders will be deleted too</p>
              <Form method="post">
                <input
                  type="hidden"
                  name="id"
                  value={searchParams.get("delete") || ""}
                />
                <input type="hidden" name="_action" value="delete" />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    disabled={navigation.state === "submitting"}
                  >
                    {navigation.state === "submitting"
                      ? "Deleting..."
                      : "Delete"}
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
