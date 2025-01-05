import React from "react";
import "../assets/css/HelpButton.style.css";

const HelpButtonComponent = () => {
  return (
    <button className="help-button">
      <i className="fa-regular fa-circle-question fa-2xl"></i>
    </button>
  );
};

const HelpButton = React.memo(HelpButtonComponent);
export default HelpButton;