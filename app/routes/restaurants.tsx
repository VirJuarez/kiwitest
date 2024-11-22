import {
  useSearchParams,
  useNavigation,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import Layout from "~/components/Layout";
import Card from "~/components/Card/Card";
import DeleteModal from "~/components/Modals/DeleteModal";
import FormModal from "~/components/Modals/FormModal";
import OrderAZ from "~/components/OrderFilter/OrderAZ";
import { loader, action } from "~/utils/restaurants.functions";
import NoObjectCard from "~/components/Card/NoObjectCard";
import { Restaurant } from "~/models/restaurant.server";
import { GenericErrorBoundary } from "~/components/ErrorBoundary";
export { loader, action };

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
        {restaurants.length === 0 ? (
          <NoObjectCard
            onClickAction={openNewModal}
            title="No restaurants registered yet"
            text="Click here to add your first restaurant"
            buttontext="Add Restaurant"
            color="bg-orange-700"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {restaurants.map((restaurant: Restaurant) => (
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
            ))}
          </div>
        )}

        {isModalOpen && (
          <FormModal
            navigation={navigation}
            fields={["name", "address", "phone"]}
            closeModal={closeModal}
            editing={editingRestaurant}
            actionData={actionData}
            title="Restaurant"
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

export function ErrorBoundary() {
  return <GenericErrorBoundary entityName="clients" />;
}
