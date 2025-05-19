import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../../assets/css/User.style.css"; // Đảm bảo đường dẫn CSS đúng
import { useSelector } from "react-redux";
import dfMale from "../../assets/images/df-male.png";
import dfFemale from "../../assets/images/df-female.png";

const UserComponent = () => {
  // onEditProfile vẫn giữ nếu có kế hoạch dùng
  const userInfo = useSelector((state) => state.user.userProfile) || {};
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    // Logic cho dropdown menu có thể được thêm ở đây
  };

  const handleDoubleClick = () => {
    navigate("/user/profile");
  };

  const getAvatar = () => {
    if (userInfo.avatar) {
      return userInfo.avatar;
    }
    return userInfo.gender === "FEMALE" ? dfFemale : dfMale;
  };

  const userRole = userInfo.tutorProfile ? "Gia sư" : "Học viên";
  const displayName =
    userInfo.userProfile && userInfo.userProfile.fullname
      ? userInfo.userProfile.fullname
      : "Người dùng";

  return (
    <div className="user-dropdown">
      <div className="user-info-dropdown">
        <img
          className="user-avatar-square"
          src={getAvatar()}
          alt="User Avatar"
          onClick={handleDoubleClick}
          title="Xem hồ sơ" // Tooltip cho avatar
        />
        {/* Thêm title vào user-details để xem full tên khi hover nếu bị cắt ngắn */}
        <div
          className="user-details"
          onClick={toggleDropdown}
          title={displayName}
        >
          <span className="user-name">{displayName}</span>
          <span className="user-role">{userRole}</span>
        </div>
      </div>
      {/* Phần hiển thị dropdown (ví dụ) */}
      {/* {isDropdownOpen && (
        <div className="dropdown-menu">
          <ul>
            <li onClick={() => { navigate('/user/profile'); setIsDropdownOpen(false); }}>Hồ sơ của tôi</li>
            {userRole === "Gia sư" && <li onClick={() => { navigate('/tutor/dashboard'); setIsDropdownOpen(false); }}>Trang gia sư</li>}
            // Thêm mục Đăng xuất ở SettingButton, không cần ở đây nữa
          </ul>
        </div>
      )} */}
    </div>
  );
};

UserComponent.propTypes = {
  onEditProfile: PropTypes.func,
};

const User = React.memo(UserComponent);
export default User;
