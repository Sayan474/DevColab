import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { GlobalErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const handleGlobalError = (error, errorInfo) => {
  console.error("Global error caught by root boundary:", error, errorInfo);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalErrorBoundary onError={handleGlobalError}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

