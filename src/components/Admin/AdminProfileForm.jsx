// src/pages/Admin/ProfileForm.jsx
import React from "react";
import PropTypes from "prop-types";

const ProfileForm = ({ profileData, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="profileForm">
      <div className="formGroup">
        <label htmlFor="fullName">Họ và tên</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={profileData.fullName}
          onChange={onChange}
        />
      </div>
      <div className="formGroup">
        <label htmlFor="birthday">Ngày sinh</label>
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={profileData.birthday}
          onChange={onChange}
        />
      </div>
      <div className="formGroup">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={profileData.personalEmail}
          onChange={onChange}
          className="readOnly"
          readOnly
        />
      </div>
      <div className="formGroup">
        <label htmlFor="workEmail">Email công việc</label>
        <input
          type="email"
          id="workEmail"
          name="workEmail"
          value={profileData.workEmail}
          onChange={onChange}
        />
      </div>
      <div className="formGroup">
        <label htmlFor="phoneNumber">Số điện thoại</label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={profileData.phoneNumber}
          onChange={onChange}
        />
      </div>
      <div className="formGroup">
        <label htmlFor="homeAddress">Địa chỉ</label>
        <input
          type="text"
          id="homeAddress"
          name="homeAddress"
          value={profileData.homeAddress}
          onChange={onChange}
        />
      </div>
      <div className="formGroup">
        <label>Giới tính</label>
        <div className="genderGroup">
          <label>
            <input
              type="radio"
              name="gender"
              value="MALE"
              checked={profileData.gender === "MALE"}
              onChange={onChange}
            />
            Nam
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="FEMALE"
              checked={profileData.gender === "FEMALE"}
              onChange={onChange}
            />
            Nữ
          </label>
        </div>
      </div>
      <button type="submit" className="profileButton">
        Lưu thay đổi
      </button>
    </form>
  );
};

ProfileForm.propTypes = {
  profileData: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    birthday: PropTypes.string.isRequired,
    personalEmail: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string.isRequired,
    homeAddress: PropTypes.string.isRequired,
    gender: PropTypes.oneOf(["MALE", "FEMALE"]).isRequired,
    workEmail: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default React.memo(ProfileForm);
