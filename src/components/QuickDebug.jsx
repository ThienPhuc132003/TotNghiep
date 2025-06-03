import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const QuickDebug = () => {
  const [tokenInfo, setTokenInfo] = useState({});

  useEffect(() => {
    const checkTokens = () => {
      const userToken = Cookies.get("token");
      const userSystemToken = Cookies.get("userSystemToken");
      const zoomToken = localStorage.getItem("zoomAccessToken");

      setTokenInfo({
        userToken: userToken ? "EXISTS" : "MISSING",
        userSystemToken: userSystemToken ? "EXISTS" : "MISSING",
        zoomToken: zoomToken ? "EXISTS" : "MISSING",
        allCookies: document.cookie,
      });
    };

    checkTokens();

    // Check every 5 seconds
    const interval = setInterval(checkTokens, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        padding: "10px",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeaa7",
        borderRadius: "4px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <div>
        <strong>Token Debug:</strong>
      </div>
      <div>
        User Token:{" "}
        <span
          style={{ color: tokenInfo.userToken === "EXISTS" ? "green" : "red" }}
        >
          {tokenInfo.userToken}
        </span>
      </div>
      <div>
        System Token:{" "}
        <span
          style={{
            color: tokenInfo.userSystemToken === "EXISTS" ? "green" : "red",
          }}
        >
          {tokenInfo.userSystemToken}
        </span>
      </div>
      <div>
        Zoom Token:{" "}
        <span
          style={{ color: tokenInfo.zoomToken === "EXISTS" ? "green" : "red" }}
        >
          {tokenInfo.zoomToken}
        </span>
      </div>
      <div
        style={{ marginTop: "5px", fontSize: "10px", wordBreak: "break-all" }}
      >
        Cookies: {tokenInfo.allCookies || "No cookies"}
      </div>
    </div>
  );
};

export default QuickDebug;
