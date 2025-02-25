// src/pages/Admin/AvatarSection.jsx
import React from "react";
import PropTypes from "prop-types";
import dfMale from "../../assets/images/df-male.png";
import dfFemale from "../../assets/images/df-female.png";

const AvatarSection = ({ adminProfile, onOpenModal }) => {
    const getAvatar = () => {
        if (adminProfile && adminProfile.avatar) {
            return adminProfile.avatar;
        }
        return adminProfile?.gender === "FEMALE" ? dfFemale : dfMale;
    };

    return (
        <div className="form-group avatar-container">
            <img src={getAvatar()} alt="Ảnh đại diện" className="avatar" />
            <button
                type="button"
                className="change-avatar-button"
                onClick={onOpenModal}
            >
                Đổi Avatar
            </button>
        </div>
    );
};

AvatarSection.propTypes = {
    adminProfile: PropTypes.shape({
        avatar: PropTypes.string,
        gender: PropTypes.string,
    }).isRequired,
    onOpenModal: PropTypes.func.isRequired,
};

export default React.memo(AvatarSection);