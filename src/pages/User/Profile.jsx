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
import Modal from "react-modal";
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
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      fullname: profileData.fullName,
      birthday: profileData.birthday,
      phoneNumber: profileData.phoneNumber,
      personalEmail: profileData.personalEmail,
      workEmail: profileData.workEmail,
      homeAddress: profileData.homeAddress,
      gender: profileData.gender,
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
        console.error("Failed to update profile:", response.message);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const getAvatar = () => {
    if (profileData.avatar) {
      return profileData.avatar;
    }
    return profileData.gender === "FEMALE" ? dfFemale : dfMale;
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

  const onCropComplete = (croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      const avatarResponse = await Api({
        endpoint: "media-service/media/media-url?mediaCategory=user_avatar",
        method: METHOD_TYPE.GET,
      });

      if (avatarResponse.success === true) {
        const fileName = avatarResponse.data.fileName;
        const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);
        const formData = new FormData();
        formData.append("file", croppedImage);

        const uploadResponse = await Api({
          endpoint: `media-service/media/upload-media?mediaCategory=user_avatar&fileName=${fileName}`,
          method: METHOD_TYPE.POST,
          data: formData,
          isFormData: true,
        });

        if (uploadResponse.success === true) {
          const pushAvatarToServer = await Api({
            endpoint: `loan-service/borrower/update-profile`,
            method: METHOD_TYPE.PUT,
            data: { avatar: uploadResponse.data.mediaUrl },
          });
          dispatch(setUserProfile(pushAvatarToServer.data));
          setProfileData({ ...profileData, avatar: pushAvatarToServer.data.avatar });
          setSuccessMessage("Avatar updated successfully!");
          setIsCropping(false);
          setIsModalOpen(false);
        } else {
          console.error("Failed to upload avatar:", uploadResponse.message);
        }
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="profile-form">
        <h1>User Profile</h1>
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
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
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Change Avatar"
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
              value={profileData.fullName || "null"}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={profileData.birthday || "null"}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || "null"}
              onChange={handleChange}
              readOnly
              className="read-only"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={profileData.phoneNumber || "null"}
              onChange={handleChange}
              readOnly
              className="read-only"
            />
          </div>
          <div className="form-group">
            <label htmlFor="homeAddress">Home Address</label>
            <input
              type="text"
              id="homeAddress"
              name="homeAddress"
              value={profileData.homeAddress || "null"}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="workEmail">Work Email</label>
            <input
              type="email"
              id="workEmail"
              name="workEmail"
              value={profileData.workEmail || "null"}
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