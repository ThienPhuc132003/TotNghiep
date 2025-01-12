import React from "react";
import PropTypes from "prop-types";
import Admin from "../Admin";
import SettingButton from "../../SettingButton";
import NotifiButton from "../../NotifiButton";
import HelpButton from "../../HelpButton";
const AdminAccountToolbarComponent = ({ onEditProfile, onLogout }) => {
  return (
    <>
      <div className="admin-account-toolbar">
        <NotifiButton />
        <HelpButton />
        <Admin onEditProfile={onEditProfile} onLogout={onLogout} />
        <SettingButton endpoint="admin/logout" pathLogout="/admin/login"/>
      </div>
    </>
  );
};
AdminAccountToolbarComponent.propTypes = {
  onEditProfile: PropTypes.func,
  onLogout: PropTypes.func,
};

const AdminAccountToolbar = React.memo(AdminAccountToolbarComponent);
export default AdminAccountToolbar;
