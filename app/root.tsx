import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "/kiwi-icon.png",
    type: "image/x-icon",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>Error | Kiwitest</title>
      </head>
      <body className="bg-gray-100 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white shadow-xl rounded-lg p-8 text-center">
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {isRouteErrorResponse(error)
              ? `${error.status} ${error.statusText}`
              : "Application Error"}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {isRouteErrorResponse(error)
              ? error.data?.message || "An unexpected error occurred."
              : "We're sorry, but something went wrong. Please try again later."}
          </p>
          {error instanceof Error && (
            <div className="mt-6">
              <details className="text-left">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 focus:outline-none">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Retry
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Go Home
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
