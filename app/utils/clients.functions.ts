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
    const editingClient = clientId
      ? await getClientById(Number(clientId))
      : null;

    return json({
      clients,
      editingClient,
      sortOrder,
    });
  } catch (error) {
    console.error("Error detallado:", error);
    // Manejo específico de errores
    throw new Error(`Error en clients route: ${error}`);
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const action = formData.get("_action")?.toString();

  try {
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
      // Update
      await updateClient(Number(id), { name, surname, address, phone });
    } else {
      // Create
      await createClient({ name, surname, address, phone });
    }
    return redirect("/clients");
  } catch (error) {
    return json(
      {
        error: "Error saving the client",
      },
      { status: 500 }
    );
  }
};
