// src/components/User/CurriculumManagement/CurriculumItem.jsx
import PropTypes from "prop-types";
import {
  FaBookOpen,
  FaBuilding,
  // FaFileAlt, // Không dùng nữa
  FaInfoCircle,
  FaPlusCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import "../../../assets/css/CurriculumItem.style.css"; // Đảm bảo bạn đã tạo và style file này

const CurriculumItem = ({
  curriculum,
  onAddCurriculum,
  isAdded,
  isProcessingAdd,
}) => {
  if (!curriculum) {
    return null;
  }

  const handleAddClick = () => {
    if (onAddCurriculum && !isAdded && !isProcessingAdd) {
      onAddCurriculum(curriculum.curriculumnId, curriculum.curriculumnName);
    }
  };

  return (
    <li
      className={`curriculumItem ${isAdded ? "added" : ""} ${
        isProcessingAdd ? "processing" : ""
      }`}
    >
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
      {/* Link file giáo trình đã được ẩn đi theo yêu cầu */}
      {/* 
      <div className="itemDetail">
        <FaFileAlt className="icon" aria-hidden="true" />
        <p>
          <strong>File Giáo trình:</strong>{" "}
          <a
            href={curriculum.curriculumnUrl} // Vẫn cần curriculumnUrl nếu muốn hiển thị sau khi thuê
            target="_blank"
            rel="noopener noreferrer"
            className="fileLink"
            aria-label={`Xem hoặc tải giáo trình ${curriculum.curriculumnName}`}
          >
            Xem / Tải về 
          </a>
        </p>
      </div>
      */}
      <div className="itemActions">
        {isAdded ? (
          <span className="addedStatus">
            <FaCheckCircle /> Đã sở hữu
          </span>
        ) : (
          <button
            type="button"
            className="addCurriculumButton"
            onClick={handleAddClick}
            disabled={isProcessingAdd || isAdded}
            title={
              isAdded
                ? "Giáo trình này đã có trong danh sách của bạn"
                : "Sử dụng giáo trình này (phí: 10 Coin)"
            }
          >
            {isProcessingAdd ? (
              <>
                <FaSpinner className="fa-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <FaPlusCircle /> Sử dụng giáo trình
              </>
            )}
          </button>
        )}
        {!isAdded && <span className="curriculumCost">Phí: 10 Coin</span>}
      </div>
    </li>
  );
};

CurriculumItem.propTypes = {
  curriculum: PropTypes.shape({
    curriculumnId: PropTypes.string.isRequired,
    curriculumnName: PropTypes.string.isRequired,
    major: PropTypes.shape({
      majorName: PropTypes.string,
    }),
    curriculumnUrl: PropTypes.string, // Không còn isRequired, nhưng vẫn có thể dùng nếu cần
    description: PropTypes.string,
  }).isRequired,
  onAddCurriculum: PropTypes.func.isRequired,
  isAdded: PropTypes.bool.isRequired,
  isProcessingAdd: PropTypes.bool.isRequired,
};

export default CurriculumItem;
