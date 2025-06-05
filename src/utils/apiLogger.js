// API Logger Utility - Simple & Clean Logging
// Provides clean, concise API logging functionality

class APILogger {
  constructor() {
    this.isEnabled = localStorage.getItem("API_LOGGING_ENABLED") !== "false";
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

  // Log API request - simple format
  logRequest(method, url, data = null, query = null) {
    if (!this.isEnabled) return;

    console.log(`🚀 [${method}] ${url}`);
    if (query && Object.keys(query).length > 0) {
      console.log("📋 Query:", query);
    }
    if (data && Object.keys(data).length > 0) {
      console.log("📤 Data:", data);
    }
  }

  // Log API response - simple format
  logResponse(data) {
    if (!this.isEnabled) return;
    console.log("✅ Response:", data);
  }

  // Log API error - simple format
  logError(error, url = "") {
    if (!this.isEnabled) return;
    console.log(`❌ Error${url ? ` [${url}]` : ""}:`, error);
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
