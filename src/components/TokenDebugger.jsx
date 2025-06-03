import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { debugCookies, setCookieWithAllOptions } from "../utils/cookieDebugger";

const TokenDebugger = () => {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    debugCookies();
  }, []);

  const handleFixToken = () => {
    try {
      // Get existing token or use a test one
      const existingToken = Cookies.get("token") || "test-token-for-debugging";

      // Remove and set with better options
      Cookies.remove("token");
      setCookieWithAllOptions("token", existingToken);

      // Set role if missing
      if (!Cookies.get("role")) {
        setCookieWithAllOptions("role", "user");
      }

      setMessage("Cookies fixed. Check console.");
      debugCookies();
    } catch (error) {
      setMessage("Error: " + error.message);
      console.error("Cookie fix error:", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>Token: {Cookies.get("token") ? "EXISTS" : "NOT FOUND"}</div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      <div>Role: {Cookies.get("role") || "NONE"}</div>

      {expanded && (
        <>
          <hr style={{ margin: "5px 0", borderColor: "gray" }} />
          <button
            onClick={handleFixToken}
            style={{
              background: "#4CAF50",
              border: "none",
              borderRadius: "3px",
              padding: "5px",
              marginTop: "5px",
              cursor: "pointer",
            }}
          >
            Fix Token
          </button>
          {message && <div style={{ marginTop: "5px" }}>{message}</div>}
        </>
      )}
    </div>
  );
};

export default TokenDebugger;
