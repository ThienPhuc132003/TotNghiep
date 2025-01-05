import React from "react";
import PropTypes from "prop-types";
import UserDashboardLayout from "./UserDashboardLayout";
import Button from "../../Button"; // Import the Button component
import { useNavigate } from "react-router-dom";

const ProfileLayoutComponent = (props) => {
  const { children = null } = props;
  const navigate = useNavigate();

  return (
    <UserDashboardLayout>
      <nav>
        <Button onClick={() => navigate("/messages")}>Message</Button>
        <Button onClick={() => navigate("/settings")}>Setting</Button>
      </nav>
      {children}
    </UserDashboardLayout>
  );
};

ProfileLayoutComponent.propTypes = {
  children: PropTypes.node,
};

const ProfileLayout = React.memo(ProfileLayoutComponent);
export default ProfileLayout;
