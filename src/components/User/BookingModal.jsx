import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { toast } from "react-toastify";
import Api from "../../network/Api"; // *** Điều chỉnh đường dẫn ***
import { METHOD_TYPE } from "../../network/methodType"; // *** Điều chỉnh đường dẫn ***
import "../../assets/css/BookingModal.style.css"; // *** Điều chỉnh đường dẫn ***

// Modal.setAppElement('#root'); // Gọi ở App.jsx hoặc index.js

const formatHoursOptions = [
  { value: 1, label: "1 giờ" },
  { value: 1.25, label: "1 giờ 15 phút" },
  { value: 1.5, label: "1 giờ 30 phút" },
  { value: 1.75, label: "1 giờ 45 phút" },
  { value: 2, label: "2 giờ" },
  { value: 2.25, label: "2 giờ 15 phút" },
  { value: 2.5, label: "2 giờ 30 phút" },
  { value: 2.75, label: "2 giờ 45 phút" },
  { value: 3, label: "3 giờ" },
];
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const dayLabels = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "CN",
};

// --- ĐỊNH NGHĨA LẠI HÀM formatTeachingTime Ở ĐÂY ---
const formatTeachingTime = (hours) => {
  if (hours === null || isNaN(hours) || hours <= 0) {
    return null; // Trả về null nếu không hợp lệ
  }
  const h = Math.floor(hours);
  const minutes = Math.round((hours - h) * 60);
  let result = `${h} giờ`;
  if (minutes > 0) {
    result += ` ${minutes} phút`;
  }
  return result;
};
// --- KẾT THÚC ĐỊNH NGHĨA ---

