import { useState, useCallback } from "react";

// useErrorHandler allows functional components to throw errors into the nearest Error Boundary.
// This is useful for asynchronous errors (like API calls or setTimeout) which React's
// standard Error Boundary does not catch by default.
function useErrorHandler(givenError) {
  const [error, setError] = useState(null);

  if (givenError != null) {
    throw givenError;
  }
  if (error != null) {
    throw error;
  }

  return useCallback((err) => {
    setError(err);
  }, []);
}

export default useErrorHandler;
