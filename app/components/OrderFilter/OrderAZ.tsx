import { Form } from "@remix-run/react";

interface OrderProps {
  sortOrder: string;
  color: string;
}

export default function OrderAZ({ sortOrder, color }: OrderProps) {
  return (
    <div className="mb-4 flex space-x-4 items-center">
      <h3>Sort: </h3>
      <Form method="get">
        <button
          type="submit"
          name="sortOrder"
          value={sortOrder === "asc" ? "desc" : "asc"}
          className={`${color} text-white px-4 py-2 rounded-lg`}
        >
          {sortOrder === "asc" ? "A/Z" : "Z/A"}
        </button>
      </Form>
    </div>
  );
}
