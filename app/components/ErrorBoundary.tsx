import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { FaceFrownIcon } from "@heroicons/react/24/outline";

interface ErrorBoundaryProps {
  entityName: string;
}

export function GenericErrorBoundary({ entityName }: ErrorBoundaryProps) {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <FaceFrownIcon className="mx-auto h-12 w-12 text-yellow-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : "Oops! Something went wrong"}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRouteErrorResponse(error)
            ? error.data?.message ||
              `There was an error loading the ${entityName}.`
            : `There was an error loading the ${entityName}. Please try again later.`}
        </p>
        {error instanceof Error && (
          <div className="mt-4">
            <details className="text-left">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Error Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          </div>
        )}
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Try Again
          </button>
          <a
            href="/"
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Back Home
          </a>
        </div>
      </div>
    </div>
  );
}
