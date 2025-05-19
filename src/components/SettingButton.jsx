// src/components/SettingButton.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Button from "./Button";
import "../assets/css/SettingButton.style.css";

const ROLES = {
  USER: "USER",
  TUTOR: "TUTOR",
};

const SettingButtonComponent = ({
  currentUserRole,
  isAuthenticated,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleNavigateToAccount = () => {
    setIsDropdownOpen(false);
    // Điều hướng đến trang hồ sơ mặc định của layout quản lý tài khoản
    if (currentUserRole === ROLES.TUTOR) {
      navigate("/gia-su/quan-ly/ho-so"); // Path đầy đủ đến trang hồ sơ gia sư
    } else {
      navigate("/tai-khoan/ho-so"); // Path đầy đủ đến trang hồ sơ người dùng
    }
  };

  const handleUserLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="setting-button-container" ref={dropdownRef}>
      <Button className="setting-button" onClick={toggleDropdown}>
        <i
          className={`fa-solid fa-gear fa-lg ${isDropdownOpen ? "rotate" : ""}`}
        ></i>
      </Button>

      {isDropdownOpen && (
        <div className="setting-dropdown-menu open">
          <button
            onClick={handleNavigateToAccount}
            type="button"
            className="dropdown-item-button"
          >
            {/* Tên mục menu trong SettingButton */}
            {currentUserRole === ROLES.TUTOR
              ? "Hồ Sơ Gia Sư"
              : "Hồ Sơ Học Viên"}
          </button>
          {isAuthenticated && (
            <button
              onClick={handleUserLogout}
              type="button"
              className="dropdown-item-button logout-button"
            >
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </div>
  );
};

SettingButtonComponent.propTypes = {
  currentUserRole: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

const SettingButton = React.memo(SettingButtonComponent);
export default SettingButton;
