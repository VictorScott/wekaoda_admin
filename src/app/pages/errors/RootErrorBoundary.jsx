// Import Depndencies
import { isRouteErrorResponse, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";

// ----------------------------------------------------------------------

const app = {
  401: lazy(() => import("./401")),
  404: lazy(() => import("./404")),
  429: lazy(() => import("./429")),
  500: lazy(() => import("./500")),
};

function RootErrorBoundary() {
  const error = useRouteError();

  // Add error logging for debugging
  console.error('RootErrorBoundary caught error:', error);
  console.error('Error stack:', error?.stack);
  console.error('Error message:', error?.message);

  if (isRouteErrorResponse(error)) {
    const Component = Loadable(app[error.status]);
    return <Component />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-dark-300 mb-4">
          An unexpected error occurred. Please check the console for details.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export default RootErrorBoundary;
