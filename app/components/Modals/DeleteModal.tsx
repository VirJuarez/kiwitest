import { Form, Navigation } from "@remix-run/react";

interface ModalProps {
  navigation: Navigation;
  text: string;
  closeModal: () => void;
  searchParams: URLSearchParams;
}

export default function DeleteModal({
  navigation,
  text,
  closeModal,
  searchParams,
}: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className="bg-white p-6 rounded-lg w-96"
        role="dialog"
        aria-labelledby="delete-modal-title"
      >
        <h2 id="delete-modal-title" className="text-xl font-bold mb-4">
          Confirm Delete
        </h2>
        <p>{text}</p>
        <Form method="post">
          <input
            type="hidden"
            name="id"
            value={searchParams.get("delete") || ""}
          />
          <input type="hidden" name="_action" value="delete" />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
