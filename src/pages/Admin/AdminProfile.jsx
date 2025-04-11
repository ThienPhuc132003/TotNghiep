import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../assets/css/Admin/AdminProfile.style.css";
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import { setAdminProfile } from "../../redux/adminSlice";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout"; // Giữ nguyên Layout Admin
import AvatarUploader from "../../components/AvatarUploader";
import AdminProfileForm from "../../components/Admin/AdminProfileForm";

const ADMIN_AVATAR_CATEGORY = "admin_avatar";

const AdminProfilePage = () => {
  const adminProfile = useSelector((state) => state.admin.adminProfile);
  const dispatch = useDispatch();

  // --- State và Logic xử lý giữ nguyên như trước ---
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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  useEffect(() => {
    if (adminProfile) {
      setProfileData({
        avatar: adminProfile.avatar || null,
        fullName: adminProfile.fullname || "",
        birthday: adminProfile.birthday
          ? adminProfile.birthday.split("T")[0]
          : "",
        email: adminProfile.personalEmail || "",
        phoneNumber: adminProfile.phoneNumber || "",
        homeAddress: adminProfile.homeAddress || "",
        gender: adminProfile.gender || "",
        workEmail: adminProfile.workEmail || adminProfile.email || "",
      });
    }
  }, [adminProfile]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      // ... (Logic submit form giữ nguyên như code trước)
      setSuccessMessage("");
      setErrorMessage("");
      setIsSubmittingProfile(true);
      const dataToSend = {
        fullname: profileData.fullName,
        birthday: profileData.birthday || null,
        homeAddress: profileData.homeAddress,
        gender: profileData.gender,
        workEmail: profileData.workEmail,
        phoneNumber: profileData.phoneNumber,
      };
      Object.keys(dataToSend).forEach(
        (key) =>
          (dataToSend[key] == null || dataToSend[key] === "") &&
          delete dataToSend[key]
      );
      try {
        const response = await Api({
          endpoint: "admin/update-admin",
          method: METHOD_TYPE.PUT,
          data: dataToSend,
        });
        if (response.success === true && response.data) {
          const updatedProfileData = {
            ...adminProfile,
            ...response.data,
            avatar: profileData.avatar,
          };
          dispatch(setAdminProfile(updatedProfileData));
          setSuccessMessage("Cập nhật thông tin thành công!");
        } else {
          throw new Error(response.message || "Cập nhật thông tin thất bại.");
        }
      } catch (error) {
        setErrorMessage(`Cập nhật thông tin thất bại: ${error.message}`);
      } finally {
        setIsSubmittingProfile(false);
      }
    },
    [profileData, dispatch, adminProfile]
  );

  const handleAvatarUploadComplete = useCallback(
    async (newAvatarUrl) => {
      if (!newAvatarUrl) return;
      // ... (Logic cập nhật avatar giữ nguyên như code trước)
      setSuccessMessage("");
      setErrorMessage("");
      setIsUpdatingAvatar(true);
      try {
        const response = await Api({
          endpoint: "admin/update-admin",
          method: METHOD_TYPE.PUT,
          data: { avatar: newAvatarUrl },
        });
        if (response.success === true) {
          const finalAvatarUrl = response.data?.avatar || newAvatarUrl;
          dispatch(
            setAdminProfile({ ...adminProfile, avatar: finalAvatarUrl })
          );
          setProfileData((prev) => ({ ...prev, avatar: finalAvatarUrl }));
          setSuccessMessage("Cập nhật ảnh đại diện thành công!");
        } else {
          throw new Error(response.message || "Lỗi cập nhật ảnh đại diện.");
        }
      } catch (error) {
        setErrorMessage(`Cập nhật ảnh đại diện thất bại: ${error.message}`);
      } finally {
        setIsUpdatingAvatar(false);
      }
    },
    [dispatch, adminProfile]
  );

  const handleAvatarUploadError = useCallback((message) => {
    setErrorMessage(`Lỗi tải ảnh lên: ${message}`);
  }, []);
  // --- Kết thúc State và Logic ---

  return (
    <AdminDashboardLayout>
      {/* Container chính giữ layout gốc */}
      <div className="admin-profile-container-original">
        <h1 className="admin-profile-title-original">Thông Tin Cá Nhân</h1>

        {/* Hiển thị thông báo */}
        {successMessage && (
          <div className="admin-alert admin-alert-success">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="admin-alert admin-alert-danger">{errorMessage}</div>
        )}

        {/* --- Phần Avatar --- */}
        {/* Bọc AvatarUploader trong div để style giống box trong hình ảnh */}
        <div className="admin-avatar-box">
          <label className="admin-avatar-label">Ảnh đại diện</label>
          <div className="admin-avatar-content">
            <AvatarUploader
              mediaCategory={ADMIN_AVATAR_CATEGORY}
              initialImageUrl={profileData.avatar}
              onUploadComplete={handleAvatarUploadComplete}
              onError={handleAvatarUploadError}
              isUploading={isUpdatingAvatar}
              // Các props khác để custom giao diện AvatarUploader nếu cần
              // Ví dụ: placeholderText="Chưa có ảnh"
            />
          </div>
          {/* Có thể thêm text loading nếu muốn */}
          {/* {isUpdatingAvatar && <p className="avatar-loading-text">Đang tải ảnh...</p>} */}
        </div>

        {/* Đường kẻ phân cách */}
        <hr className="admin-profile-divider-original" />

        {/* --- Form thông tin chính --- */}
        {/* Component AdminProfileForm sẽ render các input */}
        <AdminProfileForm
          profileData={profileData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isLoading={isSubmittingProfile}
          // Thêm class để CSS có thể target form này
          formClassName="admin-profile-form-original"
          // Truyền các trường chỉ đọc
          readOnlyFields={["email"]} // Giả sử email không được sửa
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminProfilePage;
