import React from "react";
import PropTypes from "prop-types";
import Cropper from "react-easy-crop";
import Modal from "react-modal";

const CropModalComponent = ({
    isOpen,
    selectedImage,
    crop,
    zoom,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onSave,
    onClose,
    onFileChange,
}) => {

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Select and Crop Avatar"
            className="modal"
            overlayClassName="overlay"
        >
            <h2 className="modal-title">Select and Crop Avatar</h2>
            <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="file-input"
            />
            {selectedImage && (
                <div className="crop-container">
                    <Cropper
                        image={selectedImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropComplete}
                    />
                </div>
            )}
            <div className="modal-buttons">
                <button
                    type="button"
                    className="crop-save-button"
                    onClick={onSave}
                    disabled={!selectedImage}
                >
                    Save Avatar
                </button>
                <button
                    type="button"
                    className="modal-close-button"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

CropModalComponent.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    selectedImage: PropTypes.string,
    crop: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    zoom: PropTypes.number.isRequired,
    onCropChange: PropTypes.func.isRequired,
    onZoomChange: PropTypes.func.isRequired,
    onCropComplete: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onFileChange: PropTypes.func.isRequired,
};

CropModalComponent.displayName = "CropModal";

const CropModal = React.memo(CropModalComponent);
export default CropModal;