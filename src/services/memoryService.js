// Memory Management Service
// Prevents memory leaks and manages cache properly

class MemoryService {
  constructor() {
    this.observers = [];
    this.timers = new Set();
    this.subscriptions = new Set();
    this.eventListeners = new Map();
    this.components = new WeakMap();

    // Auto cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.performGarbageCollection();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Bind methods
    this.cleanup = this.cleanup.bind(this);
    this.beforeUnload = this.beforeUnload.bind(this);

    // Setup cleanup on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.beforeUnload);
      window.addEventListener("unload", this.cleanup);
    }
  }

  // Register a timer to be tracked
  registerTimer(timerId) {
    this.timers.add(timerId);
    return timerId;
  }

  // Register a subscription to be tracked
  registerSubscription(subscription) {
    this.subscriptions.add(subscription);
    return subscription;
  }

  // Register event listener to be tracked
  registerEventListener(element, event, handler, options) {
    const key = `${element.constructor.name}-${event}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }

    const listenerData = { element, event, handler, options };
    this.eventListeners.get(key).push(listenerData);

    element.addEventListener(event, handler, options);
    return () => this.removeEventListener(element, event, handler);
  }

  // Remove specific event listener
  removeEventListener(element, event, handler) {
    const key = `${element.constructor.name}-${event}`;
    const listeners = this.eventListeners.get(key);

    if (listeners) {
      const index = listeners.findIndex(
        (l) =>
          l.element === element && l.event === event && l.handler === handler
      );

      if (index > -1) {
        listeners.splice(index, 1);
        element.removeEventListener(event, handler);
      }

      if (listeners.length === 0) {
        this.eventListeners.delete(key);
      }
    }
  }

  // Register component for tracking
  registerComponent(component, cleanupFn) {
    this.components.set(component, cleanupFn);
  }

  // Clear localStorage safely
  clearLocalStorage() {
    try {
      // Only clear app-specific items, not all localStorage
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("persist:") ||
            key.startsWith("zoom") ||
            key.startsWith("meeting") ||
            key.includes("cache"))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn("Failed to remove localStorage item:", key, error);
        }
      });
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }

  // Clear sessionStorage safely
  clearSessionStorage() {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("Failed to clear sessionStorage:", error);
    }
  }

  // Clear browser cache programmatically
  clearBrowserCache() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister();
      });
    }

    // Clear caches if available
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  }

  // Perform garbage collection
  performGarbageCollection() {
    // Clear expired localStorage items
    this.clearExpiredStorage();

    // Force garbage collection if available
    if (window.gc && typeof window.gc === "function") {
      try {
        window.gc();
      } catch (error) {
        // gc() is not available in production
      }
    }

    // Clear memory-heavy objects
    this.clearHeavyObjects();
  }

  // Clear expired storage items
  clearExpiredStorage() {
    try {
      const now = Date.now();
      const expirationTime = 24 * 60 * 60 * 1000; // 24 hours

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.includes("timestamp")) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item.timestamp && now - item.timestamp > expirationTime) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove corrupted items
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to clear expired storage:", error);
    }
  }

  // Clear memory-heavy objects
  clearHeavyObjects() {
    // Clear any heavy global objects that might have accumulated
    if (window.zoomSdk) {
      try {
        // Clear Zoom SDK cache if it exists
        if (window.zoomSdk.clearCache) {
          window.zoomSdk.clearCache();
        }
      } catch (error) {
        console.warn("Failed to clear Zoom SDK cache:", error);
      }
    }
  }

  // Cleanup before page unload
  beforeUnload() {
    // Save critical data before cleanup
    this.saveCurrentState();
    this.cleanup();
  }

  // Save current state
  saveCurrentState() {
    try {
      const state = {
        timestamp: Date.now(),
        url: window.location.href,
        // Add any other critical state you want to preserve
      };

      sessionStorage.setItem("app_state_backup", JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save current state:", error);
    }
  }

  // Main cleanup function
  cleanup() {
    console.log("🧹 Performing memory cleanup...");

    // Clear timers
    this.timers.forEach((timerId) => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.timers.clear();

    // Clear subscriptions
    this.subscriptions.forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    });
    this.subscriptions.clear();

    // Clear event listeners
    this.eventListeners.forEach((listeners) => {
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();

    // Clear component cleanup functions
    this.components = new WeakMap();

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log("✅ Memory cleanup completed");
  }

  // Get memory usage info (for debugging)
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  }

  // Log memory status
  logMemoryStatus() {
    const memInfo = this.getMemoryInfo();
    if (memInfo) {
      console.log(
        `💾 Memory: ${memInfo.used}/${memInfo.total}MB (Limit: ${memInfo.limit}MB)`
      );

      // Warn if memory usage is high
      if (memInfo.used / memInfo.limit > 0.8) {
        console.warn(
          "⚠️ High memory usage detected! Consider reducing cache or reloading."
        );
      }
    }
  }
}

// Create singleton instance
const memoryService = new MemoryService();

// React Hook for memory management
export const useMemoryManagement = () => {
  return {
    registerTimer: memoryService.registerTimer.bind(memoryService),
    registerSubscription:
      memoryService.registerSubscription.bind(memoryService),
    registerEventListener:
      memoryService.registerEventListener.bind(memoryService),
    registerComponent: memoryService.registerComponent.bind(memoryService),
    getMemoryInfo: memoryService.getMemoryInfo.bind(memoryService),
    logMemoryStatus: memoryService.logMemoryStatus.bind(memoryService),
    cleanup: memoryService.cleanup.bind(memoryService),
  };
};

export default memoryService;
