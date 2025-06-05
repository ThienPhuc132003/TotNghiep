// Error Boundary component to catch React errors including Google Maps issues
import React from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Check if it's a Google Maps related error
    if (error.message && error.message.includes("google")) {
      console.warn("Google Maps error detected:", error.message);
    }

    // Check if it's a CORS related error
    if (
      error.message &&
      (error.message.includes("CORS") || error.message.includes("cross-origin"))
    ) {
      console.warn("CORS error detected:", error.message);
    }

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Report to error logging service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: "20px",
            border: "1px solid #ff6b6b",
            borderRadius: "8px",
            backgroundColor: "#ffe0e0",
            color: "#d63031",
            margin: "10px 0",
          }}
        >
          <h3>🚨 Something went wrong</h3>{" "}
          <p>
            The component encountered an error and couldn&apos;t render
            properly.
          </p>
          {this.props.showDetails && this.state.error && (
            <details style={{ marginTop: "10px" }}>
              <summary>Error Details</summary>
              <pre
                style={{
                  fontSize: "12px",
                  backgroundColor: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  onError: PropTypes.func,
  fallback: PropTypes.node,
  showDetails: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

ErrorBoundary.defaultProps = {
  onError: null,
  fallback: null,
  showDetails: false,
};

export default ErrorBoundary;
