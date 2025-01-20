// src/pages/User/CreateMeeting.jsx
import { useState } from "react";
import Api from "../../network/Api";
import PropTypes from "prop-types";
import { METHOD_TYPE } from "../../network/methodType";

const CreateMeeting = ({ accessToken }) => {
  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [status, setStatus] = useState("");

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setStatus("Creating meeting...");
    setMeetingDetails(null);

    try {
      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: { topic, password },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMeetingDetails(response.data); // Lưu thông tin phòng họp
      setStatus("Meeting created successfully!");
    } catch (error) {
      setStatus("Failed to create meeting.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create Zoom Meeting</h1>
      <form onSubmit={handleCreateMeeting}>
        <div>
          <label>Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Meeting</button>
      </form>

      {status && <p>{status}</p>}

      {meetingDetails && (
        <div>
          <h2>Meeting Details:</h2>
          <p><strong>Meeting ID:</strong> {meetingDetails.meetingId}</p>
          <p><strong>Join URL:</strong> <a href={meetingDetails.joinUrl} target="_blank" rel="noopener noreferrer">{meetingDetails.joinUrl}</a></p>
          <p><strong>Start Time:</strong> {meetingDetails.startTime}</p>
        </div>
      )}
    </div>
  );
};

CreateMeeting.propTypes = {
  accessToken: PropTypes.string.isRequired,
};

export default CreateMeeting;