import Layout from "~/components/Layout";
import {
  useSearchParams,
  useNavigation,
  useActionData,
  useLoaderData,
} from "@remix-run/react";

import Card from "~/components/Card/Card";
import DeleteModal from "~/components/Modals/DeleteModal";
import FormModal from "~/components/Modals/FormModal";
import OrderAZ from "~/components/OrderFilter/OrderAZ";
import { loader, action } from "~/utils/clients.functions";
import NoObjectCard from "~/components/Card/NoObjectCard";
export { loader, action };

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
        {clients.length === 0 ? (
          <NoObjectCard
            onClickAction={openNewModal}
            title="No clients registered yet"
            text="Click here to add your first client"
            buttontext="Add Client"
            color="bg-lime-700"
          />
        ) : (
          <div>
            <OrderAZ sortOrder={sortOrder} color="bg-lime-700" />
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
          </div>
        )}

        {isModalOpen && (
          <FormModal
            navigation={navigation}
            fields={["name", "surname", "address", "phone"]}
            closeModal={closeModal}
            editing={editingClient}
            actionData={actionData}
            title="Client"
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
