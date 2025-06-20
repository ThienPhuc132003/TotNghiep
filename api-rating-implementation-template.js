// API Rating Implementation Template
// Ready to integrate into StudentClassroomPage.jsx

/**
 * 🎯 MEETING RATING API IMPLEMENTATION
 * Based on confirmed API structure from meeting/get-meeting
 */

// 1. Meeting Rating Function
const submitMeetingRating = async (meeting, rating, description) => {
  try {
    setLoading(true);

    const payload = {
      meetingId: meeting.meetingId,
      rating: rating, // 1-5 stars
      description: description,
    };

    console.log("Submitting meeting rating:", payload);

    const response = await fetch("/api/meeting/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      // Update local state - set isRating to true
      setMeetings((prev) =>
        prev.map((m) =>
          m.meetingId === meeting.meetingId ? { ...m, isRating: true } : m
        )
      );

      // Close modal
      setShowRatingModal(false);
      setSelectedMeeting(null);

      // Show success message
      setMessage("Đánh giá buổi học thành công!");
      setMessageType("success");

      console.log("Meeting rating submitted successfully");
    } else {
      throw new Error(result.message || "Rating failed");
    }
  } catch (error) {
    console.error("Meeting rating failed:", error);
    setMessage("Đánh giá thất bại, vui lòng thử lại!");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};

/**
 * 🎯 CLASSROOM RATING API IMPLEMENTATION
 * Based on confirmed API structure from meeting/get-meeting
 */

// 2. Classroom Rating Function
const submitClassroomRating = async (
  meeting,
  classroomEvaluation,
  description
) => {
  try {
    setLoading(true);

    const payload = {
      classroomId: meeting.classroomId,
      tutorId: meeting.classroom.tutorId,
      classroomEvaluation: classroomEvaluation.toString(), // Convert to string
      description: description,
    };

    console.log("Submitting classroom rating:", payload);

    const response = await fetch("/api/classroom/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      // Update local state - update classroomEvaluation
      setMeetings((prev) =>
        prev.map((m) =>
          m.classroomId === meeting.classroomId
            ? {
                ...m,
                classroom: {
                  ...m.classroom,
                  classroomEvaluation: classroomEvaluation.toString(),
                },
              }
            : m
        )
      );

      // Close modal
      setShowClassroomRatingModal(false);
      setSelectedClassroom(null);

      // Show success message
      setMessage("Đánh giá phòng học thành công!");
      setMessageType("success");

      console.log("Classroom rating submitted successfully");
    } else {
      throw new Error(result.message || "Rating failed");
    }
  } catch (error) {
    console.error("Classroom rating failed:", error);
    setMessage("Đánh giá thất bại, vui lòng thử lại!");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};

/**
 * 🎯 MODAL HANDLERS - UPDATED
 * Updated to use correct key mapping from API
 */

// 3. Meeting Rating Modal Handler
const handleMeetingRating = (meeting) => {
  console.log("Opening meeting rating modal for:", meeting);

  setSelectedMeeting({
    meetingId: meeting.meetingId,
    classroomId: meeting.classroomId,
    tutorId: meeting.classroom.tutorId,
    topic: meeting.topic,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    // Don't store meetingId or zoomMeetingId for display
    displayInfo: {
      topic: meeting.topic,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      duration: meeting.duration,
    },
  });

  setShowRatingModal(true);
};

// 4. Classroom Rating Modal Handler
const handleClassroomRating = (meeting) => {
  console.log("Opening classroom rating modal for:", meeting);

  setSelectedClassroom({
    classroomId: meeting.classroomId,
    tutorId: meeting.classroom.tutorId,
    userId: meeting.classroom.userId,
    nameOfRoom: meeting.classroom.nameOfRoom,
    currentEvaluation: meeting.classroom.classroomEvaluation,
    // Don't store IDs for display
    displayInfo: {
      nameOfRoom: meeting.classroom.nameOfRoom,
      currentEvaluation: meeting.classroom.classroomEvaluation,
    },
  });

  setShowClassroomRatingModal(true);
};

/**
 * 🎯 BUTTON LOGIC - CONFIRMED
 * Based on API response structure analysis
 */

// 5. Meeting Action Button Logic
const renderMeetingActionButton = (meeting) => {
  // Check meeting status first
  if (meeting.status === "IN_SESSION") {
    return (
      <button
        className="btn-join-meeting"
        onClick={() => handleJoinMeeting(meeting)}
      >
        Tham gia
      </button>
    );
  }

  // If ended, check rating status
  if (meeting.status === "ENDED") {
    if (meeting.isRating) {
      return <span className="rating-status-completed">Đã đánh giá</span>;
    } else {
      return (
        <button
          className="btn-rate-meeting"
          onClick={() => handleMeetingRating(meeting)}
        >
          Đánh giá
        </button>
      );
    }
  }

  return null;
};

/**
 * 🎯 STATE MANAGEMENT ADDITIONS
 * Add these states to existing useState declarations
 */

// 6. Additional State Variables (add to existing useState section)
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState(""); // 'success', 'error', 'warning'

/**
 * 🎯 INTEGRATION STEPS
 *
 * 1. Add the functions above to StudentClassroomPage.jsx
 * 2. Update existing modal handlers to use new structure
 * 3. Update button rendering logic
 * 4. Add loading states to modals
 * 5. Test with backend endpoints
 *
 * 🚧 BACKEND REQUIREMENTS
 *
 * Endpoints needed:
 * - POST /api/meeting/rate
 * - POST /api/classroom/rate
 *
 * Both should accept JSON payload and return:
 * {
 *   "success": true,
 *   "message": "Rating submitted successfully",
 *   "data": { ... }
 * }
 */

/**
 * 🎯 ERROR HANDLING ENHANCEMENT
 * Add these utility functions for better UX
 */

// 7. Message Display Component (add to JSX)
const MessageDisplay = () => {
  if (!message) return null;

  return (
    <div className={`message-display ${messageType}`}>
      {message}
      <button onClick={() => setMessage("")}>×</button>
    </div>
  );
};

// 8. Loading Overlay for Modals (add to modal JSX)
const LoadingOverlay = () => {
  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>Đang xử lý...</p>
    </div>
  );
};

/**
 * 🎯 CSS ADDITIONS NEEDED
 * Add these styles to StudentClassroomPage.style.css
 */

/*
.message-display {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.message-display.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message-display.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/

export {
  submitMeetingRating,
  submitClassroomRating,
  handleMeetingRating,
  handleClassroomRating,
  renderMeetingActionButton,
};
