import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  UsersIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Kiwitest" },
    { name: "Remix Technical Test ", content: "Welcome to Kiwitest!" },
  ];
};

const sections = [
  {
    name: "Clients",
    icon: <UsersIcon />,
    redirect: "/clients",
    color: "bg-lime-400",
  },
  {
    name: "Orders",
    icon: <DocumentTextIcon />,
    redirect: "/orders",
    color: "bg-purple-400",
  },
  {
    name: "Restaurants",
    icon: <BuildingStorefrontIcon />,
    redirect: "/restaurants",
    color: "bg-orange-400",
  },
];

export default function Home() {
  return (
    <div className="w-full min-h-screen m-0 bg-[url('/bg-food-2.jpg')] bg-cover bg-center ">
      <div className="container mx-auto pt-10">
        <h1 className="text-5xl font-bold mb-20 text-white text-center">
          Welcome
        </h1>
        <div className="flex justify-center gap-10 items-center m-auto flex-col">
          {sections.map((section) => (
            <Link
              to={section.redirect}
              className={`h-32 w-full md:w-2/5  border-solid border-black border-2  rounded-xl flex items-center p-10 ${section.color} bg-opacity-60 hover:bg-opacity-100 shadow-xl`}
            >
              <div className="w-20 border rounded-xl p-2  bg-white bg-opacity-60">
                {section.icon}
              </div>
              <button className="text-3xl font-semibold ml-10">
                {section.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
