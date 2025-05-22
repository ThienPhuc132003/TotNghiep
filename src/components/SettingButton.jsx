import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Button from "./Button"; // Đảm bảo component Button của bạn render ra thẻ <button>
import "../assets/css/SettingButton.style.css"; // Đảm bảo CSS được import

const ROLES = {
  USER: "USER",
  TUTOR: "TUTOR",
};

const SettingButtonComponent = ({
  currentUserRole = null,
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
    navigate("/tai-khoan/ho-so"); // Luôn điều hướng đến base path chung
  };

  const handleUserLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="setting-button-container" ref={dropdownRef}>
      <Button className="setting-button" onClick={toggleDropdown} type="button">
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
            {currentUserRole === ROLES.TUTOR
              ? "Quản Lý Gia Sư"
              : "Tài Khoản Của Tôi"}
          </button>
          <button
            onClick={handleUserLogout}
            type="button"
            className="dropdown-item-button logout-button"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

SettingButtonComponent.propTypes = {
  currentUserRole: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

const SettingButton = React.memo(SettingButtonComponent);
export default SettingButton;
