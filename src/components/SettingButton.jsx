import React from "react";

import "../assets/css/SettingButton.style.css";

const SettingButtonComponent = () => {
  return (
    <button className="setting-button">
     <i className="fa-solid fa-gear fa-2xl"></i>
    </button>
  );
};
const SettingButton = React.memo(SettingButtonComponent);
export default SettingButton;
