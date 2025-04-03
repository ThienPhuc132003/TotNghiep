import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType"; // Đảm bảo đường dẫn đúng
import "../../assets/css/TutorRegister.style.css"; // Đảm bảo đường dẫn đúng
import HomePageLayout from "../../components/User/layout/HomePageLayout";
// --- Dummy Data (Thay thế bằng fetch API) ---
const dummyMajors = [
  { id: "M0001", name: "Công nghệ thông tin" },
  { id: "M0002", name: "Quản trị kinh doanh" },
  { id: "M0003", name: "Ngôn ngữ Anh" },
];
const dummySubjects = [
  { id: "092b446d-4c13-4814-9724-3359e3eeca32", name: "Toán cao cấp A1" },
  { id: "subject-2", name: "Lập trình C++" },
  { id: "subject-3", name: "Kinh tế vi mô" },
  { id: "subject-4", name: "Tiếng Anh giao tiếp" },
];
const dummyBanks = ["Vietcombank", "Techcombank", "ACB", "MB Bank", "Agribank"];
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
// --- End Dummy Data ---

const TutorRegistrationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- State cho Form Chính ---
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    majorId: "",
    birthday: "",
    gender: "MALE",
    bankNumber: "",
    bankName: "",
    gpa: "",
    avatarFile: null,
    description: "",
    tutorEvaluation: "",
  });

  // --- State cho Môn Học ---
  const [subjects, setSubjects] = useState([
    {
      id: Date.now(),
      subjectId: "",
      gpaOrDegree: "",
      description: "",
      proofFile: null,
    },
  ]);

  // --- State cho Lịch Rảnh ---
  const [availability, setAvailability] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { isSelected: false, times: [] };
      return acc;
    }, {})
  );

  // --- State để lưu lỗi thời gian cho từng ngày ---
  const [timeErrors, setTimeErrors] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = null;
      return acc;
    }, {})
  );

  // --- Fetch Dữ liệu Ban đầu ---
  useEffect(() => {
    // Placeholder for fetching user profile, majors, subjects, banks
  }, []);

  // --- Handlers cho Input Thường và File ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // --- Handlers cho Môn Học ---
  const handleSubjectChange = (index, e) => {
    const { name, value, files, type } = e.target;
    const newSubjects = [...subjects];
    if (type === "file") {
      if (files.length > 0) {
        newSubjects[index][name] = files[0];
      }
    } else {
      newSubjects[index][name] = value;
    }
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: Date.now(),
        subjectId: "",
        gpaOrDegree: "",
        description: "",
        proofFile: null,
      },
    ]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Handlers cho Lịch Rảnh ---

  const validateTimeSlotsForDay = (day, currentTimes) => {
    // console.log(`Validating times for ${day}:`, currentTimes); // Debug log
    if (!currentTimes || currentTimes.length <= 1) return null;
    const validTimes = currentTimes.filter((time) => !!time).sort();
    if (validTimes.length <= 1) return null;

    for (let i = 1; i < validTimes.length; i++) {
      const time1 = validTimes[i - 1];
      const time2 = validTimes[i];
      try {
        const [h1, m1] = time1.split(":").map(Number);
        const [h2, m2] = time2.split(":").map(Number);
        if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) {
          // Check for invalid time format
          console.warn(
            `Invalid time format detected for ${day}:`,
            time1,
            time2
          );
          const originalIndex = currentTimes.findIndex((t) => t === time2);
          return originalIndex !== -1 ? originalIndex : i; // Return index of the invalid format
        }
        const totalMinutes1 = h1 * 60 + m1;
        const totalMinutes2 = h2 * 60 + m2;
        if (totalMinutes2 < totalMinutes1 + 120) {
          // 120 minutes = 2 hours
          const originalIndex = currentTimes.findIndex((t) => t === time2);
          // console.log(`Validation failed for ${day}: ${time2} is less than 2 hours after ${time1}. Error index: ${originalIndex}`); // Debug log
          return originalIndex !== -1 ? originalIndex : i;
        }
      } catch (err) {
        console.error("Lỗi phân tích thời gian:", day, time1, time2, err);
        const originalIndex = currentTimes.findIndex((t) => t === time2);
        return originalIndex !== -1 ? originalIndex : i;
      }
    }
    // console.log(`Validation passed for ${day}`); // Debug log
    return null;
  };

  const handleDayToggle = (day) => {
    setAvailability((prev) => {
      const isCurrentlySelected = prev[day].isSelected;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          isSelected: !isCurrentlySelected,
          times: !isCurrentlySelected ? prev[day].times : [],
        },
      };
    });
    setTimeErrors((prev) => ({ ...prev, [day]: null }));
  };

  // *** Đảm bảo hàm này thêm chuỗi rỗng ***
  const addTimeSlot = (day) => {
    const newTimes = [...availability[day].times, ""]; // Thêm slot RỖNG
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], times: newTimes },
    }));
    // Reset lỗi của ngày đó vì cấu trúc times đã thay đổi, cần nhập liệu mới
    setTimeErrors((prev) => ({ ...prev, [day]: null }));
  };

  const removeTimeSlot = (day, timeIndex) => {
    const currentTimes = availability[day].times;
    const newTimes = currentTimes.filter((_, i) => i !== timeIndex);
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], times: newTimes },
    }));
    const errorIndex = validateTimeSlotsForDay(day, newTimes); // Validate lại sau khi xóa
    setTimeErrors((prev) => ({ ...prev, [day]: errorIndex }));
  };

  const handleTimeChange = (day, timeIndex, newTimeValue) => {
    // console.log(`handleTimeChange called for ${day}, index ${timeIndex}, value: ${newTimeValue}`); // Debug log
    const currentTimes = [...availability[day].times];
    currentTimes[timeIndex] = newTimeValue;
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], times: currentTimes },
    }));
    const errorIndex = validateTimeSlotsForDay(day, currentTimes); // Validate ngay khi thay đổi
    setTimeErrors((prev) => ({ ...prev, [day]: errorIndex }));
  };

  // --- Xử lý Submit Form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasTimeValidationError = false;
    let firstErrorMessage = "";
    const finalTimeErrors = {}; // Bắt đầu với object rỗng

    // Validate tất cả các ngày được chọn
    for (const day of daysOfWeek) {
      finalTimeErrors[day] = null; // Reset lỗi cho ngày này
      if (availability[day].isSelected) {
        if (availability[day].times.length === 0) {
          // Tùy chọn: Báo lỗi nếu chọn ngày mà không có giờ
          // hasTimeValidationError = true;
          // if (!firstErrorMessage) firstErrorMessage = `Vui lòng chọn ít nhất một khung giờ cho ${day}.`;
          // finalTimeErrors[day] = 0; // Đánh dấu lỗi
          continue;
        }
        const emptySlotIndex = availability[day].times.findIndex(
          (time) => !time
        );
        if (emptySlotIndex !== -1) {
          hasTimeValidationError = true;
          if (!firstErrorMessage)
            firstErrorMessage = `Vui lòng nhập đầy đủ thời gian cho ${day}.`;
          finalTimeErrors[day] = emptySlotIndex; // Lỗi ở slot rỗng
          continue; // Ưu tiên lỗi slot rỗng
        }
        const errorIndex = validateTimeSlotsForDay(
          day,
          availability[day].times
        );
        if (errorIndex !== null) {
          hasTimeValidationError = true;
          if (!firstErrorMessage)
            firstErrorMessage =
              "Khung giờ không hợp lệ (phải cách nhau ít nhất 2 tiếng).";
          finalTimeErrors[day] = errorIndex; // Lỗi ở slot vi phạm khoảng cách
        }
      }
    }
    setTimeErrors(finalTimeErrors); // Cập nhật UI với tất cả lỗi tìm thấy

    if (hasTimeValidationError) {
      setError(
        firstErrorMessage || "Vui lòng kiểm tra lại thông tin thời gian."
      );
      setIsLoading(false);
      return;
    }

    // --- Nếu không có lỗi validation, tiếp tục submit ---
    setIsLoading(true);
    setError("");
    setSuccess("");
    const submissionData = new FormData();
    // Append data... (giữ nguyên như trước)
    submissionData.append("fullname", formData.fullname);
    submissionData.append("majorId", formData.majorId);
    submissionData.append("birthday", formData.birthday);
    submissionData.append("gender", formData.gender);
    submissionData.append("bankNumber", formData.bankNumber);
    submissionData.append("bankName", formData.bankName);
    submissionData.append("GPA", formData.gpa);
    submissionData.append("description", formData.description);
    if (formData.avatarFile) {
      submissionData.append("avatar", formData.avatarFile);
    }
    subjects.forEach((subject, index) => {
      submissionData.append(`subjects[${index}][subjectId]`, subject.subjectId);
      submissionData.append(
        `subjects[${index}][GPAOrNameDegree]`,
        subject.gpaOrDegree
      );
      submissionData.append(
        `subjects[${index}][descriptionOfSubject]`,
        subject.description
      );
      if (subject.proofFile) {
        submissionData.append(
          `subjects[${index}][educationalCertification]`,
          subject.proofFile
        );
      }
    });
    const dateTimeLearn = Object.entries(availability)
      // eslint-disable-next-line no-unused-vars
      .filter(([_day, data]) => data.isSelected && data.times.length > 0)
      .map(([day, data]) => ({
        day: day,
        times: [...data.times].filter((time) => !!time).sort(),
      }));
    submissionData.append("dateTimeLearn", JSON.stringify(dateTimeLearn));

    try {
      const response = await Api({
        endpoint: "user/regis-to-tutor",
        method: METHOD_TYPE.POST,
        body: submissionData,
      });
      setSuccess(
        "Đăng ký làm gia sư thành công! Bạn sẽ được chuyển hướng sau giây lát."
      );
      console.log("API Response:", response);
      setTimeout(() => {
        navigate("/home");
      }, 2500);
    } catch (apiError) {
      console.error("API Error:", apiError);
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <HomePageLayout>
      <div className="tutor-registration-container">
        <h2>Đăng Ký Làm Gia Sư</h2>
        <form
          onSubmit={handleSubmit}
          className="tutor-registration-form"
          noValidate
        >
          {/* ========== Thông Tin Cá Nhân ========== */}
          <div className="form-section personal-info">
            <h3>Thông Tin Cá Nhân</h3>
            {/* ... JSX ... */}
            <div className="form-grid">
              <div className="form-column">
                {/* ... Các trường ... */}
                <div className="form-group">
                  <label htmlFor="fullname">Họ Tên *</label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!formData.email}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="majorId">Khoa *</label>
                  <select
                    id="majorId"
                    name="majorId"
                    value={formData.majorId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Chọn khoa
                    </option>
                    {dummyMajors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giới tính *</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === "MALE"}
                        onChange={handleInputChange}
                      />{" "}
                      Nam
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === "FEMALE"}
                        onChange={handleInputChange}
                      />{" "}
                      Nữ
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="birthday">Ngày sinh *</label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gpa">Điểm trung bình tích lũy (GPA) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    id="gpa"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    required
                    placeholder="Hệ 4 (Ví dụ: 3.5)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="avatarFile">Ảnh đại diện</label>
                  <input
                    type="file"
                    id="avatarFile"
                    name="avatarFile"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                  />
                  {formData.avatarFile && (
                    <p className="file-name">
                      Đã chọn: {formData.avatarFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="form-column">
                {/* ... Các trường cột 2 ... */}
                <div className="form-group">
                  <label htmlFor="bankNumber">Số tài khoản ngân hàng *</label>
                  <input
                    type="text"
                    pattern="\d*"
                    title="Vui lòng chỉ nhập số"
                    id="bankNumber"
                    name="bankNumber"
                    value={formData.bankNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bankName">Tên ngân hàng *</label>
                  <select
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Chọn ngân hàng
                    </option>
                    {dummyBanks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="description">Giới thiệu bản thân</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    maxLength={500}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Chia sẻ về kinh nghiệm, điểm mạnh của bạn..."
                  ></textarea>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="tutorEvaluation">
                    Đánh giá về việc gia sư
                  </label>
                  <textarea
                    id="tutorEvaluation"
                    name="tutorEvaluation"
                    rows="4"
                    maxLength={500}
                    value={formData.tutorEvaluation}
                    onChange={handleInputChange}
                    placeholder="Quan điểm của bạn về vai trò và trách nhiệm của một gia sư..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Thông Tin Môn Gia Sư ========== */}
          <div className="form-section subject-info">
            <h3>Thông Tin Môn Gia Sư</h3>
            {/* ... JSX ... */}
            {subjects.map((subject, index) => (
              <div key={subject.id} className="subject-item form-grid">
                <div className="form-column">
                  <h4>
                    Môn Gia Sư {index + 1}{" "}
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeSubject(index)}
                        title="Xóa môn này"
                      >
                        Xóa môn
                      </button>
                    )}
                  </h4>
                  <div className="form-group">
                    <label htmlFor={`subjectId-${index}`}>Môn *</label>
                    <select
                      id={`subjectId-${index}`}
                      name="subjectId"
                      value={subject.subjectId}
                      onChange={(e) => handleSubjectChange(index, e)}
                      required
                    >
                      <option value="" disabled>
                        Chọn môn gia sư
                      </option>
                      {dummySubjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor={`gpaOrDegree-${index}`}>
                      Điểm môn hoặc tên chứng chỉ *
                    </label>
                    <input
                      type="text"
                      id={`gpaOrDegree-${index}`}
                      name="gpaOrDegree"
                      value={subject.gpaOrDegree}
                      onChange={(e) => handleSubjectChange(index, e)}
                      required
                      placeholder="Ví dụ: 8.5 hoặc IELTS 7.0"
                    />
                  </div>
                </div>
                <div className="form-column">
                  <div className="form-group">
                    <label htmlFor={`proofFile-${index}`}>
                      Minh chứng (Bảng điểm/Chứng chỉ) *
                    </label>
                    <input
                      type="file"
                      id={`proofFile-${index}`}
                      name="proofFile"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleSubjectChange(index, e)}
                      required
                    />
                    {subject.proofFile && (
                      <p className="file-name">
                        Đã chọn: {subject.proofFile.name}
                      </p>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor={`description-${index}`}>
                      Giới thiệu về môn gia sư
                    </label>
                    <textarea
                      id={`description-${index}`}
                      name="description"
                      rows="3"
                      maxLength={300}
                      value={subject.description}
                      onChange={(e) => handleSubjectChange(index, e)}
                      placeholder="Mô tả kinh nghiệm, phương pháp dạy môn này..."
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="add-button" onClick={addSubject}>
              + Thêm môn học
            </button>
          </div>

          {/* ========== Thời Gian Có Thể Dạy ========== */}
          <div className="form-section availability-info">
            <h3>Thời Gian Có Thể Dạy *</h3>
            {/* Hiển thị lỗi validation thời gian (nếu có) */}
            <p className="note">Lưu ý các giờ phải cách nhau 2 tiếng</p>
            {error &&
              (error.includes("Khung giờ không hợp lệ") ||
                error.includes("Vui lòng nhập đầy đủ")) && (
                <p className="error-message">{error}</p>
              )}

            <div className="availability-grid">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`day-column ${
                    availability[day].isSelected ? "selected" : ""
                  }`}
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
                      day === "Sunday"
                        ? "CN"
                        : parseInt(daysOfWeek.indexOf(day)) + 2
                    }`}</label>
                  </div>

                  {availability[day].isSelected && (
                    <div className="time-slots">
                      {availability[day].times.map((time, timeIndex) => (
                        <div
                          key={`${day}-${timeIndex}`}
                          className="time-slot-item"
                        >
                          {" "}
                          {/* Thêm key động */}
                          <input
                            type="time"
                            // *** Đảm bảo value và onChange đúng ***
                            value={time} // Hiển thị giá trị từ state
                            onChange={(e) =>
                              handleTimeChange(day, timeIndex, e.target.value)
                            } // Gọi handler khi thay đổi
                            step="1800" // 30 phút
                            className={
                              timeErrors[day] === timeIndex
                                ? "time-input-error"
                                : ""
                            }
                            required // Bắt buộc nhập giờ
                          />
                          <span>(Bắt đầu)</span>
                          <button
                            type="button"
                            className="remove-time-button"
                            onClick={() => removeTimeSlot(day, timeIndex)}
                            title="Xóa khung giờ này"
                          >
                            Xóa
                          </button>
                          {/* Hiển thị lỗi cụ thể */}
                          {timeErrors[day] === timeIndex && (
                            <span className="time-slot-error-message">
                              Giờ không hợp lệ.
                            </span>
                          )}
                        </div>
                      ))}
                      {/* Hiển thị nút thêm giờ nếu không có lỗi ở slot cuối cùng HOẶC chưa có slot nào */}
                      {/* Kiểm tra lỗi ở slot cuối cùng (index = times.length - 1) */}
                      {(timeErrors[day] === null ||
                        timeErrors[day] <
                          availability[day].times.length - 1) && (
                        <button
                          type="button"
                          className="add-time-button"
                          onClick={() => addTimeSlot(day)}
                        >
                          + Thêm giờ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========== Submit & Messages ========== */}
          <div className="form-actions">
            {/* Hiển thị lỗi API */}
            {error &&
              !error.includes("Khung giờ không hợp lệ") &&
              !error.includes("Vui lòng nhập đầy đủ") && (
                <p className="error-message">{error}</p>
              )}
            {success && <p className="success-message">{success}</p>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Hoàn tất đăng ký"}
            </button>
            <p className="terms">
              Bằng cách nhấp vào nút đăng ký, bạn đồng ý với{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Điều khoản và Dịch vụ
              </a>{" "}
              của chúng tôi.
            </p>
          </div>
        </form>
      </div>
    </HomePageLayout>
  );
};

export default TutorRegistrationForm;
