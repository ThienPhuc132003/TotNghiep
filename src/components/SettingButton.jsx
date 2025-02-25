import React, { useState } from "react";
import Button from "./Button";
import "../assets/css/SettingButton.style.css";
import { useNavigate } from "react-router-dom";
import Api from "../network/Api";
import { METHOD_TYPE } from "../network/methodType";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
const SettingButtonComponent = ({ endpoint, pathLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Api({
        endpoint: endpoint,
        method: METHOD_TYPE.POST,
      });
      Cookies.remove("token");
      Cookies.remove("role")
      navigate(pathLogout);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="setting-button-container">
      <Button className="setting-button" onClick={toggleDropdown}>
        <i
          className={`fa-solid fa-gear fa-2xl ${
            isDropdownOpen ? "rotate" : ""
          }`}
        ></i>
      </Button>
      <div className={`setting-dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
        <button onClick={handleLogout}>Logout</button>
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
