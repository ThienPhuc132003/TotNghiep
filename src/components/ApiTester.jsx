import { useState } from "react";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import Cookies from "js-cookie";

const ApiTester = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const testApi = async () => {
    setLoading(true);
    setResult("Testing...");

    try {
      console.log("Testing API call to meeting/get-meeting");
      console.log("Token exists:", !!Cookies.get("token"));
      console.log("Token value:", Cookies.get("token"));

      const response = await Api({
        endpoint: "meeting/get-meeting",
        method: METHOD_TYPE.GET,
        query: {
          classroomId: "test-id",
        },
        requireToken: true,
      });

      setResult("SUCCESS: " + JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("API Test Error:", error);
      setResult(
        "ERROR: " +
          JSON.stringify(
            {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              message: error.message,
            },
            null,
            2
          )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "white",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 9999,
        maxWidth: "400px",
        maxHeight: "300px",
        overflow: "auto",
      }}
    >
      <button onClick={testApi} disabled={loading}>
        Test API
      </button>
      <pre style={{ fontSize: "10px", marginTop: "10px" }}>{result}</pre>
    </div>
  );
};

export default ApiTester;
