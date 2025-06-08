import React from "react";
import PropTypes from "prop-types";

class ZoomErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 [ZoomErrorBoundary] Error caught:", error);
    console.error("🚨 [ZoomErrorBoundary] Error info:", errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }

    // Call parent error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reportError = (error, errorInfo) => {
    // Implement your error reporting service here
    // Example: Sentry, LogRocket, etc.
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId,
      meetingId: this.props.meetingConfig?.meetingNumber,
    };

    console.log("📊 [ZoomErrorBoundary] Error report:", errorReport);

    // Send to your error tracking service
    // fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) });
  };

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleFallback = () => {
    // Redirect to alternative meeting solution
    if (this.props.fallbackUrl) {
      window.open(this.props.fallbackUrl, "_blank");
    } else {
      // Show instructions for manual join
      alert(
        `Please join the meeting manually:\n\nMeeting ID: ${this.props.meetingConfig?.meetingNumber}\nPassword: ${this.props.meetingConfig?.passWord}`
      );
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="zoom-error-boundary">
          <div className="error-container">
            <div className="error-icon">🚨</div>
            <h2>Zoom Meeting Error</h2>
            <p className="error-message">
              We encountered an issue loading the Zoom meeting. This might be
              due to:
            </p>

            <ul className="error-reasons">
              <li>🌐 Network connectivity issues</li>
              <li>🔒 Browser security restrictions</li>
              <li>📱 Device compatibility problems</li>
              <li>🔧 Zoom SDK loading failures</li>
            </ul>

            <div className="error-actions">
              <button
                onClick={this.handleRetry}
                className="retry-button"
                disabled={this.state.retryCount >= 3}
              >
                🔄 Try Again ({3 - this.state.retryCount} attempts left)
              </button>

              <button onClick={this.handleFallback} className="fallback-button">
                🌐 Join via Browser
              </button>

              <button
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                🔃 Reload Page
              </button>
            </div>

            {this.props.meetingConfig && (
              <div className="manual-join-info">
                <h3>📋 Manual Join Information</h3>
                <div className="join-details">
                  <p>
                    <strong>Meeting ID:</strong>{" "}
                    {this.props.meetingConfig.meetingNumber}
                  </p>
                  {this.props.meetingConfig.passWord && (
                    <p>
                      <strong>Password:</strong>{" "}
                      {this.props.meetingConfig.passWord}
                    </p>
                  )}
                  <p>
                    <strong>Join URL:</strong>{" "}
                    <a
                      href={`https://zoom.us/j/${this.props.meetingConfig.meetingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://zoom.us/j/{this.props.meetingConfig.meetingNumber}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Technical Details for Development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="error-details">
                <summary>🔧 Technical Details (Development)</summary>
                <div className="error-technical">
                  <h4>Error Message:</h4>
                  <pre>{this.state.error.message}</pre>

                  <h4>Stack Trace:</h4>
                  <pre>{this.state.error.stack}</pre>

                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>

          <style jsx>{`
            .zoom-error-boundary {
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                Oxygen, Ubuntu, Cantarell, sans-serif;
            }

            .error-container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 600px;
              margin: 20px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              text-align: center;
            }

            .error-icon {
              font-size: 60px;
              margin-bottom: 20px;
            }

            h2 {
              color: #333;
              margin-bottom: 20px;
              font-size: 28px;
              font-weight: 600;
            }

            .error-message {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }

            .error-reasons {
              text-align: left;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }

            .error-reasons li {
              margin: 10px 0;
              color: #555;
            }

            .error-actions {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              justify-content: center;
              margin: 30px 0;
            }

            .retry-button,
            .fallback-button,
            .reload-button {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 14px;
            }

            .retry-button {
              background: #007bff;
              color: white;
            }

            .retry-button:hover:not(:disabled) {
              background: #0056b3;
              transform: translateY(-2px);
            }

            .retry-button:disabled {
              background: #6c757d;
              cursor: not-allowed;
            }

            .fallback-button {
              background: #28a745;
              color: white;
            }

            .fallback-button:hover {
              background: #218838;
              transform: translateY(-2px);
            }

            .reload-button {
              background: #ffc107;
              color: #212529;
            }

            .reload-button:hover {
              background: #e0a800;
              transform: translateY(-2px);
            }

            .manual-join-info {
              background: #e7f3ff;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              text-align: left;
            }

            .manual-join-info h3 {
              margin: 0 0 15px 0;
              color: #0056b3;
              font-size: 18px;
            }

            .join-details p {
              margin: 8px 0;
              color: #333;
            }

            .join-details a {
              color: #007bff;
              text-decoration: none;
            }

            .join-details a:hover {
              text-decoration: underline;
            }

            .error-details {
              margin: 20px 0;
              text-align: left;
            }

            .error-technical {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              font-family: monospace;
              font-size: 12px;
            }

            .error-technical h4 {
              color: #333;
              margin: 15px 0 10px 0;
              font-size: 14px;
            }

            .error-technical pre {
              background: #fff;
              padding: 10px;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            @media (max-width: 768px) {
              .error-container {
                margin: 10px;
                padding: 20px;
              }

              .error-actions {
                flex-direction: column;
              }

              .retry-button,
              .fallback-button,
              .reload-button {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

ZoomErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  fallbackUrl: PropTypes.string,
  meetingConfig: PropTypes.object,
  userId: PropTypes.string,
};

export default ZoomErrorBoundary;
