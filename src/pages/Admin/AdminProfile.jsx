// src/pages/Admin/AdminProfile.jsx
import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../assets/css/Admin/AdminProfile.style.css";
import { METHOD_TYPE } from "../../network/methodType";
import Api from "../../network/Api";
import { setAdminProfile } from "../../redux/adminSlice";
import AdminDashboardLayout from "../../components/Admin/layout/AdminDashboardLayout";
import AvatarSection from "../../components/Admin/AdminAvatarSection";
import CropModal from "../../components/CropModal";
import ProfileForm from "../../components/Admin/AdminProfileForm";
import getCroppedImg from "../../utils/cropImage";

const AdminProfilePage = () => {
    const adminProfile = useSelector((state) => state.admin.adminProfile);
    const dispatch = useDispatch();
    const [profileData, setProfileData] = useState({
        avatar: adminProfile?.avatar || null,
        fullName: adminProfile?.fullname || "",
        birthday: adminProfile?.birthday || "",
        email: adminProfile?.personalEmail || "",
        phoneNumber: adminProfile?.phoneNumber || "",
        homeAddress: adminProfile?.homeAddress || "",
        gender: adminProfile?.gender || "",
        workEmail: adminProfile?.workEmail || "",
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({ ...prevData, [name]: value }));
        setErrorMessage(""); // Clear the error message
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            const dataToSend = {
                fullname: profileData.fullName,
                birthday: profileData.birthday,
                homeAddress: profileData.homeAddress,
                gender: profileData.gender,
                workEmail: profileData.workEmail,
            };
            console.log("Data to send:", dataToSend);

            try {
                const response = await Api({
                    endpoint: "admin/update-admin", // Corrected endpoint
                    method: METHOD_TYPE.PUT,
                    data: dataToSend,
                });

                console.log("API response:", response); // Log the entire response

                if (response.success === true) {
                    dispatch(setAdminProfile(response.data));
                    setSuccessMessage("Cập nhật thông tin thành công!");
                } else {
                    setErrorMessage(`Cập nhật thông tin thất bại: ${response.message || "Unknown error"}`);
                }
            } catch (error) {
                console.error("API error:", error); // Log the error
                setErrorMessage(`Cập nhật thông tin thất bại: ${error.message || "Unknown error"}`);
            }
        },
        [profileData, dispatch]
    );

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = useCallback(async () => {
        try {
            if (!selectedImage || !croppedAreaPixels) {
                setErrorMessage("Vui lòng chọn ảnh và crop.");
                return;
            }
            const croppedImageFile = await getCroppedImg(selectedImage, croppedAreaPixels);

            const formData = new FormData();
            formData.append("avatar", croppedImageFile);

            const response = await Api({
                endpoint: "admin/upload-avatar",
                method: METHOD_TYPE.POST,
                data: formData,
                isFormData: true,
            });

            if (response.success === true) {
                dispatch(setAdminProfile({ ...adminProfile, avatar: response.data.avatar }));
                setIsModalOpen(false);
                setSelectedImage(null);
                setIsCropping(false);
                setSuccessMessage("Cập nhật avatar thành công!");
            } else {
                setErrorMessage("Cập nhật avatar thất bại: " + response.message);
            }
        } catch (error) {
            setErrorMessage("Cập nhật avatar thất bại: " + error.message);
        }
    }, [selectedImage, croppedAreaPixels, adminProfile, dispatch]);

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedImage(null);
        setIsCropping(false);
    }, []);

    return (
        <AdminDashboardLayout>
            <div className="profile-container">
                <h1 className="profile-title">Thông Tin Cá Nhân</h1>
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <AvatarSection
                    adminProfile={adminProfile}
                    onOpenModal={handleOpenModal}
                />
                <CropModal
                    isOpen={isModalOpen}
                    selectedImage={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    croppedAreaPixels={croppedAreaPixels}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    onSave={handleCropSave}
                    onClose={handleCloseModal}
                    onFileChange={handleFileChange}
                    isCropping={isCropping}
                />
                <ProfileForm
                    profileData={profileData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />
            </div>
        </AdminDashboardLayout>
    );
};

const AdminProfile = React.memo(AdminProfilePage);
export default AdminProfile;