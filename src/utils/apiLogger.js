// API Logger Utility - Simple & Clean Logging
// Provides clean, concise API logging functionality

class APILogger {
  constructor() {
    this.isEnabled = localStorage.getItem("API_LOGGING_ENABLED") !== "false";
    this.requestStartTimes = new Map();
  }

  enable() {
    this.isEnabled = true;
    localStorage.setItem("API_LOGGING_ENABLED", "true");
    console.log("🔊 API Logging ENABLED");
    return "✅ API Logging is now ENABLED";
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem("API_LOGGING_ENABLED", "false");
    console.log("🔇 API Logging DISABLED");
    return "❌ API Logging is now DISABLED";
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
      return "❌ API Logging is now DISABLED";
    } else {
      this.enable();
      return "✅ API Logging is now ENABLED";
    }
  }

  getStatus() {
    return this.isEnabled ? "ENABLED" : "DISABLED";
  }

  // Generate unique request ID for timing
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log API request - enhanced format with timing
  logRequest(method, url, data = null, query = null) {
    if (!this.isEnabled) return;

    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    // Store start time for duration calculation
    this.requestStartTimes.set(requestId, performance.now());

    console.group(`🚀 [${method}] API Request - ${timestamp}`);
    console.log(`🔗 URL: %c${url}`, "color: #2196F3; font-weight: bold;");
    console.log(
      `🆔 Request ID: %c${requestId}`,
      "color: #9C27B0; font-weight: bold;"
    );

    if (query && Object.keys(query).length > 0) {
      console.log("📋 Query Parameters:");
      console.table(query);
      console.log(
        `🔍 Query String: %c${new URLSearchParams(query).toString()}`,
        "color: #FF9800;"
      );
    } // Enhanced body data logging - Consistent for ALL methods
    if (data && Object.keys(data).length > 0) {
      console.log("📤 Request Body:");
      console.log(`%c${JSON.stringify(data, null, 2)}`, "color: #4CAF50;");

      // Method-specific highlights and notes
      switch (method) {
        case "GET":
          console.log(
            `🔥 Custom GET with Body Data: %c${Object.keys(data).join(", ")}`,
            "color: #FF6B35; font-weight: bold; background: rgba(255, 107, 53, 0.1); padding: 2px 6px; border-radius: 4px;"
          );
          console.log(
            `ℹ️ Note: %cBackend supports GET with body data (custom API)`,
            "color: #2196F3; font-style: italic;"
          );
          break;

        case "POST":
          console.log(
            `📝 POST Data: %c${Object.keys(data).join(", ")}`,
            "color: #2196F3; font-weight: bold; background: rgba(33, 150, 243, 0.1); padding: 2px 6px; border-radius: 4px;"
          );
          break;

        case "PUT":
          console.log(
            `� PUT Update: %c${Object.keys(data).join(", ")}`,
            "color: #FF9800; font-weight: bold; background: rgba(255, 152, 0, 0.1); padding: 2px 6px; border-radius: 4px;"
          );
          break;

        case "PATCH":
          console.log(
            `🔧 PATCH Fields: %c${Object.keys(data).join(", ")}`,
            "color: #9C27B0; font-weight: bold; background: rgba(156, 39, 176, 0.1); padding: 2px 6px; border-radius: 4px;"
          );
          break;

        case "DELETE":
          console.log(
            `�️ DELETE with Body: %c${Object.keys(data).join(", ")}`,
            "color: #F44336; font-weight: bold; background: rgba(244, 67, 54, 0.1); padding: 2px 6px; border-radius: 4px;"
          );
          break;
      }

      // DEBUG: Log exact data being sent (for all methods)
      console.log(
        `🔍 DEBUG - Exact body data: %c${JSON.stringify(data)}`,
        "color: #607D8B; font-weight: bold; background: rgba(96, 125, 139, 0.1); padding: 2px 6px; border-radius: 4px;"
      );
      console.log(
        `🔍 DEBUG - Data type: %c${typeof data} | Keys: [${Object.keys(
          data
        ).join(", ")}]`,
        "color: #607D8B; font-style: italic;"
      );
    } else {
      // Different messages for different methods when no data
      switch (method) {
        case "GET":
          console.log(
            "📤 Request Body: %cNone (Standard GET request)",
            "color: #757575;"
          );
          break;
        case "DELETE":
          console.log(
            "📤 Request Body: %cNone (Standard DELETE request)",
            "color: #757575;"
          );
          break;
        default:
          console.log("📤 Request Body: %cEmpty", "color: #757575;");
      }
    }

    console.groupEnd();

    return requestId;
  }

  // Log API response - enhanced format with timing
  logResponse(data, requestId = null) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    let duration = null;

    if (requestId && this.requestStartTimes.has(requestId)) {
      duration = performance.now() - this.requestStartTimes.get(requestId);
      this.requestStartTimes.delete(requestId);
    }

    console.group(`✅ API Response - ${timestamp}`);

    if (duration !== null) {
      console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`);
    }

    if (requestId) {
      console.log("🆔 Request ID:", requestId);
    }

    console.log("📥 Response Data:");

    // Enhanced logging for different data types
    if (Array.isArray(data)) {
      console.log(`📊 Array Response (${data.length} items):`);
      console.table(data.slice(0, 5)); // Show first 5 items in table format
      if (data.length > 5) {
        console.log(`... and ${data.length - 5} more items`);
      }
    } else if (data && typeof data === "object") {
      // Check if it's paginated response
      if (
        Object.prototype.hasOwnProperty.call(data, "data") &&
        Object.prototype.hasOwnProperty.call(data, "pagination")
      ) {
        console.log("📄 Paginated Response:");
        console.log("📊 Pagination Info:", data.pagination);
        console.log(`📋 Data (${data.data.length} items):`);
        console.table(data.data.slice(0, 5));
        if (data.data.length > 5) {
          console.log(`... and ${data.data.length - 5} more items`);
        }
      } else if (
        Object.prototype.hasOwnProperty.call(data, "result") &&
        Object.prototype.hasOwnProperty.call(data.result, "items")
      ) {
        // Handle result.items structure (like meeting API)
        console.log("📄 Result Response:");
        console.log(
          `📊 Total: %c${data.result.total || data.result.items.length}`,
          "color: #2196F3; font-weight: bold;"
        );
        console.log(`📋 Items (${data.result.items.length} items):`);
        console.table(data.result.items.slice(0, 5));
        if (data.result.items.length > 5) {
          console.log(`... and ${data.result.items.length - 5} more items`);
        }
      } else {
        console.log("📦 Object Response:");
        console.log(`%c${JSON.stringify(data, null, 2)}`, "color: #4CAF50;");
      }
    } else {
      console.log("📄 Raw Response:", data);
    }

    console.groupEnd();
  }

  // Log API error - enhanced format with more details
  logError(error, url = "", requestId = null) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    let duration = null;

    if (requestId && this.requestStartTimes.has(requestId)) {
      duration = performance.now() - this.requestStartTimes.get(requestId);
      this.requestStartTimes.delete(requestId);
    }

    console.group(`❌ API Error - ${timestamp}`);

    if (url) {
      console.log(
        `🔗 Failed URL: %c${url}`,
        "color: #F44336; font-weight: bold;"
      );
    }

    if (duration !== null) {
      console.log(
        `⏱️ Duration: %c${duration.toFixed(2)}ms`,
        "color: #FF5722; font-weight: bold;"
      );
    }

    if (requestId) {
      console.log(
        `🆔 Request ID: %c${requestId}`,
        "color: #9C27B0; font-weight: bold;"
      );
    }

    // Enhanced error details
    if (error && typeof error === "object") {
      if (error.response) {
        console.log("📛 HTTP Error Response:");
        console.log(
          `🔢 Status: %c${error.response.status} ${error.response.statusText}`,
          "color: #F44336; font-weight: bold; font-size: 14px; background: rgba(244, 67, 54, 0.1); padding: 2px 6px; border-radius: 4px;"
        );

        // Show response data prominently
        if (error.response.data) {
          console.log("💬 Server Error Details:");

          // Try to format error data nicely
          if (typeof error.response.data === "object") {
            console.log(
              `%c${JSON.stringify(error.response.data, null, 2)}`,
              "color: #F44336; background: rgba(244, 67, 54, 0.05); padding: 8px; border-left: 3px solid #F44336; font-family: monospace;"
            );

            // Also show as table if it's an object
            if (!Array.isArray(error.response.data)) {
              console.table(error.response.data);
            }
          } else {
            console.log(
              `%c${error.response.data}`,
              "color: #F44336; font-weight: bold; font-size: 13px;"
            );
          }
        }

        // Headers for debugging
        console.log("📋 Response Headers:");
        console.table(error.response.headers);
      } else if (error.request) {
        console.log("📡 Network Error - No Response Received:");
        console.log(
          "%cThis could be CORS, network timeout, or server down",
          "color: #FF5722; font-weight: bold;"
        );
        console.log("🌐 Request Details:", error.request);
      } else {
        console.log("⚙️ Request Setup Error:");
        console.log(
          `💬 Error Message: %c${error.message}`,
          "color: #F44336; font-weight: bold;"
        );
      }

      // Request config for debugging
      if (error.config) {
        console.log("🔧 Request Configuration:");
        const configTable = {
          Method: error.config.method?.toUpperCase(),
          URL: error.config.url,
          BaseURL: error.config.baseURL,
          Timeout: error.config.timeout + "ms",
          Headers: JSON.stringify(error.config.headers, null, 2),
        };
        console.table(configTable);

        if (error.config.data) {
          console.log("📤 Request Data that caused error:");
          console.log(
            `%c${JSON.stringify(error.config.data, null, 2)}`,
            "color: #FF9800; background: rgba(255, 152, 0, 0.05); padding: 8px; border-left: 3px solid #FF9800; font-family: monospace;"
          );
        }
      }
    } else {
      console.log(`💬 Error: %c${error}`, "color: #F44336; font-weight: bold;");
    }

    console.groupEnd();
  }
}

// Create the global instance
const apiLogger = new APILogger();

// Expose global functions with return values
window.enableAPILogging = function () {
  return apiLogger.enable();
};

window.disableAPILogging = function () {
  return apiLogger.disable();
};

window.toggleAPILogging = function () {
  return apiLogger.toggle();
};

window.getAPILoggingStatus = function () {
  const status = apiLogger.getStatus();
  console.log(`📊 API Logging Status: ${status}`);
  return `API Logging is ${status}`;
};

// Also expose the apiLogger instance
window.apiLogger = apiLogger;

// Auto-show usage guide on console
console.log(
  "%c🚀 API Logger Loaded!",
  "color: #4CAF50; font-size: 16px; font-weight: bold;"
);
console.log(
  "%c📋 Available Commands:",
  "color: #2196F3; font-size: 14px; font-weight: bold;"
);
console.log("%c- enableAPILogging()", "color: #4CAF50;");
console.log("%c- disableAPILogging()", "color: #F44336;");
console.log("%c- toggleAPILogging()", "color: #FF9800;");
console.log("%c- getAPILoggingStatus()", "color: #9C27B0;");
console.log("%c- apiLogger.getStatus()", "color: #607D8B;");

export default apiLogger;
