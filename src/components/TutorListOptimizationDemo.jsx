// TutorListOptimizationDemo.jsx - Demo component showing optimization features

import { useState } from "react";
import { toast } from "react-toastify";
import {
  updateTutorBookingStatus,
  clearTutorBookingStatus,
  BOOKING_STATUS,
  shouldShowCancelButton,
  shouldShowAcceptedRequestsButton,
} from "../utils/bookingStateHelpers";

const TutorListOptimizationDemo = () => {
  const [demoTutors, setDemoTutors] = useState([
    {
      id: "demo1",
      name: "Gia sư A",
      bookingInfoCard: { status: null, bookingId: null },
      isInitiallyFavorite: false,
    },
    {
      id: "demo2",
      name: "Gia sư B",
      bookingInfoCard: { status: "REQUEST", bookingId: "booking123" },
      isInitiallyFavorite: true,
    },
    {
      id: "demo3",
      name: "Gia sư C",
      bookingInfoCard: { status: "ACCEPTED", bookingId: "booking456" },
      isInitiallyFavorite: false,
    },
  ]);

  const [actionLog, setActionLog] = useState([]);

  const logAction = (action, tutorName, details) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [
      ...prev,
      { timestamp, action, tutorName, details },
    ]);
  };

  const handleOptimizedBooking = (tutorId, tutorName) => {
    // Simulate sending booking request
    const newBookingStatus = {
      status: BOOKING_STATUS.REQUEST,
      bookingId: `booking_${Date.now()}`,
    };

    setDemoTutors((prev) =>
      updateTutorBookingStatus(prev, tutorId, newBookingStatus)
    );
    logAction(
      "🎯 BOOKING CREATED",
      tutorName,
      "Local state updated instantly - no API refetch"
    );
    toast.success(`Đã gửi yêu cầu thuê ${tutorName} (Tối ưu hóa)`);
  };

  const handleOptimizedCancel = (tutorId, tutorName) => {
    setDemoTutors((prev) => clearTutorBookingStatus(prev, tutorId));
    logAction(
      "❌ BOOKING CANCELLED",
      tutorName,
      "Local state cleared instantly - no API refetch"
    );
    toast.success(`Đã hủy yêu cầu cho ${tutorName} (Tối ưu hóa)`);
  };

  const handleOptimizedAccept = (tutorId, tutorName) => {
    const updatedStatus = {
      status: BOOKING_STATUS.HIRED,
      bookingId: `hired_${Date.now()}`,
    };

    setDemoTutors((prev) =>
      updateTutorBookingStatus(prev, tutorId, updatedStatus)
    );
    logAction(
      "✅ BOOKING ACCEPTED",
      tutorName,
      "Status updated to HIRED instantly - no API refetch"
    );
    toast.success(`Đã chấp nhận thuê ${tutorName} (Tối ưu hóa)`);
  };

  const resetDemo = () => {
    setDemoTutors([
      {
        id: "demo1",
        name: "Gia sư A",
        bookingInfoCard: { status: null, bookingId: null },
        isInitiallyFavorite: false,
      },
      {
        id: "demo2",
        name: "Gia sư B",
        bookingInfoCard: { status: "REQUEST", bookingId: "booking123" },
        isInitiallyFavorite: true,
      },
      {
        id: "demo3",
        name: "Gia sư C",
        bookingInfoCard: { status: "ACCEPTED", bookingId: "booking456" },
        isInitiallyFavorite: false,
      },
    ]);
    setActionLog([]);
    toast.info("Demo reset!");
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        margin: "20px",
      }}
    >
      <h3 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        🚀 TutorList Optimization Demo
      </h3>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Tối ưu hóa đã thực hiện:</strong>
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>✅ Cập nhật local state thay vì gọi lại API toàn bộ</li>
          <li>✅ Helper functions để quản lý booking status</li>
          <li>✅ Custom hook useTutorStateManager</li>
          <li>✅ Optimistic updates cho UI mượt mà</li>
          <li>✅ Consistent button logic across components</li>
        </ul>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div>
          <h4>Demo Tutors:</h4>
          {demoTutors.map((tutor) => (
            <div
              key={tutor.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <strong>{tutor.name}</strong>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Status: {tutor.bookingInfoCard.status || "None"} | BookingID:{" "}
                {tutor.bookingInfoCard.bookingId || "None"}
              </div>

              <div style={{ marginTop: "8px" }}>
                {!tutor.bookingInfoCard.status && (
                  <button
                    onClick={() => handleOptimizedBooking(tutor.id, tutor.name)}
                    style={{
                      fontSize: "12px",
                      marginRight: "5px",
                      backgroundColor: "#3498db",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    📤 Send Request
                  </button>
                )}

                {shouldShowCancelButton(tutor.bookingInfoCard) && (
                  <button
                    onClick={() => handleOptimizedCancel(tutor.id, tutor.name)}
                    style={{
                      fontSize: "12px",
                      marginRight: "5px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    ❌ Cancel
                  </button>
                )}

                {shouldShowAcceptedRequestsButton(tutor.bookingInfoCard) && (
                  <button
                    onClick={() => handleOptimizedAccept(tutor.id, tutor.name)}
                    style={{
                      fontSize: "12px",
                      marginRight: "5px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    ✅ Accept & Hire
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={resetDemo}
            style={{
              marginTop: "10px",
              backgroundColor: "#95a5a6",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
            }}
          >
            🔄 Reset Demo
          </button>
        </div>

        <div>
          <h4>Action Log (Real-time updates):</h4>
          <div
            style={{
              height: "300px",
              overflow: "auto",
              border: "1px solid #ddd",
              padding: "10px",
              backgroundColor: "#2c3e50",
              color: "#ecf0f1",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {actionLog.length === 0 ? (
              <div style={{ color: "#95a5a6" }}>Waiting for actions...</div>
            ) : (
              actionLog.map((log, index) => (
                <div key={index} style={{ marginBottom: "5px" }}>
                  <span style={{ color: "#3498db" }}>[{log.timestamp}]</span>{" "}
                  {log.action} - {log.tutorName}
                  <br />
                  <span style={{ color: "#95a5a6", fontSize: "11px" }}>
                    ↳ {log.details}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#d5f4e6",
          borderRadius: "4px",
        }}
      >
        <strong>🎯 Performance Benefits:</strong>
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>
            ❌ <del>Fetch toàn bộ danh sách gia sư</del> → ✅ Cập nhật chỉ 1
            tutor
          </li>
          <li>
            ❌ <del>Tải lại 8 TutorCard components</del> → ✅ Re-render chỉ 1
            component
          </li>
          <li>
            ❌ <del>API call + network latency</del> → ✅ Instant UI update
          </li>
          <li>
            ❌ <del>Loading states</del> → ✅ Smooth user experience
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TutorListOptimizationDemo;
