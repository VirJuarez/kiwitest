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
  getClients,
  createClient,
  updateClient,
  getClientById,
  deleteClient,
} from "~/models/client.server";
import Card from "~/components/Card";
import React, { useState } from "react";
import DeleteModal from "~/components/DeleteModal";
import FormModal from "~/components/FormModal";

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

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clients, editingClient, sortOrder } = useLoaderData<typeof loader>();
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
    <div className="bg-lime-100 w-full min-h-screen m-0 ">
      <Layout title="Clients" action={openNewModal} color="bg-lime-700">
        <Form method="get">
          <button
            type="submit"
            name="sortOrder"
            value={sortOrder === "asc" ? "desc" : "asc"}
            className="bg-lime-600 text-white px-4 py-2 rounded"
          >
            Sort {sortOrder === "asc" ? "A/Z" : "Z/A"}
          </button>
        </Form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clients.map(
            (client: {
              name: string;
              surname: string;
              address: string;
              phone: string;
              id: number;
            }) => (
              <Card
                id={client.id}
                avatar={`${client.name} ${client.surname}`}
                title={`${client.name} ${client.surname}`}
                attributes={[
                  { key: "Address", label: client.address },
                  { key: "Phone", label: client.phone },
                ]}
                editAction={() =>
                  setSearchParams({ edit: client.id.toString() })
                }
                deleteAction={(e) => {
                  e.preventDefault();
                  openDeleteModal(client.id);
                }}
              />
            )
          )}
        </div>

        {isModalOpen && (
          <FormModal
            navigation={navigation}
            fields={["name", "surname", "address", "phone"]}
            closeModal={closeModal}
            editingClient={editingClient}
            actionData={actionData}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteModal
            navigation={navigation}
            text="Are you sure you want to delete this client? Associated orders will be deleted too"
            closeModal={closeModal}
            searchParams={searchParams}
          />
        )}
      </Layout>
    </div>
  );
}
