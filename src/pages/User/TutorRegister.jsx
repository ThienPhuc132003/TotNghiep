/* eslint-disable react/no-unescaped-entities */
// src/pages/User/TutorRegistrationForm.jsx
import { useCallback, useEffect, useState, useRef } from "react";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/TutorRegister.style.css";
import "../../assets/css/Modal.style.css";
import GenericFileUploader from "../../components/GenericFileUploader";
import BankList from "../../components/Static_Data/BankList";
import MajorList from "../../components/Static_Data/MajorList";
import SubjectList from "../../components/Static_Data/SubjectList";
import AvatarDisplay from "../../components/AvatarDisplay";
import ImageCropModal from "../../components/ImageCropModal";
import TutorLevelList from "../../components/Static_Data/TutorLevelList"; // Use Admin component temporarily if User version isn't ready
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import isEqual from "lodash/isEqual";

Modal.setAppElement("#root");

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
const STATUS_MAP = {
  REQUEST: { text: "Đang chờ duyệt", className: "status-request" },
  ACCEPT: { text: "Đã được duyệt", className: "status-approved" },
  REFUSE: { text: "Đã bị từ chối", className: "status-rejected" },
  CANCEL: { text: "Đã hủy", className: "status-cancelled" },
};

const TutorRegistrationForm = () => {
  // --- States ---
  const [isLoading, setIsLoading] = useState(false); // General loading for submit/update/cancel/public status
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
    desiredTutorLevelId: "",
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

  // --- States for Fetching Request ---
  const [requestData, setRequestData] = useState(null);
  const [isFetchingRequest, setIsFetchingRequest] = useState(true);
  const [fetchRequestError, setFetchRequestError] = useState(null);

  // --- State for Public Profile ---
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [isUpdatingPublicStatus, setIsUpdatingPublicStatus] = useState(false); // Specific loading for public status
  const [publicStatusError, setPublicStatusError] = useState("");

  // --- States for Change Detection ---
  const [initialFormData, setInitialFormData] = useState(null);
  const [initialAvailability, setInitialAvailability] = useState(null);
  const [initialNumberOfSubjects, setInitialNumberOfSubjects] = useState(1);
  const [hasFormChanges, setHasFormChanges] = useState(false);

  // --- Helper to Reset Form State ---
  const resetFormState = useCallback(() => {
    setFormData({
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
      desiredTutorLevelId: "",
    });
    setAvailability(
      daysOfWeek.reduce(
        (acc, day) => ({ ...acc, [day]: { isSelected: false, times: [] } }),
        {}
      )
    );
    setNumberOfSubjects(1);
    setAvatarPreviewUrl(null);
    setImageToCrop(null);
    setInitialFormData(null);
    setInitialAvailability(null);
    setInitialNumberOfSubjects(1);
    setHasFormChanges(false);
    setFieldErrors({});
    setFileUploadErrors({});
    setTimeErrors(
      daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: null }), {})
    );
    setFormError("");
    setSuccess("");
    setAvatarUploadError("");
    setAvatarUploadSuccess("");
    setRequestData(null);
    setIsPublicProfile(false);
    setPublicStatusError("");
    setIsUpdatingPublicStatus(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, []);

  // --- Function to Populate Form with API Data ---
  const populateFormWithData = useCallback(
    (data) => {
      if (!data) {
        resetFormState();
        return;
      }
      const currentForm = {
        fullname: data.fullname || "",
        majorId: data.majorId || "",
        birthday: data.birthday || "",
        gender: data.gender || "MALE",
        bankNumber: data.bankNumber || "",
        bankName: data.bankName || "",
        avatar: data.avatar || "",
        description: data.description || "",
        univercity: data.univercity || "Đại học Văn Lang",
        GPA: String(data.GPA || ""),
        evidenceOfGPA: data.evidenceOfGPA || "",
        teachingTime: teachingTimeOptions.some(
          (opt) => opt.value === parseFloat(data.teachingTime)
        )
          ? parseFloat(data.teachingTime)
          : 2,
        videoUrl: data.videoUrl || "",
        teachingMethod: data.teachingMethod || "ONLINE",
        teachingPlace: data.teachingPlace || "",
        isUseCurriculumn: data.isUseCurriculumn || false,
        subjectId: data.subjectId || "",
        evidenceOfSubject: data.evidenceOfSubject || "",
        descriptionOfSubject: data.descriptionOfSubject || "",
        subjectId2: data.subjectId2 || "",
        evidenceOfSubject2: data.evidenceOfSubject2 || "",
        descriptionOfSubject2: data.descriptionOfSubject2 || "",
        subjectId3: data.subjectId3 || "",
        evidenceOfSubject3: data.evidenceOfSubject3 || "",
        descriptionOfSubject3: data.descriptionOfSubject3 || "",
        desiredTutorLevelId: data.tutorLevelId || "",
      };
      setFormData(currentForm);
      const currentAvailability = daysOfWeek.reduce(
        (acc, day) => ({ ...acc, [day]: { isSelected: false, times: [] } }),
        {}
      );
      if (data.dateTimeLearn && Array.isArray(data.dateTimeLearn)) {
        data.dateTimeLearn.forEach((jsonString) => {
          try {
            const parsed = JSON.parse(jsonString);
            if (
              parsed.day &&
              daysOfWeek.includes(parsed.day) &&
              Array.isArray(parsed.times)
            ) {
              currentAvailability[parsed.day] = {
                isSelected: true,
                times:
                  parsed.times
                    .filter(
                      (t) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t)
                    )
                    .sort() || [],
              };
            }
          } catch (error) {
            console.error("Error parsing dateTimeLearn:", jsonString, error);
          }
        });
      }
      setAvailability(currentAvailability);
      let subjectCount = 0;
      if (data.subjectId) subjectCount = 1;
      if (data.subjectId2) subjectCount = 2;
      if (data.subjectId3) subjectCount = 3;
      setNumberOfSubjects(subjectCount || 1);
      setAvatarPreviewUrl(data.avatar || null);
      setIsPublicProfile(data.isPublicProfile || false);
      setInitialFormData(currentForm);
      setInitialAvailability(currentAvailability);
      setInitialNumberOfSubjects(subjectCount || 1);
      setHasFormChanges(false);
      setTimeErrors(
        daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: null }), {})
      );
      setFieldErrors({});
      setFormError("");
      setSuccess("");
      setAvatarUploadError("");
      setAvatarUploadSuccess("");
      setFileUploadErrors({});
      setPublicStatusError("");
    },
    [resetFormState]
  );

  // --- Effect to Check for Changes ---
  useEffect(() => {
    // Only check for changes if initial data has been set and not currently fetching initial data
    if (initialFormData && initialAvailability && !isFetchingRequest) {
      const formDataChanged = !isEqual(formData, initialFormData);
      const availabilityChanged = !isEqual(availability, initialAvailability);
      const subjectsChanged = numberOfSubjects !== initialNumberOfSubjects;
      setHasFormChanges(
        formDataChanged || availabilityChanged || subjectsChanged
      );
    } else {
      setHasFormChanges(false);
    }
  }, [
    formData,
    availability,
    numberOfSubjects,
    initialFormData,
    initialAvailability,
    initialNumberOfSubjects,
    isFetchingRequest,
  ]);

  // --- Fetch Data Effect ---
  const fetchData = useCallback(async () => {
    setIsFetchingRequest(true);
    setFetchRequestError(null);
    setRequestData(null);
    try {
      const response = await Api({
        endpoint: "tutor-request/get-my-newest-request",
        method: METHOD_TYPE.GET,
      });
      if (response.success && response.data) {
        if (response.data.status === "CANCEL") {
          resetFormState();
        } else {
          setRequestData(response.data);
          populateFormWithData(response.data);
        }
      } else if (response.status === 404 || !response.data) {
        resetFormState();
        setRequestData(null);
      } else {
        throw new Error(response.message || "Failed to load data.");
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        setFetchRequestError(error.message || "Error loading data.");
      } else {
        resetFormState();
        setRequestData(null);
      }
      console.error("Fetch error:", error);
    } finally {
      setIsFetchingRequest(false);
    }
  }, [populateFormWithData, resetFormState]);
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Removed fetchData from dependency array of populateFormWithData to avoid loop
  useEffect(() => {
    const targetAvatar = requestData?.avatar || formData.avatar;
    if (targetAvatar && !avatarPreviewUrl?.startsWith("blob:")) {
      setAvatarPreviewUrl(targetAvatar);
    }
  }, [formData.avatar, requestData, avatarPreviewUrl]);
  useEffect(() => {
    const currentPreviewUrl = avatarPreviewUrl;
    return () => {
      if (currentPreviewUrl && currentPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  // --- Upload Callbacks ---
  const handleUploadComplete = useCallback(
    (url, identifier) => {
      setFileUploadErrors((prev) => ({ ...prev, [identifier]: "" }));
      setFieldErrors((prev) => ({ ...prev, [identifier]: undefined }));
      if (
        identifier.startsWith("evidenceOfSubject") ||
        identifier === "evidenceOfGPA"
      ) {
        setFormData((prev) => ({ ...prev, [identifier]: url }));
      } else if (identifier in formData) {
        setFormData((prev) => ({ ...prev, [identifier]: url }));
      } else {
        console.warn("Unknown identifier:", identifier);
      }
      setSuccess("");
      setFormError("");
    },
    [formData]
  );
  const handleUploadError = useCallback((message, identifier) => {
    const userMsg = message || "Upload thất bại";
    setFileUploadErrors((prev) => ({ ...prev, [identifier]: userMsg }));
    setFieldErrors((prev) => ({ ...prev, [identifier]: userMsg }));
    setSuccess("");
    setFormError("");
  }, []);

  // --- Subject Handlers ---
  const addSubjectSlot = useCallback(() => {
    if (numberOfSubjects < 3) setNumberOfSubjects((p) => p + 1);
  }, [numberOfSubjects]);
  const removeSubjectSlot = useCallback(
    (index) => {
      const suffix = index === 1 ? "" : index;
      const idKey = `subjectId${suffix}`;
      const evKey = `evidenceOfSubject${suffix}`;
      const descKey = `descriptionOfSubject${suffix}`;
      const resetFields = { [idKey]: "", [evKey]: "", [descKey]: "" };
      const resetErrors = {
        [idKey]: undefined,
        [evKey]: undefined,
        [descKey]: undefined,
      };
      setFormData((prev) => ({ ...prev, ...resetFields }));
      setFieldErrors((prev) => ({ ...prev, ...resetErrors }));
      setFileUploadErrors((prev) => ({ ...prev, [evKey]: "" }));
      if (index === 2 && numberOfSubjects === 3) {
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
        const resetSub3 = {
          subjectId3: "",
          evidenceOfSubject3: "",
          descriptionOfSubject3: "",
        };
        const resetSub3Errors = {
          subjectId3: undefined,
          evidenceOfSubject3: undefined,
          descriptionOfSubject3: undefined,
        };
        setFormData((prev) => ({ ...prev, ...dataToMove, ...resetSub3 }));
        setFieldErrors((prev) => ({
          ...prev,
          ...errorsToMove,
          ...resetSub3Errors,
        }));
        setFileUploadErrors((prev) => ({
          ...prev,
          evidenceOfSubject2: fileErrorToMove,
          evidenceOfSubject3: "",
        }));
      }
      setNumberOfSubjects((prev) => prev - 1);
      setSuccess("");
      setFormError("");
    },
    [numberOfSubjects, formData, fieldErrors, fileUploadErrors]
  );

  // --- Availability Handlers ---
  const getTeachingTimeMinutes = useCallback(() => {
    const time = parseFloat(formData.teachingTime);
    return !isNaN(time) && time > 0 ? Math.round(time * 60) : 120;
  }, [formData.teachingTime]);
  const validateTimeSlotsForDay = useCallback((day, times, interval) => {
    if (!times || times.length === 0) return null;
    if (times.length > 0) {
      const emptyIdx = times.findIndex((t) => !t);
      if (emptyIdx !== -1) return { type: "empty", index: emptyIdx };
    }
    if (times.length <= 1) return null;
    const validSorted = [...times].filter((t) => !!t).sort();
    if (validSorted.length <= 1) return null;
    for (let i = 1; i < validSorted.length; i++) {
      try {
        const [h1, m1] = validSorted[i - 1].split(":").map(Number);
        const [h2, m2] = validSorted[i].split(":").map(Number);
        if (h2 * 60 + m2 < h1 * 60 + m1 + interval) {
          const origIdx = times.findIndex((t) => t === validSorted[i]);
          return { type: "interval", index: origIdx !== -1 ? origIdx : i };
        }
      } catch (e) {
        const origIdx = times.findIndex((t) => t === validSorted[i]);
        return { type: "format", index: origIdx !== -1 ? origIdx : i };
      }
    }
    return null;
  }, []);
  const validateAllAvailability = useCallback(() => {
    const interval = getTeachingTimeMinutes();
    const newErrors = {};
    let hasError = false;
    daysOfWeek.forEach((day) => {
      const dayData = availability[day];
      if (dayData.isSelected && dayData.times.length > 0) {
        const errorInfo = validateTimeSlotsForDay(day, dayData.times, interval);
        newErrors[day] = errorInfo ? errorInfo.index : null;
        if (errorInfo) hasError = true;
      } else {
        newErrors[day] = null;
      }
    });
    setTimeErrors(newErrors);
    return !hasError;
  }, [availability, getTeachingTimeMinutes, validateTimeSlotsForDay]);
  const handleInputChange = useCallback(
    (name, value) => {
      let processedValue = value;
      if (name === "isUseCurriculumn") {
        processedValue = Boolean(value);
      } else if (name === "teachingTime") {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) ? "" : numValue;
        if (processedValue !== formData.teachingTime) {
          setTimeout(validateAllAvailability, 0);
        }
      } else if (name === "GPA") {
        if (
          value === "" ||
          /^\d?$/.test(value) ||
          /^\d\.$/.test(value) ||
          /^\d\.\d{0,2}$/.test(value)
        ) {
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
      if (success) setSuccess("");
    },
    [fieldErrors, formData, formError, success, validateAllAvailability]
  );
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
      setSuccess("");
      setFormError("");
    },
    [availability, fieldErrors]
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
      setSuccess("");
      setFormError("");
    },
    [fieldErrors]
  );
  const removeTimeSlot = useCallback(
    (day, index) => {
      const newTimes = availability[day].times.filter((_, i) => i !== index);
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: newTimes },
      }));
      const interval = getTeachingTimeMinutes();
      const errorInfo = validateTimeSlotsForDay(day, newTimes, interval);
      setTimeErrors((prev) => ({
        ...prev,
        [day]: errorInfo ? errorInfo.index : null,
      }));
      if (fieldErrors.availability) {
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      }
      setSuccess("");
      setFormError("");
    },
    [availability, getTeachingTimeMinutes, validateTimeSlotsForDay, fieldErrors]
  );
  const handleTimeChange = useCallback(
    (day, index, value) => {
      const currentTimes = [...availability[day].times];
      currentTimes[index] = value;
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: currentTimes },
      }));
      const interval = getTeachingTimeMinutes();
      const errorInfo = validateTimeSlotsForDay(day, currentTimes, interval);
      setTimeErrors((prev) => ({
        ...prev,
        [day]: errorInfo ? errorInfo.index : null,
      }));
      if (fieldErrors.availability) {
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      }
      setSuccess("");
      setFormError("");
    },
    [availability, getTeachingTimeMinutes, validateTimeSlotsForDay, fieldErrors]
  );

  // --- Avatar Handlers ---
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
        const msg = "Vui lòng chọn file ảnh hợp lệ.";
        setFieldErrors((prev) => ({ ...prev, avatar: msg }));
        setAvatarUploadError(msg);
        setAvatarUploadSuccess("");
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
      reader.onerror = () => {
        const msg = "Không thể đọc file ảnh.";
        setFieldErrors((prev) => ({ ...prev, avatar: msg }));
        setAvatarUploadError(msg);
      };
      reader.readAsDataURL(file);
    },
    [formError]
  );
  const handleCropSaveForRegistration = useCallback(
    async (blob) => {
      setIsCropModalOpen(false);
      if (!blob) {
        setImageToCrop(null);
        return;
      }
      setIsUploadingRegistrationAvatar(true);
      setAvatarUploadError("");
      setAvatarUploadSuccess("");
      setFieldErrors((prev) => ({ ...prev, avatar: undefined }));
      setFormError("");
      try {
        const fnRes = await Api({
          endpoint: "media/media-url",
          query: { mediaCategory: MEDIA_CATEGORIES.TUTOR_AVATAR },
          method: METHOD_TYPE.GET,
        });
        if (!fnRes?.success || !fnRes?.data?.fileName)
          throw new Error(fnRes?.message || "Lỗi lấy định danh avatar.");
        const fileName = fnRes.data.fileName;
        const fData = new FormData();
        fData.append("file", blob, `${fileName}.jpeg`);
        const upRes = await Api({
          endpoint: `media/upload-media`,
          query: { mediaCategory: MEDIA_CATEGORIES.TUTOR_AVATAR, fileName },
          method: METHOD_TYPE.POST,
          data: fData,
        });
        if (!upRes?.success || !upRes?.data?.mediaUrl)
          throw new Error(upRes?.message || "Upload ảnh thất bại.");
        const finalUrl = upRes.data.mediaUrl;
        setFormData((prev) => ({ ...prev, avatar: finalUrl }));
        if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreviewUrl);
        }
        setAvatarPreviewUrl(finalUrl);
        setImageToCrop(null);
        setAvatarUploadSuccess("Upload ảnh đại diện thành công!");
      } catch (err) {
        console.error("Lỗi upload avatar:", err);
        setAvatarPreviewUrl(formData.avatar || null);
        const msg = `Lỗi upload: ${err.message || "Không xác định"}`;
        setAvatarUploadError(msg);
        setFieldErrors((prev) => ({ ...prev, avatar: msg }));
      } finally {
        setIsUploadingRegistrationAvatar(false);
      }
    },
    [avatarPreviewUrl, formData.avatar]
  );
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
    if (!formData.fullname.trim()) errors.fullname = "Vui lòng nhập họ tên.";
    if (!formData.majorId) errors.majorId = "Vui lòng chọn khoa.";
    if (!formData.birthday) errors.birthday = "Vui lòng chọn ngày sinh.";
    if (!formData.bankNumber.trim() || !/^\d+$/.test(formData.bankNumber))
      errors.bankNumber = "Số tài khoản không hợp lệ.";
    if (!formData.bankName) errors.bankName = "Vui lòng chọn ngân hàng.";
    if (!formData.univercity.trim())
      errors.univercity = "Vui lòng nhập tên trường.";
    if (
      formData.GPA === "" ||
      isNaN(parseFloat(formData.GPA)) ||
      parseFloat(formData.GPA) < 0 ||
      parseFloat(formData.GPA) > 4
    )
      errors.GPA = "GPA không hợp lệ (0.00 - 4.00).";
    if (!formData.teachingTime)
      errors.teachingTime = "Vui lòng chọn thời gian mỗi tiết.";
    else if (formData.teachingTime < 1 || formData.teachingTime > 3)
      errors.teachingTime = "Thời gian tiết dạy không hợp lệ (1h - 3h).";
    if (formData.videoUrl && !/^https?:\/\/.+/.test(formData.videoUrl))
      errors.videoUrl = "URL video không hợp lệ.";
    if (
      (formData.teachingMethod === "OFFLINE" ||
        formData.teachingMethod === "BOTH") &&
      !formData.teachingPlace.trim()
    )
      errors.teachingPlace = "Vui lòng nhập khu vực dạy Offline.";
    if (!formData.avatar) errors.avatar = "Vui lòng tải ảnh đại diện.";
    else if (avatarUploadError) errors.avatar = avatarUploadError;
    if (fileUploadErrors["evidenceOfGPA"])
      errors.evidenceOfGPA = `Minh chứng GPA: ${fileUploadErrors["evidenceOfGPA"]}`;
    const validateSub = (idx) => {
      const sfx = idx === 1 ? "" : idx;
      const idKey = `subjectId${sfx}`;
      const evKey = `evidenceOfSubject${sfx}`;
      let hasErr = false;
      if (idx <= numberOfSubjects) {
        if (!formData[idKey]) {
          errors[idKey] = `Chọn môn học ${idx}.`;
          hasErr = true;
        }
        if (!formData[evKey]) {
          errors[evKey] = `Tải minh chứng môn ${idx}.`;
          hasErr = true;
        } else if (fileUploadErrors[evKey]) {
          errors[evKey] = `Minh chứng ${idx}: ${fileUploadErrors[evKey]}`;
          hasErr = true;
        }
      }
      return hasErr;
    };
    if (validateSub(1)) isValid = false;
    if (validateSub(2)) isValid = false;
    if (validateSub(3)) isValid = false;
    let hasSelDay = false;
    let hasValidTime = false;
    let timeValErr = null;
    const currAvailErrs = {};
    daysOfWeek.forEach((day) => {
      const dayData = availability[day];
      if (dayData.isSelected) {
        hasSelDay = true;
        if (dayData.times.length > 0) {
          const errInfo = validateTimeSlotsForDay(
            day,
            dayData.times,
            minInterval
          );
          currAvailErrs[day] = errInfo ? errInfo.index : null;
          if (errInfo && !timeValErr) {
            const dayNm = `Thứ ${
              day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
            }`;
            if (errInfo.type === "empty")
              timeValErr = `Nhập giờ bắt đầu cho ${dayNm}.`;
            else if (errInfo.type === "interval")
              timeValErr = `Giờ dạy ${dayNm} cách nhau ${teachingHoursLabel}.`;
            else timeValErr = `Giờ ${dayNm} không đúng định dạng.`;
          }
          if (!errInfo && dayData.times.some((t) => !!t)) hasValidTime = true;
        } else {
          if (!timeValErr)
            timeValErr = `Thêm giờ bắt đầu cho Thứ ${
              day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
            }.`;
        }
      } else {
        currAvailErrs[day] = null;
      }
    });
    setTimeErrors(currAvailErrs);
    if (!hasSelDay) errors.availability = "Chọn ít nhất một ngày rảnh.";
    else if (!hasValidTime && !timeValErr)
      errors.availability = "Thêm ít nhất một giờ bắt đầu hợp lệ.";
    else if (timeValErr) errors.availability = timeValErr;
    isValid = Object.keys(errors).length === 0;
    setFieldErrors(errors);
    if (!isValid)
      setFormError(
        errors.avatar ||
          errors.availability ||
          Object.values(errors).find((e) => e) ||
          "Kiểm tra lại thông tin."
      );
    else setFormError("");
    return isValid;
  }, [
    formData,
    numberOfSubjects,
    fileUploadErrors,
    availability,
    getTeachingTimeMinutes,
    validateTimeSlotsForDay,
    avatarUploadError,
  ]);

  // --- Helper to build request data payload ---
  const buildRequestDataPayload = useCallback(() => {
    const payload = {
      fullname: formData.fullname,
      majorId: formData.majorId,
      birthday: formData.birthday,
      gender: formData.gender,
      bankNumber: formData.bankNumber,
      bankName: formData.bankName,
      description: formData.description || "",
      univercity: formData.univercity,
      GPA: parseFloat(formData.GPA) || 0,
      teachingTime: parseFloat(formData.teachingTime) || 0,
      teachingMethod: formData.teachingMethod,
      isUseCurriculumn: formData.isUseCurriculumn,
      avatar: formData.avatar || null,
      ...(formData.evidenceOfGPA && { evidenceOfGPA: formData.evidenceOfGPA }),
      ...(formData.videoUrl && { videoUrl: formData.videoUrl }),
      ...(formData.teachingMethod !== "ONLINE" &&
        formData.teachingPlace && { teachingPlace: formData.teachingPlace }),
      ...(formData.subjectId &&
        formData.evidenceOfSubject && {
          subjectId: formData.subjectId,
          evidenceOfSubject: formData.evidenceOfSubject,
          descriptionOfSubject: formData.descriptionOfSubject || "",
        }),
      ...(numberOfSubjects >= 2 &&
        formData.subjectId2 &&
        formData.evidenceOfSubject2 && {
          subjectId2: formData.subjectId2,
          evidenceOfSubject2: formData.evidenceOfSubject2,
          descriptionOfSubject2: formData.descriptionOfSubject2 || "",
        }),
      ...(numberOfSubjects >= 3 &&
        formData.subjectId3 &&
        formData.evidenceOfSubject3 && {
          subjectId3: formData.subjectId3,
          evidenceOfSubject3: formData.evidenceOfSubject3,
          descriptionOfSubject3: formData.descriptionOfSubject3 || "",
        }),
      ...(formData.desiredTutorLevelId && {
        tutorLevelId: formData.desiredTutorLevelId,
      }),
      dateTimeLearn: daysOfWeek
        .filter(
          (day) =>
            availability[day].isSelected &&
            availability[day].times.some((t) => !!t)
        )
        .map((day) => {
          const validTimes = availability[day].times.filter((t) => !!t).sort();
          return { day: day, times: validTimes };
        }),
    };
    if (payload.tutorLevelId === "") {
      delete payload.tutorLevelId;
    }
    return payload;
  }, [formData, numberOfSubjects, availability]);

  // --- Handle Create New Request ---
  const handleCreateRequest = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");
      setSuccess("");
      setAvatarUploadError("");
      setAvatarUploadSuccess("");
      if (isUploadingRegistrationAvatar) {
        setFormError("Đang xử lý ảnh...");
        return;
      }
      if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setIsLoading(true);
      const registrationData = buildRequestDataPayload();
      console.log(
        "--- Submitting JSON Data for NEW Request ---",
        registrationData
      );
      try {
        const response = await Api({
          endpoint: "tutor-request/regis-to-tutor",
          method: METHOD_TYPE.POST,
          data: registrationData,
          headers: { "Content-Type": "application/json" },
        });
        if (response.success === true && response.data) {
          toast.success("Đăng ký thành công! Hồ sơ đang chờ duyệt.");
          setRequestData(response.data);
          populateFormWithData(response.data);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          throw new Error(response.message || "Đăng ký thất bại.");
        }
      } catch (apiError) {
        console.error("Create Request Error:", apiError);
        toast.success(`Đăng ký thành công `);
        setFormError(apiError.message || "Lỗi đăng ký.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsLoading(false);
      }
    },
    [
      validateForm,
      isUploadingRegistrationAvatar,
      buildRequestDataPayload,
      populateFormWithData,
    ]
  );

  // --- Handle Profile Update ---
  const handleProfileUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");
      setSuccess("");
      setAvatarUploadError("");
      setAvatarUploadSuccess("");
      if (isUploadingRegistrationAvatar) {
        setFormError("Đang xử lý ảnh...");
        return;
      }
      const currentStatus = requestData?.status;
      if (!hasFormChanges && currentStatus === "ACCEPT") {
        return;
      }
      if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!requestData?.tutorRequestId) {
        setFormError("Không tìm thấy ID yêu cầu/hồ sơ.");
        return;
      }
      setIsLoading(true);
      const updateData = buildRequestDataPayload();
      const endpoint = `tutor-request/regis-to-tutor`;
      console.log(
        `--- Submitting JSON Data for Update (${endpoint}) ---`,
        updateData
      );
      try {
        const response = await Api({
          endpoint: endpoint,
          method: METHOD_TYPE.POST,
          data: updateData,
          headers: { "Content-Type": "application/json" },
        });
        if (response.success === true) {
          toast.success("Cập nhật thông tin thành công!");
          let newData = requestData;
          if (response.data) {
            newData = response.data;
            setRequestData(newData);
          } else {
            newData = {
              ...requestData,
              ...updateData,
              tutorLevelId: updateData.tutorLevelId || requestData.tutorLevelId,
            };
            setRequestData(newData);
          }
          populateFormWithData(newData);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          throw new Error(response.message || "Cập nhật thất bại.");
        }
      } catch (apiError) {
        console.error("Profile Update Error:", apiError);
        toast.error(
          `Cập nhật thất bại: ${apiError.message || "Lỗi không xác định"}`
        );
        setFormError(apiError.message || "Lỗi cập nhật.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsLoading(false);
      }
    },
    [
      validateForm,
      requestData,
      isUploadingRegistrationAvatar,
      buildRequestDataPayload,
      populateFormWithData,
      hasFormChanges,
    ]
  ); // Keep fetchData dep

  // --- Handle Cancel Request ---
  const handleCancelRequest = useCallback(async () => {
    if (!requestData?.tutorRequestId) return;
    if (
      !window.confirm(
        `Bạn chắc muốn hủy yêu cầu ${requestData.tutorRequestId}?`
      )
    )
      return;
    setIsLoading(true);
    setFormError("");
    setSuccess("");
    try {
      const response = await Api({
        endpoint: `tutor-request/cancel-request/${requestData.tutorRequestId}`,
        method: METHOD_TYPE.PUT,
        data: { status: "CANCEL" },
        headers: { "Content-Type": "application/json" },
      });
      if (response.success) {
        toast.success("Yêu cầu đã được hủy.");
        resetFormState();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(response.message || "Hủy thất bại.");
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      toast.error(`Hủy thất bại: ${error.message || "Lỗi không xác định"}`);
      setFormError(`Lỗi hủy: ${error.message || "Không xác định"}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  }, [requestData, resetFormState]);

  // --- Handlers for Public/Private Status ---
  const updatePublicStatus = async (makePublic) => {
    setIsUpdatingPublicStatus(true);
    setPublicStatusError("");
    setSuccess("");
    console.log(`Setting public profile to: ${makePublic}`);
    try {
      const response = await Api({
        endpoint: `user/update-public-tutor-profile`,
        method: METHOD_TYPE.PUT,
        data: { isPublicProfile: makePublic },
        headers: { "Content-Type": "application/json" },
      });
      if (response.success) {
        setIsPublicProfile(makePublic);
        toast.success(
          `Hồ sơ đã được ${makePublic ? "công khai" : "ẩn"} thành công.`
        );
        setRequestData((prev) =>
          prev ? { ...prev, isPublicProfile: makePublic } : null
        );
      } else {
        throw new Error(response.message || "Cập nhật thất bại.");
      }
    } catch (error) {
      console.error("Update Public Status Error:", error);
      toast.error(
        `Cập nhật trạng thái thất bại: ${error.message || "Lỗi không xác định"}`
      );
      setPublicStatusError(`Lỗi: ${error.message || "Không xác định"}.`);
    } finally {
      setIsUpdatingPublicStatus(false);
    }
  };
  const handleMakePublic = () => {
    updatePublicStatus(true);
  };
  const handleMakePrivate = () => {
    updatePublicStatus(false);
  };

  // --- Render Helpers ---
  const renderFieldError = useCallback(
    (fieldName) => {
      const error = fieldErrors[fieldName];
      return error ? <p className="field-error-message">{error}</p> : null;
    },
    [fieldErrors]
  );
  const renderSubjectSection = useCallback(
    (index) => {
      const suffix = index === 1 ? "" : index;
      return (
        <div key={`subject-${index}`} className="subject-item form-grid">
          {" "}
          <div className="form-column">
            {" "}
            <h4>
              {" "}
              Môn Dạy {index}{" "}
              {index > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeSubjectSlot(index)}
                  title={`Xóa môn ${index}`}
                  disabled={
                    isLoading ||
                    isUploadingRegistrationAvatar ||
                    index <= 1 ||
                    numberOfSubjects < index
                  }
                >
                  {" "}
                  Xóa môn{" "}
                </button>
              )}{" "}
            </h4>{" "}
            <div className="form-group">
              {" "}
              <label htmlFor={`subjectId${suffix}`}>
                {" "}
                Môn học <span className="required-asterisk">*</span>{" "}
              </label>{" "}
              <SubjectList
                name={`subjectId${suffix}`}
                value={formData[`subjectId${suffix}`]}
                onChange={handleInputChange}
                required={true}
                disabled={isLoading}
              />{" "}
              {renderFieldError(`subjectId${suffix}`)}{" "}
            </div>{" "}
            <div className="form-group">
              {" "}
              <label htmlFor={`descriptionOfSubject${suffix}`}>
                {" "}
                Mô tả kinh nghiệm{" "}
              </label>{" "}
              <textarea
                id={`descriptionOfSubject${suffix}`}
                name={`descriptionOfSubject${suffix}`}
                rows="4"
                maxLength={500}
                value={formData[`descriptionOfSubject${suffix}`]}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                placeholder="..."
                disabled={isLoading}
              />{" "}
              {renderFieldError(`descriptionOfSubject${suffix}`)}{" "}
            </div>{" "}
          </div>{" "}
          <div className="form-column">
            {" "}
            <div className="form-group">
              {" "}
              <GenericFileUploader
                label={`Minh chứng môn ${index}`}
                mediaCategory={MEDIA_CATEGORIES.SUBJECT_PROOF}
                initialFileUrl={formData[`evidenceOfSubject${suffix}`]}
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
                required={true}
                fileIdentifier={`evidenceOfSubject${suffix}`}
                promptText="Tải file ảnh/PDF"
                disabled={isLoading || isUploadingRegistrationAvatar}
              />{" "}
              {renderFieldError(`evidenceOfSubject${suffix}`)}{" "}
            </div>{" "}
          </div>{" "}
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
      numberOfSubjects,
    ]
  );

  // --- Main Render ---
  if (isFetchingRequest) {
    return (
      <>
        <div className="tutor-registration-container loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Đang tải...</p>
        </div>
      </>
    );
  }
  if (fetchRequestError) {
    return (
      <>
        <div className="tutor-registration-container error-container">
          <h3>Lỗi</h3>
          <p>{fetchRequestError}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </>
    );
  }

  const currentStatus = requestData?.status;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelected}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/jpg"
        disabled={isUploadingRegistrationAvatar || isLoading}
      />

      <div className="tutor-registration-container">
        <h2>
          {" "}
          {requestData ? "Thông Tin Hồ Sơ Gia Sư" : "Đăng Ký Làm Gia Sư"}{" "}
        </h2>
        <form
          onSubmit={requestData ? handleProfileUpdate : handleCreateRequest}
          className="tutor-registration-form"
          noValidate
        >
          {/* --- Section 1: Personal & Academic Info --- */}
          <div className="form-section">
            <h3>I. Thông Tin Cá Nhân & Học Vấn</h3>
            <div className="form-grid">
              <div className="form-column">
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                    placeholder="Đại học Văn Lang"
                    disabled={isLoading}
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
                    disabled={isLoading}
                    placeholder="Chọn ngành học của bạn" 
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
                    placeholder="VD: 3.50"
                    disabled={isLoading}
                  />{" "}
                  {renderFieldError("GPA")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <GenericFileUploader
                    label="Minh chứng GPA"
                    mediaCategory={MEDIA_CATEGORIES.GPA_PROOF}
                    initialFileUrl={formData.evidenceOfGPA}
                    onUploadComplete={handleUploadComplete}
                    onError={handleUploadError}
                    fileIdentifier="evidenceOfGPA"
                    promptText="Tải file ảnh/PDF"
                    disabled={isLoading || isUploadingRegistrationAvatar}
                  />{" "}
                  {renderFieldError("evidenceOfGPA")}{" "}
                </div>
              </div>
              <div className="form-column">
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
                    disabled={isLoading || isUploadingRegistrationAvatar}
                  />{" "}
                  {isUploadingRegistrationAvatar && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "10px",
                        color: "#b41e2d",
                      }}
                    >
                      <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
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
                    placeholder="Chia sẻ kinh nghiệm..."
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />{" "}
                  {renderFieldError("bankNumber")}{" "}
                </div>
              </div>
            </div>
          </div>

          {/* --- Section 2: Teaching Info --- */}
          <div className="form-section">
            <h3>II. Thông Tin Giảng Dạy</h3>
            <div className="form-grid">
              <div className="form-column">
                {" "}
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
                    disabled={isLoading}
                  >
                    {" "}
                    <option value="ONLINE">Online</option>{" "}
                    <option value="OFFLINE">Offline</option>{" "}
                    <option value="BOTH">Cả hai</option>{" "}
                  </select>{" "}
                  {renderFieldError("teachingMethod")}{" "}
                </div>{" "}
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
                      placeholder="VD: Q.Gò Vấp"
                      disabled={isLoading}
                    />{" "}
                    {renderFieldError("teachingPlace")}{" "}
                  </div>
                )}{" "}
              </div>
              <div className="form-column">
                {" "}
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
                      disabled={isLoading}
                    />{" "}
                    <span> Tôi có sử dụng giáo trình riêng </span>{" "}
                  </label>{" "}
                </div>{" "}
              </div>
            </div>
          </div>

          {/* --- Section 3: Subjects --- */}
          <div className="form-section subject-info">
            <h3>III. Thông Tin Môn Đăng Ký Dạy</h3>
            {renderSubjectSection(1)}{" "}
            {numberOfSubjects >= 2 && renderSubjectSection(2)}{" "}
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

          {/* --- Section 4: Availability --- */}
          <div className="form-section availability-info">
            <h3> IV. Thời Gian Rảnh</h3>
            <div className="form-group teaching-time-group availability-teaching-time">
              {" "}
              <label htmlFor="teachingTime">
                {" "}
                Thời gian tối đa có thể dạy mỗi buổi{" "}
                <span className="required-asterisk">*</span>{" "}
              </label>{" "}
              <select
                id="teachingTime"
                name="teachingTime"
                value={formData.teachingTime}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                required
                disabled={isLoading}
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
              Chọn ngày rảnh, thêm giờ bắt đầu. Cách nhau tối thiểu{" "}
              <strong>
                {" "}
                {formatTeachingTime(formData.teachingTime) || "2h"}{" "}
              </strong>
              .{" "}
            </p>{" "}
            {renderFieldError("availability")}
            <div className="availability-grid">
              {" "}
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`day-column ${
                    availability[day].isSelected ? "selected" : ""
                  } ${timeErrors[day] !== null ? "has-error" : ""}`}
                >
                  {" "}
                  <div
                    className="day-header"
                    onClick={() => !isLoading && handleDayToggle(day)}
                    role={!isLoading ? "button" : undefined}
                    tabIndex={!isLoading ? 0 : -1}
                    onKeyDown={(e) =>
                      !isLoading &&
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
                      disabled={isLoading}
                      style={{ pointerEvents: "none" }}
                    />{" "}
                    <label htmlFor={`day-${day}`}>{`Thứ ${
                      day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
                    }`}</label>{" "}
                  </div>{" "}
                  {availability[day].isSelected && (
                    <div className="time-slots">
                      {" "}
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
                            disabled={isLoading}
                          />{" "}
                          <span>(Bắt đầu)</span>{" "}
                          <button
                            type="button"
                            className="remove-time-button"
                            onClick={() => removeTimeSlot(day, timeIndex)}
                            title="Xóa giờ"
                            disabled={
                              isLoading || isUploadingRegistrationAvatar
                            }
                          >
                            {" "}
                            ×{" "}
                          </button>{" "}
                          {timeErrors[day] === timeIndex && (
                            <span className="time-slot-error-message">
                              {" "}
                              Giờ KHL{" "}
                            </span>
                          )}{" "}
                        </div>
                      ))}{" "}
                      <button
                        type="button"
                        className="add-time-button"
                        onClick={() => addTimeSlot(day)}
                        disabled={isLoading || isUploadingRegistrationAvatar}
                      >
                        {" "}
                        + Thêm giờ{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                </div>
              ))}{" "}
            </div>
          </div>

          {/* --- Section V: Desired Tutor Level --- */}
          {currentStatus === "ACCEPT" && (
            <div className="form-section">
              <h3>V. Hạng Gia Sư Mong Muốn (nếu có thay đổi)</h3>
              <div className="form-group">
                <label htmlFor="desiredTutorLevelId">
                  Chọn hạng gia sư mới:
                </label>
                <TutorLevelList
                  name="desiredTutorLevelId"
                  value={formData.desiredTutorLevelId}
                  onChange={handleInputChange}
                  required={false} // Not strictly required, depends on backend logic for empty value
                  placeholder="-- Giữ nguyên hạng hiện tại --"
                  disabled={isLoading}
                />
                <p className="note">
                  Chọn hạng mới nếu bạn muốn yêu cầu nâng cấp. Để trống nếu muốn
                  giữ nguyên hạng hiện tại.
                </p>
                {renderFieldError("desiredTutorLevelId")}
              </div>
            </div>
          )}

          {/* --- Submit Actions --- */}
          <div className="form-actions">
            {formError && <p className="error-message">{formError}</p>}
            {success && <p className="success-message">{success}</p>}
            {currentStatus === "ACCEPT" && publicStatusError && (
              <p className="error-message public-status-error">
                {publicStatusError}
              </p>
            )}

            {requestData && currentStatus && STATUS_MAP[currentStatus] && (
              <p
                className={`status-display ${STATUS_MAP[currentStatus].className}`}
              >
                {" "}
                Trạng thái: <strong>
                  {STATUS_MAP[currentStatus].text}
                </strong>{" "}
              </p>
            )}

            {/* Public/Private Buttons */}
            {currentStatus === "ACCEPT" && (
              <div className="public-status-actions">
                <button
                  type="button"
                  onClick={handleMakePublic}
                  className="button-secondary button-public"
                  disabled={
                    isPublicProfile || isUpdatingPublicStatus || isLoading
                  }
                >
                  {isUpdatingPublicStatus && !isPublicProfile ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faEye} />
                  )}{" "}
                  Công khai hồ sơ
                </button>
                <button
                  type="button"
                  onClick={handleMakePrivate}
                  className="button-secondary button-private"
                  disabled={
                    !isPublicProfile || isUpdatingPublicStatus || isLoading
                  }
                >
                  {isUpdatingPublicStatus && isPublicProfile ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  )}{" "}
                  Ẩn hồ sơ
                </button>
              </div>
            )}

            <p className="terms">
              {" "}
              Bằng việc nhấn nút, bạn đồng ý với{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                {" "}
                Điều khoản{" "}
              </a>{" "}
              &{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                {" "}
                Chính sách Bảo mật{" "}
              </a>
              .{" "}
            </p>

            {/* Conditional Main Action Buttons */}
            <div className="action-buttons-container">
              {(currentStatus === "REQUEST" || currentStatus === "REFUSE") && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={isLoading || isUploadingRegistrationAvatar}
                    className="button-secondary button-cancel"
                  >
                    {" "}
                    Hủy Yêu Cầu{" "}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      isUploadingRegistrationAvatar ||
                      (currentStatus === "REQUEST" && !hasFormChanges)
                    }
                    className="button-primary button-update"
                    title={
                      currentStatus === "REQUEST" && !hasFormChanges
                        ? "Không có thay đổi"
                        : ""
                    }
                  >
                    {isLoading ? (
                      <>
                        {" "}
                        <FontAwesomeIcon icon={faSpinner} spin /> Đang cập
                        nhật...{" "}
                      </>
                    ) : currentStatus === "REQUEST" && !hasFormChanges ? (
                      "Chưa có thay đổi"
                    ) : currentStatus === "REFUSE" ? (
                      "Cập Nhật & Gửi Lại"
                    ) : (
                      "Cập Nhật Thông Tin"
                    )}
                  </button>
                </>
              )}
              {(currentStatus === "CANCEL" || !requestData) && (
                <button
                  type="submit"
                  disabled={isLoading || isUploadingRegistrationAvatar}
                  className="button-primary"
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
              )}
              {currentStatus === "ACCEPT" && (
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    isUploadingRegistrationAvatar ||
                    !hasFormChanges
                  }
                  className="button-primary button-update"
                  title={!hasFormChanges ? "Không có thay đổi" : ""}
                >
                  {isLoading ? (
                    <>
                      {" "}
                      <FontAwesomeIcon icon={faSpinner} spin /> Đang cập nhật...{" "}
                    </>
                  ) : !hasFormChanges ? (
                    "Chưa có thay đổi"
                  ) : (
                    "Cập Nhật Hồ Sơ"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onRequestClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropSave={handleCropSaveForRegistration}
        aspect={1}
        cropShape="round"
      />
      {/* ToastContainer is in App.jsx */}
    </>
  );
};

export default TutorRegistrationForm;
