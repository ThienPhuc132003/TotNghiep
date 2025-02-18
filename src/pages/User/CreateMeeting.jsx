// src/pages/User/CreateMeeting.jsx
import React, { useState } from "react";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";
import "../../assets/css/CreateMeeting.style.css";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import Modal from "react-modal";
import FormDetail from "../../components/FormDetail";

// Set the app element for accessibility
Modal.setAppElement("#root");

const CreateMeetingPage = () => {
  const [topic, setTopic] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalMode, setModalMode] = useState(null);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");
    try {
      const response = await Api({
        endpoint: "meeting/create",
        method: METHOD_TYPE.POST,
        data: { topic, password },
      });
      if (response.success) {
        setStatus("Meeting created successfully.");
        setModalData(response.data);
        setModalMode("view");
        setIsModalOpen(true);
      } else {
        setStatus("Failed to create meeting.");
      }
    } catch (error) {
      setStatus("Failed to create meeting.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData({});
    setModalMode(null);
  };

  return (
    <UserDashboardLayout>
      <div className="create-meeting-form">
        <h1>Create Zoom Meeting</h1>
        {status && <p className="status-message">{status}</p>}
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
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Meeting Details"
        className="modal"
        overlayClassName="overlay"
      >
        <FormDetail
          formData={modalData}
          fields={[
            { key: "id", label: "Meeting ID", readOnly: true },
            { key: "topic", label: "Topic", readOnly: true },
            { key: "password", label: "Password", readOnly: true },
            { key: "start_url", label: "Start URL", readOnly: true },
            { key: "join_url", label: "Join URL", readOnly: true },
          ]}
          mode={modalMode || "view"}
          onChange={() => {}}
          onSubmit={() => {}}
        />
      </Modal>
    </UserDashboardLayout>
  );
};

const CreateMeeting = React.memo(CreateMeetingPage);
export default CreateMeeting;