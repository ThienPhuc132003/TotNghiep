import React from "react";
import PropTypes from "prop-types";
import "../assets/css/HoverForInfo.style.css";
const HoverForInfoComponent = ({ Text }) => {
  return (
    <>
      <div className="dropdown-info">
        <div className="dropdown-info-btn">*</div>
        {Text && (
          <div className="dropdown-info-menu">
            <p>{Text}</p>
          </div>
        )}
      </div>
    </>
  );
};

HoverForInfoComponent.propTypes = {
  Text: PropTypes.string,
};
const HoverForInfo = React.memo(HoverForInfoComponent);
export default HoverForInfo;
