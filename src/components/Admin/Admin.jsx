import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Admin/Admin.style.css";
import { useSelector } from "react-redux";
import dfMale from "../../assets/images/df-male.png";
import dfFemale from "../../assets/images/df-female.png";

const UserComponent = () => {
  const adminInfo = useSelector((state) => state.admin.adminProfile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDoubleClick = () => {
    navigate("/admin/profile");
  };

  const getAvatar = () => {
    if (adminInfo.avatar) {
      return adminInfo.avatar;
    }
    return adminInfo.gender === "FEMALE" ? dfFemale : dfMale;
  };

  return (
    <div className="admin-dropdown">
      <div className="admin-info-dropdown">
        <img
          className="admin-avatar-square"
          src={getAvatar()}
          alt="uadminser-avatar"
          onClick={handleDoubleClick}
        />
        <div className="admin-details" onClick={toggleDropdown}>
          <span className="admin-name">{adminInfo.fullname}</span>
          <span className="admin-role">Hoc vien</span>
        </div>
      </div>

    </div>
  );
};

UserComponent.propTypes = {
  onEditProfile: PropTypes.func,
  userRole: PropTypes.string,
};

const User = React.memo(UserComponent);
export default User;
