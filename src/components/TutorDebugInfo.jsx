import React from "react";

const TutorDebugInfo = ({ tutor }) => {
  if (!tutor) return null;

  const debugInfo = {
    id: tutor.id,
    name: tutor.name,
    isBookingRequest: tutor.isBookingRequest,
    isTutorAcceptingRequestAPIFlag: tutor.isTutorAcceptingRequestAPIFlag,
    bookingInfoCard: tutor.bookingInfoCard,
    rawBookingData: {
      bookingRequest: tutor.bookingRequest,
      bookingRequestId: tutor.bookingRequestId,
      isBookingRequestAccepted: tutor.isBookingRequestAccepted,
    },
    // Display conditions for cancel button
    showCancelButton: {
      detailedStatusOnCard: tutor.bookingInfoCard?.status,
      bookingIdOnCard: tutor.bookingInfoCard?.bookingId,
      shouldShowCancel:
        tutor.bookingInfoCard?.status === "REQUEST" &&
        !!tutor.bookingInfoCard?.bookingId,
    },
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#f0f8ff",
        border: "1px solid #0066cc",
        borderRadius: "4px",
        padding: "8px",
        margin: "4px 0",
        fontSize: "11px",
        fontFamily: "monospace",
      }}
    >
      {" "}
      <div style={{ fontWeight: "bold", color: "#0066cc" }}>
        🔍 Debug First Tutor: {tutor.name}
      </div>
      <div style={{ whiteSpace: "pre-wrap", marginTop: "4px" }}>
        {JSON.stringify(debugInfo, null, 2)}
      </div>
    </div>
  );
};

export default TutorDebugInfo;
