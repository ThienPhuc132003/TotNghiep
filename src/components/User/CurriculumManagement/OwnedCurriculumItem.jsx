// src/components/User/CurriculumManagement/OwnedCurriculumItem.jsx
import PropTypes from "prop-types";
import {
  FaBookOpen,
  FaBuilding,
  FaFileAlt,
  FaInfoCircle,
  // FaTrashAlt, // Icon cho nút xóa nếu có
} from "react-icons/fa";
import "../../../assets/css/OwnedCurriculumItem.style.css"; // Tạo file CSS mới cho item này

const OwnedCurriculumItem = ({ curriculum /*, onDelete */ }) => {
  if (!curriculum) {
    return null;
  }

  return (
    <li className="ownedCurriculumItem"> {/* Class riêng cho item đã sở hữu */}
      <div className="itemHeader">
        <FaBookOpen className="icon" aria-hidden="true" />
        <h3 className="title">{curriculum.curriculumnName}</h3>
      </div>
      <div className="itemDetail">
        <FaBuilding className="icon" aria-hidden="true" />
        <p>
          <strong>Ngành:</strong>{" "}
          {curriculum.major?.majorName || "Chưa cập nhật"}
        </p>
      </div>
      <div className="itemDetail">
        <FaInfoCircle className="icon" aria-hidden="true" />
        <p>
          <strong>Mô tả:</strong>{" "}
          {curriculum.description || "Không có mô tả chi tiết."}
        </p>
      </div>
      {/* HIỂN THỊ LINK FILE GIÁO TRÌNH VÌ ĐÃ SỞ HỮU */}
      {curriculum.curriculumnUrl && (
        <div className="itemDetail">
          <FaFileAlt className="icon" aria-hidden="true" />
          <p>
            <strong>File Giáo trình:</strong>{" "}
            <a
              href={curriculum.curriculumnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fileLink"
              aria-label={`Xem hoặc tải giáo trình ${curriculum.curriculumnName}`}
            >
              Xem / Tải về
            </a>
          </p>
        </div>
      )}
      {/* 
      // Nếu có chức năng xóa giáo trình khỏi danh sách của tôi
      <div className="itemActionsOwned">
        <button 
          type="button" 
          className="removeOwnedButton" 
          onClick={() => onDelete(curriculum.curriculumnId)} // Ví dụ
        >
          <FaTrashAlt /> Xóa khỏi danh sách
        </button>
      </div>
      */}
    </li>
  );
};

OwnedCurriculumItem.propTypes = {
  curriculum: PropTypes.shape({
    curriculumnId: PropTypes.string.isRequired,
    curriculumnName: PropTypes.string.isRequired,
    major: PropTypes.shape({
      majorName: PropTypes.string,
    }),
    curriculumnUrl: PropTypes.string, // URL có thể có hoặc không tùy dữ liệu
    description: PropTypes.string,
  }).isRequired,
  // onDelete: PropTypes.func, // Prop cho hàm xóa nếu có
};

export default OwnedCurriculumItem;