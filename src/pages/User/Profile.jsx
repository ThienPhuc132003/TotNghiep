// src/pages/User/Profile.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import dfMale from "../../assets/images/df-male.png";
import dfFemale from "../../assets/images/df-female.png";
import "../../assets/css/Profile.style.css";
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import { setUserProfile } from "../../redux/userSlice";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import Modal from "../../components/Modal";
import UserDashboardLayout from "../../components/User/layout/UserDashboardLayout";
// Set the app element for accessibility
Modal.setAppElement("#root");

const ProfilePage = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState({
    avatar: userProfile?.avatar || null,
    fullName: userProfile?.fullname || "",
    birthday: userProfile?.birthday || "",
    email: userProfile?.personalEmail || "",
    phoneNumber: userProfile?.phoneNumber || "",
    homeAddress: userProfile?.homeAddress || "",
    gender: userProfile?.gender || "",
    workEmail: userProfile?.workEmail || "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });

    // Clear the error message for the field being edited
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      fullname: profileData.fullName,
      birthday: profileData.birthday,
      phoneNumber: profileData.phoneNumber,
      email: profileData.email,
      homeAddress: profileData.homeAddress,
      gender: profileData.gender,
      workEmail: profileData.workEmail,
    };
    try {
      const response = await Api({
        endpoint: "user/update-profile",
        method: METHOD_TYPE.PUT,
        data: dataToSend,
      });
      if (response.success === true) {
        dispatch(setUserProfile(response.data));
        setSuccessMessage("Profile updated successfully!");
      } else {
        setErrorMessage("Failed to update profile: " + response.message);
      }
    } catch (error) {
      setErrorMessage("Failed to update profile: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append("avatar", croppedImage);

      const response = await Api({
        endpoint: "user/upload-avatar",
        method: METHOD_TYPE.POST,
        data: formData,
        isFormData: true,
      });

      if (response.success === true) {
        dispatch(setUserProfile({ ...userProfile, avatar: response.data.avatar }));
        setIsModalOpen(false);
        setSelectedImage(null);
        setIsCropping(false);
        setSuccessMessage("Avatar updated successfully!");
      } else {
        setErrorMessage("Failed to upload avatar: " + response.message);
      }
    } catch (error) {
      setErrorMessage("Failed to upload avatar: " + error.message);
    }
  };

  const getAvatar = () => {
    if (profileData.avatar) {
      return profileData.avatar;
    }
    return profileData.gender === "FEMALE" ? dfFemale : dfMale;
  };

  return (
    <UserDashboardLayout>
      <div className="profile-form">
        <h1>User Profile</h1>
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group avatar-container">
            <img src={getAvatar()} alt="Avatar" className="avatar" />
            <button
              type="button"
              className="change-avatar-button"
              onClick={() => setIsModalOpen(true)}
            >
              Change Avatar
            </button>
          </div>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Select and Crop Avatar"
            className="modal"
            overlayClassName="overlay"
          >
            <h2 className="modal-title">Select and Crop Avatar</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            {isCropping && (
              <div className="crop-container">
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
            <div className="modal-buttons">
              <button
                type="button"
                className="crop-save-button"
                onClick={handleCropSave}
                disabled={!selectedImage}
              >
                Save Avatar
              </button>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </Modal>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={profileData.birthday}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className="read-only"
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="homeAddress">Home Address</label>
            <input
              type="text"
              id="homeAddress"
              name="homeAddress"
              value={profileData.homeAddress}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="workEmail">Work Email</label>
            <input
              type="email"
              id="workEmail"
              name="workEmail"
              value={profileData.workEmail}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <div className="gender-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={profileData.gender === "MALE"}
                  onChange={handleChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={profileData.gender === "FEMALE"}
                  onChange={handleChange}
                />
                Female
              </label>
            </div>
          </div>
          <button type="submit" className="profile-button">
            Save Changes
          </button>
        </form>
      </div>
    </UserDashboardLayout>
  );
};

const Profile = React.memo(ProfilePage);
export default Profile;