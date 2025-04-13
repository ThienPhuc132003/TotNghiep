// src/components/Modal/ImageCropModal.jsx
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal"; // Thư viện modal
import Cropper from "react-easy-crop"; // Thư viện crop
// Đảm bảo bạn đã tạo hoặc có file này
import getCroppedImg from "../utils/cropImage";
// Import CSS mới cho modal
import "../assets/css/ImageCropModal.style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faSearchPlus,
  faSearchMinus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// Cấu hình react-modal (nên đặt ở App.js hoặc index.js)
// Modal.setAppElement('#root');

const ImageCropModal = ({
  isOpen,
  onRequestClose,
  imageSrc, // Data URL ảnh cần crop
  onCropSave, // Callback trả về Blob
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Loading khi crop/lưu

  // Callback khi crop hoàn thành (lấy pixel area)
  const onCropComplete = useCallback((croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  // Xử lý khi nhấn nút "Lưu ảnh" trong modal
  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setIsProcessing(true);
    try {
      // Gọi hàm tiện ích để lấy Blob
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Gọi callback của ProfilePage, truyền Blob ra ngoài
      onCropSave(croppedImageBlob);
      // Lưu ý: Không đóng modal ở đây, để ProfilePage tự đóng sau khi xử lý xong
    } catch (e) {
      console.error("Lỗi khi cắt ảnh:", e);
      setIsProcessing(false); // Dừng loading nếu có lỗi
      // Có thể thêm thông báo lỗi trong modal nếu muốn
    }
    // setIsProcessing(false); // Không cần set false ở đây
  };

  // Xử lý đóng modal
  const handleClose = () => {
    if (!isProcessing) {
      // Chỉ đóng khi không đang xử lý
      onRequestClose();
    }
  };

  // Reset state bên trong modal mỗi khi nó được mở
  const handleAfterOpen = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsProcessing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={handleAfterOpen} // Reset state sau khi mở
      onRequestClose={handleClose} // Hàm đóng modal
      contentLabel="Chỉnh sửa ảnh đại diện" // Accessibility
      className="image-crop-modal" // Class cho nội dung
      overlayClassName="image-crop-modal-overlay" // Class cho nền mờ
      shouldCloseOnOverlayClick={!isProcessing} // Cho phép click nền để đóng
      shouldCloseOnEsc={!isProcessing} // Cho phép nhấn Esc để đóng
      appElement={document.getElementById("root") || undefined} // Element gốc
    >
      {/* Header */}
      <div className="modal-header">
        <h2>Chỉnh sửa ảnh đại diện</h2>
        <button
          onClick={handleClose}
          className="modal-close-button"
          aria-label="Đóng"
          disabled={isProcessing}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Body - Chứa Cropper và Zoom */}
      <div className="modal-body">
        {imageSrc ? (
          <div className="cropper-container">
            {" "}
            {/* Container giới hạn kích thước cropper */}
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Tỷ lệ 1:1
              cropShape="round" // Crop hình tròn
              showGrid={false} // Không hiển thị lưới
              onCropChange={setCrop} // Cập nhật vị trí crop
              onZoomChange={setZoom} // Cập nhật mức zoom
              onCropComplete={onCropComplete} // Lấy pixel area khi thả chuột/tay
            />
          </div>
        ) : (
          <p>Đang tải ảnh...</p> // Hoặc hiển thị spinner
        )}

        {/* Thanh trượt Zoom */}
        {imageSrc && (
          <div className="zoom-controls">
            <FontAwesomeIcon icon={faSearchMinus} />
            <input
              type="range"
              value={zoom}
              min={1} // Zoom nhỏ nhất là 1
              max={3} // Zoom lớn nhất là 3 (có thể điều chỉnh)
              step={0.05} // Bước nhảy nhỏ để mượt hơn
              aria-labelledby="zoom-slider-label"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="zoom-slider"
              disabled={isProcessing}
            />
            <FontAwesomeIcon icon={faSearchPlus} />
          </div>
        )}
      </div>

      {/* Footer - Chứa nút Hủy và Lưu */}
      <div className="modal-footer">
        <button
          onClick={handleClose}
          className="modal-button cancel"
          disabled={isProcessing}
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="modal-button save"
          // Disable nút Lưu nếu đang xử lý HOẶC chưa có vùng crop hợp lệ
          disabled={isProcessing || !croppedAreaPixels}
        >
          {isProcessing ? (
            <>
              {" "}
              <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...{" "}
            </>
          ) : (
            <>
              {" "}
              <FontAwesomeIcon icon={faSave} /> Lưu ảnh{" "}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

ImageCropModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  imageSrc: PropTypes.string, // Data URL ảnh
  onCropSave: PropTypes.func.isRequired, // Callback trả về Blob
};

export default ImageCropModal;
