// src/pages/User/ProfilePage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import "../../assets/css/Profile.style.css";
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import { setUserProfile } from "../../redux/userSlice";
import AvatarDisplay from "../../components/AvatarDisplay";
import ImageCropModal from "../../components/ImageCropModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState({
    avatar: null,
    fullName: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    gender: "",
    workEmail: "",
  });
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        avatar: userProfile.avatar || null,
        fullName: userProfile.fullname || "",
        birthday: userProfile.birthday
          ? userProfile.birthday.split("T")[0]
          : "",
        email: userProfile.personalEmail || "",
        phoneNumber: userProfile.phoneNumber || "",
        homeAddress: userProfile.homeAddress || "",
        gender: userProfile.gender || "",
        workEmail: userProfile.workEmail || userProfile.email || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleTriggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chọn một file ảnh hợp lệ.");
      return;
    }
    setErrorMessage("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setIsCropModalOpen(true);
    };
    reader.onerror = (error) => {
      console.error("Lỗi đọc file:", error);
      setErrorMessage("Không thể đọc file ảnh.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropSave = useCallback(
    async (croppedImageBlob) => {
      setIsCropModalOpen(false);
      if (!croppedImageBlob) return;
      setIsUploadingAvatar(true);
      setSuccessMessage("");
      setErrorMessage("");
      try {
        const fileNameResponse = await Api({
          endpoint: "media/media-url",
          query: { mediaCategory: "USER_AVATAR" },
          method: METHOD_TYPE.GET,
        });
        if (!fileNameResponse?.success || !fileNameResponse?.data?.fileName)
          throw new Error(
            fileNameResponse?.message || "Lỗi lấy định danh file."
          );
        const fileName = fileNameResponse.data.fileName;
        const uploadFormData = new FormData();
        uploadFormData.append("file", croppedImageBlob, `${fileName}.jpeg`);
        const uploadResponse = await Api({
          endpoint: `media/upload-media`,
          query: { mediaCategory: "USER_AVATAR", fileName },
          method: METHOD_TYPE.POST,
          data: uploadFormData,
        });
        if (!uploadResponse?.success || !uploadResponse?.data?.mediaUrl)
          throw new Error(uploadResponse?.message || "Upload ảnh thất bại.");
        const finalUrl = uploadResponse.data.mediaUrl;
        const updateProfileResponse = await Api({
          endpoint: "user/update-profile",
          method: METHOD_TYPE.PUT,
          data: { avatar: finalUrl },
        });
        if (!updateProfileResponse.success)
          throw new Error(
            updateProfileResponse.message || "Cập nhật liên kết ảnh thất bại."
          );
        dispatch(setUserProfile({ ...userProfile, avatar: finalUrl }));
        setSuccessMessage("Ảnh đại diện đã cập nhật thành công!");
        setImageToCrop(null);
      } catch (error) {
        console.error("Lỗi xử lý avatar:", error);
        setErrorMessage(error.message || "Lỗi cập nhật ảnh đại diện.");
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [dispatch, userProfile]
  );

  const handleCloseCropModal = useCallback(() => {
    if (!isUploadingAvatar) {
      setIsCropModalOpen(false);
      setImageToCrop(null);
    }
  }, [isUploadingAvatar]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (isUploadingAvatar) return;
    setIsSavingProfile(true);
    setSuccessMessage("");
    setErrorMessage("");
    const dataToSend = {
      fullname: profileData.fullName,
      birthday: profileData.birthday,
      phoneNumber: profileData.phoneNumber,
      homeAddress: profileData.homeAddress,
      gender: profileData.gender,
      workEmail: profileData.workEmail, // Gửi cả email VLU
    };
    try {
      const response = await Api({
        endpoint: "user/update-profile",
        method: METHOD_TYPE.PUT,
        data: dataToSend,
      });
      if (response.success === true && response.data) {
        dispatch(setUserProfile({ ...userProfile, ...response.data }));
        setSuccessMessage("Thông tin hồ sơ đã cập nhật!");
      } else {
        throw new Error(response.message || "Cập nhật thông tin thất bại.");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMessage(error.message || "Lỗi lưu thông tin.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <HomePageLayout>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/jpg"
        disabled={isUploadingAvatar}
      />
      <div className="profile-page-wrapper">
        <div className="profile-container">
          <h1>Hồ sơ cá nhân</h1>
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
          <div
            className={`profile-content ${
              isSavingProfile || isUploadingAvatar ? "content-loading" : ""
            }`}
          >
            <div className="profile-avatar-section">
              {isUploadingAvatar && (
                <div className="avatar-loading-overlay">
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                </div>
              )}
              <AvatarDisplay
                imageUrl={profileData.avatar}
                onTriggerSelect={handleTriggerFileInput}
              />
            </div>
            <form
              className="profile-form-section"
              onSubmit={handleSubmitProfile}
            >
              {/* === SẮP XẾP LẠI GRID === */}
              <div className="form-grid">
                {/* --- DÒNG 1 --- */}
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* --- DÒNG 2 --- */}
                <div className="form-group">
                  <label htmlFor="email">Email cá nhân</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    readOnly
                    className="input-readonly" // Chỉ đọc + class style
                    aria-label="Email cá nhân không thể thay đổi"
                    onChange={handleChange} // Vẫn cần để state update
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="workEmail">Email liên hệ (VLU)</label>
                  <input
                    type="email"
                    id="workEmail"
                    name="workEmail"
                    value={profileData.workEmail}
                    onChange={handleChange} // Cho phép sửa
                    placeholder="Nhập email liên hệ VLU"
                  />
                </div>

                {/* --- DÒNG 3 --- */}
                <div className="form-group">
                  <label htmlFor="birthday">Ngày sinh</label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={profileData.birthday}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="gender-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={profileData.gender === "MALE"}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span> Nam
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={profileData.gender === "FEMALE"}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span> Nữ
                    </label>
                  </div>
                </div>

                {/* --- DÒNG 4 --- */}
                <div className="form-group form-group-full">
                  <label htmlFor="homeAddress">Địa chỉ hiện tại</label>
                  <input
                    type="text"
                    id="homeAddress"
                    name="homeAddress"
                    value={profileData.homeAddress}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã..."
                  />
                </div>
              </div>{" "}
              {/* === KẾT THÚC GRID === */}
              <button
                type="submit"
                className="profile-submit-button"
                disabled={isSavingProfile || isUploadingAvatar}
              >
                {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi thông tin"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ImageCropModal
        isOpen={isCropModalOpen}
        onRequestClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropSave={handleCropSave}
      />
    </HomePageLayout>
  );
};

export default ProfilePage;
