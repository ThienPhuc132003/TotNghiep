// Memory Optimization Hook
import { useEffect, useRef, useCallback } from "react";
import { useMemoryManagement } from "../services/memoryService";

export const useMemoryOptimization = (componentName = "Unknown Component") => {
  const memoryService = useMemoryManagement();
  const timersRef = useRef(new Set());
  const listenersRef = useRef(new Map());
  const subscriptionsRef = useRef(new Set());

  // Register timer with automatic cleanup
  const registerTimer = useCallback(
    (timer) => {
      timersRef.current.add(timer);
      memoryService.registerTimer(timer);
      return timer;
    },
    [memoryService]
  );

  // Register event listener with automatic cleanup
  const registerEventListener = useCallback(
    (element, event, handler, options) => {
      const cleanup = memoryService.registerEventListener(
        element,
        event,
        handler,
        options
      );
      const key = `${element.constructor.name}-${event}`;
      listenersRef.current.set(key, cleanup);
      return cleanup;
    },
    [memoryService]
  );

  // Register subscription with automatic cleanup
  const registerSubscription = useCallback(
    (subscription) => {
      subscriptionsRef.current.add(subscription);
      memoryService.registerSubscription(subscription);
      return subscription;
    },
    [memoryService]
  );

  // Safe setTimeout with auto-cleanup
  const safeSetTimeout = useCallback(
    (callback, delay) => {
      const timer = setTimeout(() => {
        callback();
        timersRef.current.delete(timer);
      }, delay);
      return registerTimer(timer);
    },
    [registerTimer]
  );

  // Safe setInterval with auto-cleanup
  const safeSetInterval = useCallback(
    (callback, delay) => {
      const timer = setInterval(callback, delay);
      return registerTimer(timer);
    },
    [registerTimer]
  );

  // Safe event listener registration
  const safeAddEventListener = useCallback(
    (element, event, handler, options) => {
      return registerEventListener(element, event, handler, options);
    },
    [registerEventListener]
  );

  // Manual cleanup function
  const cleanup = useCallback(() => {
    // Clear timers
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timersRef.current.clear();

    // Clear event listeners
    listenersRef.current.forEach((cleanup) => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    });
    listenersRef.current.clear();

    // Clear subscriptions
    subscriptionsRef.current.forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current.clear();

    console.log(`🧹 Cleaned up resources for ${componentName}`);
  }, [componentName]);

  // Component unmount cleanup
  useEffect(() => {
    // Register component for tracking
    memoryService.registerComponent({ name: componentName }, cleanup);

    return () => {
      cleanup();
    };
  }, [memoryService, componentName, cleanup]);

  // Development memory monitoring
  useEffect(() => {
    if (import.meta.env.DEV) {
      const logMemoryUsage = () => {
        const memInfo = memoryService.getMemoryInfo();
        if (memInfo && memInfo.used / memInfo.limit > 0.8) {
          console.warn(`⚠️ High memory usage in ${componentName}:`, memInfo);
        }
      };

      const timer = setInterval(logMemoryUsage, 30000); // Every 30 seconds
      registerTimer(timer);
    }
  }, [componentName, memoryService, registerTimer]);

  return {
    // Safe utilities
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener,

    // Manual registration (if needed)
    registerTimer,
    registerEventListener,
    registerSubscription,

    // Manual cleanup
    cleanup,

    // Memory info
    getMemoryInfo: memoryService.getMemoryInfo,
    logMemoryStatus: memoryService.logMemoryStatus,
  };
};

// Hook for component performance monitoring
export const usePerformanceMonitor = (componentName = "Component") => {
  const renderStartTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - renderStartTime.current;

    if (import.meta.env.DEV && renderTime > 16) {
      // > 16ms = potential 60fps issue
      console.warn(
        `⚠️ Slow render in ${componentName}: ${renderTime.toFixed(
          2
        )}ms (render #${renderCount.current})`
      );
    }

    renderStartTime.current = performance.now();
  });

  const logPerformance = useCallback(() => {
    console.log(`📊 ${componentName} - Renders: ${renderCount.current}`);
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    logPerformance,
  };
};

// Hook for heavy computation with memory monitoring
export const useHeavyComputation = () => {
  const memoryService = useMemoryManagement();

  const runHeavyTask = useCallback(
    async (task, taskName = "Heavy Task") => {
      const startMemory = memoryService.getMemoryInfo();
      const startTime = performance.now();

      try {
        const result = await task();

        const endTime = performance.now();
        const endMemory = memoryService.getMemoryInfo();

        if (import.meta.env.DEV) {
          console.log(`⚡ ${taskName} completed:`, {
            duration: `${(endTime - startTime).toFixed(2)}ms`,
            memoryDelta:
              endMemory && startMemory
                ? `${(endMemory.used - startMemory.used).toFixed(2)}MB`
                : "Unknown",
          });
        }

        // Trigger cleanup if memory usage increased significantly
        if (
          endMemory &&
          startMemory &&
          endMemory.used - startMemory.used > 10
        ) {
          console.warn(
            `🚨 High memory increase detected in ${taskName}, triggering cleanup`
          );
          memoryService.performGarbageCollection();
        }

        return result;
      } catch (error) {
        console.error(`❌ ${taskName} failed:`, error);
        throw error;
      }
    },
    [memoryService]
  );

  return { runHeavyTask };
};
