import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantById,
} from "~/models/restaurant.server";

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
