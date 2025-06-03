import { useState } from "react";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";

const CreateMeetingTest = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [testData, setTestData] = useState({
    topic: "Test Meeting",
    password: "123456",
  });

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const testCreateMeeting = async () => {
    addLog("🚀 Testing Create Meeting API...", "info");

    try {
      const meetingPayload = {
        topic: testData.topic,
        password: testData.password,
        type: 2, // Scheduled meeting
        duration: 60,
        start_time: new Date().toISOString(),
        settings: {
          join_before_host: true,
          waiting_room: false,
          mute_upon_entry: false,
          use_pmi: false,
          approval_type: 2,
        },
      };

      addLog(
        `📤 Sending payload: ${JSON.stringify(meetingPayload, null, 2)}`,
        "debug"
      );

      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: meetingPayload,
        requireToken: true,
      });

      addLog("✅ Create Meeting Success!", "success");
      addLog(`📋 Response: ${JSON.stringify(response, null, 2)}`, "success");
    } catch (error) {
      addLog(
        `❌ Create Meeting Error: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      addLog(
        `🔍 Error Details: ${JSON.stringify(
          error.response?.data || error,
          null,
          2
        )}`,
        "debug"
      );
    }
  };

  const testGetSignature = async () => {
    addLog("🔐 Testing Get Signature API...", "info");

    try {
      const signaturePayload = {
        zoomMeetingId: "123456789", // Test meeting ID
        role: "0",
      };

      const response = await Api({
        endpoint: "meeting/signature",
        method: METHOD_TYPE.POST,
        data: signaturePayload,
        requireToken: true,
      });

      addLog("✅ Get Signature Success!", "success");
      addLog(
        `🔑 Signature Response: ${JSON.stringify(response, null, 2)}`,
        "success"
      );
    } catch (error) {
      addLog(
        `❌ Get Signature Error: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      addLog(
        `🔍 Error Details: ${JSON.stringify(
          error.response?.data || error,
          null,
          2
        )}`,
        "debug"
      );
    }
  };

  const clearLogs = () => setLogs([]);

  if (!isVisible) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsVisible(true)}
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          🧪 Meeting Test
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
        width: "450px",
        maxHeight: "600px",
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
        <h4 style={{ margin: 0, fontSize: "14px" }}>🧪 Meeting API Tester</h4>
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
          <input
            type="text"
            placeholder="Meeting topic"
            value={testData.topic}
            onChange={(e) =>
              setTestData({ ...testData, topic: e.target.value })
            }
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "11px",
              marginBottom: "5px",
              border: "1px solid #ccc",
              borderRadius: "3px",
            }}
          />
          <input
            type="text"
            placeholder="Password"
            value={testData.password}
            onChange={(e) =>
              setTestData({ ...testData, password: e.target.value })
            }
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "11px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "3px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={testCreateMeeting}
            style={{
              padding: "5px 10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              marginRight: "5px",
              fontSize: "11px",
            }}
          >
            Test Create
          </button>
          <button
            onClick={testGetSignature}
            style={{
              padding: "5px 10px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              marginRight: "5px",
              fontSize: "11px",
            }}
          >
            Test Signature
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
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #e9ecef",
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: "#6c757d", fontStyle: "italic" }}>
              No logs yet. Click test buttons to start.
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
                      : log.type === "debug"
                      ? "#6c757d"
                      : "#333",
                  fontSize: "10px",
                  lineHeight: "1.3",
                  whiteSpace: "pre-wrap",
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

export default CreateMeetingTest;
