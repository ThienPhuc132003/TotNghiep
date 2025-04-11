/* eslint-disable react/no-unescaped-entities */
// src/pages/User/TutorRegistrationForm.jsx

import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/TutorRegister.style.css";
import HomePageLayout from "../../components/User/layout/HomePageLayout";
import AvatarUploader from "../../components/AvatarUploader";
import GenericFileUploader from "../../components/GenericFileUploader";
import BankList from "../../components/Static_Data/BankList";
import MajorList from "../../components/Static_Data/MajorList";
import SubjectList from "../../components/Static_Data/SubjectList";

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
  AVATAR: "tutor_avatar",
  SUBJECT_PROOF: "tutor_subject_proof",
  GPA_PROOF: "tutor_gpa_proof",
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
  const [fileUploadErrors, setFileUploadErrors] = useState({}); // Dùng trong validateForm
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
  ); // Dùng trong JSX và validateForm

  // --- Fetch Data ---
  useEffect(() => {
    /* TODO: Fetch initial data if needed */
  }, []);

  // --- Callbacks Upload File ---
  const handleUploadComplete = useCallback(
    (url, identifier) => {
      console.log(`Upload Complete: id=${identifier}, url=${url}`);
      setFileUploadErrors((prev) => ({ ...prev, [identifier]: "" }));
      setFieldErrors((prev) => ({ ...prev, [identifier]: undefined }));
      if (identifier in formData) {
        setFormData((prev) => ({ ...prev, [identifier]: url }));
      } else {
        console.warn("Unknown file id:", identifier);
      }
    },
    [formData]
  ); // Dependency: formData

  const handleUploadError = useCallback((message, identifier) => {
    console.error(`Upload Error: id=${identifier}, msg=${message}`);
    const userMsg = message || "Upload thất bại";
    setFileUploadErrors((prev) => ({ ...prev, [identifier]: userMsg }));
    setFieldErrors((prev) => ({ ...prev, [identifier]: userMsg }));
  }, []);

  // --- Handler Thêm/Bớt Môn Học ---
  const addSubjectSlot = useCallback(() => {
    if (numberOfSubjects < 3) setNumberOfSubjects((prev) => prev + 1);
  }, [numberOfSubjects]);

  const removeSubjectSlot = useCallback(
    (subjectIndexToRemove) => {
      // subjectIndexToRemove là 2 hoặc 3
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
      setFileUploadErrors((prev) => ({ ...prev, [evidenceKey]: "" })); // Reset lỗi upload cụ thể

      if (subjectIndexToRemove === 2 && numberOfSubjects === 3) {
        // Logic chuyển môn 3 lên 2
        const keys3 = [
          `subjectId3`,
          `evidenceOfSubject3`,
          `descriptionOfSubject3`,
        ];
        const keys2 = [
          `subjectId2`,
          `evidenceOfSubject2`,
          `descriptionOfSubject2`,
        ];
        const dataToMove = keys3.reduce(
          (acc, key3, i) => ({ ...acc, [keys2[i]]: formData[key3] }),
          {}
        );
        const errorsToMove = keys3.reduce(
          (acc, key3, i) => ({ ...acc, [keys2[i]]: fieldErrors[key3] }),
          {}
        );
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
  ); // Dependencies

  // --- Handlers Lịch Rảnh (ĐỊNH NGHĨA TRƯỚC) ---
  const getTeachingTimeMinutes = useCallback(() => {
    const time = parseFloat(formData.teachingTime);
    return !isNaN(time) && time > 0 ? Math.round(time * 60) : 120;
  }, [formData.teachingTime]);

  const validateTimeSlotsForDay = useCallback(
    (_day, currentTimes, minIntervalMinutes) => {
      // _day không dùng nhưng cần cho signature
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
          console.error("Time parse error:", _day, time1, time2, err); // Sử dụng _day trong log
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
  ); // Dependency trống

  const validateAllAvailability = useCallback(() => {
    const minInterval = getTeachingTimeMinutes();
    const newTimeErrors = {};
    let hasAnyError = false;
    daysOfWeek.forEach((day) => {
      // Sử dụng daysOfWeek từ scope ngoài
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
    setTimeErrors(newTimeErrors); // <-- SỬ DỤNG setTimeErrors
    return !hasAnyError;
  }, [availability, getTeachingTimeMinutes, validateTimeSlotsForDay]); // Dependencies

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
          // Gọi validateAllAvailability ở đây vì nó đã được định nghĩa
          validateAllAvailability();
        }
      } else if (name && name.startsWith("GPA")) {
        if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
          const numGPA = parseFloat(value);
          if (value === "" || (!isNaN(numGPA) && numGPA >= 0 && numGPA <= 4)) {
            processedValue = value;
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
      if (fieldErrors[name])
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      if (
        name === "teachingMethod" &&
        value === "ONLINE" &&
        fieldErrors.teachingPlace
      ) {
        setFieldErrors((prev) => ({ ...prev, teachingPlace: undefined }));
      }
      setFormError("");
      // Không cần validateAllAvailability làm dependency ở đây
    },
    [fieldErrors, formData, validateAllAvailability]
  ); // Thêm formData

  // --- Các Handlers Lịch Rảnh khác ---
  const handleDayToggle = useCallback(
    (day) => {
      // day được dùng
      const isSelected = !availability[day].isSelected;
      setAvailability((prev) => ({
        // <-- SỬ DỤNG setAvailability
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
      setTimeErrors((prev) => ({ ...prev, [day]: null })); // <-- SỬ DỤNG setTimeErrors
      if (fieldErrors.availability)
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      setFormError("");
    },
    [availability, fieldErrors]
  ); // Dependencies

  const addTimeSlot = useCallback((day) => {
    // day được dùng
    setAvailability((prev) => ({
      // <-- SỬ DỤNG setAvailability
      ...prev,
      [day]: { ...prev[day], times: [...prev[day].times, ""] },
    }));
    setTimeErrors((prev) => ({ ...prev, [day]: null })); // <-- SỬ DỤNG setTimeErrors
  }, []); // Dependency trống vì không dùng state/prop khác

  const removeTimeSlot = useCallback(
    (day, timeIndex) => {
      // day và timeIndex được dùng
      const newTimes = availability[day].times.filter(
        (_, i) => i !== timeIndex
      );
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: newTimes },
      })); // <-- SỬ DỤNG setAvailability
      const minInterval = getTeachingTimeMinutes();
      const errorInfo = validateTimeSlotsForDay(day, newTimes, minInterval);
      setTimeErrors((prev) => ({
        ...prev,
        [day]: errorInfo ? errorInfo.index : null,
      })); // <-- SỬ DỤNG setTimeErrors
    },
    [availability, getTeachingTimeMinutes, validateTimeSlotsForDay]
  ); // Dependencies

  const handleTimeChange = useCallback(
    (day, timeIndex, newTimeValue) => {
      // Các params được dùng
      const currentTimes = [...availability[day].times];
      currentTimes[timeIndex] = newTimeValue;
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], times: currentTimes },
      })); // <-- SỬ DỤNG setAvailability
      const minInterval = getTeachingTimeMinutes();
      const errorInfo = validateTimeSlotsForDay(day, currentTimes, minInterval);
      setTimeErrors((prev) => ({
        ...prev,
        [day]: errorInfo ? errorInfo.index : null,
      })); // <-- SỬ DỤNG setTimeErrors
      if (fieldErrors.availability)
        setFieldErrors((prev) => ({ ...prev, availability: undefined }));
      setFormError("");
    },
    [availability, fieldErrors, getTeachingTimeMinutes, validateTimeSlotsForDay]
  ); // Dependencies

  // --- Hàm Validate Form Tổng Thể ---
  const validateForm = useCallback(() => {
    // *** Đầy đủ logic validate form ***
    let isValid = true;
    let errors = {};
    const minInterval = getTeachingTimeMinutes();
    const teachingHours = formatTeachingTime(formData.teachingTime) || "2h";

    // Basic fields validation...
    if (!formData.fullname.trim()) errors.fullname = "Vui lòng nhập họ tên.";
    if (!formData.majorId) errors.majorId = "Vui lòng chọn khoa.";
    if (!formData.birthday) errors.birthday = "Vui lòng chọn ngày sinh.";
    if (
      formData.GPA === "" ||
      isNaN(formData.GPA) ||
      formData.GPA < 0 ||
      formData.GPA > 4
    )
      errors.GPA = "GPA không hợp lệ (0-4).";
    if (!formData.bankNumber.trim() || !/^\d+$/.test(formData.bankNumber))
      errors.bankNumber = "Số tài khoản không hợp lệ.";
    if (!formData.bankName) errors.bankName = "Vui lòng chọn ngân hàng.";
    if (!formData.univercity.trim())
      errors.univercity = "Vui lòng nhập tên trường.";
    if (!formData.teachingTime)
      errors.teachingTime = "Vui lòng chọn thời gian mỗi tiết dạy.";
    else if (formData.teachingTime < 1 || formData.teachingTime > 3)
      errors.teachingTime = "Thời gian tiết dạy không hợp lệ (1h - 3h).";
    if (formData.videoUrl && !/^https?:\/\/.+/.test(formData.videoUrl))
      errors.videoUrl = "URL video không hợp lệ.";
    if (
      (formData.teachingMethod === "OFFLINE" ||
        formData.teachingMethod === "BOTH") &&
      !formData.teachingPlace.trim()
    )
      errors.teachingPlace = "Vui lòng nhập khu vực dạy offline.";

    // File uploads validation...
    if (!formData.avatar) errors.avatar = "Vui lòng tải ảnh đại diện.";
    else if (fileUploadErrors["avatar"])
      errors.avatar = `Ảnh đại diện: ${fileUploadErrors["avatar"]}`; // <-- Sử dụng fileUploadErrors
    if (fileUploadErrors["evidenceOfGPA"])
      errors.evidenceOfGPA = `Minh chứng GPA: ${fileUploadErrors["evidenceOfGPA"]}`; // <-- Sử dụng fileUploadErrors

    // Subjects validation...
    const validateSubject = (index) => {
      const suffix = index > 1 ? index : "";
      const subjectIdKey = `subjectId${suffix}`;
      const evidenceKey = `evidenceOfSubject${suffix}`;
      if (!formData[subjectIdKey])
        errors[subjectIdKey] = `Chọn môn học ${index}.`;
      if (!formData[evidenceKey])
        errors[evidenceKey] = `Tải minh chứng môn ${index}.`;
      else if (fileUploadErrors[evidenceKey])
        errors[
          evidenceKey
        ] = `Minh chứng môn ${index}: ${fileUploadErrors[evidenceKey]}`; // <-- Sử dụng fileUploadErrors
    };
    validateSubject(1);
    if (numberOfSubjects >= 2) validateSubject(2);
    if (numberOfSubjects >= 3) validateSubject(3);

    // Availability validation...
    let hasSelectedDay = false;
    let hasAnyTime = false;
    let timeValidationError = null;
    const currentAvailabilityErrors = {};
    daysOfWeek.forEach((day) => {
      const dayData = availability[day];
      currentAvailabilityErrors[day] = null;
      if (dayData.isSelected) {
        hasSelectedDay = true;
        if (dayData.times.length > 0) {
          const errorInfo = validateTimeSlotsForDay(
            day,
            dayData.times,
            minInterval
          );
          if (errorInfo) {
            currentAvailabilityErrors[day] = errorInfo.index;
            if (!timeValidationError) {
              const dayName = `Thứ ${
                day === "Sunday" ? "CN" : daysOfWeek.indexOf(day) + 2
              }`;
              timeValidationError =
                errorInfo.type === "empty"
                  ? `Nhập đủ giờ cho ${dayName}.`
                  : `Giờ dạy ${dayName} không hợp lệ (cách nhau ${teachingHours}).`;
            }
          } else if (dayData.times.some((t) => !!t)) {
            hasAnyTime = true;
          }
        }
      }
    });
    setTimeErrors(currentAvailabilityErrors); // <-- SỬ DỤNG setTimeErrors
    if (!hasSelectedDay) errors.availability = "Chọn ít nhất 1 ngày rảnh.";
    else if (!hasAnyTime && !timeValidationError)
      errors.availability = "Thêm ít nhất 1 khung giờ hợp lệ.";
    else if (timeValidationError) errors.availability = timeValidationError;

    isValid = Object.keys(errors).length === 0;
    setFieldErrors(errors);
    if (!isValid) {
      setFormError(
        errors.availability ||
          Object.values(errors)[0] ||
          "Vui lòng kiểm tra lại thông tin."
      );
    } else {
      setFormError("");
    }
    return isValid;
  }, [
    formData,
    numberOfSubjects,
    fileUploadErrors,
    availability,
    getTeachingTimeMinutes,
    validateTimeSlotsForDay,
  ]); // Dependencies

  // --- Xử lý Submit Form ---
  const handleSubmit = useCallback(
    async (e) => {
      // *** Đầy đủ logic submit ***
      e.preventDefault();
      setFormError("");
      setSuccess("");
      if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setIsLoading(true);
      const submissionData = {
        /* ... Tạo JSON object ... */
      };
      console.log(
        "--- Submitting Data (JSON) ---",
        JSON.stringify(submissionData, null, 2)
      );
      try {
        const response = await Api({
          endpoint: "user/regis-to-tutor",
          method: METHOD_TYPE.POST,
          data: submissionData,
        });
        setSuccess("Đăng ký thành công! Hồ sơ chờ duyệt.");
        console.log("API Resp:", response);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (apiError) {
        console.error("API Error:", apiError);
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Đăng ký thất bại.";
        setFormError(errorMessage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm]
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
      // *** Đầy đủ JSX cho section môn học ***
      const suffix = index > 1 ? index : "";
      const subjectIdKey = `subjectId${suffix}`;
      const evidenceKey = `evidenceOfSubject${suffix}`;
      const descriptionKey = `descriptionOfSubject${suffix}`;
      return (
        <div key={`subject-${index}`} className="subject-item form-grid">
          <div className="form-column">
            <h4>
              {" "}
              Môn Dạy {index}{" "}
              {index > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeSubjectSlot(index)}
                  title={`Xóa môn ${index}`}
                  disabled={isLoading}
                >
                  {" "}
                  Xóa môn{" "}
                </button>
              )}
            </h4>
            <div className="form-group">
              {" "}
              <label htmlFor={subjectIdKey}>Môn *</label>{" "}
              <SubjectList
                name={subjectIdKey}
                value={formData[subjectIdKey]}
                onChange={handleInputChange}
                required={true}
              />{" "}
              {renderFieldError(subjectIdKey)}{" "}
            </div>
            <div className="form-group">
              {" "}
              <label htmlFor={descriptionKey}>
                Mô tả kinh nghiệm dạy môn này
              </label>{" "}
              <textarea
                id={descriptionKey}
                name={descriptionKey}
                rows="4"
                maxLength={500}
                value={formData[descriptionKey]}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                placeholder="Kinh nghiệm, phương pháp dạy..."
              />{" "}
              {renderFieldError(descriptionKey)}{" "}
            </div>
          </div>
          <div className="form-column">
            <div className="form-group">
              {" "}
              <GenericFileUploader
                label="Minh chứng *"
                mediaCategory={MEDIA_CATEGORIES.SUBJECT_PROOF}
                initialFileUrl={formData[evidenceKey]}
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
                required={true}
                fileIdentifier={evidenceKey}
              />{" "}
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
    ]
  );

  // --- Render Chính ---
  return (
    <HomePageLayout>
      <div className="tutor-registration-container">
        <h2>Đăng Ký Làm Gia Sư</h2>
        <form
          onSubmit={handleSubmit}
          className="tutor-registration-form"
          noValidate
        >
          {/* Phần 1: Thông Tin Cá Nhân & Học Vấn */}
          <div className="form-section">
            <h3>I. Thông Tin Cá Nhân & Học Vấn</h3>
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  {" "}
                  <label htmlFor="fullname">Họ Tên *</label>{" "}
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
                  <label htmlFor="birthday">Ngày sinh *</label>{" "}
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
                  <label>Giới tính *</label>{" "}
                  <div className="radio-group">
                    {" "}
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === "MALE"}
                        onChange={(e) =>
                          handleInputChange(e.target.name, e.target.value)
                        }
                      />{" "}
                      Nam
                    </label>{" "}
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === "FEMALE"}
                        onChange={(e) =>
                          handleInputChange(e.target.name, e.target.value)
                        }
                      />{" "}
                      Nữ
                    </label>{" "}
                  </div>{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="univercity">Trường Đại học *</label>{" "}
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
                  <label htmlFor="majorId">Ngành học *</label>{" "}
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
                  <label htmlFor="GPA">Điểm GPA (Hệ 4) *</label>{" "}
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]?[0-9]?"
                    id="GPA"
                    name="GPA"
                    value={formData.GPA}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                    placeholder="Ví dụ: 3.80"
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
                  />{" "}
                </div>
              </div>
              <div className="form-column">
                <div className="form-group">
                  {" "}
                  <AvatarUploader
                    mediaCategory={MEDIA_CATEGORIES.AVATAR}
                    initialImageUrl={formData.avatar}
                    onUploadComplete={handleUploadComplete}
                    label="Ảnh đại diện *"
                    required={true}
                  />{" "}
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
                    placeholder="Chia sẻ về kinh nghiệm, thành tích..."
                  ></textarea>{" "}
                  {renderFieldError("description")}{" "}
                </div>
                <div className="form-group">
                  {" "}
                  <label htmlFor="videoUrl">Link Video giới thiệu</label>{" "}
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
                  <label htmlFor="bankName">Tên ngân hàng *</label>{" "}
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
                    Số tài khoản nhận học phí *
                  </label>{" "}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
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

          {/* Phần 2: Thông Tin Giảng Dạy */}
          <div className="form-section">
            <h3>II. Thông Tin Giảng Dạy</h3>
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  {" "}
                  <label htmlFor="teachingMethod">Phương thức dạy *</label>{" "}
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
                    <option value="ONLINE">Trực tuyến (Online)</option>{" "}
                    <option value="OFFLINE">Tại nhà học viên (Offline)</option>{" "}
                    <option value="BOTH">Cả hai (Online và Offline)</option>{" "}
                  </select>{" "}
                  {renderFieldError("teachingMethod")}{" "}
                </div>
                {(formData.teachingMethod === "OFFLINE" ||
                  formData.teachingMethod === "BOTH") && (
                  <div className="form-group">
                    {" "}
                    <label htmlFor="teachingPlace">
                      Khu vực dạy Offline *
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
                      placeholder="Ví dụ: Q.Gò Vấp, Q.Bình Thạnh"
                    />{" "}
                    {renderFieldError("teachingPlace")}{" "}
                  </div>
                )}
              </div>
              <div className="form-column">
                <div className="form-group">
                  {" "}
                  <label>Giáo trình</label>{" "}
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
                    <span>Sử dụng giáo trình/tài liệu riêng</span>{" "}
                  </label>{" "}
                </div>
              </div>
            </div>
          </div>

          {/* Phần 3: Thông Tin Môn Dạy */}
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
                disabled={isLoading}
              >
                + Thêm môn dạy (Tối đa 3)
              </button>
            )}
          </div>

          {/* Phần 4: Thời Gian Rảnh */}
          <div className="form-section availability-info">
            <h3>IV. Thời Gian Rảnh Có Thể Dạy *</h3>
            <div className="form-group teaching-time-group availability-teaching-time">
              <label htmlFor="teachingTime">Thời gian mỗi tiết dạy *</label>
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
              Chọn ngày rảnh, thêm giờ **bắt đầu** dạy. Khoảng cách giữa các giờ
              bắt đầu phải ít nhất{" "}
              <strong>
                {formatTeachingTime(formData.teachingTime) || "2h"}
              </strong>
              .
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
                            step="1800"
                            className={
                              timeErrors[day] === timeIndex
                                ? "time-input-error"
                                : ""
                            }
                            required={
                              !!time || availability[day].times.length === 1
                            }
                          />
                          <span>(Bắt đầu)</span>
                          <button
                            type="button"
                            className="remove-time-button"
                            onClick={() => removeTimeSlot(day, timeIndex)}
                            title="Xóa giờ"
                          >
                            ×
                          </button>
                          {timeErrors[day] === timeIndex && (
                            <span className="time-slot-error-message">
                              Giờ không hợp lệ
                            </span>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-time-button"
                        onClick={() => addTimeSlot(day)}
                      >
                        + Thêm giờ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit & Messages */}
          <div className="form-actions">
            {formError && <p className="error-message">{formError}</p>}
            {success && <p className="success-message">{success}</p>}
            <button type="submit" disabled={isLoading}>
              {" "}
              {isLoading ? "Đang xử lý..." : "Hoàn Tất Đăng Ký"}{" "}
            </button>
            <p className="terms">
              {" "}
              Bằng cách nhấp vào nút đăng ký, bạn đồng ý với{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Điều khoản và Dịch vụ
              </a>
              .{" "}
            </p>
          </div>
        </form>
      </div>
    </HomePageLayout>
  );
};

export default TutorRegistrationForm;
