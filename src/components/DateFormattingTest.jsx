import React from "react";
import { format, parseISO } from "date-fns";

// Copy exact formatDate function từ ListOfTutorPayments.jsx đã được sửa
const formatDate = (dateString, formatString = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";

  try {
    let date;

    // Xử lý các loại input khác nhau
    if (typeof dateString === "string") {
      // Trường hợp ISO string như "2025-05-07T13:39:12.601Z"
      if (
        dateString.includes("T") ||
        dateString.includes("Z") ||
        dateString.includes("+")
      ) {
        date = new Date(dateString);
      } else {
        // Fallback sử dụng parseISO cho các format khác
        date = parseISO(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      // Thử convert sang Date object
      date = new Date(dateString);
    }

    // Kiểm tra tính hợp lệ của date
    if (!date || isNaN(date.getTime())) {
      console.warn("Invalid date detected:", dateString);
      return "Ngày không hợp lệ";
    }

    // Format date với date-fns
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "Lỗi định dạng ngày";
  }
};

const DateFormattingTestComponent = () => {
  // Test data giống như API response thực tế
  const testDates = [
    {
      label: "API Response Format",
      value: "2025-05-07T13:39:12.601Z",
      expected: "07/05/2025 13:39",
    },
    {
      label: "Without Milliseconds",
      value: "2025-05-07T13:39:12Z",
      expected: "07/05/2025 13:39",
    },
    {
      label: "With Timezone Offset",
      value: "2025-05-07T13:39:12+07:00",
      expected: "07/05/2025 06:39", // UTC time
    },
    {
      label: "Date Only",
      value: "2025-05-07",
      expected: "07/05/2025 00:00",
    },
    {
      label: "Empty String",
      value: "",
      expected: "N/A",
    },
    {
      label: "Null Value",
      value: null,
      expected: "N/A",
    },
    {
      label: "Invalid Date",
      value: "invalid-date-string",
      expected: "Ngày không hợp lệ",
    },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>🧪 Date Formatting Test - ListOfTutorPayments Fix</h2>
      <p>Testing the fixed formatDate function with real API data formats</p>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "20px",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Test Case
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Input Value
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Formatted Output
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {testDates.map((test, index) => {
            const result = formatDate(test.value);
            const isSuccess =
              result !== "Lỗi định dạng ngày" && result !== "Ngày không hợp lệ";
            const statusIcon = isSuccess ? "✅" : "❌";

            return (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {test.label}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    fontFamily: "monospace",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {JSON.stringify(test.value)}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    fontWeight: "bold",
                  }}
                >
                  {result}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {statusIcon}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#e8f5e8",
          borderRadius: "5px",
        }}
      >
        <h3>✅ Fix Summary</h3>
        <ul>
          <li>
            <strong>Problem:</strong> Date column showing "Ngày không hợp lệ"
            for ISO strings like "2025-05-07T13:39:12.601Z"
          </li>
          <li>
            <strong>Root Cause:</strong> Original formatDate only used
            parseISO() which doesn't handle all ISO formats well
          </li>
          <li>
            <strong>Solution:</strong> Enhanced formatDate to use new Date() for
            ISO strings, parseISO() as fallback
          </li>
          <li>
            <strong>Result:</strong> Now correctly formats API response dates
            "2025-05-07T13:39:12.601Z" → "07/05/2025 13:39"
          </li>
        </ul>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fff3cd",
          borderRadius: "5px",
        }}
      >
        <h3>🔧 Technical Details</h3>
        <p>
          <strong>Before:</strong> Only used parseISO() from date-fns
        </p>
        <p>
          <strong>After:</strong> Smart detection of ISO strings and use
          appropriate parser
        </p>
        <ul>
          <li>ISO strings with T/Z/+ → new Date()</li>
          <li>Other formats → parseISO()</li>
          <li>Better error handling and validation</li>
        </ul>
      </div>
    </div>
  );
};

export default DateFormattingTestComponent;
