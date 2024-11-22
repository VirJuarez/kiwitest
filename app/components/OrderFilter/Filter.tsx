import { Form, SubmitFunction } from "@remix-run/react";
import { Client } from "~/models/client.server";
import { Restaurant } from "~/models/restaurant.server";

interface OrderProps {
  restaurants: Restaurant[];
  clients: Client[];
  searchParams: URLSearchParams;
  submit: SubmitFunction;
}

export default function Filter({
  restaurants,
  clients,
  searchParams,
  submit,
}: OrderProps) {
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(name, value);
    } else {
      newSearchParams.delete(name);
    }
    submit(newSearchParams);
  };

  const resetFilters = () => {
    submit({});
  };

  return (
    <Form method="get" className="mb-4 flex space-x-4 items-end">
      <div>
        <label
          htmlFor="restaurantId"
          className="block text-sm font-medium text-gray-700"
        >
          Filter by Restaurant
        </label>
        <select
          id="restaurantId"
          name="restaurantId"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          onChange={handleFilterChange}
          value={searchParams.get("restaurantId") || ""}
        >
          <option value="">All Restaurants</option>
          {restaurants.map((restaurant: Restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="clientId"
          className="block text-sm font-medium text-gray-700"
        >
          Filter by Client
        </label>
        <select
          id="clientId"
          name="clientId"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          onChange={handleFilterChange}
          value={searchParams.get("clientId") || ""}
        >
          <option value="">All Clients</option>
          {clients.map((client: Client) => (
            <option key={client.id} value={client.id}>
              {client.name} {client.surname}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={resetFilters}
        className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-500"
      >
        Reset Filters
      </button>
    </Form>
  );
}
