import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
//import { Button } from "~/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  action: () => void;
  color:string
}

export default function Layout({ children, title, action, color }: LayoutProps) {
  return (
    <div className="container mx-auto pt-10">
      <div className="flex justify-center mb-6 flex-col gap-6">
      <Link to="/">
          <div className="flex"> 
            <ChevronDoubleLeftIcon className="w-4"/>
            <h5>Back</h5> 
            </div>
        </Link>
        <div className="flex justify-between items-center">
        <h1 className="text-5xl font-bold">{title}</h1>
        <button 
        onClick={action}
        className={`${color} text-white px-4 py-2 rounded-lg`}
      >
        Create New
      </button>
      </div>
      </div>
      {children}
    </div>
  );
}