// SettingButton.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import Cookies from "js-cookie";

import Button from "./Button"; // Component Button bạn đã có
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import { clearUserProfile } from "../redux/userSlice"; // Đảm bảo đường dẫn đúng
import "../assets/css/SettingButton.style.css"; // File CSS của bạn

const SettingButtonComponent = ({
  endpoint = "auth/logout",
  pathLogout = "/login",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    console.log("Bắt đầu quá trình đăng xuất...");
    try {
      await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.POST,
      });
      console.log("API đăng xuất backend thành công (hoặc không cần gọi).");
    } catch (error) {
      console.error(
        "Lỗi khi gọi API đăng xuất backend (tiếp tục logout client):",
        error
      );
    } finally {
      console.log("Xóa cookie token và role...");
      Cookies.remove("token");
      Cookies.remove("role");
      // localStorage.removeItem('refreshToken'); // Nếu có

      console.log("Dispatch action clearUserProfile...");
      dispatch(clearUserProfile());

      console.log(`Điều hướng đến ${pathLogout}...`);
      setIsDropdownOpen(false); // Đóng dropdown
      navigate(pathLogout);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Các hàm điều hướng, thêm setIsDropdownOpen(false) để đóng menu
  const handleUserInfo = () => {
    setIsDropdownOpen(false);
    navigate("/user/profile");
  };
  const handleWallet = () => {
    setIsDropdownOpen(false);
    navigate("/vi-cua-toi");
  };
  const handleTutorLike = () => {
    setIsDropdownOpen(false);
    navigate("/gia-su-yeu-thich");
  };

  return (
    <div className="setting-button-container">
      {/* Nút bánh răng để mở/đóng dropdown */}
      <Button className="setting-button" onClick={toggleDropdown}>
        <i
          className={`fa-solid fa-gear fa-2xl ${
            isDropdownOpen ? "rotate" : ""
          }`}
        ></i>
      </Button>

      {/* Dropdown menu */}
      <div className={`setting-dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
        {/* *** HOÀN NGUYÊN SỬ DỤNG THẺ <button> *** */}
        <button onClick={handleUserInfo}>Trang cá nhân</button>
        <button onClick={handleTutorLike}>Gia sư yêu thích</button>
        <button onClick={handleWallet}>Ví cá nhân</button>
        <button onClick={handleLogout}>Đăng xuất</button>
        {/* Các CSS trong SettingButton.style.css nhắm vào button sẽ được áp dụng lại */}
      </div>
    </div>
  );
};

SettingButtonComponent.propTypes = {
  endpoint: PropTypes.string,
  pathLogout: PropTypes.string,
};

const SettingButton = React.memo(SettingButtonComponent);
export default SettingButton;
