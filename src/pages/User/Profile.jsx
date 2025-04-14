import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // <- Layout của bạn
import "../../assets/css/Profile.style.css"; // <- CSS cho trang Profile
import { METHOD_TYPE } from "../../network/methodType"; // <- methodType
import Api from "../../network/Api"; // <- File Api của bạn
import { setUserProfile } from "../../redux/userSlice"; // <- Action Redux
import AvatarDisplay from "../../components/AvatarDisplay"; // <- Component hiển thị Avatar
import ImageCropModal from "../../components/ImageCropModal"; // <- Modal Crop
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const dispatch = useDispatch();

  // State cho dữ liệu form chính
  const [profileData, setProfileData] = useState({
    avatar: null,
    fullName: "",
    birthday: "",
    email: "", // Email cá nhân (readonly)
    phoneNumber: "",
    homeAddress: "",
    gender: "",
    workEmail: "", // Email VLU (editable)
  });

  // State quản lý modal crop
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null); // Data URL ảnh gốc cho modal

  // State thông báo & loading
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false); // Loading lưu form chính
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // Loading upload avatar

  // Ref cho input file ẩn
  const fileInputRef = useRef(null);

  // Đồng bộ từ Redux vào state local
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        avatar: userProfile.avatar || null,
        fullName: userProfile.fullname || "",
        birthday: userProfile.birthday
          ? userProfile.birthday.split("T")[0]
          : "",
        email: userProfile.personalEmail || "", // Map từ personalEmail
        phoneNumber: userProfile.phoneNumber || "",
        homeAddress: userProfile.homeAddress || "",
        gender: userProfile.gender || "",
        workEmail: userProfile.workEmail || userProfile.email || "", // Map từ workEmail hoặc email
      });
    }
  }, [userProfile]);

  // Xử lý thay đổi input form
  const handleChange = (e) => {
    // Không cho phép thay đổi nếu input là readOnly (chỉ cần thiết nếu không dùng thuộc tính readOnly HTML)
    // if (e.target.readOnly) return;
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  // --- Trigger ẩn input file ---
  const handleTriggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  }, []);

  // --- Xử lý khi người dùng chọn file từ input ---
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

  // --- Hàm được gọi khi nhấn "Lưu ảnh" trong ImageCropModal ---
  const handleCropSave = useCallback(
    async (croppedImageBlob) => {
      setIsCropModalOpen(false);
      if (!croppedImageBlob) return;
      setIsUploadingAvatar(true);
      setSuccessMessage("");
      setErrorMessage("");
      try {
        // 1. Lấy tên file
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
        // 2. Upload ảnh
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
        // 3. Cập nhật profile
        const updateProfileResponse = await Api({
          endpoint: "user/update-profile",
          method: METHOD_TYPE.PUT,
          data: { avatar: finalUrl },
        });
        if (!updateProfileResponse.success)
          throw new Error(
            updateProfileResponse.message || "Cập nhật liên kết ảnh thất bại."
          );
        // 4. Cập nhật Redux
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

  // --- Hàm đóng modal ---
  const handleCloseCropModal = useCallback(() => {
    if (!isUploadingAvatar) {
      setIsCropModalOpen(false);
      setImageToCrop(null);
    }
  }, [isUploadingAvatar]);

  // --- Xử lý submit form chính ---
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (isUploadingAvatar) return;
    setIsSavingProfile(true);
    setSuccessMessage("");
    setErrorMessage("");
    // *** Dữ liệu gửi đi ***
    const dataToSend = {
      fullname: profileData.fullName,
      birthday: profileData.birthday,
      phoneNumber: profileData.phoneNumber,
      homeAddress: profileData.homeAddress,
      gender: profileData.gender,
      // Gửi email VLU (đảm bảo key `workEmail` khớp backend)
      workEmail: profileData.workEmail,
      // KHÔNG gửi email cá nhân (profileData.email)
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

  // --- Render JSX ---
  return (
    <HomePageLayout>
      {/* Input file ẩn */}
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

          {/* Thông báo */}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}

          {/* Content chính */}
          <div
            className={`profile-content ${
              isSavingProfile || isUploadingAvatar ? "content-loading" : ""
            }`}
          >
            {/* Khu vực Avatar */}
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

            {/* Form thông tin */}
            <form
              className="profile-form-section"
              onSubmit={handleSubmitProfile}
            >
              {/* === GRID ĐÃ SẮP XẾP LẠI === */}
              <div className="form-grid-user">
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
                    readOnly // Chỉ đọc
                    className="input-readonly" // Thêm class để style
                    aria-label="Email cá nhân không thể thay đổi"
                    onChange={handleChange} // Vẫn cần onChange
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
                    // KHÔNG có readOnly và class input-readonly
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
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>{" "}
              {/* === KẾT THÚC GRID === */}
              {/* Nút Submit */}
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

      {/* Modal Crop Ảnh */}
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
