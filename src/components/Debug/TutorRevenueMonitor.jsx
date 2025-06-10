// Real-time monitor component for tutor revenue page
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const TutorRevenueMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const userProfile = useSelector((state) => state.user.userProfile);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString("vi-VN");
    const newLog = { timestamp, message, type, id: Date.now() };
    setLogs((prev) => [...prev.slice(-20), newLog]); // Keep last 20 logs
  };

  useEffect(() => {
    addLog("🟢 TutorRevenueMonitor mounted", "success");

    return () => {
      addLog("🔴 TutorRevenueMonitor unmounted", "warning");
    };
  }, []);

  useEffect(() => {
    addLog(
      `🔒 Auth state: ${
        isAuthenticated ? "authenticated" : "not authenticated"
      }`,
      isAuthenticated ? "success" : "warning"
    );
  }, [isAuthenticated]);

  useEffect(() => {
    if (userProfile) {
      addLog(
        `👤 User profile updated: ${JSON.stringify({
          id: userProfile.id || userProfile.userId,
          roleId: userProfile.roleId,
          roles: userProfile.roles,
          name: userProfile.name || userProfile.username,
        })}`,
        "info"
      );

      // Check if user is tutor
      let isTutor = false;

      if (userProfile.roles && Array.isArray(userProfile.roles)) {
        isTutor = userProfile.roles.some(
          (role) =>
            role.name === "TUTOR" ||
            role.name === "Tutor" ||
            role.name?.toLowerCase() === "tutor"
        );
      }

      if (!isTutor && userProfile.roleId) {
        isTutor = String(userProfile.roleId).toUpperCase() === "TUTOR";
      }

      addLog(`🎯 Is tutor: ${isTutor}`, isTutor ? "success" : "error");
    } else {
      addLog("❌ No user profile available", "error");
    }
  }, [userProfile]);

  // Monitor URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      addLog(`📍 Location changed: ${window.location.pathname}`, "info");
    };

    window.addEventListener("popstate", handleLocationChange);
    addLog(`📍 Initial location: ${window.location.pathname}`, "info");

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Monitor for white screen by checking DOM
  useEffect(() => {
    const checkForWhiteScreen = () => {
      const bodyText = document.body.textContent || "";
      if (bodyText.trim().length < 100) {
        addLog(
          "⚠️ Potential white screen detected (minimal content)",
          "warning"
        );
      }
    };

    const interval = setInterval(checkForWhiteScreen, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 9999,
          backgroundColor: "#007bff",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "12px",
        }}
        onClick={() => setIsVisible(true)}
      >
        📊 Show Monitor
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        width: "400px",
        maxHeight: "500px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h4 style={{ margin: 0, color: "#00ff00" }}>
          🔍 Tutor Revenue Monitor
        </h4>
        <div>
          <button
            onClick={() => setLogs([])}
            style={{
              background: "#dc3545",
              border: "none",
              color: "white",
              padding: "2px 8px",
              borderRadius: "3px",
              cursor: "pointer",
              marginRight: "5px",
              fontSize: "10px",
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: "#6c757d",
              border: "none",
              color: "white",
              padding: "2px 8px",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            Hide
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #333",
          padding: "8px",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: "#888", fontStyle: "italic" }}>
            No logs yet...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                marginBottom: "4px",
                padding: "2px 0",
                borderBottom: "1px solid #222",
                color:
                  {
                    success: "#28a745",
                    error: "#dc3545",
                    warning: "#ffc107",
                    info: "#17a2b8",
                  }[log.type] || "white",
              }}
            >
              <span style={{ color: "#888" }}>[{log.timestamp}]</span>{" "}
              {log.message}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: "10px",
          padding: "8px",
          backgroundColor: "rgba(0,50,100,0.3)",
          borderRadius: "4px",
          fontSize: "10px",
        }}
      >
        <div>Auth: {isAuthenticated ? "✅" : "❌"}</div>
        <div>Profile: {userProfile ? "✅" : "❌"}</div>
        <div>URL: {window.location.pathname}</div>
      </div>
    </div>
  );
};

export default TutorRevenueMonitor;
