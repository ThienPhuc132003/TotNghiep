/* eslint-disable react/no-unescaped-entities */
// src/pages/User/TutorRegistrationForm.jsx
import { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom"; // Bỏ comment nếu bạn cần chuyển hướng sau khi thành công
import Api from "../../network/Api"; // API helper của bạn
import { METHOD_TYPE } from "../../network/methodType"; // Method types
import "../../assets/css/TutorRegister.style.css"; // CSS cho trang này
import HomePageLayout from "../../components/User/layout/HomePageLayout"; // Layout trang
import GenericFileUploader from "../../components/GenericFileUploader"; // Component upload file chung
import BankList from "../../components/Static_Data/BankList"; // Component danh sách ngân hàng
import MajorList from "../../components/Static_Data/MajorList"; // Component danh sách ngành học
import SubjectList from "../../components/Static_Data/SubjectList"; // Component danh sách môn học
import AvatarDisplay from "../../components/AvatarDisplay"; // Component hiển thị Avatar
import ImageCropModal from "../../components/ImageCropModal"; // Component Modal Crop
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // FontAwesome
import { faSpinner } from "@fortawesome/free-solid-svg-icons"; // Icon Spinner

// --- Constants ---
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEDIA_CATEGORIES = {
  SUBJECT_PROOF: "tutor_subject_proof",
  GPA_PROOF: "tutor_gpa_proof",
  TUTOR_AVATAR: "TUTOR_AVATAR", // Category cho avatar gia sư
};
const teachingTimeOptions = [];
for (let h = 1; h <= 3; h += 0.25) {
  const hours = Math.floor(h);
  const minutes = (h - hours) * 60;
  let label = `${hours}h`;
  if (minutes > 0) label += ` ${minutes}p`;
  teachingTimeOptions.push({ value: h, label: label });
}
const formatTeachingTime = (hours) => {
  const option = teachingTimeOptions.find(
    (opt) => opt.value === parseFloat(hours)
  );
  return option ? option.label : `${hours || "N/A"}h`;
};

const TutorRegistrationForm = () => {
  // --- States ---
  const [isLoading, setIsLoading] = useState(false); // Loading chung khi submit form
  const [formError, setFormError] = useState(""); // Lỗi chung của form
  const [success, setSuccess] = useState(""); // Thông báo thành công submit form
  const [fieldErrors, setFieldErrors] = useState({}); // Lỗi cụ thể của từng field
  const [fileUploadErrors, setFileUploadErrors] = useState({}); // Lỗi upload file (cho GenericFileUploader)
  const [numberOfSubjects, setNumberOfSubjects] = useState(1); // Số lượng môn học đăng ký
  const [formData, setFormData] = useState({
    fullname: "",
    majorId: "",
    birthday: "",
    gender: "MALE",
    bankNumber: "",
    bankName: "",
    avatar: "", // *** Sẽ chứa mediaUrl sau khi upload thành công ***
    description: "",
    univercity: "Đại học Văn Lang", // Mặc định
    GPA: "",
    evidenceOfGPA: "", // URL minh chứng GPA
    teachingTime: 2, // Mặc định 2 giờ
    videoUrl: "",
    teachingMethod: "ONLINE", // Mặc định online
    teachingPlace: "",
    isUseCurriculumn: false,
    subjectId: "",
    evidenceOfSubject: "", // URL minh chứng môn 1
    descriptionOfSubject: "",
    subjectId2: "",
    evidenceOfSubject2: "", // URL minh chứng môn 2
    descriptionOfSubject2: "",
    subjectId3: "",
    evidenceOfSubject3: "", // URL minh chứng môn 3
    descriptionOfSubject3: "",
  });
  const [availability, setAvailability] = useState(
    daysOfWeek.reduce(
      (acc, day) => ({ ...acc, [day]: { isSelected: false, times: [] } }),
      {}
    )
  );
  const [timeErrors, setTimeErrors] = useState(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: null }), {})
  );

  // --- State mới cho quản lý Avatar trong form đăng ký ---
  const [isUploadingRegistrationAvatar, setIsUploadingRegistrationAvatar] =
    useState(false); // Loading riêng cho upload avatar
  const [avatarUploadError, setAvatarUploadError] = useState(""); // Lỗi riêng cho upload avatar
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(""); // Thành công upload avatar
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null); // URL xem trước (blob URL tạm thời hoặc URL từ server)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false); // State mở/đóng modal crop
  const [imageToCrop, setImageToCrop] = useState(null); // Data URL ảnh gốc cho modal

  // --- Refs ---
  const fileInputRef = useRef(null); // Ref cho input file ẩn của avatar
  // const navigate = useNavigate(); // Bỏ comment nếu bạn dùng react-router-dom để chuyển hướng

  // --- Fetch Data (nếu có draft) ---
  useEffect(() => {
    // Nếu bạn có chức năng lưu draft và load lại, fetch dữ liệu ở đây
    // Ví dụ: fetchTutorDraft().then(draftData => { setFormData(draftData); setAvatarPreviewUrl(draftData.avatar); ... });
    // Nếu load draft, cần cập nhật cả avatarPreviewUrl từ formData.avatar
    if (formData.avatar && !avatarPreviewUrl) {
      setAvatarPreviewUrl(formData.avatar);
    }
  }, [formData.avatar, avatarPreviewUrl]); // Thêm dependency

  // --- Giải phóng Object URL khi component unmount hoặc URL thay đổi ---
  useEffect(() => {
    const currentPreviewUrl = avatarPreviewUrl;
    return () => {
      if (currentPreviewUrl && currentPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreviewUrl);
        console.log("Revoked Object URL:", currentPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  // --- Callbacks Upload File (CHO CÁC FILE KHÁC AVATAR) ---
  const handleUploadComplete = useCallback(
    (url, identifier) => {
      console.log(`Upload Complete: id=${identifier}, url=${url}`);
      setFileUploadErrors((prev) => ({ ...prev, [identifier]: "" }));
      setFieldErrors((prev) => ({ ...prev, [identifier]: undefined }));
      if (identifier in formData) {
        setFormData((prev) => ({ ...prev, [identifier]: url }));
      } else {
        console.warn("Unknown file identifier:", identifier);
      }
    },
    [formData]
  );

  const handleUploadError = useCallback((message, identifier) => {
    console.error(`Upload Error: id=${identifier}, msg=${message}`);
    const userMsg = message || "Upload thất bại";
    setFileUploadErrors((prev) => ({ ...prev, [identifier]: userMsg }));
    setFieldErrors((prev) => ({ ...prev, [identifier]: userMsg }));
  }, []);

  // --- Handler Thêm/Bớt Môn Học ---
  const addSubjectSlot = useCallback(() => {
    if (numberOfSubjects < 3) {
      setNumberOfSubjects((prev) => prev + 1);
    }
  }, [numberOfSubjects]);

  const removeSubjectSlot = useCallback(
    (subjectIndexToRemove) => {
      const keySuffix = subjectIndexToRemove;
      const keysToReset = [
        `subjectId${keySuffix}`,
        `evidenceOfSubject${keySuffix}`,
        `descriptionOfSubject${keySuffix}`,
      ];
      const evidenceKey = `evidenceOfSubject${keySuffix}`;

      const resetFields = keysToReset.reduce(
        (acc, key) => ({ ...acc, [key]: "" }),
        {}
      );
      const resetFieldErrors = keysToReset.reduce(
        (acc, key) => ({ ...acc, [key]: undefined }),
        {}
      );

      setFormData((prev) => ({ ...prev, ...resetFields }));
      setFieldErrors((prev) => ({ ...prev, ...resetFieldErrors }));
      setFileUploadErrors((prev) => ({ ...prev, [evidenceKey]: "" }));

      if (subjectIndexToRemove === 2 && numberOfSubjects === 3) {
        const dataToMove = {
          subjectId2: formData.subjectId3,
          evidenceOfSubject2: formData.evidenceOfSubject3,
          descriptionOfSubject2: formData.descriptionOfSubject3,
        };
        const errorsToMove = {
          subjectId2: fieldErrors.subjectId3,
          evidenceOfSubject2: fieldErrors.evidenceOfSubject3,
          descriptionOfSubject2: fieldErrors.descriptionOfSubject3,
        };
        const fileErrorToMove = fileUploadErrors["evidenceOfSubject3"];

        setFormData((prev) => ({
          ...prev,
          ...dataToMove,
          subjectId3: "",
          evidenceOfSubject3: "",
          descriptionOfSubject3: "",
        }));
        setFieldErrors((prev) => ({
          ...prev,
          ...errorsToMove,
          subjectId3: undefined,
          evidenceOfSubject3: undefined,
          descriptionOfSubject3: undefined,
        }));
        setFileUploadErrors((prev) => ({
          ...prev,
          evidenceOfSubject2: fileErrorToMove,
          evidenceOfSubject3: "",
        }));
      }
      setNumberOfSubjects((prev) => prev - 1);
    },
    [numberOfSubjects, formData, fieldErrors, fileUploadErrors]
  );

  // --- Handlers Lịch Rảnh ---
  const getTeachingTimeMinutes = useCallback(() => {
    const time = parseFloat(formData.teachingTime);
    return !isNaN(time) && time > 0 ? Math.round(time * 60) : 120;
  }, [formData.teachingTime]);

  const validateTimeSlotsForDay = useCallback(
    (day, currentTimes, minIntervalMinutes) => {
      if (!currentTimes || currentTimes.length === 0) return null;
      const emptySlotIndex = currentTimes.findIndex((time) => !time);
      if (emptySlotIndex !== -1)
        return { type: "empty", index: emptySlotIndex };
      if (currentTimes.length <= 1) return null;
      const validTimes = [...currentTimes].sort();
      for (let i = 1; i < validTimes.length; i++) {
        const time1 = validTimes[i - 1];
        const time2 = validTimes[i];
        try {
          const [h1, m1] = time1.split(":").map(Number);
          const [h2, m2] = time2.split(":").map(Number);
          const totalMinutes1 = h1 * 60 + m1;
          const totalMinutes2 = h2 * 60 + m2;
          if (totalMinutes2 < totalMinutes1 + minIntervalMinutes) {
            const originalIndex = currentTimes.findIndex((t) => t === time2);
            return {
              type: "interval",
              index: originalIndex !== -1 ? originalIndex : i,
            };
          }
        } catch (err) {
          console.error("Lỗi phân tích thời gian:", day, time1, time2, err);
          const originalIndex = currentTimes.findIndex((t) => t === time2);
          return {
            type: "format",
            index: originalIndex !== -1 ? originalIndex : i,
          };
        }
      }
      return null;
    },
    []
  );

  const validateAllAvailability = useCallback(() => {
    const minInterval = getTeachingTimeMinutes();
    const newTimeErrors = {};
    let hasAnyError = false;
    daysOfWeek.forEach((day) => {
      const dayData = availability[day];
      if (dayData.isSelected && dayData.times.length > 0) {
        const errorInfo = validateTimeSlotsForDay(
          day,
          dayData.times,
          minInterval
        );
        newTimeErrors[day] = errorInfo ? errorInfo.index : null;
        if (errorInfo) hasAnyError = true;
      } else {
        newTimeErrors[day] = null;
      }
    });
    setTimeErrors(newTimeErrors);
    return !hasAnyError;
  }, [availability, getTeachingTimeMinutes, validateTimeSlotsForDay]);

  // --- Handler Input Thường ---
  const handleInputChange = useCallback(
    (name, value) => {
      let processedValue = value;
      if (name === "isUseCurriculumn") {
        processedValue = Boolean(value);
      } else if (name === "teachingTime") {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) ? "" : numValue;
        if (processedValue !== formData.teachingTime) {
          validateAllAvailability();
        }
      } else if (name === "GPA") {
        if (value === "" || /^\d?(\.\d{0,2})?$/.test(value)) {
          const numGPA = parseFloat(value);
          if (value === "" || (!isNaN(numGPA) && numGPA >= 0 && numGPA <= 4)) {
            processedValue = value;
          } else if (numGPA > 4) {
            processedValue = "4";
          } else {
            processedValue = formData[name];
          }
        } else {
          processedValue = formData[name];
        }
      } else if (name === "bankNumber") {
        processedValue = value.replace(/\D/g, "");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
        ...(name === "teachingMethod" &&
          value === "ONLINE" && { teachingPlace: "" }),
      }));
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      }
      if (
        name === "teachingMethod" &&
        value === "ONLINE" &&
        fieldErrors.teachingPlace
      ) {
        setFieldErrors((prev) => ({ ...prev, teachingPlace: undefined }));
      }
      if (formError) setFormError("");
    },
    [fieldErrors, formData, formError, validateAllAvailability]
  );

  // --- Các Handlers Lịch Rảnh khác ---
  const handleDayToggle = useCallback(
    (day) => {
      const isSelected = !availability[day].isSelected;
      setAvailability((prev) => ({
        ...prev,
        [day]: {
          isSelected,
          times: isSelected
            ? prev[day].times.length > 0
              ? prev[day].times
              : [""]
            : [],
        },
      }));
      setTimeErrors((prev) => ({ ...prev, [day]: null }));
      if (fieldErrors.availability) {
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      }
      if (formError) setFormError("");
    },
    [availability, fieldErrors, formError]
  );

  const addTimeSlot = useCallback(
    (day) => {
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: [...prev[day].times, ""] },
      }));
      if (fieldErrors.availability) {
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      }
      if (formError) setFormError("");
    },
    [fieldErrors, formError]
  );

  const removeTimeSlot = useCallback(
    (day, timeIndex) => {
      const newTimes = availability[day].times.filter(
        (_, i) => i !== timeIndex
      );
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: newTimes },
      }));
      const minInterval = getTeachingTimeMinutes();
      const errorInfo = validateTimeSlotsForDay(day, newTimes, minInterval);
      setTimeErrors((prev) => ({
        ...prev,
        [day]: errorInfo ? errorInfo.index : null,
      }));
      if (fieldErrors.availability) {
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      }
      if (formError) setFormError("");
    },
    [
      availability,
      getTeachingTimeMinutes,
      validateTimeSlotsForDay,
      fieldErrors,
      formError,
    ]
  );

  const handleTimeChange = useCallback(
    (day, timeIndex, newTimeValue) => {
      const currentTimes = [...availability[day].times];
      currentTimes[timeIndex] = newTimeValue;
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: currentTimes },
      }));
      const minInterval = getTeachingTimeMinutes();
      const errorInfo = validateTimeSlotsForDay(day, currentTimes, minInterval);
      setTimeErrors((prev) => ({
        ...prev,
        [day]: errorInfo ? errorInfo.index : null,
      }));
      if (fieldErrors.availability) {
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      }
      if (formError) setFormError("");
    },
    [
      availability,
      getTeachingTimeMinutes,
      validateTimeSlotsForDay,
      fieldErrors,
      formError,
    ]
  );

  // --- Logic xử lý Avatar (Chọn, Mở Modal Crop) ---
  const handleTriggerAvatarInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  }, []);

  const handleAvatarFileSelected = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        setFieldErrors((prev) => ({
          ...prev,
          avatar: "Vui lòng chọn một file ảnh hợp lệ.",
        }));
        setAvatarUploadError("Vui lòng chọn một file ảnh hợp lệ."); // Cập nhật lỗi riêng
        return;
      }
      // Xóa lỗi cũ
      setFieldErrors((prev) => ({ ...prev, avatar: undefined }));
      setAvatarUploadError("");
      setAvatarUploadSuccess("");
      if (formError) setFormError("");

      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setIsCropModalOpen(true);
      };
      reader.onerror = (error) => {
        console.error("Lỗi đọc file:", error);
        const errorMsg = "Không thể đọc file ảnh.";
        setFieldErrors((prev) => ({ ...prev, avatar: errorMsg }));
        setAvatarUploadError(errorMsg);
      };
      reader.readAsDataURL(file);
    },
    [formError]
  );

  // --- Logic xử lý Avatar (Sau khi Crop: Upload NGAY, Lưu URL vào State) ---
  const handleCropSaveForRegistration = useCallback(
    async (croppedImageBlob) => {
      setIsCropModalOpen(false); // Đóng modal ngay
      if (!croppedImageBlob) {
        setImageToCrop(null); // Dọn dẹp nếu không có blob
        return;
      }

      setIsUploadingRegistrationAvatar(true); // *** BẮT ĐẦU UPLOAD ***
      setAvatarUploadError(""); // Xóa lỗi upload cũ
      setAvatarUploadSuccess(""); // Xóa thông báo thành công cũ
      setFieldErrors((prev) => ({ ...prev, avatar: undefined })); // Xóa lỗi validation avatar cũ
      setFormError(""); // Xóa lỗi form chung

      let finalUrl = null;

      try {
        // ----- BẮT ĐẦU LOGIC UPLOAD -----
        // 1. Lấy tên file
        const fileNameResponse = await Api({
          endpoint: "media/media-url",
          query: { mediaCategory: MEDIA_CATEGORIES.TUTOR_AVATAR }, // Sử dụng category đã định nghĩa
          method: METHOD_TYPE.GET,
        });
        if (!fileNameResponse?.success || !fileNameResponse?.data?.fileName) {
          throw new Error(
            fileNameResponse?.message || "Lỗi lấy định danh file avatar."
          );
        }
        const fileName = fileNameResponse.data.fileName;

        // 2. Tạo FormData để upload ảnh
        const uploadFormData = new FormData();
        uploadFormData.append("file", croppedImageBlob, `${fileName}.jpeg`); // Đặt tên file

        // 3. Gọi API Upload ảnh
        const uploadResponse = await Api({
          endpoint: `media/upload-media`,
          query: { mediaCategory: MEDIA_CATEGORIES.TUTOR_AVATAR, fileName },
          method: METHOD_TYPE.POST,
          data: uploadFormData,
        });

        if (!uploadResponse?.success || !uploadResponse?.data?.mediaUrl) {
          throw new Error(
            uploadResponse?.message || "Upload ảnh đại diện thất bại."
          );
        }
        finalUrl = uploadResponse.data.mediaUrl; // *** LẤY ĐƯỢC URL ***
        // ----- KẾT THÚC LOGIC UPLOAD -----

        // Cập nhật state formData với URL thật
        setFormData((prev) => ({ ...prev, avatar: finalUrl }));

        // Cập nhật URL xem trước (bằng URL thật)
        if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreviewUrl);
        }
        setAvatarPreviewUrl(finalUrl); // Hiển thị ảnh từ URL server

        setImageToCrop(null); // Dọn dẹp ảnh gốc
        setAvatarUploadSuccess("Upload ảnh đại diện thành công!"); // Thông báo thành công
      } catch (error) {
        console.error("Lỗi upload ảnh đại diện khi đăng ký:", error);
        setFormData((prev) => ({ ...prev, avatar: "" })); // Đảm bảo avatar rỗng trong form
        setAvatarPreviewUrl(null); // Xóa ảnh preview
        const errorMsg = `Lỗi upload: ${error.message || "Không xác định"}`;
        setAvatarUploadError(errorMsg); // Set lỗi riêng cho avatar
        setFieldErrors((prev) => ({ ...prev, avatar: errorMsg })); // Set lỗi field để validateForm biết
      } finally {
        setIsUploadingRegistrationAvatar(false); // *** KẾT THÚC UPLOAD ***
      }
    },
    [avatarPreviewUrl] // Phụ thuộc vào avatarPreviewUrl để revoke
  );

  // --- Hàm đóng modal Crop ---
  const handleCloseCropModal = useCallback(() => {
    // Chỉ cho phép đóng nếu không đang xử lý upload
    if (!isUploadingRegistrationAvatar) {
      setIsCropModalOpen(false);
      setImageToCrop(null); // Dọn dẹp ảnh gốc
    }
  }, [isUploadingRegistrationAvatar]); // Phụ thuộc state loading mới

  // --- Hàm Validate Form Tổng Thể ---
  const validateForm = useCallback(() => {
    let isValid = true;
    let errors = {};
    const minInterval = getTeachingTimeMinutes();
    const teachingHoursLabel =
      formatTeachingTime(formData.teachingTime) || "2h";

    // --- Validate các trường cơ bản ---
    if (!formData.fullname.trim()) {
      errors.fullname = "Vui lòng nhập họ tên.";
      isValid = false;
    }
    if (!formData.majorId) {
      errors.majorId = "Vui lòng chọn khoa.";
      isValid = false;
    }
    if (!formData.birthday) {
      errors.birthday = "Vui lòng chọn ngày sinh.";
      isValid = false;
    }
    if (!formData.bankNumber.trim() || !/^\d+$/.test(formData.bankNumber)) {
      errors.bankNumber = "Số tài khoản không hợp lệ.";
      isValid = false;
    }
    if (!formData.bankName) {
      errors.bankName = "Vui lòng chọn ngân hàng.";
      isValid = false;
    }
    if (!formData.univercity.trim()) {
      errors.univercity = "Vui lòng nhập tên trường.";
      isValid = false;
    }
    if (
      formData.GPA === "" ||
      isNaN(parseFloat(formData.GPA)) ||
      parseFloat(formData.GPA) < 0 ||
      parseFloat(formData.GPA) > 4
    ) {
      errors.GPA = "GPA không hợp lệ (từ 0.00 đến 4.00).";
      isValid = false;
    }
    if (!formData.teachingTime) {
      errors.teachingTime = "Vui lòng chọn thời gian mỗi tiết dạy.";
      isValid = false;
    } else if (formData.teachingTime < 1 || formData.teachingTime > 3) {
      errors.teachingTime = "Thời gian tiết dạy không hợp lệ (1h - 3h).";
      isValid = false;
    }
    if (formData.videoUrl && !/^https?:\/\/.+/.test(formData.videoUrl)) {
      errors.videoUrl =
        "URL video không hợp lệ (bắt đầu bằng http:// hoặc https://).";
      isValid = false;
    }
    if (
      (formData.teachingMethod === "OFFLINE" ||
        formData.teachingMethod === "BOTH") &&
      !formData.teachingPlace.trim()
    ) {
      errors.teachingPlace = "Vui lòng nhập khu vực có thể dạy Offline.";
      isValid = false;
    }

    // --- Validate Avatar ---
    // Kiểm tra xem formData.avatar có URL hợp lệ không (sau khi upload)
    if (!formData.avatar) {
      // Nếu URL rỗng
      errors.avatar = "Vui lòng tải và lưu ảnh đại diện.";
      isValid = false;
    } else if (avatarUploadError) {
      // Kiểm tra nếu có lỗi từ quá trình upload trước đó
      errors.avatar = avatarUploadError; // Sử dụng lỗi đã lưu
      isValid = false;
    }

    // --- Validate các file upload khác (minh chứng GPA, môn học) ---
    if (fileUploadErrors["evidenceOfGPA"]) {
      errors.evidenceOfGPA = `Minh chứng GPA: ${fileUploadErrors["evidenceOfGPA"]}`;
      isValid = false;
    }
    // GPA proof không bắt buộc

    // --- Validate môn học ---
    const validateSubject = (index) => {
      const suffix = index > 1 ? index : "";
      const subjectIdKey = `subjectId${suffix}`;
      const evidenceKey = `evidenceOfSubject${suffix}`;
      let subjectHasError = false;
      if (!formData[subjectIdKey]) {
        errors[subjectIdKey] = `Vui lòng chọn môn học ${index}.`;
        subjectHasError = true;
      }
      if (!formData[evidenceKey]) {
        errors[evidenceKey] = `Vui lòng tải minh chứng cho môn học ${index}.`;
        subjectHasError = true;
      } else if (fileUploadErrors[evidenceKey]) {
        errors[
          evidenceKey
        ] = `Minh chứng môn ${index}: ${fileUploadErrors[evidenceKey]}`;
        subjectHasError = true;
      }
      return subjectHasError;
    };
    if (validateSubject(1)) isValid = false;
    if (numberOfSubjects >= 2 && validateSubject(2)) isValid = false;
    if (numberOfSubjects >= 3 && validateSubject(3)) isValid = false;

    // --- Validate Lịch Rảnh ---
    let hasSelectedDay = false;
    let hasAnyValidTime = false;
    let timeValidationError = null;
    const currentAvailabilityErrors = { ...timeErrors };
    daysOfWeek.forEach((day) => {
      const dayData = availability[day];
      if (dayData.isSelected) {
        hasSelectedDay = true;
        if (dayData.times.length > 0) {
          const errorInfo = validateTimeSlotsForDay(
            day,
            dayData.times,
            minInterval
          );
          currentAvailabilityErrors[day] = errorInfo ? errorInfo.index : null;
          if (errorInfo && !timeValidationError) {
            const dayName = `Thứ ${
              day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
            }`;
            timeValidationError =
              errorInfo.type === "empty"
                ? `Vui lòng nhập đầy đủ giờ bắt đầu cho ${dayName}.`
                : `Giờ dạy ${dayName} không hợp lệ (phải cách nhau ít nhất ${teachingHoursLabel}).`;
          }
          if (!errorInfo && dayData.times.some((t) => !!t)) {
            hasAnyValidTime = true;
          }
        } else {
          if (!timeValidationError) {
            timeValidationError = `Vui lòng thêm ít nhất một khung giờ cho Thứ ${
              day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
            }.`;
          }
        }
      } else {
        currentAvailabilityErrors[day] = null;
      }
    });
    setTimeErrors(currentAvailabilityErrors);
    if (!hasSelectedDay) {
      errors.availability = "Vui lòng chọn ít nhất một ngày rảnh trong tuần.";
      isValid = false;
    } else if (!hasAnyValidTime && !timeValidationError) {
      errors.availability =
        "Vui lòng thêm ít nhất một khung giờ bắt đầu hợp lệ.";
      isValid = false;
    } else if (timeValidationError) {
      errors.availability = timeValidationError;
      isValid = false;
    }

    // --- Cập nhật state lỗi và trả về kết quả ---
    setFieldErrors(errors);
    if (!isValid) {
      setFormError(
        avatarUploadError || // Lỗi upload avatar (nếu có)
          errors.availability || // Lỗi lịch rảnh
          errors.avatar || // Lỗi avatar chưa tải
          Object.values(errors)[0] || // Lỗi đầu tiên khác
          "Vui lòng kiểm tra lại các thông tin đã nhập."
      );
    } else {
      setFormError(""); // Xóa lỗi chung nếu form hợp lệ
    }
    console.log("Validation Result:", isValid, errors);
    return isValid;
  }, [
    formData, // Phụ thuộc formData (chứa avatar URL)
    fieldErrors, // Để set lỗi mới
    numberOfSubjects,
    fileUploadErrors,
    availability,
    timeErrors,
    getTeachingTimeMinutes,
    validateTimeSlotsForDay,
    avatarUploadError, // Phụ thuộc lỗi upload avatar
  ]);

  // --- Xử lý Submit Form ---
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(""); // Xóa lỗi cũ
      setSuccess(""); // Xóa thông báo thành công cũ
      setAvatarUploadError(""); // Xóa lỗi upload avatar cũ khi submit lại
      setAvatarUploadSuccess(""); // Xóa thông báo thành công upload cũ

      // Kiểm tra: Không cho submit nếu đang upload avatar
      if (isUploadingRegistrationAvatar) {
        setFormError(
          "Đang xử lý ảnh đại diện, vui lòng đợi hoàn tất trước khi gửi đăng ký."
        );
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        }); // Cuộn xuống cuối xem lỗi
        return;
      }

      // Validate trước khi gửi
      if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên đầu trang để xem lỗi
        return;
      }

      setIsLoading(true); // Bắt đầu loading submit form chính

      // ---- Tạo FormData để gửi lên server ----
      const registrationFormData = new FormData();

      // 1. Append các trường dữ liệu thông thường
      registrationFormData.append("fullname", formData.fullname);
      registrationFormData.append("majorId", formData.majorId);
      registrationFormData.append("birthday", formData.birthday);
      registrationFormData.append("gender", formData.gender);
      registrationFormData.append("bankNumber", formData.bankNumber);
      registrationFormData.append("bankName", formData.bankName);
      registrationFormData.append("description", formData.description || "");
      registrationFormData.append("univercity", formData.univercity);
      registrationFormData.append("GPA", formData.GPA);
      if (formData.evidenceOfGPA) {
        registrationFormData.append("evidenceOfGPA", formData.evidenceOfGPA);
      }
      registrationFormData.append("teachingTime", formData.teachingTime);
      if (formData.videoUrl) {
        registrationFormData.append("videoUrl", formData.videoUrl);
      }
      registrationFormData.append("teachingMethod", formData.teachingMethod);
      if (formData.teachingPlace) {
        registrationFormData.append("teachingPlace", formData.teachingPlace);
      }
      registrationFormData.append(
        "isUseCurriculumn",
        String(formData.isUseCurriculumn)
      );

      // *** Append URL avatar từ formData ***
      if (formData.avatar) {
        // Chỉ append nếu có URL
        registrationFormData.append("avatar", formData.avatar);
      }

      // 2. Append thông tin môn học (JSON string)
      const subjects = [];
      const addSubjectData = (index) => {
        const suffix = index > 1 ? index : "";
        const subjectIdKey = `subjectId${suffix}`;
        const evidenceKey = `evidenceOfSubject${suffix}`;
        const descriptionKey = `descriptionOfSubject${suffix}`;
        if (formData[subjectIdKey] && formData[evidenceKey]) {
          subjects.push({
            subjectId: formData[subjectIdKey],
            evidence: formData[evidenceKey],
            description: formData[descriptionKey] || "",
          });
        }
      };
      addSubjectData(1);
      if (numberOfSubjects >= 2) addSubjectData(2);
      if (numberOfSubjects >= 3) addSubjectData(3);
      registrationFormData.append("subjects", JSON.stringify(subjects));

      // 3. Append lịch rảnh (availability - JSON string)
      const formattedAvailability = daysOfWeek.reduce((acc, day) => {
        const dayData = availability[day];
        if (dayData.isSelected && dayData.times.length > 0) {
          const validTimes = dayData.times.filter((t) => !!t).sort();
          if (validTimes.length > 0) {
            acc[day] = validTimes;
          }
        }
        return acc;
      }, {});
      registrationFormData.append(
        "availability",
        JSON.stringify(formattedAvailability)
      );

      // --- Log dữ liệu FormData trước khi gửi ---
      console.log("--- Submitting FormData (with Avatar URL) ---");
      for (let pair of registrationFormData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      // --- Gọi API ---
      try {
        const response = await Api({
          endpoint: "tutor-request/regis-to-tutor",
          method: METHOD_TYPE.POST,
          data: registrationFormData, // Gửi FormData chứa URL avatar
        });

        if (response.success === true) {
          setSuccess("Đăng ký thành công! Hồ sơ của bạn sẽ được xét duyệt.");
          // Reset form nếu cần
          // setFormData({...initialFormData}); setAvailability({...initialAvailability}); ...
          window.scrollTo({ top: 0, behavior: "smooth" });
          // navigate('/success-page'); // Chuyển hướng nếu cần
        } else {
          throw new Error(
            response.message || "Đăng ký không thành công từ phía máy chủ."
          );
        }
      } catch (apiError) {
        console.error("API Error on Submit:", apiError);
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Đã xảy ra lỗi trong quá trình đăng ký.";
        setFormError(errorMessage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsLoading(false); // Kết thúc loading submit form chính
      }
    },
    [
      validateForm, // Phụ thuộc validate mới
      formData, // Phụ thuộc formData (chứa avatar URL)
      availability,
      numberOfSubjects,
      isUploadingRegistrationAvatar, // Phụ thuộc state upload avatar
    ]
  );

  // --- Function hiển thị lỗi field ---
  const renderFieldError = useCallback(
    (fieldName) => {
      const error = fieldErrors[fieldName];
      return error ? <p className="field-error-message">{error}</p> : null;
    },
    [fieldErrors]
  );

  // --- Render Subject Input Sections ---
  const renderSubjectSection = useCallback(
    (index) => {
      const suffix = index > 1 ? index : "";
      const subjectIdKey = `subjectId${suffix}`;
      const evidenceKey = `evidenceOfSubject${suffix}`;
      const descriptionKey = `descriptionOfSubject${suffix}`;
      return (
        <div key={`subject-${index}`} className="subject-item form-grid">
          {/* Cột 1: Chọn môn, Mô tả */}
          <div className="form-column">
            <h4>
              Môn Dạy {index}
              {/* Nút xóa */}
              {index > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeSubjectSlot(index)}
                  title={`Xóa môn ${index}`}
                  // *** Disable khi đang submit form HOẶC đang upload avatar ***
                  disabled={isLoading || isUploadingRegistrationAvatar}
                >
                  Xóa môn
                </button>
              )}
            </h4>
            <div className="form-group">
              <label htmlFor={subjectIdKey}>
                Môn học <span className="required-asterisk">*</span>
              </label>
              <SubjectList
                name={subjectIdKey}
                value={formData[subjectIdKey]}
                onChange={handleInputChange}
                required={true}
              />
              {renderFieldError(subjectIdKey)}
            </div>
            <div className="form-group">
              <label htmlFor={descriptionKey}>
                Mô tả kinh nghiệm dạy môn này
              </label>
              <textarea
                id={descriptionKey}
                name={descriptionKey}
                rows="4"
                maxLength={500}
                value={formData[descriptionKey]}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                placeholder="Ví dụ: Kinh nghiệm gia sư, thành tích học tập liên quan..."
              />
              {renderFieldError(descriptionKey)}
            </div>
          </div>
          {/* Cột 2: Upload Minh chứng */}
          <div className="form-column">
            <div className="form-group">
              <GenericFileUploader
                label={`Minh chứng môn ${index} (Bảng điểm, chứng chỉ...)`}
                mediaCategory={MEDIA_CATEGORIES.SUBJECT_PROOF}
                initialFileUrl={formData[evidenceKey]}
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
                required={true}
                fileIdentifier={evidenceKey}
                promptText="Tải lên file ảnh hoặc PDF"
              />
              {renderFieldError(evidenceKey)}
            </div>
          </div>
        </div>
      );
    },
    [
      formData,
      handleInputChange,
      handleUploadComplete,
      handleUploadError,
      renderFieldError,
      removeSubjectSlot,
      isLoading, // Dependency cũ
      isUploadingRegistrationAvatar, // *** THÊM DEPENDENCY MỚI ***
    ]
  );

  // --- Render Chính ---
  return (
    <HomePageLayout>
      {/* Input file ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelected}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/jpg"
        // Disable khi đang upload avatar HOẶC đang submit form chính
        disabled={isUploadingRegistrationAvatar || isLoading}
      />

      <div className="tutor-registration-container">
        <h2>Đăng Ký Làm Gia Sư</h2>

        <form
          onSubmit={handleSubmit}
          className="tutor-registration-form"
          noValidate
        >
          {/* --- Phần 1: Thông Tin Cá Nhân & Học Vấn --- */}
          <div className="form-section">
            <h3>I. Thông Tin Cá Nhân & Học Vấn</h3>
            <div className="form-grid">
              {/* Cột 1: Thông tin cơ bản */}
              <div className="form-column">
                {/* Các field fullname, birthday, gender, univercity, majorId, GPA, evidenceOfGPA giữ nguyên */}
                <div className="form-group">
                  <label htmlFor="fullname">
                    {" "}
                    Họ và Tên <span className="required-asterisk">*</span>{" "}
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                  />
                  {renderFieldError("fullname")}
                </div>
                <div className="form-group">
                  <label htmlFor="birthday">
                    {" "}
                    Ngày sinh <span className="required-asterisk">*</span>{" "}
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {renderFieldError("birthday")}
                </div>
                <div className="form-group">
                  <label>
                    {" "}
                    Giới tính <span className="required-asterisk">*</span>{" "}
                  </label>
                  <div className="radio-group">
                    <label>
                      {" "}
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === "MALE"}
                        onChange={(e) =>
                          handleInputChange(e.target.name, e.target.value)
                        }
                      />{" "}
                      Nam{" "}
                    </label>
                    <label>
                      {" "}
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === "FEMALE"}
                        onChange={(e) =>
                          handleInputChange(e.target.name, e.target.value)
                        }
                      />{" "}
                      Nữ{" "}
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="univercity">
                    {" "}
                    Trường Đại học <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>
                  <input
                    type="text"
                    id="univercity"
                    name="univercity"
                    value={formData.univercity}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                    placeholder="Ví dụ: Đại học Văn Lang"
                  />
                  {renderFieldError("univercity")}
                </div>
                <div className="form-group">
                  <label htmlFor="majorId">
                    {" "}
                    Ngành học <span className="required-asterisk">*</span>{" "}
                  </label>
                  <MajorList
                    name="majorId"
                    value={formData.majorId}
                    onChange={handleInputChange}
                    required={true}
                  />
                  {renderFieldError("majorId")}
                </div>
                <div className="form-group">
                  <label htmlFor="GPA">
                    {" "}
                    Điểm GPA (Hệ 4) <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    id="GPA"
                    name="GPA"
                    value={formData.GPA}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                    placeholder="Ví dụ: 3.50"
                  />
                  {renderFieldError("GPA")}
                </div>
                <div className="form-group">
                  <GenericFileUploader
                    label="Minh chứng GPA (Bảng điểm)"
                    mediaCategory={MEDIA_CATEGORIES.GPA_PROOF}
                    initialFileUrl={formData.evidenceOfGPA}
                    onUploadComplete={handleUploadComplete}
                    onError={handleUploadError}
                    fileIdentifier="evidenceOfGPA"
                    promptText="Tải lên file ảnh hoặc PDF"
                  />
                  {renderFieldError("evidenceOfGPA")}
                </div>
              </div>

              {/* Cột 2: Avatar, Giới thiệu, Ngân hàng */}
              <div className="form-column">
                <div className="form-group">
                  <label>
                    Ảnh đại diện <span className="required-asterisk">*</span>
                  </label>
                  <AvatarDisplay
                    imageUrl={avatarPreviewUrl} // Hiển thị URL xem trước (từ server hoặc blob)
                    onTriggerSelect={handleTriggerAvatarInput}
                  />
                  {/* Hiển thị spinner HOẶC lỗi/thành công upload avatar */}
                  {isUploadingRegistrationAvatar && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        color: "#b41e2d",
                      }}
                    >
                      <FontAwesomeIcon icon={faSpinner} spin size="lg" /> Đang
                      tải ảnh lên...
                    </div>
                  )}
                  {avatarUploadError && !isUploadingRegistrationAvatar && (
                    <p
                      className="field-error-message"
                      style={{ textAlign: "center", marginTop: "10px" }}
                    >
                      {avatarUploadError}
                    </p>
                  )}
                  {avatarUploadSuccess && !isUploadingRegistrationAvatar && (
                    <p
                      className="success-message"
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        fontSize: "0.9rem",
                        padding: "0.5rem 1rem",
                      }}
                    >
                      {avatarUploadSuccess}
                    </p>
                  )}
                  {/* Hiển thị lỗi validation chung của field avatar */}
                  {renderFieldError("avatar")}
                </div>
                {/* Các field description, videoUrl, bankName, bankNumber giữ nguyên */}
                <div className="form-group">
                  <label htmlFor="description">Giới thiệu bản thân</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    maxLength={1500}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    placeholder="Chia sẻ về kinh nghiệm giảng dạy..."
                  ></textarea>
                  {renderFieldError("description")}
                </div>
                <div className="form-group">
                  <label htmlFor="videoUrl">
                    {" "}
                    Link Video giới thiệu (Youtube, Drive,...)
                  </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    placeholder="https://..."
                  />
                  {renderFieldError("videoUrl")}
                </div>
                <div className="form-group">
                  <label htmlFor="bankName">
                    {" "}
                    Tên ngân hàng <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>
                  <BankList
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required={true}
                  />
                  {renderFieldError("bankName")}
                </div>
                <div className="form-group">
                  <label htmlFor="bankNumber">
                    {" "}
                    Số tài khoản nhận học phí{" "}
                    <span className="required-asterisk">*</span>{" "}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="bankNumber"
                    name="bankNumber"
                    value={formData.bankNumber}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                  />
                  {renderFieldError("bankNumber")}
                </div>
              </div>
            </div>
          </div>

          {/* --- Phần 2: Thông Tin Giảng Dạy --- */}
          <div className="form-section">
            <h3>II. Thông Tin Giảng Dạy</h3>
            {/* Các field teachingMethod, teachingPlace, isUseCurriculumn giữ nguyên */}
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="teachingMethod">
                    {" "}
                    Phương thức dạy <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>
                  <select
                    id="teachingMethod"
                    name="teachingMethod"
                    value={formData.teachingMethod}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                  >
                    <option value="ONLINE">Trực tuyến (Online)</option>
                    <option value="OFFLINE">Tại nhà học viên (Offline)</option>
                    <option value="BOTH">Cả hai (Online và Offline)</option>
                  </select>
                  {renderFieldError("teachingMethod")}
                </div>
                {(formData.teachingMethod === "OFFLINE" ||
                  formData.teachingMethod === "BOTH") && (
                  <div className="form-group">
                    <label htmlFor="teachingPlace">
                      {" "}
                      Khu vực có thể dạy Offline{" "}
                      <span className="required-asterisk">*</span>{" "}
                    </label>
                    <input
                      type="text"
                      id="teachingPlace"
                      name="teachingPlace"
                      value={formData.teachingPlace}
                      onChange={(e) =>
                        handleInputChange(e.target.name, e.target.value)
                      }
                      required
                      placeholder="Ví dụ: Q.Gò Vấp, Q.Bình Thạnh"
                    />
                    {renderFieldError("teachingPlace")}
                  </div>
                )}
              </div>
              <div className="form-column">
                <div className="form-group">
                  <label>Giáo trình / Tài liệu riêng</label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isUseCurriculumn"
                      checked={formData.isUseCurriculumn}
                      onChange={(e) =>
                        handleInputChange(e.target.name, e.target.checked)
                      }
                    />
                    <span>
                      {" "}
                      Tôi có sử dụng giáo trình/tài liệu do tôi tự chuẩn bị{" "}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* --- Phần 3: Thông Tin Môn Đăng Ký Dạy --- */}
          <div className="form-section subject-info">
            <h3>III. Thông Tin Môn Đăng Ký Dạy</h3>
            {/* Render các section môn học */}
            {renderSubjectSection(1)}
            {numberOfSubjects >= 2 && renderSubjectSection(2)}
            {numberOfSubjects >= 3 && renderSubjectSection(3)}

            {/* Nút thêm môn học */}
            {numberOfSubjects < 3 && (
              <button
                type="button"
                className="add-button"
                onClick={addSubjectSlot}
                // *** Disable khi đang submit form HOẶC đang upload avatar ***
                disabled={isLoading || isUploadingRegistrationAvatar}
              >
                + Thêm môn dạy (Tối đa 3 môn)
              </button>
            )}
          </div>

          {/* --- Phần 4: Thời Gian Rảnh Có Thể Dạy --- */}
          <div className="form-section availability-info">
            {/* Phần teachingTime, availability grid giữ nguyên */}
            <h3>
              {" "}
              IV. Thời Gian Rảnh Có Thể Dạy{" "}
              <span className="required-asterisk">*</span>{" "}
            </h3>
            <div className="form-group teaching-time-group availability-teaching-time">
              <label htmlFor="teachingTime">
                {" "}
                Thời gian mỗi buổi dạy (dự kiến){" "}
                <span className="required-asterisk">*</span>{" "}
              </label>
              <select
                id="teachingTime"
                name="teachingTime"
                value={formData.teachingTime}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                required
              >
                {teachingTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}
              </select>
              {renderFieldError("teachingTime")}
            </div>
            <p className="note availability-note">
              {" "}
              Chọn các ngày bạn rảnh và thêm các **giờ bắt đầu** ca dạy trong
              ngày đó. Khoảng cách tối thiểu giữa các giờ bắt đầu phải là{" "}
              <strong>
                {" "}
                {formatTeachingTime(formData.teachingTime) || "2h"}{" "}
              </strong>
              .{" "}
            </p>
            {renderFieldError("availability")}
            <div className="availability-grid">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`day-column ${
                    availability[day].isSelected ? "selected" : ""
                  } ${timeErrors[day] !== null ? "has-error" : ""}`}
                >
                  <div
                    className="day-header"
                    onClick={() => handleDayToggle(day)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === " " || e.key === "Enter") &&
                      handleDayToggle(day)
                    }
                  >
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={availability[day].isSelected}
                      readOnly
                      style={{ pointerEvents: "none" }}
                    />
                    <label htmlFor={`day-${day}`}>{`Thứ ${
                      day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
                    }`}</label>
                  </div>
                  {availability[day].isSelected && (
                    <div className="time-slots">
                      {availability[day].times.map((time, timeIndex) => (
                        <div
                          key={`${day}-${timeIndex}`}
                          className="time-slot-item"
                        >
                          <input
                            type="time"
                            value={time}
                            onChange={(e) =>
                              handleTimeChange(day, timeIndex, e.target.value)
                            }
                            step="900"
                            className={
                              timeErrors[day] === timeIndex
                                ? "time-input-error"
                                : ""
                            }
                            required={availability[day].times.length > 0}
                          />
                          <span>(Giờ bắt đầu)</span>
                          <button
                            type="button"
                            className="remove-time-button"
                            onClick={() => removeTimeSlot(day, timeIndex)}
                            title="Xóa khung giờ này"
                          >
                            {" "}
                            ×{" "}
                          </button>
                          {timeErrors[day] === timeIndex && (
                            <span className="time-slot-error-message">
                              {" "}
                              Giờ không hợp lệ{" "}
                            </span>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-time-button"
                        onClick={() => addTimeSlot(day)}
                      >
                        {" "}
                        + Thêm giờ{" "}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* --- Submit & Thông báo --- */}
          <div className="form-actions">
            {/* Hiển thị lỗi chung của form */}
            {formError && <p className="error-message">{formError}</p>}
            {/* Hiển thị thông báo thành công submit form */}
            {success && <p className="success-message">{success}</p>}

            {/* Điều khoản dịch vụ */}
            <p className="terms">
              Bằng việc nhấn nút "Hoàn Tất Đăng Ký", bạn xác nhận đã đọc và đồng
              ý với{" "}
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Điều khoản Dịch vụ{" "}
              </a>{" "}
              và{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Chính sách Bảo mật{" "}
              </a>{" "}
              của chúng tôi.
            </p>

            {/* Nút Submit chính */}
            <button
              type="submit"
              // *** Disable khi đang submit form HOẶC đang upload avatar ***
              disabled={isLoading || isUploadingRegistrationAvatar}
            >
              {isLoading ? (
                <>
                  {" "}
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang gửi đăng ký...{" "}
                </>
              ) : (
                "Hoàn Tất Đăng Ký"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- Modal Crop Ảnh --- */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onRequestClose={handleCloseCropModal} // Gọi hàm đã sửa đổi
        imageSrc={imageToCrop}
        onCropSave={handleCropSaveForRegistration} // <-- Gọi hàm upload đã sửa đổi
        aspect={1}
        cropShape="round"
      />
    </HomePageLayout>
  );
};

export default TutorRegistrationForm;
