//import { Button } from "~/components/ui/button";
import Layout from "~/components/Layout";
import { useState } from "react";
import { 
  Link, 
  useSearchParams, 
  Form, 
  useNavigation, 
  useActionData, 
  useLoaderData
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { 
  getClients, 
  createClient, 
  updateClient, 
  getClientById, 
  deleteClient
} from "~/models/client.server";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Avatar from "~/components/Avatar";
import Card from "~/components/Card";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("edit");
  
  const clients = await getClients();
  const editingClient = clientId 
    ? await getClientById(Number(clientId)) 
    : null;

  return json({ 
    clients, 
    editingClient 
  });
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
    return json({ 
      error: "Error saving the client" 
    }, { status: 500 });
  }
};

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clients, editingClient } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const isModalOpen = searchParams.get("modal") === "new" || 
                      searchParams.get("edit") !== null;

  const openNewModal = () => {
    setSearchParams({ modal: "new" });
  };

  const closeModal = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-lime-100 w-full min-h-screen m-0 ">
    <Layout title="Clients" action={openNewModal} color="bg-lime-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clients.map((client: {name:string, surname:string, address:string, phone:string, id:number}) => (
          <Card 
          id={client.id}
          avatar={`${client.name} ${client.surname}`}
          title={`${client.name} ${client.surname}`}
          attributes={[
            { key: "Address", label: client.address }, 
            { key: "Phone", label: client.phone }
          ]}
          editAction={() => setSearchParams({ edit: client.id.toString() })}
          deleteAction={(e) => {
                   if (!confirm('¿Está seguro de eliminar este cliente? Todas las órdenes asociadas también se eliminarán.')) {
                    e.preventDefault();
                      }
              }}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? "Edit Client" : "New Client"}
            </h2>
            <Form method="post" className="space-y-4">
              {editingClient && (
                <input 
                  type="hidden" 
                  name="id" 
                  value={editingClient.id} 
                />
              )}
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingClient?.name}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Surname</label>
                <input
                  type="text"
                  name="surname"
                  defaultValue={editingClient?.surname}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingClient?.address}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingClient?.phone}
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {navigation.state === "submitting" 
                    ? "Saving..." 
                    : "Save"}
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