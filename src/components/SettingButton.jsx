// src/components/SettingButton.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import Cookies from "js-cookie";

import Button from "./Button"; // Component Button của bạn (đã sửa để render thẻ <button>)
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import { clearUserProfile } from "../redux/userSlice";
import "../assets/css/SettingButton.style.css"; // CSS cho component này

// Định nghĩa ROLES (phải đồng bộ với ROLES trong HomePageLayout)
const ROLES = {
  GUEST: "GUEST",
  USER: "USER",
  TUTOR: "TUTOR",
};

const SettingButtonComponent = ({
  endpoint = "user/logout", // Hoặc "auth/logout" tùy theo API của bạn
  pathLogout = "/login",
  currentUserRole,
  isAuthenticated,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await Api({ endpoint: endpoint, method: METHOD_TYPE.POST });
    } catch (error) {
      console.error("Lỗi API đăng xuất (tiếp tục logout client):", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("role"); // Xóa cả cookie role nếu có
      dispatch(clearUserProfile());
      setIsDropdownOpen(false);
      navigate(pathLogout);
    }
  };

  const toggleDropdown = () => {
    // console.log('SettingButton: toggleDropdown called. Previous isDropdownOpen:', isDropdownOpen);
    setIsDropdownOpen((prev) => !prev);
  };

  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const getSettingDropdownItems = () => {
    let items = [];
    console.log('[SettingButton] currentUserRole:', currentUserRole); 
    if (currentUserRole === ROLES.USER) {
      items = [
        {
          id: "studentProfileSetting",
          label: "Hồ sơ học viên",
          path: "/user/profile",
        },
        {
          id: "favoriteTutorsSetting",
          label: "Gia sư yêu thích",
          path: "/gia-su-yeu-thich",
        },
        { id: "userWalletSetting", label: "Ví cá nhân", path: "/vi-cua-toi" },
      ];
    } else if (currentUserRole === ROLES.TUTOR) {
      items = [
        {
          id: "tutorProfileSetting",
          label: "Hồ sơ gia sư",
          path: "/ho-so-gia-su",
        },
        { id: "tutorWalletSetting", label: "Ví cá nhân", path: "/vi-cua-toi" },
        {
          id: "rentalRequestsSetting",
          label: "Yêu cầu thuê",
          path: "/yeu-cau-thue",
        },
        {
          id: "personalSyllabusSetting",
          label: "Giáo trình cá nhân",
          path: "/giao-trinh-ca-nhan",
        },
      ];
    }
    return items;
  };

  const settingDropdownItems = getSettingDropdownItems();

  return (
    <div className="setting-button-container">
      {/* 
        Sử dụng component Button (đã sửa) và truyền className.
        Component Button bên trong sẽ render ra thẻ <button type="button" className="setting-button" ...>
      */}
      <Button className="setting-button" onClick={toggleDropdown}>
        <i
          className={`fa-solid fa-gear fa-2xl ${
            isDropdownOpen ? "rotate" : ""
          }`}
        ></i>
      </Button>

      <div className={`setting-dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
        {settingDropdownItems.map((item) => (
          // Các mục trong dropdown cũng nên là thẻ <button> để có tính nhất quán và accessibility
          <button
            key={item.id}
            onClick={() => handleNavigate(item.path)}
            type="button"
            className="dropdown-item-button"
          >
            {item.label}
          </button>
        ))}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            type="button"
            className="dropdown-item-button logout-button"
          >
            Đăng xuất
          </button>
        )}
      </div>
    </div>
  );
};

SettingButtonComponent.propTypes = {
  endpoint: PropTypes.string,
  pathLogout: PropTypes.string,
  currentUserRole: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const SettingButton = React.memo(SettingButtonComponent);
export default SettingButton;
