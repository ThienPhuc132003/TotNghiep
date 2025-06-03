import { useState } from "react";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";

const ClassroomAPITest = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testGetClassrooms = async () => {
    addLog("🔍 Testing Get Classrooms API...", "info");

    try {
      const response = await Api({
        endpoint: "classroom/search-for-user",
        method: METHOD_TYPE.GET,
        query: { page: 1, rpp: 5 },
        requireToken: true,
      });

      addLog(
        `✅ Get Classrooms Success: Found ${
          response.data?.items?.length || 0
        } classrooms`,
        "success"
      );

      if (response.data?.items?.length > 0) {
        const firstClassroom = response.data.items[0];
        addLog(
          `📋 First classroom: ${firstClassroom.nameOfRoom} (ID: ${firstClassroom.classroomId})`,
          "info"
        );

        // Auto test get meeting for first classroom
        await testGetMeeting(firstClassroom.classroomId);
      }
    } catch (error) {
      addLog(
        `❌ Get Classrooms Error: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    }
  };

  const testGetMeeting = async (classroomId) => {
    if (!classroomId) {
      addLog("❌ No classroom ID provided", "error");
      return;
    }

    addLog(`🏫 Testing Get Meeting API for classroom: ${classroomId}`, "info");

    try {
      const response = await Api({
        endpoint: "meeting/get-meeting",
        method: METHOD_TYPE.POST,
        data: { classroomId },
        requireToken: true,
      });

      if (response.success && response.data?.items?.length > 0) {
        addLog(`✅ Get Meeting Success: Found meeting data`, "success");
        addLog(
          `📞 Meeting URL: ${response.data.items[0].joinUrl || "N/A"}`,
          "info"
        );
      } else {
        addLog(`⚠️ Get Meeting: No meeting data found`, "warning");
      }
    } catch (error) {
      addLog(
        `❌ Get Meeting Error: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      addLog(
        `🔍 Error Details: ${JSON.stringify(
          error.response?.data || error.message
        )}`,
        "debug"
      );
    }
  };

  if (!isVisible) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsVisible(true)}
          style={{
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          🧪 API Test
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "400px",
        maxHeight: "500px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontSize: "12px",
      }}
    >
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "14px" }}>🧪 API Tester</h4>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "10px" }}>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={testGetClassrooms}
            style={{
              padding: "5px 10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              marginRight: "5px",
              fontSize: "11px",
            }}
          >
            Test Classrooms
          </button>
          <button
            onClick={clearLogs}
            style={{
              padding: "5px 10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Clear
          </button>
        </div>

        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #e9ecef",
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: "#6c757d", fontStyle: "italic" }}>
              No logs yet. Click Test Classrooms to start.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "4px",
                  color:
                    log.type === "error"
                      ? "#dc3545"
                      : log.type === "success"
                      ? "#28a745"
                      : log.type === "warning"
                      ? "#ffc107"
                      : log.type === "debug"
                      ? "#6c757d"
                      : "#333",
                  fontSize: "10px",
                  lineHeight: "1.3",
                }}
              >
                <span style={{ color: "#6c757d" }}>[{log.timestamp}]</span>{" "}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomAPITest;
