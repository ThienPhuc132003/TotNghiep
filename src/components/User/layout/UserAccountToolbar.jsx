import React from "react";
import PropTypes from "prop-types";
import User from "../User";
import SettingButton from "../../SettingButton";
import NotifiButton from "../../NotifiButton";
import HelpButton from "../../HelpButton";
const UserAccountToolbarComponent = ({ onEditProfile }) => {
  return (
    <>
      <div className="user-account-toolbar">
        <NotifiButton />
        <HelpButton />
        <User onEditProfile={onEditProfile} />
        <SettingButton endpoint="user/logout" pathLogout="/login"/>
      </div>
    </>
  );
};

// UserAccountToolbarComponent.propTypes = {
//   onEditProfile: PropTypes.func.isRequired,
//   onLogout: PropTypes.func.isRequired,
// };
UserAccountToolbarComponent.propTypes = {
  onEditProfile: PropTypes.func,
};

const UserAccountToolbar = React.memo(UserAccountToolbarComponent);
export default UserAccountToolbar;
