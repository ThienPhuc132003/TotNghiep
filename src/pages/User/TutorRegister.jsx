/* eslint-disable react/no-unescaped-entities */
// src/pages/User/TutorRegistrationForm.jsx
import { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/TutorRegister.style.css";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import GenericFileUploader from "../../components/GenericFileUploader";
import BankList from "../../components/Static_Data/BankList";
import MajorList from "../../components/Static_Data/MajorList";
import SubjectList from "../../components/Static_Data/SubjectList";
import AvatarDisplay from "../../components/AvatarDisplay";
import ImageCropModal from "../../components/ImageCropModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

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
  TUTOR_AVATAR: "TUTOR_AVATAR",
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
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [fileUploadErrors, setFileUploadErrors] = useState({});
  const [numberOfSubjects, setNumberOfSubjects] = useState(1);
  const [formData, setFormData] = useState({
    fullname: "",
    majorId: "",
    birthday: "",
    gender: "MALE",
    bankNumber: "",
    bankName: "",
    avatar: "",
    description: "",
    univercity: "Đại học Văn Lang",
    GPA: "",
    evidenceOfGPA: "",
    teachingTime: 2,
    videoUrl: "",
    teachingMethod: "ONLINE",
    teachingPlace: "",
    isUseCurriculumn: false,
    subjectId: "",
    evidenceOfSubject: "",
    descriptionOfSubject: "",
    subjectId2: "",
    evidenceOfSubject2: "",
    descriptionOfSubject2: "",
    subjectId3: "",
    evidenceOfSubject3: "",
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
  const [isUploadingRegistrationAvatar, setIsUploadingRegistrationAvatar] =
    useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const fileInputRef = useRef(null);
  // const navigate = useNavigate();

  // --- Effects (Fetch Data, Cleanup URL) ---
  useEffect(() => {
    if (formData.avatar && !avatarPreviewUrl) {
      setAvatarPreviewUrl(formData.avatar);
    }
  }, [formData.avatar, avatarPreviewUrl]);

  useEffect(() => {
    const currentPreviewUrl = avatarPreviewUrl;
    return () => {
      if (currentPreviewUrl && currentPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreviewUrl);
        console.log("Revoked Object URL:", currentPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  // --- Callbacks Upload File (Generic) ---
  const handleUploadComplete = useCallback(
    (url, identifier) => {
      console.log(`Upload Complete: id=${identifier}, url=${url}`);
      setFileUploadErrors((prev) => ({ ...prev, [identifier]: "" }));
      setFieldErrors((prev) => ({ ...prev, [identifier]: undefined }));
      // Update formData for evidence URLs directly
      if (
        identifier.startsWith("evidenceOfSubject") ||
        identifier === "evidenceOfGPA"
      ) {
        setFormData((prev) => ({ ...prev, [identifier]: url }));
      } else if (identifier in formData) {
        // Handle other identifiers if necessary, though currently only evidence uses this
        setFormData((prev) => ({ ...prev, [identifier]: url }));
      } else {
        console.warn("Unknown file identifier for generic upload:", identifier);
      }
    },
    [formData]
  ); // Keep formData dependency

  const handleUploadError = useCallback((message, identifier) => {
    console.error(`Upload Error: id=${identifier}, msg=${message}`);
    const userMsg = message || "Upload thất bại";
    setFileUploadErrors((prev) => ({ ...prev, [identifier]: userMsg }));
    setFieldErrors((prev) => ({ ...prev, [identifier]: userMsg }));
  }, []);

  // --- Handlers Subjects ---
  const addSubjectSlot = useCallback(() => {
    if (numberOfSubjects < 3) {
      setNumberOfSubjects((prev) => prev + 1);
    }
  }, [numberOfSubjects]);

  const removeSubjectSlot = useCallback(
    (subjectIndexToRemove) => {
      const keySuffix = subjectIndexToRemove === 1 ? "" : subjectIndexToRemove; // Handle index 1 having no suffix
      const subjectIdKey = `subjectId${keySuffix}`;
      const evidenceKey = `evidenceOfSubject${keySuffix}`;
      const descriptionKey = `descriptionOfSubject${keySuffix}`;

      const resetFields = {
        [subjectIdKey]: "",
        [evidenceKey]: "",
        [descriptionKey]: "",
      };
      const resetFieldErrors = {
        [subjectIdKey]: undefined,
        [evidenceKey]: undefined,
        [descriptionKey]: undefined,
      };

      setFormData((prev) => ({ ...prev, ...resetFields }));
      setFieldErrors((prev) => ({ ...prev, ...resetFieldErrors }));
      setFileUploadErrors((prev) => ({ ...prev, [evidenceKey]: "" })); // Reset specific upload error

      // Shift data up if subject 2 is removed and subject 3 exists
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

        // Reset subject 3 fields after moving
        const resetSubject3 = {
          subjectId3: "",
          evidenceOfSubject3: "",
          descriptionOfSubject3: "",
        };
        const resetSubject3Errors = {
          subjectId3: undefined,
          evidenceOfSubject3: undefined,
          descriptionOfSubject3: undefined,
        };

        setFormData((prev) => ({ ...prev, ...dataToMove, ...resetSubject3 }));
        setFieldErrors((prev) => ({
          ...prev,
          ...errorsToMove,
          ...resetSubject3Errors,
        }));
        setFileUploadErrors((prev) => ({
          ...prev,
          evidenceOfSubject2: fileErrorToMove,
          evidenceOfSubject3: "",
        }));
      }
      // Decrement count last
      setNumberOfSubjects((prev) => prev - 1);
    },
    [numberOfSubjects, formData, fieldErrors, fileUploadErrors]
  );

  // --- Handlers Availability ---
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

  // --- Handler Input Change (Generic) ---
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

  // --- Handlers Availability (Toggle, Add, Remove, Change Time) ---
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

  // --- Handlers Avatar (Trigger Input, Select File) ---
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
        setAvatarUploadError("Vui lòng chọn một file ảnh hợp lệ.");
        return;
      }
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

  // --- Handler Avatar (Save Crop -> Upload -> Save URL) ---
  const handleCropSaveForRegistration = useCallback(
    async (croppedImageBlob) => {
      setIsCropModalOpen(false);
      if (!croppedImageBlob) {
        setImageToCrop(null);
        return;
      }
      setIsUploadingRegistrationAvatar(true);
      setAvatarUploadError("");
      setAvatarUploadSuccess("");
      setFieldErrors((prev) => ({ ...prev, avatar: undefined }));
      setFormError("");
      let finalUrl = null;
      try {
        const fileNameResponse = await Api({
          endpoint: "media/media-url",
          query: { mediaCategory: MEDIA_CATEGORIES.TUTOR_AVATAR },
          method: METHOD_TYPE.GET,
        });
        if (!fileNameResponse?.success || !fileNameResponse?.data?.fileName) {
          throw new Error(
            fileNameResponse?.message || "Lỗi lấy định danh file avatar."
          );
        }
        const fileName = fileNameResponse.data.fileName;
        const uploadFormData = new FormData();
        uploadFormData.append("file", croppedImageBlob, `${fileName}.jpeg`);
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
        finalUrl = uploadResponse.data.mediaUrl;
        setFormData((prev) => ({ ...prev, avatar: finalUrl }));
        if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreviewUrl);
        }
        setAvatarPreviewUrl(finalUrl);
        setImageToCrop(null);
        setAvatarUploadSuccess("Upload ảnh đại diện thành công!");
      } catch (error) {
        console.error("Lỗi upload ảnh đại diện khi đăng ký:", error);
        setFormData((prev) => ({ ...prev, avatar: "" }));
        setAvatarPreviewUrl(null);
        const errorMsg = `Lỗi upload: ${error.message || "Không xác định"}`;
        setAvatarUploadError(errorMsg);
        setFieldErrors((prev) => ({ ...prev, avatar: errorMsg }));
      } finally {
        setIsUploadingRegistrationAvatar(false);
      }
    },
    [avatarPreviewUrl]
  );

  // --- Handler Avatar (Close Crop Modal) ---
  const handleCloseCropModal = useCallback(() => {
    if (!isUploadingRegistrationAvatar) {
      setIsCropModalOpen(false);
      setImageToCrop(null);
    }
  }, [isUploadingRegistrationAvatar]);

  // --- Validate Form ---
  const validateForm = useCallback(() => {
    let isValid = true;
    let errors = {};
    const minInterval = getTeachingTimeMinutes();
    const teachingHoursLabel =
      formatTeachingTime(formData.teachingTime) || "2h";
    // Basic fields validation
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
      errors.videoUrl = "URL video không hợp lệ.";
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
    // Avatar validation (checks URL and upload errors)
    if (!formData.avatar) {
      errors.avatar = "Vui lòng tải và lưu ảnh đại diện.";
      isValid = false;
    } else if (avatarUploadError) {
      errors.avatar = avatarUploadError;
      isValid = false;
    }
    // Other file uploads validation
    if (fileUploadErrors["evidenceOfGPA"]) {
      errors.evidenceOfGPA = `Minh chứng GPA: ${fileUploadErrors["evidenceOfGPA"]}`;
      isValid = false;
    }
    // Subjects validation
    const validateSubject = (index) => {
      const suffix = index > 1 ? index : "";
      const subjectIdKey = `subjectId${suffix}`;
      const evidenceKey = `evidenceOfSubject${suffix}`;
      let subjectHasError = false;
      // Only validate if the subject slot is intended (based on numberOfSubjects)
      if (index <= numberOfSubjects) {
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
      }
      return subjectHasError;
    };
    if (validateSubject(1)) isValid = false;
    if (validateSubject(2)) isValid = false; // Validate even if not filled, if numberOfSubjects >= 2
    if (validateSubject(3)) isValid = false; // Validate even if not filled, if numberOfSubjects === 3

    // Availability validation
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
                : `Giờ dạy ${dayName} không hợp lệ (cách nhau ${teachingHoursLabel}).`;
          }
          if (!errorInfo && dayData.times.some((t) => !!t)) {
            hasAnyValidTime = true;
          }
        } else {
          if (!timeValidationError) {
            timeValidationError = `Vui lòng thêm giờ cho Thứ ${
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
      errors.availability = "Vui lòng chọn ít nhất một ngày rảnh.";
      isValid = false;
    } else if (!hasAnyValidTime && !timeValidationError) {
      errors.availability = "Vui lòng thêm giờ bắt đầu hợp lệ.";
      isValid = false;
    } else if (timeValidationError) {
      errors.availability = timeValidationError;
      isValid = false;
    }
    // Set errors and return
    setFieldErrors(errors);
    if (!isValid) {
      setFormError(
        avatarUploadError ||
          errors.availability ||
          errors.avatar ||
          Object.values(errors).find((e) => e) ||
          "Vui lòng kiểm tra lại thông tin."
      );
    } // Find first error message
    else {
      setFormError("");
    }
    console.log("Validation Result:", isValid, errors);
    return isValid;
  }, [
    formData,
    numberOfSubjects,
    fileUploadErrors,
    availability,
    timeErrors,
    getTeachingTimeMinutes,
    validateTimeSlotsForDay,
    avatarUploadError,
  ]);

  // --- Handle Submit (Gửi dữ liệu theo cấu trúc JSON mẫu - Flat Subjects, dateTimeLearn Array) ---
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");
      setSuccess("");
      setAvatarUploadError("");
      setAvatarUploadSuccess("");

      if (isUploadingRegistrationAvatar) {
        setFormError("Đang xử lý ảnh, vui lòng đợi.");
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        return;
      }

      if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setIsLoading(true);
      const registrationFormData = new FormData();

      // === Append data matching the SAMPLE JSON structure ===

      // 1. Basic Info (Appending strings, numbers, boolean as needed by backend)
      registrationFormData.append("fullname", formData.fullname);
      registrationFormData.append("majorId", formData.majorId);
      registrationFormData.append("birthday", formData.birthday);
      registrationFormData.append("gender", formData.gender);
      registrationFormData.append("bankNumber", formData.bankNumber);
      registrationFormData.append("bankName", formData.bankName);
      registrationFormData.append("description", formData.description || "");
      registrationFormData.append("univercity", formData.univercity);
      registrationFormData.append("GPA", formData.GPA); // Send GPA as string
      registrationFormData.append(
        "teachingTime",
        String(formData.teachingTime)
      ); // Send teachingTime as string
      if (formData.evidenceOfGPA) {
        registrationFormData.append("evidenceOfGPA", formData.evidenceOfGPA);
      }
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
      ); // Send boolean as "true"/"false" string
      if (formData.avatar) {
        registrationFormData.append("avatar", formData.avatar);
      } // Send Avatar URL

      // 2. Subjects (Append individual fields based on sample)
      if (formData.subjectId && formData.evidenceOfSubject) {
        registrationFormData.append("subjectId", formData.subjectId);
        registrationFormData.append(
          "evidenceOfSubject",
          formData.evidenceOfSubject
        );
        registrationFormData.append(
          "descriptionOfSubject",
          formData.descriptionOfSubject || ""
        );
      }
      if (
        numberOfSubjects >= 2 &&
        formData.subjectId2 &&
        formData.evidenceOfSubject2
      ) {
        registrationFormData.append("subjectId2", formData.subjectId2);
        registrationFormData.append(
          "evidenceOfSubject2",
          formData.evidenceOfSubject2
        );
        registrationFormData.append(
          "descriptionOfSubject2",
          formData.descriptionOfSubject2 || ""
        );
      }
      if (
        numberOfSubjects >= 3 &&
        formData.subjectId3 &&
        formData.evidenceOfSubject3
      ) {
        registrationFormData.append("subjectId3", formData.subjectId3);
        registrationFormData.append(
          "evidenceOfSubject3",
          formData.evidenceOfSubject3
        );
        registrationFormData.append(
          "descriptionOfSubject3",
          formData.descriptionOfSubject3 || ""
        );
      }

      // 3. Availability (Append as 'dateTimeLearn' with Array structure)
      const dateTimeLearnArray = [];
      daysOfWeek.forEach((day) => {
        const dayData = availability[day];
        if (dayData.isSelected && dayData.times.length > 0) {
          const validTimes = dayData.times.filter((t) => !!t).sort();
          if (validTimes.length > 0) {
            dateTimeLearnArray.push({ day: day, times: validTimes });
          }
        }
      });
      registrationFormData.append(
        "dateTimeLearn",
        JSON.stringify(dateTimeLearnArray)
      ); // Append JSON string of the array

      // === End Appending Data ===

      console.log(
        "--- Submitting FormData (Structured as Sample - Flat Subjects, dateTimeLearn Array) ---"
      );
      for (let pair of registrationFormData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      // --- API Call ---
      try {
        const response = await Api({
          endpoint: "tutor-request/regis-to-tutor", // <<< CHECK YOUR ENDPOINT
          method: METHOD_TYPE.POST,
          data: registrationFormData,
        });
        if (response.success === true) {
          setSuccess("Đăng ký thành công! Hồ sơ của bạn sẽ được xét duyệt.");
          window.scrollTo({ top: 0, behavior: "smooth" });
          // Optional: Reset form state here
          // Optional: navigate('/success-page');
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
        setIsLoading(false);
      }
    },
    [
      validateForm,
      formData,
      availability,
      numberOfSubjects,
      isUploadingRegistrationAvatar, // Include this state
    ]
  );

  // --- Render Field Error ---
  const renderFieldError = useCallback(
    (fieldName) => {
      const error = fieldErrors[fieldName];
      return error ? <p className="field-error-message">{error}</p> : null;
    },
    [fieldErrors]
  );

  // --- Render Subject Section ---
  const renderSubjectSection = useCallback(
    (index) => {
      // Adjust suffix handling for index 1
      const suffix = index === 1 ? "" : index;
      const subjectIdKey = `subjectId${suffix}`;
      const evidenceKey = `evidenceOfSubject${suffix}`;
      const descriptionKey = `descriptionOfSubject${suffix}`;
      return (
        <div key={`subject-${index}`} className="subject-item form-grid">
          <div className="form-column">
            <h4>
              {" "}
              Môn Dạy {index}
              {index > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeSubjectSlot(index)}
                  title={`Xóa môn ${index}`}
                  disabled={isLoading || isUploadingRegistrationAvatar}
                >
                  {" "}
                  Xóa môn{" "}
                </button>
              )}
            </h4>
            <div className="form-group">
              <label htmlFor={subjectIdKey}>
                {" "}
                Môn học <span className="required-asterisk">*</span>{" "}
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
                {" "}
                Mô tả kinh nghiệm dạy môn này{" "}
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
                placeholder="Ví dụ: Kinh nghiệm gia sư..."
              />
              {renderFieldError(descriptionKey)}
            </div>
          </div>
          <div className="form-column">
            <div className="form-group">
              <GenericFileUploader
                label={`Minh chứng môn ${index} (Bảng điểm...)`}
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
      isLoading,
      isUploadingRegistrationAvatar,
    ]
  ); // Added dependencies

  // --- Main Render ---
  return (
    <HomePageLayout>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelected}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/jpg"
        disabled={isUploadingRegistrationAvatar || isLoading}
      />

      <div className="tutor-registration-container">
        <h2>Đăng Ký Làm Gia Sư</h2>
        <form
          onSubmit={handleSubmit}
          className="tutor-registration-form"
          noValidate
        >
          {/* Section 1: Personal & Academic Info */}
          <div className="form-section">
            <h3>I. Thông Tin Cá Nhân & Học Vấn</h3>
            <div className="form-grid">
              <div className="form-column">
                {" "}
                {/* Column 1 */}
                <div className="form-group">
                  {" "}
                  <label htmlFor="fullname">
                    {" "}
                    Họ và Tên <span className="required-asterisk">*</span>{" "}
                  </label>{" "}
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                  />{" "}
                  {renderFieldError("fullname")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="birthday">
                    {" "}
                    Ngày sinh <span className="required-asterisk">*</span>{" "}
                  </label>{" "}
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
                  />{" "}
                  {renderFieldError("birthday")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label>
                    {" "}
                    Giới tính <span className="required-asterisk">*</span>{" "}
                  </label>{" "}
                  <div className="radio-group">
                    {" "}
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
                    </label>{" "}
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
                    </label>{" "}
                  </div>{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="univercity">
                    {" "}
                    Trường Đại học <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>{" "}
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
                  />{" "}
                  {renderFieldError("univercity")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="majorId">
                    {" "}
                    Ngành học <span className="required-asterisk">*</span>{" "}
                  </label>{" "}
                  <MajorList
                    name="majorId"
                    value={formData.majorId}
                    onChange={handleInputChange}
                    required={true}
                  />{" "}
                  {renderFieldError("majorId")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="GPA">
                    {" "}
                    Điểm GPA (Hệ 4) <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>{" "}
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
                  />{" "}
                  {renderFieldError("GPA")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <GenericFileUploader
                    label="Minh chứng GPA (Bảng điểm)"
                    mediaCategory={MEDIA_CATEGORIES.GPA_PROOF}
                    initialFileUrl={formData.evidenceOfGPA}
                    onUploadComplete={handleUploadComplete}
                    onError={handleUploadError}
                    fileIdentifier="evidenceOfGPA"
                    promptText="Tải lên file ảnh hoặc PDF"
                  />{" "}
                  {renderFieldError("evidenceOfGPA")}{" "}
                </div>
              </div>
              <div className="form-column">
                {" "}
                {/* Column 2 */}
                <div className="form-group">
                  {" "}
                  <label>
                    {" "}
                    Ảnh đại diện <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>{" "}
                  <AvatarDisplay
                    imageUrl={avatarPreviewUrl}
                    onTriggerSelect={handleTriggerAvatarInput}
                  />{" "}
                  {isUploadingRegistrationAvatar && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        color: "#b41e2d",
                      }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faSpinner} spin size="lg" /> Đang
                      tải ảnh...{" "}
                    </div>
                  )}{" "}
                  {avatarUploadError && !isUploadingRegistrationAvatar && (
                    <p
                      className="field-error-message"
                      style={{ textAlign: "center", marginTop: "10px" }}
                    >
                      {avatarUploadError}
                    </p>
                  )}{" "}
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
                  )}{" "}
                  {renderFieldError("avatar")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="description">Giới thiệu bản thân</label>{" "}
                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    maxLength={1500}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    placeholder="Chia sẻ về kinh nghiệm..."
                  ></textarea>{" "}
                  {renderFieldError("description")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="videoUrl"> Link Video giới thiệu </label>{" "}
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    placeholder="https://..."
                  />{" "}
                  {renderFieldError("videoUrl")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="bankName">
                    {" "}
                    Tên ngân hàng <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>{" "}
                  <BankList
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required={true}
                  />{" "}
                  {renderFieldError("bankName")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="bankNumber">
                    {" "}
                    Số tài khoản <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>{" "}
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
                  />{" "}
                  {renderFieldError("bankNumber")}{" "}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Teaching Info */}
          <div className="form-section">
            <h3>II. Thông Tin Giảng Dạy</h3>
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  {" "}
                  <label htmlFor="teachingMethod">
                    {" "}
                    Phương thức dạy <span className="required-asterisk">
                      *
                    </span>{" "}
                  </label>{" "}
                  <select
                    id="teachingMethod"
                    name="teachingMethod"
                    value={formData.teachingMethod}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                  >
                    {" "}
                    <option value="ONLINE">Online</option>{" "}
                    <option value="OFFLINE">Offline</option>{" "}
                    <option value="BOTH">Cả hai</option>{" "}
                  </select>{" "}
                  {renderFieldError("teachingMethod")}{" "}
                </div>
                {(formData.teachingMethod === "OFFLINE" ||
                  formData.teachingMethod === "BOTH") && (
                  <div className="form-group">
                    {" "}
                    <label htmlFor="teachingPlace">
                      {" "}
                      Khu vực dạy Offline{" "}
                      <span className="required-asterisk">*</span>{" "}
                    </label>{" "}
                    <input
                      type="text"
                      id="teachingPlace"
                      name="teachingPlace"
                      value={formData.teachingPlace}
                      onChange={(e) =>
                        handleInputChange(e.target.name, e.target.value)
                      }
                      required
                      placeholder="Ví dụ: Q.Gò Vấp"
                    />{" "}
                    {renderFieldError("teachingPlace")}{" "}
                  </div>
                )}
              </div>
              <div className="form-column">
                <div className="form-group">
                  {" "}
                  <label>Giáo trình riêng</label>{" "}
                  <label className="checkbox-label">
                    {" "}
                    <input
                      type="checkbox"
                      name="isUseCurriculumn"
                      checked={formData.isUseCurriculumn}
                      onChange={(e) =>
                        handleInputChange(e.target.name, e.target.checked)
                      }
                    />{" "}
                    <span> Tôi có sử dụng giáo trình riêng </span>{" "}
                  </label>{" "}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Subjects */}
          <div className="form-section subject-info">
            <h3>III. Thông Tin Môn Đăng Ký Dạy</h3>
            {renderSubjectSection(1)}
            {numberOfSubjects >= 2 && renderSubjectSection(2)}
            {numberOfSubjects >= 3 && renderSubjectSection(3)}
            {numberOfSubjects < 3 && (
              <button
                type="button"
                className="add-button"
                onClick={addSubjectSlot}
                disabled={isLoading || isUploadingRegistrationAvatar}
              >
                {" "}
                + Thêm môn dạy{" "}
              </button>
            )}
          </div>

          {/* Section 4: Availability */}
          <div className="form-section availability-info">
            <h3>
              {" "}
              IV. Thời Gian Rảnh <span className="required-asterisk">
                *
              </span>{" "}
            </h3>
            <div className="form-group teaching-time-group availability-teaching-time">
              {" "}
              <label htmlFor="teachingTime">
                {" "}
                Thời gian mỗi buổi <span className="required-asterisk">
                  *
                </span>{" "}
              </label>{" "}
              <select
                id="teachingTime"
                name="teachingTime"
                value={formData.teachingTime}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                required
              >
                {" "}
                {teachingTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
              {renderFieldError("teachingTime")}{" "}
            </div>
            <p className="note availability-note">
              {" "}
              Chọn ngày rảnh và thêm **giờ bắt đầu** ca dạy. Khoảng cách tối
              thiểu là{" "}
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
                    {" "}
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={availability[day].isSelected}
                      readOnly
                      style={{ pointerEvents: "none" }}
                    />{" "}
                    <label htmlFor={`day-${day}`}>{`Thứ ${
                      day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
                    }`}</label>{" "}
                  </div>
                  {availability[day].isSelected && (
                    <div className="time-slots">
                      {availability[day].times.map((time, timeIndex) => (
                        <div
                          key={`${day}-${timeIndex}`}
                          className="time-slot-item"
                        >
                          {" "}
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
                          />{" "}
                          <span>(Giờ bắt đầu)</span>{" "}
                          <button
                            type="button"
                            className="remove-time-button"
                            onClick={() => removeTimeSlot(day, timeIndex)}
                            title="Xóa giờ"
                          >
                            {" "}
                            ×{" "}
                          </button>{" "}
                          {timeErrors[day] === timeIndex && (
                            <span className="time-slot-error-message">
                              {" "}
                              Giờ không hợp lệ{" "}
                            </span>
                          )}{" "}
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

          {/* Submit Actions */}
          <div className="form-actions">
            {formError && <p className="error-message">{formError}</p>}
            {success && <p className="success-message">{success}</p>}
            <p className="terms">
              {" "}
              Bằng việc nhấn nút, bạn đồng ý với{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                {" "}
                Điều khoản{" "}
              </a>{" "}
              và{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                {" "}
                Chính sách Bảo mật{" "}
              </a>
              .{" "}
            </p>
            <button
              type="submit"
              disabled={isLoading || isUploadingRegistrationAvatar}
            >
              {" "}
              {isLoading ? (
                <>
                  {" "}
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang gửi...{" "}
                </>
              ) : (
                "Hoàn Tất Đăng Ký"
              )}{" "}
            </button>
          </div>
        </form>
      </div>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onRequestClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropSave={handleCropSaveForRegistration}
        aspect={1}
        cropShape="round"
      />
    </HomePageLayout>
  );
};

export default TutorRegistrationForm;
