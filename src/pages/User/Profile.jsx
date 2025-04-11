import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // <- Layout của bạn
import "../../assets/css/Profile.style.css"; // <- CSS cho trang Profile
import { METHOD_TYPE } from "../../network/methodType"; // <- methodType
import Api from "../../network/Api"; // <- File Api của bạn
import { setUserProfile } from "../../redux/userSlice"; // <- Action cập nhật user profile trong Redux
import AvatarUploader from "../../components/AvatarUploader"; // <- Import component AvatarUploader
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faSave, faSpinner } from "@fortawesome/free-solid-svg-icons"; // Import icon save

const ProfilePage = () => {
  const userProfile = useSelector((state) => state.user.userProfile);
  const dispatch = useDispatch();

  // State cho dữ liệu form chính
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

  // State cho URL avatar mới vừa upload lên media service, chờ được lưu vào profile
  const [newUnsavedAvatarUrl, setNewUnsavedAvatarUrl] = useState(null);

  // State thông báo
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State loading
  const [isSavingProfile, setIsSavingProfile] = useState(false); // Loading cho nút "Lưu thay đổi" chính
  const [isSavingAvatarLink, setIsSavingAvatarLink] = useState(false); // Loading cho nút "Lưu ảnh đại diện" riêng

  // Đồng bộ từ Redux vào state local
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
      // Reset URL chờ lưu khi load lại dữ liệu từ Redux
      setNewUnsavedAvatarUrl(null);
    }
  }, [userProfile]);

  // Xử lý thay đổi input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  // --- Callback khi AvatarUploader upload media thành công ---
  // Chỉ lưu URL mới vào state tạm `newUnsavedAvatarUrl`
  const handleAvatarUploaded = useCallback((mediaUrl) => {
    setNewUnsavedAvatarUrl(mediaUrl); // Lưu URL mới vào state chờ
    // Cập nhật luôn ảnh hiển thị trong profileData để UI thay đổi ngay
    setProfileData((prev) => ({ ...prev, avatar: mediaUrl }));
    setSuccessMessage(
      "Ảnh mới đã sẵn sàng. Nhấn 'Lưu ảnh đại diện' để xác nhận."
    );
    setErrorMessage("");
  }, []);

  // --- Callback khi AvatarUploader gặp lỗi ---
  const handleAvatarError = useCallback((message) => {
    setErrorMessage(message || "Lỗi xử lý ảnh đại diện.");
    setSuccessMessage("");
  }, []);

  // --- Hàm xử lý cho nút "Lưu ảnh đại diện" RIÊNG ---
  const handleSaveAvatarLink = async () => {
    if (!newUnsavedAvatarUrl) {
      setErrorMessage("Không có ảnh đại diện mới để lưu.");
      return;
    }

    setIsSavingAvatarLink(true); // Bắt đầu loading cho nút này
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Gọi API user/update-profile chỉ với field 'avatar'
      const response = await Api({
        endpoint: "user/update-profile",
        method: METHOD_TYPE.PUT,
        data: {
          avatar: newUnsavedAvatarUrl, // Chỉ gửi URL avatar mới
        },
      });

      if (response.success === true) {
        // Cập nhật thành công:
        // 1. Dispatch để cập nhật Redux store
        dispatch(
          setUserProfile({ ...userProfile, avatar: newUnsavedAvatarUrl })
        );
        // 2. Xóa URL khỏi state chờ lưu (vì đã lưu thành công)
        setNewUnsavedAvatarUrl(null);
        // 3. Cập nhật state profileData (đã làm ở handleAvatarUploaded hoặc sẽ tự cập nhật qua useEffect từ Redux)
        // setProfileData(prev => ({ ...prev, avatar: newUnsavedAvatarUrl })); // Đảm bảo state đồng bộ
        // 4. Hiển thị thông báo thành công
        setSuccessMessage("Ảnh đại diện đã được cập nhật thành công!");
      } else {
        throw new Error(response.message || "Lưu ảnh đại diện thất bại.");
      }
    } catch (error) {
      console.error("Error saving avatar link:", error);
      setErrorMessage(error.message || "Đã xảy ra lỗi khi lưu ảnh đại diện.");
      // Không xóa newUnsavedAvatarUrl để người dùng có thể thử lại
    } finally {
      setIsSavingAvatarLink(false); // Kết thúc loading cho nút này
    }
  };

  // --- Xử lý khi nhấn nút "Lưu thay đổi" chính (cho các field khác) ---
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    // Nếu đang lưu avatar thì không cho lưu form chính
    if (isSavingAvatarLink) return;

    setIsSavingProfile(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Gửi dữ liệu form, KHÔNG BAO GỒM avatar (vì nó được xử lý riêng)
    // TRỪ KHI backend yêu cầu gửi cả avatar hiện tại -> thì lấy từ profileData.avatar
    const dataToSend = {
      fullname: profileData.fullName,
      birthday: profileData.birthday,
      phoneNumber: profileData.phoneNumber,
      homeAddress: profileData.homeAddress,
      gender: profileData.gender,
      // Quyết định gửi profileData.avatar hay không dựa vào thiết kế API:
      // Nếu API chỉ cập nhật field gửi lên: KHÔNG gửi avatar ở đây.
      // Nếu API yêu cầu gửi đầy đủ object: Gửi profileData.avatar (là avatar hiện tại đã lưu)
      // avatar: profileData.avatar, // <- Cân nhắc dòng này
    };

    try {
      const response = await Api({
        endpoint: "user/update-profile",
        method: METHOD_TYPE.PUT,
        data: dataToSend,
      });

      if (response.success === true && response.data) {
        // Cập nhật Redux với dữ liệu mới (trừ avatar nếu không gửi)
        dispatch(setUserProfile({ ...userProfile, ...response.data }));
        setSuccessMessage("Thông tin hồ sơ đã được cập nhật!");
        // Nếu có gửi avatar ở đây và thành công, đảm bảo setNewUnsavedAvatarUrl(null)
      } else {
        throw new Error(response.message || "Cập nhật thông tin thất bại.");
      }
    } catch (error) {
      console.error("Update profile info error:", error);
      setErrorMessage(error.message || "Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Render JSX ---
  return (
    <HomePageLayout>
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
              isSavingProfile || isSavingAvatarLink ? "content-loading" : ""
            }`}
          >
            {/* --- Khu vực Avatar --- */}
            <div className="profile-avatar-section">
              <AvatarUploader
                mediaCategory="USER_AVATAR"
                initialImageUrl={profileData.avatar} // Luôn hiển thị avatar hiện tại (đã lưu hoặc mới upload)
                onUploadComplete={handleAvatarUploaded} // Callback khi upload media xong
                onError={handleAvatarError}
                label=""
              />
              {/* --- Nút Lưu ảnh đại diện RIÊNG --- */}
              {/* Hiển thị nút này CHỈ KHI có newUnsavedAvatarUrl */}
              {newUnsavedAvatarUrl && (
                <button
                  type="button" // Quan trọng: không phải submit form
                  onClick={handleSaveAvatarLink}
                  className="save-avatar-button" // Class riêng để style
                  disabled={isSavingAvatarLink || isSavingProfile} // Disable khi đang lưu avatar hoặc form
                >
                  {isSavingAvatarLink ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Đang lưu ảnh...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} /> Lưu ảnh đại diện
                    </>
                  )}
                </button>
              )}
            </div>

            {/* --- Khu vực Form Thông tin --- */}
            <form
              className="profile-form-section"
              onSubmit={handleSubmitProfile}
            >
              <div className="form-grid">
                {/* Các input field như cũ */}
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
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="workEmail">Email liên hệ (VLU)</label>
                  <input
                    type="email"
                    id="workEmail"
                    name="workEmail"
                    value={profileData.workEmail}
                    readOnly
                    className="input-readonly"
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
                      />{" "}
                      <span className="radio-custom"></span> Nam
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={profileData.gender === "FEMALE"}
                        onChange={handleChange}
                      />{" "}
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
                    placeholder="Số nhà, đường, phường/xã..."
                  />
                </div>
              </div>

              {/* Nút Submit chính cho các thông tin khác */}
              <button
                type="submit"
                className="profile-submit-button"
                // Disable khi đang lưu form hoặc khi đang chờ lưu avatar mới
                disabled={
                  isSavingProfile ||
                  isSavingAvatarLink ||
                  newUnsavedAvatarUrl !== null
                }
                title={
                  newUnsavedAvatarUrl !== null
                    ? "Vui lòng lưu ảnh đại diện mới trước"
                    : "Lưu thay đổi thông tin"
                }
              >
                {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi thông tin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
};

export default ProfilePage;
