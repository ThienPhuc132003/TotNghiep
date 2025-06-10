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
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem("API_LOGGING_ENABLED", "false");
    console.log("🔇 API Logging DISABLED");
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
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
    console.log("🔗 Full URL:", url);

    if (query && Object.keys(query).length > 0) {
      console.log("📋 Query Parameters:");
      console.table(query);
      console.log("🔍 Query String:", new URLSearchParams(query).toString());
    }

    if (data && Object.keys(data).length > 0) {
      console.log("📤 Request Body:");
      console.log(JSON.stringify(data, null, 2));
    }

    console.log("🆔 Request ID:", requestId);
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
      if (data.hasOwnProperty("data") && data.hasOwnProperty("pagination")) {
        console.log("📄 Paginated Response:");
        console.log("📊 Pagination Info:", data.pagination);
        console.log(`📋 Data (${data.data.length} items):`);
        console.table(data.data.slice(0, 5));
        if (data.data.length > 5) {
          console.log(`... and ${data.data.length - 5} more items`);
        }
      } else {
        console.log("📦 Object Response:");
        console.log(JSON.stringify(data, null, 2));
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
      console.log("🔗 Failed URL:", url);
    }

    if (duration !== null) {
      console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`);
    }

    if (requestId) {
      console.log("🆔 Request ID:", requestId);
    }

    // Enhanced error details
    if (error && typeof error === "object") {
      if (error.response) {
        console.log("📛 HTTP Error Response:");
        console.log("🔢 Status:", error.response.status);
        console.log("📄 Status Text:", error.response.statusText);
        console.log("📋 Headers:", error.response.headers);
        console.log("💬 Error Data:", error.response.data);
      } else if (error.request) {
        console.log("📡 Network Error - No Response Received:");
        console.log("🌐 Request Details:", error.request);
      } else {
        console.log("⚙️ Request Setup Error:");
        console.log("💬 Error Message:", error.message);
      }

      if (error.config) {
        console.log("🔧 Request Config:", error.config);
      }
    } else {
      console.log("💬 Error:", error);
    }

    console.groupEnd();
  }

  // Special method for tutor revenue debugging
  logTutorRevenueRequest(query, searchParams, sortParams) {
    if (!this.isEnabled) return;

    console.group("🎓 TUTOR REVENUE STATISTICS - REQUEST DEBUG");
    console.log("📅 Timestamp:", new Date().toISOString());

    console.log("🔍 Search Parameters:");
    console.table(searchParams);

    console.log("📊 Sort Parameters:");
    console.table(sortParams);

    console.log("📋 Full Query Object:");
    console.table(query);

    console.log(
      "🔗 Query String Preview:",
      new URLSearchParams(query).toString()
    );
    console.groupEnd();
  }

  // Method to clear all stored request times (cleanup)
  clearRequestTimes() {
    this.requestStartTimes.clear();
    console.log("🧹 Cleared all request timing data");
  }
}

// Create singleton instance
const apiLogger = new APILogger();

// Export both the instance and the class
export default apiLogger;
export { APILogger };

// Expose to window for easy console access
if (typeof window !== "undefined") {
  window.apiLogger = apiLogger;
  window.enableAPILogging = () => apiLogger.enable();
  window.disableAPILogging = () => apiLogger.disable();
  window.toggleAPILogging = () => apiLogger.toggle();
}
