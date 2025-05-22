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
    navigate("/tai-khoan/ho-so");
  };

  const getAvatar = () => {
    if (userInfo.avatar) {
      return userInfo.avatar;
    }
    return userInfo.gender === "FEMALE" ? dfFemale : dfMale;
  };

  const displayName =
    userInfo.userProfile && userInfo.userProfile.fullname
      ? userInfo.userProfile.fullname
      : "Người dùng";
  const userRole = userInfo.tutorProfile ? "Gia sư" : "Học viên";
  const userCoin = userInfo.coin ? `${userInfo.coin} Coin` : "0 Xu";

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
          <span className="user-coin">
            <p className="user-coin-amount"> {userCoin}</p>
            <i className="fa-solid fa-coins"></i>
          </span>
        </div>
      </div>
    </div>
  );
};

UserComponent.propTypes = {
  onEditProfile: PropTypes.func,
};

const User = React.memo(UserComponent);
export default User;
