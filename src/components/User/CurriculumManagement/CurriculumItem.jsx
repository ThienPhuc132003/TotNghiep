// src/components/User/CurriculumManagement/CurriculumItem.jsx
import PropTypes from "prop-types";
import {
  FaBookOpen,
  FaBuilding,
  FaFileAlt,
  FaInfoCircle,
} from "react-icons/fa";
// IMPORT CSS TRỰC TIẾP - KHÔNG GÁN VÀO BIẾN
import "../../../assets/css/CurriculumItem.style.css";

const CurriculumItem = ({ curriculum }) => {
  if (!curriculum) {
    return null;
  }

  // SỬ DỤNG TÊN CLASS DƯỚI DẠNG CHUỖI STRING
  return (
    <li className="curriculumItem">
      {" "}
      {/* Thay styles.curriculumItem */}
      <div className="itemHeader">
        {" "}
        {/* Thay styles.itemHeader */}
        <FaBookOpen className="icon" aria-hidden="true" />{" "}
        {/* Thay styles.icon */}
        <h3 className="title">{curriculum.curriculumnName}</h3>{" "}
        {/* Thay styles.title */}
      </div>
      <div className="itemDetail">
        {" "}
        {/* Thay styles.itemDetail */}
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
      <div className="itemDetail">
        <FaFileAlt className="icon" aria-hidden="true" />
        <p>
          <strong>File Giáo trình:</strong>{" "}
          <a
            href={curriculum.curriculumnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fileLink" /* Thay styles.fileLink */
            aria-label={`Xem hoặc tải giáo trình ${curriculum.curriculumnName}`}
          >
            Xem / Tải về
          </a>
        </p>
      </div>
      {/*
      <button type="button" className="rentButton"> // Thay styles.rentButton
        Thuê giáo trình
      </button>
      */}
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
    curriculumnUrl: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default CurriculumItem;
