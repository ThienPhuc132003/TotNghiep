// Memory Health Monitor - React Component
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMemoryManagement } from "../services/memoryService";

const MemoryMonitor = ({ showInProduction = false }) => {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const memoryService = useMemoryManagement();

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (import.meta.env.DEV || showInProduction) {
      setIsVisible(true);

      const updateMemoryInfo = () => {
        const info = memoryService.getMemoryInfo();
        setMemoryInfo(info);
      };

      // Update memory info every 5 seconds
      const interval = setInterval(updateMemoryInfo, 5000);
      updateMemoryInfo(); // Initial call

      return () => clearInterval(interval);
    }
  }, [memoryService, showInProduction]);

  const handleCleanup = () => {
    memoryService.cleanup();
    // Refresh memory info after cleanup
    setTimeout(() => {
      const info = memoryService.getMemoryInfo();
      setMemoryInfo(info);
    }, 1000);
  };

  const getMemoryStatus = () => {
    if (!memoryInfo) return "unknown";

    const usage = memoryInfo.used / memoryInfo.limit;
    if (usage > 0.8) return "critical";
    if (usage > 0.6) return "warning";
    return "good";
  };

  const getStatusColor = () => {
    const status = getMemoryStatus();
    switch (status) {
      case "critical":
        return "#ff4757";
      case "warning":
        return "#ffa502";
      case "good":
        return "#2ed573";
      default:
        return "#747d8c";
    }
  };

  if (!isVisible || !memoryInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        zIndex: 9999,
        fontFamily: "monospace",
        minWidth: "200px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>💾 Memory Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginTop: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Used:</span>
          <span style={{ color: getStatusColor() }}>{memoryInfo.used}MB</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Total:</span>
          <span>{memoryInfo.total}MB</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Limit:</span>
          <span>{memoryInfo.limit}MB</span>
        </div>

        <div
          style={{
            marginTop: "5px",
            height: "4px",
            background: "#333",
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(memoryInfo.used / memoryInfo.limit) * 100}%`,
              background: getStatusColor(),
              borderRadius: "2px",
              transition: "all 0.3s ease",
            }}
          />
        </div>

        <div style={{ marginTop: "8px", display: "flex", gap: "5px" }}>
          <button
            onClick={handleCleanup}
            style={{
              background: "#5352ed",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: "3px",
              fontSize: "10px",
              cursor: "pointer",
            }}
          >
            🧹 Cleanup
          </button>

          <button
            onClick={() => memoryService.logMemoryStatus()}
            style={{
              background: "#26de81",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: "3px",
              fontSize: "10px",
              cursor: "pointer",
            }}
          >
            📊 Log
          </button>
        </div>

        {getMemoryStatus() === "critical" && (
          <div style={{ marginTop: "5px", color: "#ff4757", fontSize: "10px" }}>
            ⚠️ High memory usage!
          </div>
        )}
      </div>
    </div>
  );
};

MemoryMonitor.propTypes = {
  showInProduction: PropTypes.bool,
};

export default MemoryMonitor;
