import { Form, Navigation } from "@remix-run/react";

interface ModalProps {
  navigation: Navigation;
  fields: string[];
  closeModal: () => void;
  actionData: any;
  editing: any;
  title: string;
}

export default function FormModal({
  navigation,
  fields,
  closeModal,
  editing,
  actionData,
  title,
}: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {editing ? `Edit ${title}` : `New ${title}`}
        </h2>
        <Form method="post" className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {fields.map((field) => (
            <div id={field}>
              <label className="block mb-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                defaultValue={editing ? editing[field] : ""}
                className="w-full border rounded p-2"
                required
              />
            </div>
          ))}
          {actionData?.error && (
            <div className="text-red-500">{actionData.error}</div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {navigation.state === "submitting" ? "Saving..." : "Save"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