const BookingModal = ({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  onBookingSuccess,
  maxHoursPerLesson,
}) => {
  const [schedule, setSchedule] = useState({});
  const [lessonsPerWeek, setLessonsPerWeek] = useState(1);
  const [totalLessons, setTotalLessons] = useState(10);
  const [hoursPerLesson, setHoursPerLesson] = useState(1.5);
  const [startDay, setStartDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const availableHoursOptions = useMemo(() => {
    const maxAllowed = maxHoursPerLesson || 99;
    return formatHoursOptions.filter((opt) => opt.value <= maxAllowed);
  }, [maxHoursPerLesson]);

  useEffect(() => {
    if (isOpen) {
      setSchedule({});
      setLessonsPerWeek(1);
      setTotalLessons(10);
      setStartDay(new Date().toISOString().split("T")[0]);
      setError("");
      setIsSubmitting(false);
      const defaultOptionValue = 1.5;
      const maxAllowed = maxHoursPerLesson || 99;
      let initialHoursValue = defaultOptionValue;
      if (
        defaultOptionValue > maxAllowed ||
        !availableHoursOptions.some((opt) => opt.value === defaultOptionValue)
      ) {
        if (availableHoursOptions.length > 0) {
          initialHoursValue =
            availableHoursOptions[availableHoursOptions.length - 1].value;
        } else {
          initialHoursValue = 1;
        }
      }
      setHoursPerLesson(initialHoursValue);
    }
  }, [isOpen, maxHoursPerLesson, availableHoursOptions]);

  const handleDayToggle = (day) => {
    setSchedule((prev) => {
      const ns = { ...prev };
      if (ns[day]) {
        delete ns[day];
      } else {
        ns[day] = [""];
      }
      return ns;
    });
  };
  const handleTimeChange = (day, timeIndex, value) => {
    setSchedule((prev) => {
      const ns = { ...prev };
      if (!ns[day]) ns[day] = [];
      const nt = [...ns[day]];
      nt[timeIndex] = value;
      ns[day] = nt;
      return ns;
    });
  };
  const addTimeSlot = (day) => {
    setSchedule((prev) => {
      const ns = { ...prev };
      if (!ns[day]) ns[day] = [];
      ns[day] = [...ns[day], ""];
      return ns;
    });
  };
  const removeTimeSlot = (day, timeIndex) => {
    setSchedule((prev) => {
      const ns = { ...prev };
      if (ns[day]) {
        ns[day] = ns[day].filter((_, i) => i !== timeIndex);
      }
      return ns;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const dateTimeLearnPayload = Object.entries(schedule)
      .map(([day, times]) => ({
        day: day,
        times: times.filter((t) => t && t.match(/^\d{2}:\d{2}$/)),
      }))
      .filter((e) => e.times.length > 0);
    if (dateTimeLearnPayload.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày và nhập giờ học hợp lệ.");
      setIsSubmitting(false);
      return;
    }
    if (!startDay) {
      setError("Vui lòng chọn ngày bắt đầu.");
      setIsSubmitting(false);
      return;
    }
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDay)) {
      setError("Định dạng ngày bắt đầu không hợp lệ (YYYY-MM-DD).");
      setIsSubmitting(false);
      return;
    }
    if (new Date(startDay) < new Date(new Date().toDateString())) {
      setError("Ngày bắt đầu không được là ngày trong quá khứ.");
      setIsSubmitting(false);
      return;
    }
    const payload = {
      dateTimeLearn: dateTimeLearnPayload,
      lessonsPerWeek: parseInt(lessonsPerWeek, 10),
      totalLessons: parseInt(totalLessons, 10),
      hoursPerLesson: parseFloat(hoursPerLesson),
      startDay: startDay,
    };
    console.log(
      "Sending booking request for tutor:",
      tutorId,
      "Payload:",
      payload
    );
    try {
      await Api({
        endpoint: `/booking-request/create/${tutorId}`,
        method: METHOD_TYPE.POST,
        body: payload,
      });
      toast.success(`Đã gửi yêu cầu thuê gia sư ${tutorName}`);
      onBookingSuccess(tutorId);
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu thuê:", err);
      const errorMsg =
        err.response?.data?.message || "Gửi yêu cầu thuê thất bại.";
      setError(errorMsg);
      toast.error(`Lỗi: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`Đặt lịch học với ${tutorName}`}
      className="booking-modal"
      overlayClassName="booking-modal-overlay"
      shouldCloseOnOverlayClick={!isSubmitting}
      shouldCloseOnEsc={!isSubmitting}
    >
      <h2>Đặt lịch học với gia sư {tutorName}</h2>
      <button
        onClick={onClose}
        className="close-modal-btn"
        aria-label="Đóng"
        disabled={isSubmitting}
      >
        ×
      </button>
      <form onSubmit={handleSubmit}>
        <div className="form-group schedule-group">
          {" "}
          <label>Chọn lịch học mong muốn:</label>{" "}
          <div className="schedule-picker">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className={`day-schedule ${schedule[day] ? "selected" : ""}`}
              >
                {" "}
                <label className="day-label">
                  {" "}
                  <input
                    type="checkbox"
                    checked={!!schedule[day]}
                    onChange={() => handleDayToggle(day)}
                  />{" "}
                  {dayLabels[day]}{" "}
                </label>{" "}
                {schedule[day] && (
                  <div className="time-slots">
                    {schedule[day].map((time, index) => (
                      <div key={index} className="time-slot-input">
                        {" "}
                        <input
                          type="time"
                          value={time}
                          onChange={(e) =>
                            handleTimeChange(day, index, e.target.value)
                          }
                          required={schedule[day]?.length > 0}
                        />{" "}
                        {schedule[day].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day, index)}
                            className="remove-time-btn"
                            title="Xóa giờ này"
                          >
                            ×
                          </button>
                        )}{" "}
                      </div>
                    ))}{" "}
                    <button
                      type="button"
                      onClick={() => addTimeSlot(day)}
                      className="add-time-btn"
                      title={`Thêm giờ cho ${dayLabels[day]}`}
                    >
                      +
                    </button>{" "}
                  </div>
                )}{" "}
              </div>
            ))}
          </div>{" "}
        </div>
        <div className="form-grid">
          {" "}
          <div className="form-group">
            {" "}
            <label htmlFor="lessonsPerWeek">Số buổi / tuần:</label>{" "}
            <input
              id="lessonsPerWeek"
              type="number"
              min="1"
              max="7"
              value={lessonsPerWeek}
              onChange={(e) => setLessonsPerWeek(e.target.value)}
              required
            />{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label htmlFor="totalLessons">Tổng số buổi:</label>{" "}
            <input
              id="totalLessons"
              type="number"
              min="1"
              value={totalLessons}
              onChange={(e) => setTotalLessons(e.target.value)}
              required
            />{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label htmlFor="hoursPerLesson">Thời lượng / buổi:</label>{" "}
            <select
              id="hoursPerLesson"
              value={hoursPerLesson}
              onChange={(e) => setHoursPerLesson(e.target.value)}
              required
              disabled={availableHoursOptions.length === 0}
            >
              {" "}
              {availableHoursOptions.length > 0 ? (
                availableHoursOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <option value="">Không có lựa chọn hợp lệ</option>
              )}{" "}
            </select>
            {/* Sử dụng hàm đã định nghĩa */}
            {maxHoursPerLesson && (
              <small className="input-hint">
                Tối đa: {formatTeachingTime(maxHoursPerLesson)}
              </small>
            )}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label htmlFor="startDay">Ngày bắt đầu:</label>{" "}
            <input
              id="startDay"
              type="date"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />{" "}
          </div>{" "}
        </div>
        {error && <p className="error-message-modal">{error}</p>}
        <div className="modal-actions">
          {" "}
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>{" "}
          <button type="submit" disabled={isSubmitting}>
            {" "}
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}{" "}
          </button>{" "}
        </div>
      </form>
    </Modal>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tutorId: PropTypes.string.isRequired,
  tutorName: PropTypes.string.isRequired,
  onBookingSuccess: PropTypes.func.isRequired,
  maxHoursPerLesson: PropTypes.number,
};
export default BookingModal;
