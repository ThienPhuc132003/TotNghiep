import React from "react";
import PropTypes from "prop-types";
import "../assets/css/DeleteConfirmationModal.style.css";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, message = "Are you sure you want to delete this item?" }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "delete-confirmation-modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="delete-confirmation-modal-overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="delete-confirmation-modal-content">
        <button className="delete-confirmation-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="delete-confirmation-modal-header">
          <div className="alert-icon">&#9888;</div>
          <h2 className="modal-title">Xóa vĩnh viễn</h2>
        </div>
        <p className="modal-message">{message} thao tác này không thể hoàn tác</p>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>Hủy</button>
          <button className="delete-button" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string,
};

export default React.memo(DeleteConfirmationModal);
