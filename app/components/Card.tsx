import { TrashIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { Form, Link } from "@remix-run/react";
import Avatar from "./Avatar";
//import { Button } from "~/components/ui/button";

interface CardProps {
  id: number;
  avatar: string;
  title: string;
  deleteAction?: (e: React.FormEvent) => void ;
  editAction: () => void;
  attributes: { key: string; label: string }[];
}

export default function Card({ id, avatar, title, editAction, deleteAction, attributes }: CardProps) {
  return (
    <div 
            key={id} 
            className="border p-4 rounded-xl bg-white"
          >
            <div className="flex items-center gap-4 mb-3">
            <Avatar name={`${avatar}`}/>
            <h2 className="text-2xl font-semibold">{title}</h2>
            </div>
            {attributes.map((attr, index) => (
  <p key={index}><strong>{attr.key}: </strong>{attr.label}</p>
))}
            <div className="mt-3 flex space-x-2">
            <button 
              onClick={editAction}
              className="bg-yellow-500 text-white px-2 py-1 rounded flex-grow flex items-center justify-center gap-2"
            >
              <PencilSquareIcon className="w-5"/>
              Edit
            </button>
            <Form method="post" className="flex-grow">
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  name="_action"
                  value="delete"
                  className="bg-red-500 text-white px-2 py-1 rounded w-full flex items-center justify-center gap-2"
                  onClick={deleteAction}
                >
                  <TrashIcon className="w-5"/>
                  Delete
                </button>
              </Form>
              </div>
          </div>
  );
}