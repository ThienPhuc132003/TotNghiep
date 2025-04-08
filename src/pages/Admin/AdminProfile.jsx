// src/pages/Admin/AdminProfilePage.jsx
import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../assets/css/Admin/AdminProfile.style.css"; // Import CSS
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import { setAdminProfile } from "../../redux/adminSlice"; // Action cập nhật Redux
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import AvatarUploader from "../../components/AvatarUploader"; // <<< Import AvatarUploader
import ProfileForm from "../../components/Admin/AdminProfileForm"; // Component form thông tin

// Định nghĩa media category cho admin avatar (QUAN TRỌNG: Phải khớp với backend)
const ADMIN_AVATAR_CATEGORY = "admin_avatar";

const AdminProfilePage = () => {
  const adminProfile = useSelector((state) => state.admin.adminProfile);
  const dispatch = useDispatch();

  // State cho form thông tin chính
  const [profileData, setProfileData] = useState({
    avatar: null, // Sẽ được cập nhật từ useEffect
    fullName: "",
    birthday: "",
    email: "", // Thường là read-only hoặc lấy từ nguồn khác
    phoneNumber: "",
    homeAddress: "",
    gender: "",
    workEmail: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false); // Loading cho form profile
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false); // Loading riêng cho avatar

  // Đồng bộ state cục bộ với Redux store khi component mount hoặc adminProfile thay đổi
  useEffect(() => {
    if (adminProfile) {
      setProfileData({
        avatar: adminProfile.avatar || null,
        fullName: adminProfile.fullname || "",
        // Định dạng lại ngày tháng nếu cần (ví dụ: từ ISO string sang YYYY-MM-DD)
        birthday: adminProfile.birthday
          ? adminProfile.birthday.split("T")[0]
          : "",
        email: adminProfile.personalEmail || adminProfile.workEmail || "",
        phoneNumber: adminProfile.phoneNumber || "",
        homeAddress: adminProfile.homeAddress || "",
        gender: adminProfile.gender || "",
        workEmail: adminProfile.workEmail || "",
      });
    }
  }, [adminProfile]); // Chạy khi adminProfile thay đổi

  // Handler cho thay đổi input form chính
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  // Handler Submit Form Thông Tin Chính (Không gửi avatar)
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSuccessMessage("");
      setErrorMessage("");
      setIsSubmittingProfile(true);

      // Chỉ gửi các trường được phép cập nhật
      const dataToSend = {
        fullname: profileData.fullName,
        birthday: profileData.birthday || null, // Gửi null nếu rỗng
        homeAddress: profileData.homeAddress,
        gender: profileData.gender,
        workEmail: profileData.workEmail, // Chỉ gửi nếu admin có thể sửa
        phoneNumber: profileData.phoneNumber, // Chỉ gửi nếu admin có thể sửa
        // *** KHÔNG gửi avatar ở đây ***
      };
      // Loại bỏ các trường null hoặc undefined nếu API yêu cầu
      Object.keys(dataToSend).forEach(
        (key) =>
          (dataToSend[key] == null || dataToSend[key] === "") &&
          delete dataToSend[key]
      );

      console.log("Data to send (Profile Update):", dataToSend);

      try {
        const response = await Api({
          endpoint: "admin/update-admin", // Endpoint cập nhật admin
          method: METHOD_TYPE.PUT,
          data: dataToSend,
        });

        console.log("API response (Profile Update):", response);

        if (response.success === true && response.data) {
          // Cập nhật Redux store với profile mới (bao gồm avatar cũ)
          const updatedProfileData = { ...adminProfile, ...response.data };
          dispatch(setAdminProfile(updatedProfileData));
          // Cập nhật state cục bộ để form hiển thị đúng (không bắt buộc nếu chỉ dựa vào Redux)
          // setProfileData(prev => ({...prev, ...response.data}));
          setSuccessMessage("Cập nhật thông tin thành công!");
        } else {
          throw new Error(response.message || "Cập nhật thông tin thất bại.");
        }
      } catch (error) {
        console.error("API error (Profile Update):", error);
        setErrorMessage(`Cập nhật thông tin thất bại: ${error.message}`);
      } finally {
        setIsSubmittingProfile(false);
      }
    },
    [profileData, dispatch, adminProfile]
  ); // Dependencies

  // Callback khi AvatarUploader hoàn tất upload
  const handleAvatarUploadComplete = useCallback(
    async (newAvatarUrl) => {
      if (!newAvatarUrl) return; // Bỏ qua nếu URL rỗng (vd: hủy)

      console.log("AvatarUploader completed, URL:", newAvatarUrl);
      setSuccessMessage("");
      setErrorMessage("");
      setIsUpdatingAvatar(true);

      try {
        // Gọi API cập nhật *chỉ* avatar
        const response = await Api({
          endpoint: "admin/update-admin",
          method: METHOD_TYPE.PUT,
          data: { avatar: newAvatarUrl }, // Chỉ gửi trường avatar
        });

        console.log("API response (Avatar Update):", response);

        if (response.success === true) {
          const finalAvatarUrl = response.data?.avatar || newAvatarUrl; // Ưu tiên URL từ response

          // Cập nhật Redux
          dispatch(
            setAdminProfile({ ...adminProfile, avatar: finalAvatarUrl })
          );
          // Cập nhật state cục bộ để hiển thị ngay
          setProfileData((prev) => ({ ...prev, avatar: finalAvatarUrl }));
          setSuccessMessage("Cập nhật ảnh đại diện thành công!");
        } else {
          throw new Error(response.message || "Lỗi cập nhật ảnh đại diện.");
        }
      } catch (error) {
        console.error("Lỗi cập nhật avatar profile:", error);
        setErrorMessage(`Cập nhật ảnh đại diện thất bại: ${error.message}`);
        // Giữ lại ảnh cũ nếu lỗi
        setProfileData((prev) => ({
          ...prev,
          avatar: adminProfile?.avatar || null,
        }));
      } finally {
        setIsUpdatingAvatar(false);
      }
    },
    [dispatch, adminProfile]
  );

  // Callback xử lý lỗi từ AvatarUploader (nếu cần)
  const handleAvatarUploadError = useCallback((message) => {
    setErrorMessage(`Lỗi tải ảnh lên: ${message}`);
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="profile-container">
        <h1 className="profile-title">Thông Tin Cá Nhân</h1>

        {/* Hiển thị thông báo */}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* --- Sử dụng AvatarUploader --- */}
        {/* Bọc trong div để dễ dàng style vị trí nếu cần */}
        <div className="avatar-upload-section">
          <AvatarUploader
            mediaCategory={ADMIN_AVATAR_CATEGORY}
            initialImageUrl={profileData.avatar} // Lấy từ state cục bộ
            onUploadComplete={handleAvatarUploadComplete}
            onError={handleAvatarUploadError}
            label="Ảnh đại diện" // Nhãn cho AvatarUploader
          />
          {/* Loading indicator riêng cho avatar */}
          {isUpdatingAvatar && (
            <div className="avatar-loading">Đang cập nhật ảnh...</div>
          )}
        </div>

        {/* --- Form thông tin chính --- */}
        <ProfileForm
          profileData={profileData} // Truyền state cục bộ đã đồng bộ
          onChange={handleChange}
          onSubmit={handleSubmit}
          isLoading={isSubmittingProfile} // Truyền trạng thái loading của form
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminProfilePage; // Xuất trực tiếp
