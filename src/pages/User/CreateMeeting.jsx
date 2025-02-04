import { useState } from "react";
import Api from "../../network/Api";
import PropTypes from "prop-types";
import { METHOD_TYPE } from "../../network/methodType";
import Cookies from "js-cookie";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";
import "../../assets/css/CreateMeeting.style.css";

const CreateMeeting = () => {
  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    setMeetingDetails(null);

    try {
      const accessToken = Cookies.get("zoomAccessToken");
      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: { topic, password },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMeetingDetails(response.data);
      setStatus("Meeting created successfully!");
    } catch (error) {
      setStatus("Failed to create meeting.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="create-meeting-form">
        <h1>Create Zoom Meeting</h1>
        <form onSubmit={handleCreateMeeting}>
          <div className="form-group">
            <label htmlFor="topic">Topic:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="create-meeting-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Meeting"}
          </button>
        </form>

        {status && <p className="status-message">{status}</p>}

        {meetingDetails && (
          <div className="meeting-details">
            <h2>Meeting Details:</h2>
            <p><strong>Meeting ID:</strong> {meetingDetails.meetingId}</p>
            <p><strong>Join URL:</strong> <a href={meetingDetails.joinUrl} target="_blank" rel="noopener noreferrer">{meetingDetails.joinUrl}</a></p>
            <p><strong>Start Time:</strong> {meetingDetails.startTime}</p>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

CreateMeeting.propTypes = {
  accessToken: PropTypes.string,
};

export default CreateMeeting;