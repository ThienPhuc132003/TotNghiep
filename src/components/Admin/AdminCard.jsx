// src/components/Admin/AdminCard.jsx
import React from "react";
import PropTypes from "prop-types";
import "../../assets/css/Admin/AdminCard.style.css";

const AdminCardComponent = ({ title, children, iconAdminCard }) => {
  return (
    <div className="admin-card">
      <div className="title-card-container">
        {iconAdminCard}
        <p className="title-card">{title}</p>
      </div>
      {children}
    </div>
  );
};

AdminCardComponent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  iconAdminCard: PropTypes.node,
};

const AdminCard = React.memo(AdminCardComponent);
export default AdminCard;
