// Test component để kiểm tra logic isBookingRequestAccepted
import React from "react";
import TutorCard from "../User/TutorCard";

const TestBookingRequestAccepted = () => {
  // Mock data với các trường hợp khác nhau
  const mockTutors = [
    {
      id: 1,
      name: "Gia sư A - Có yêu cầu được duyệt",
      imageUrl: "/default-avatar.svg",
      major: "Toán học",
      level: "Vàng",
      subjects: ["Toán", "Lý"],
      rating: 4.5,
      reviewCount: 10,
      rankKey: "gold",
      hourlyRate: 50000,
      isTutorAcceptingRequestAPIFlag: true, // TRUE - should show "Xem YC Duyệt" button
      bookingInfoCard: null,
      isFavorited: false,
    },
    {
      id: 2,
      name: "Gia sư B - Chưa có yêu cầu được duyệt",
      imageUrl: "/default-avatar.svg",
      major: "Văn học",
      level: "Bạc",
      subjects: ["Văn", "Sử"],
      rating: 4.0,
      reviewCount: 5,
      rankKey: "silver",
      hourlyRate: 40000,
      isTutorAcceptingRequestAPIFlag: false, // FALSE - should show "Chưa có yêu cầu được chấp nhận"
      bookingInfoCard: null,
      isFavorited: false,
    },
    {
      id: 3,
      name: "Gia sư C - Undefined (không có dữ liệu)",
      imageUrl: "/default-avatar.svg",
      major: "Tiếng Anh",
      level: "Đồng",
      subjects: ["Tiếng Anh"],
      rating: 3.5,
      reviewCount: 3,
      rankKey: "bronze",
      hourlyRate: 30000,
      isTutorAcceptingRequestAPIFlag: undefined, // UNDEFINED - should not show either button/message
      bookingInfoCard: null,
      isFavorited: false,
    },
  ];

  const mockProps = {
    isLoggedIn: true,
    onOpenBookingModal: (tutor) =>
      console.log("Open booking modal for:", tutor.name),
    onOpenAcceptedRequestsModal: (tutor) =>
      console.log("Open accepted requests modal for:", tutor.name),
    onToggleFavorite: (tutorId) =>
      console.log("Toggle favorite for tutor:", tutorId),
    onCancelSuccess: (tutorId) =>
      console.log("Cancel success for tutor:", tutorId),
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test isBookingRequestAccepted Logic</h2>
      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {mockTutors.map((tutor) => (
          <div
            key={tutor.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{tutor.name}</h3>
            <p>
              <strong>isTutorAcceptingRequestAPIFlag:</strong>{" "}
              {String(tutor.isTutorAcceptingRequestAPIFlag)}
            </p>
            <TutorCard tutor={tutor} {...mockProps} />
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>Expected Behavior:</h3>
        <ul>
          <li>
            <strong>Gia sư A (true):</strong> Should show "Xem YC Duyệt" button
          </li>
          <li>
            <strong>Gia sư B (false):</strong> Should show "Chưa có yêu cầu được
            chấp nhận" message
          </li>
          <li>
            <strong>Gia sư C (undefined):</strong> Should not show either button
            or message
          </li>
        </ul>
        <p>
          <strong>Note:</strong> Open browser console to see debug logs
        </p>
      </div>
    </div>
  );
};

export default TestBookingRequestAccepted;
