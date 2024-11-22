import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  getClients,
  createClient,
  updateClient,
  getClientById,
  deleteClient,
} from "~/models/client.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("edit");
    const sortOrder =
      (url.searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    const clients = await getClients(sortOrder);
    let editingClient = null;

    if (clientId) {
      editingClient = await getClientById(Number(clientId));
      if (!editingClient) {
        throw new Error(`Client with id ${clientId} not found`);
      }
    }

    return json({
      clients,
      editingClient,
      sortOrder,
    });
  } catch (error) {
    console.error("Error in clients loader:", error);
    throw json(
      { error: "An error occurred while loading clients" },
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
      await deleteClient(id);
      return redirect("/clients");
    }

    const id = formData.get("id")?.toString();
    const name = formData.get("name")?.toString() || "";
    const surname = formData.get("surname")?.toString() || "";
    const address = formData.get("address")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";

    if (id) {
      await updateClient(Number(id), { name, surname, address, phone });
    } else {
      await createClient({ name, surname, address, phone });
    }
    return redirect("/clients");
  } catch (error) {
    console.error("Error in clients action:", error);
    return json(
      { error: "An error occurred while processing the client" },
      { status: 500 }
    );
  }
};
