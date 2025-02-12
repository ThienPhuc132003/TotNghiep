// src/components/Spinner.jsx
import React from "react";
import PropTypes from "prop-types";
import "../assets/css/Spinner.style.css"; // Assuming you have a CSS file for Spinner styles

const Spinner = ({ size = "40px", color = "#007bff" }) => {
  return (
    <div className="spinner" style={{ width: size, height: size }}>
      <div className="double-bounce1" style={{ backgroundColor: color }}></div>
      <div className="double-bounce2" style={{ backgroundColor: color }}></div>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
};

export default React.memo(Spinner);