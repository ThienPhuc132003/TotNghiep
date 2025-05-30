import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Button from "./Button"; // Đảm bảo component Button của bạn render ra thẻ <button>
import "../assets/css/SettingButton.style.css"; // Đảm bảo CSS được import

const SettingButtonComponent = ({
  isAuthenticated = () => false,
  onLogout, // Hàm logout được truyền từ cha
  accountManagementText = "", // Text cho mục quản lý tài khoản
  accountManagementPath = "", // Path cho mục quản lý tài khoản
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
  }, []); // Bỏ dropdownRef khỏi dependency array

  const handleNavigateToAccount = () => {
    setIsDropdownOpen(false);
    if (accountManagementPath) {
      navigate(accountManagementPath);
    }
  };

  const handleTriggerLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout(); // Gọi hàm logout được truyền từ cha
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
          {/* Chỉ hiển thị mục này nếu có text và path */}
          {accountManagementText && accountManagementPath && (
            <button
              onClick={handleNavigateToAccount}
              type="button"
              className="dropdown-item-button"
            >
              {accountManagementText}
            </button>
          )}
          <button
            onClick={handleTriggerLogout}
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
  isAuthenticated: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  accountManagementText: PropTypes.string,
  accountManagementPath: PropTypes.string,
};

const SettingButton = React.memo(SettingButtonComponent);
export default SettingButton;
