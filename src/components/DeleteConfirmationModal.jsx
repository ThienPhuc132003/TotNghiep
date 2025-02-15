// src/components/DeleteConfirmationModal.jsx
import React from "react";
import PropTypes from "prop-types";
import "../assets/css/DeleteConfirmationModal.style.css";

const DeleteConfirmationModalComponent = ({
  isOpen,
  onClose,
  onConfirm,
  message = "Are you sure you want to delete this item?",
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "delete-confirmation-modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="delete-confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-confirmation-modal-content">
        <button className="delete-confirmation-modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="delete-confirmation-modal-title">Confirm Delete</h2>
        <p>{message}</p>
        <div className="delete-confirmation-modal-buttons">
          <button className="delete-confirmation-modal-cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-confirmation-modal-confirm-button" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string,
};

const DeleteConfirmationModal = React.memo(DeleteConfirmationModalComponent);
export default DeleteConfirmationModal;