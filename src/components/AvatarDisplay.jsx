// src/components/Common/AvatarDisplay.jsx
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera } from '@fortawesome/free-solid-svg-icons';
// Import CSS mới cho component này
import '../assets/css/AvatarDisplay.style.css';

const AvatarDisplay = ({ imageUrl, onTriggerSelect }) => {
  return (
    <div className="avatar-display-container">
      {/* Vùng ảnh tròn, có thể click */}
      <div
        className="avatar-image-wrapper"
        onClick={onTriggerSelect}
        role="button"
        tabIndex="0"
        aria-label="Nhấn để thay đổi ảnh đại diện"
        title="Thay đổi ảnh đại diện"
      >
        {/* Hiển thị ảnh hoặc placeholder */}
        {imageUrl ? (
          <img src={imageUrl} alt="Ảnh đại diện" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <FontAwesomeIcon icon={faUser} className="placeholder-icon" />
          </div>
        )}
        {/* Icon camera nhỏ ở góc */}
        <div className="camera-icon-overlay">
          <FontAwesomeIcon icon={faCamera} />
        </div>
      </div>
      {/* Nút bấm rõ ràng nằm bên dưới */}
      <button
        type="button"
        onClick={onTriggerSelect} // Gọi cùng hàm trigger
        className="change-avatar-button"
      >
        <FontAwesomeIcon icon={faCamera} /> Thay đổi ảnh
      </button>
    </div>
  );
};

AvatarDisplay.propTypes = {
  imageUrl: PropTypes.string, // URL ảnh hiện tại hoặc null
  onTriggerSelect: PropTypes.func.isRequired, // Hàm gọi khi nhấn để chọn file
};

export default AvatarDisplay;