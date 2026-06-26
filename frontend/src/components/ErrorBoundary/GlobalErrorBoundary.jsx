import React from "react";

// GlobalErrorBoundary is a React class component that catches JavaScript errors
// anywhere in their child component tree, logs those errors, and displays a fallback UI.
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or send to an external logging service like Sentry or Datadog
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (err) {
        console.error("Error in GlobalErrorBoundary onError callback:", err);
      }
    } else {
      console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      // Support custom fallback component or function
      if (fallback) {
        if (typeof fallback === "function") {
          const FallbackComponent = fallback;
          return (
            <FallbackComponent
              error={this.state.error}
              resetErrorBoundary={this.handleReset}
            />
          );
        }
        return fallback;
      }

      // Default premium themed fallback UI
      return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-xl p-6 md:p-8 flex flex-col items-center text-center space-y-6">
            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500 animate-pulse">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Application Error
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                An unexpected error occurred. Please try reloading the page.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-black/5 dark:bg-white/5 rounded-md p-3 text-left overflow-x-auto max-h-40 border border-light-border dark:border-dark-border">
                <code className="text-xs font-mono text-red-500 break-words">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full btn btn-primary flex items-center justify-center py-2.5"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2"
                />
              </svg>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
