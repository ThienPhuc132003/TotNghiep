import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../../assets/css/User.style.css";
import { useSelector } from "react-redux";
import dfMale from "../../assets/images/df-male.png";
import dfFemale from "../../assets/images/df-female.png";

const UserComponent = () => {
  // Lấy thông tin người dùng từ Redux store, đảm bảo luôn là object
  const userInfo =
    useSelector((state) => state.user.userProfile) || {};
  // console.log("userInfo toolbar:", userInfo); // Giữ lại để debug nếu cần

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    // TODO: Thêm logic hiển thị/ẩn dropdown menu
  };

  const handleDoubleClick = () => {
    navigate("/user/profile");
    // Cân nhắc: Thay bằng onClick hoặc đưa vào dropdown sẽ thân thiện hơn
  };

  const getAvatar = () => {
    if (userInfo.avatar) {
      return userInfo.avatar;
    }
    return userInfo.gender === "FEMALE" ? dfFemale : dfMale;
  };

  // --- THAY ĐỔI LOGIC XÁC ĐỊNH VAI TRÒ ---
  // Kiểm tra xem userInfo.tutorProfile có tồn tại và không phải là null không
  // Nếu có, vai trò là "Gia sư", ngược lại là "Học viên"
  const userRole = userInfo.tutorProfile ? "Gia sư" : "Học viên";
  // -----------------------------------------

  return (
    <div className="user-dropdown">
      <div className="user-info-dropdown">
        <img
          className="user-avatar-square"
          src={getAvatar()}
          alt="user-avatar"
          onClick={handleDoubleClick} // Xem xét lại UX cho hành động này
          // title="Nhấn đúp để xem hồ sơ" // Tooltip gợi ý (tùy chọn)
        />
        <div className="user-details" onClick={toggleDropdown}>
          <span className="user-name">{userInfo.userProfile.fullname || "Người dùng"}</span>
          {/* Hiển thị vai trò đã được xác định động */}
          <span className="user-role">{userRole}</span>
        </div>
      </div>
      {/* Phần hiển thị dropdown (nếu có) */}
      {/* {isDropdownOpen && (
        <div className="dropdown-menu">
          <ul>
            <li onClick={() => navigate('/user/profile')}>Hồ sơ của tôi</li>
            {userRole === "Gia sư" && <li onClick={() => navigate('/tutor/dashboard')}>Trang gia sư</li>}
            <li>Đăng xuất</li>
          </ul>
        </div>
      )} */}
    </div>
  );
};

// Vì vai trò giờ được lấy từ Redux, prop 'userRole' không còn cần thiết nữa
UserComponent.propTypes = {
  onEditProfile: PropTypes.func, // Giữ lại nếu bạn có kế hoạch sử dụng
};

const User = React.memo(UserComponent);
export default User;
