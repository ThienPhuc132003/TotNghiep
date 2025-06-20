// src/pages/User/Profile.jsx
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../assets/css/Profile.style.css";
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import { setUserProfile } from "../../redux/userSlice"; // Thêm fetchUserProfile nếu bạn muốn refresh profile từ trang này
import AvatarDisplay from "../../components/AvatarDisplay";
import ImageCropModal from "../../components/ImageCropModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getUserAvatar } from "../../utils/avatarUtils";

const ProfilePage = () => {
  // Lấy toàn bộ object userProfile từ Redux state
  const userProfileFromRedux = useSelector((state) => state.user.userProfile);
  const profileLoading = useSelector((state) => state.user.profileLoading);
  const profileError = useSelector((state) => state.user.profileError);
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
  const [errorMessage, setErrorMessageState] = useState(""); // Đổi tên để tránh trùng với profileError từ Redux
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  // Đồng bộ từ Redux vào state local khi userProfileFromRedux thay đổi hoặc khi component mount
  useEffect(() => {
    if (userProfileFromRedux && userProfileFromRedux.userProfile) {
      console.log(
        "🔄 Profile.jsx - Syncing Redux data to local state:",
        userProfileFromRedux
      );

      // Sử dụng getUserAvatar để lấy avatar đúng theo logic role
      const avatar = getUserAvatar(userProfileFromRedux);

      setProfileData({
        avatar: avatar,
        fullName: userProfileFromRedux.userProfile.fullname || "",
        birthday: userProfileFromRedux.userProfile.birthday
          ? userProfileFromRedux.userProfile.birthday.split("T")[0]
          : "",
        email:
          userProfileFromRedux.userProfile.personalEmail ||
          userProfileFromRedux.email ||
          "",
        phoneNumber:
          userProfileFromRedux.userProfile.phoneNumber ||
          userProfileFromRedux.phoneNumber ||
          "",
        homeAddress: userProfileFromRedux.userProfile.homeAddress || "",
        gender: userProfileFromRedux.userProfile.gender || "",
        workEmail: userProfileFromRedux.userProfile.workEmail || "", // Nếu API có workEmail riêng
      });
    } else {
      console.log("⚠️ Profile.jsx - No userProfile data in Redux");
      // Nếu chưa có userProfile trong Redux (ví dụ: mới vào trang, chưa kịp fetch),
      // bạn có thể dispatch fetchUserProfile ở đây
      // dispatch(fetchUserProfile()); // Cẩn thận vòng lặp vô hạn nếu không có điều kiện dừng
    }
  }, [userProfileFromRedux, dispatch]); // Thêm dispatch vào dependencies nếu dùng fetchUserProfile

  // Xử lý khi errorMessage từ Redux thay đổi
  useEffect(() => {
    if (profileError) {
      setErrorMessageState(`Lỗi tải hồ sơ: ${profileError}`);
    }
  }, [profileError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessageState("");
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
      setErrorMessageState("Vui lòng chọn một file ảnh hợp lệ.");
      return;
    }
    setErrorMessageState("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setIsCropModalOpen(true);
    };
    reader.onerror = (error) => {
      console.error("Lỗi đọc file:", error);
      setErrorMessageState("Không thể đọc file ảnh.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropSave = useCallback(
    async (croppedImageBlob) => {
      setIsCropModalOpen(false);
      if (!croppedImageBlob) return;
      setIsUploadingAvatar(true);
      setSuccessMessage("");
      setErrorMessageState("");
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
        uploadFormData.append("file", croppedImageBlob, `${fileName}.jpeg`); // Hoặc .png tùy bạn
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
          data: { avatar: finalUrl }, // Chỉ gửi avatar để cập nhật
        });
        if (!updateProfileResponse.success)
          throw new Error(
            updateProfileResponse.message || "Cập nhật liên kết ảnh thất bại."
          );

        // Dispatch để cập nhật Redux store với profile mới từ API (bao gồm avatar mới)
        // Hoặc nếu API update-profile trả về toàn bộ profile đã cập nhật:
        // dispatch(setUserProfile(updateProfileResponse.data));
        // Nếu không, bạn có thể chỉ cập nhật avatar cục bộ và trong Redux:
        dispatch(setUserProfile({ ...userProfileFromRedux, avatar: finalUrl }));
        setSuccessMessage("Ảnh đại diện đã cập nhật thành công!");
        setImageToCrop(null);
      } catch (error) {
        console.error("Lỗi xử lý avatar:", error);
        setErrorMessageState(error.message || "Lỗi cập nhật ảnh đại diện.");
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [dispatch, userProfileFromRedux]
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
    setErrorMessageState("");
    const dataToSend = {
      fullname: profileData.fullName,
      birthday: profileData.birthday,
      phoneNumber: profileData.phoneNumber,
      homeAddress: profileData.homeAddress,
      gender: profileData.gender,
      workEmail: profileData.workEmail,
      // Không gửi email cá nhân (profileData.email) nếu nó là readonly và không cho sửa
    };
    try {
      const response = await Api({
        endpoint: "user/update-profile",
        method: METHOD_TYPE.PUT,
        data: dataToSend,
      });
      if (response.success === true && response.data) {
        // Giả sử API trả về toàn bộ profile đã cập nhật
        dispatch(
          setUserProfile({
            ...userProfileFromRedux,
            userProfile: {
              ...userProfileFromRedux.userProfile,
              ...{
                fullname: response.data.fullname,
                gender: response.data.gender,
                // Thêm các trường khác nếu cần
              },
            },
            // Merge các trường khác ở root nếu có
            ...response.data,
          })
        );
        setSuccessMessage("Thông tin hồ sơ đã cập nhật!");
      } else {
        throw new Error(response.message || "Cập nhật thông tin thất bại.");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMessageState(error.message || "Lỗi lưu thông tin.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (profileLoading && !userProfileFromRedux) {
    // Hiển thị loading nếu đang fetch lần đầu và chưa có data
    return (
      <div
        className="profile-page-wrapper"
        style={{ textAlign: "center", paddingTop: "50px" }}
      >
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }
  // Sau khi đã có userProfileFromRedux (dù fetch lỗi hay thành công sau đó), render form
  // Hoặc nếu profileError và không có userProfileFromRedux, hiển thị lỗi
  if (profileError && !userProfileFromRedux && !profileLoading) {
    return (
      <div className="profile-page-wrapper alert alert-danger">
        Không thể tải thông tin hồ sơ: {profileError}
      </div>
    );
  }

  return (
    <>
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
                imageUrl={profileData.avatar} // Dùng avatar từ state local đã đồng bộ
                onTriggerSelect={handleTriggerFileInput}
              />
            </div>
            <form
              className="profile-form-section"
              onSubmit={handleSubmitProfile}
            >
              <div className="form-grid-user">
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
                <div className="form-group">
                  <label htmlFor="email">Email cá nhân</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    readOnly
                    className="input-readonly"
                    aria-label="Email cá nhân không thể thay đổi"
                    onChange={handleChange} // Vẫn cần onChange dù là readonly để state không bị warning
                  />
                </div>{" "}
                <div className="form-group">
                  <label htmlFor="workEmail">Email liên hệ (VLU)</label>
                  <input
                    type="email"
                    id="workEmail"
                    name="workEmail"
                    value={profileData.workEmail}
                    onChange={handleChange}
                    placeholder={
                      profileData.workEmail
                        ? profileData.workEmail
                        : "Chưa có Email liên hệ"
                    }
                  />
                </div>
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
              </div>
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
    </>
  );
};
export default memo(ProfilePage);
