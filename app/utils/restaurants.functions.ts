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
  try {
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get("edit");
    const sortOrder =
      (url.searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    const restaurants = await getRestaurants(sortOrder);
    let editingRestaurant = null;

    if (restaurantId) {
      editingRestaurant = await getRestaurantById(Number(restaurantId));
      if (!editingRestaurant) {
        throw new Error(`Restaurant with id ${restaurantId} not found`);
      }
    }

    return json({
      restaurants,
      editingRestaurant,
      sortOrder,
    });
  } catch (error) {
    console.error("Error in restaurants loader:", error);
    throw json(
      { error: "An error occurred while loading restaurants: error" },
      { status: 500 }
    );
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const action = formData.get("_action")?.toString();

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
      { error: "An error occurred while processing the restaurant" },
      { status: 500 }
    );
  }
};
