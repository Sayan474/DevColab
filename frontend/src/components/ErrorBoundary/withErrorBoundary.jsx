import GlobalErrorBoundary from "./GlobalErrorBoundary";

// withErrorBoundary is a Higher-Order Component (HOC) that wraps any React component
// with a GlobalErrorBoundary. It accepts optional boundary configuration.
function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <GlobalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  const displayName = Component.displayName || Component.name || "Component";
  WrappedComponent.displayName = `WithErrorBoundary(${displayName})`;

  return WrappedComponent;
}

export default withErrorBoundary;
