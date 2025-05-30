// src/components/User/BookingModal.jsx

import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { toast } from "react-toastify";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";
import "../../assets/css/BookingModal.style.css";
import { FaCoins, FaClock, FaMoneyBillWave } from "react-icons/fa";

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
const dayLabels = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "CN",
};
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const formatTeachingTime = (hours) => {
  if (hours === null || isNaN(hours) || hours <= 0) return null;
  const h = Math.floor(hours);
  const minutes = Math.round((hours - h) * 60);
  let result = `${h} giờ`;
  if (minutes > 0) result += ` ${minutes} phút`;
  return result;
};

const BookingModal = ({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  onBookingSuccess,
  maxHoursPerLesson = null,
  availableScheduleRaw = [],
  hourlyRate = 0,
}) => {
  // DEBUG #4: Kiểm tra giá trị hourlyRate nhận được từ props
  console.log(
    "[BookingModal DEBUG #4] Received props - hourlyRate:",
    hourlyRate,
    "for tutor:",
    tutorName
  );

  const [parsedTutorSchedule, setParsedTutorSchedule] = useState({});
  const [selectedScheduleSlots, setSelectedScheduleSlots] = useState([]);
  const [lessonsPerWeek, setLessonsPerWeek] = useState(1);
  const [totalLessons, setTotalLessons] = useState(10);
  const [hoursPerLesson, setHoursPerLesson] = useState(1.5);
  const [startDay, setStartDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [calculatedTotalHours, setCalculatedTotalHours] = useState(0);
  const [calculatedTotalCoin, setCalculatedTotalCoin] = useState(0);

  const availableHoursOptions = useMemo(() => {
    const maxAllowed = maxHoursPerLesson || 99;
    return formatHoursOptions.filter((opt) => opt.value <= maxAllowed);
  }, [maxHoursPerLesson]);

  const getMinStartDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedScheduleSlots([]);
      setLessonsPerWeek(1);
      setTotalLessons(10);
      setStartDay(getMinStartDate());
      setError("");
      setIsSubmitting(false);
      const defaultOptionValue = 1.5;
      const maxAllowed = maxHoursPerLesson || 99;
      let initialHoursValue = defaultOptionValue;
      if (availableHoursOptions.length > 0) {
        if (
          defaultOptionValue > maxAllowed ||
          !availableHoursOptions.some((opt) => opt.value === defaultOptionValue)
        ) {
          const validOptionsBelowDefault = availableHoursOptions.filter(
            (opt) => opt.value <= defaultOptionValue
          );
          if (validOptionsBelowDefault.length > 0)
            initialHoursValue = validOptionsBelowDefault.reduce(
              (max, opt) => (opt.value > max.value ? opt : max),
              validOptionsBelowDefault[0]
            ).value;
          else
            initialHoursValue = availableHoursOptions.reduce(
              (min, opt) => (opt.value < min.value ? opt : min),
              availableHoursOptions[0]
            ).value;
        }
      } else initialHoursValue = 1;
      setHoursPerLesson(initialHoursValue);
      if (availableScheduleRaw && availableScheduleRaw.length > 0) {
        try {
          const parsed = availableScheduleRaw.reduce((acc, itemString) => {
            let item;
            if (typeof itemString === "string") item = JSON.parse(itemString);
            else if (typeof itemString === "object" && itemString !== null)
              item = itemString;
            if (
              item &&
              item.day &&
              Array.isArray(item.times) &&
              item.times.length > 0
            ) {
              const validTimes = item.times.filter(
                (t) => typeof t === "string" && t.match(/^\d{2}:\d{2}$/)
              );
              if (validTimes.length > 0) {
                if (!acc[item.day]) acc[item.day] = [];
                acc[item.day] = [
                  ...new Set([...acc[item.day], ...validTimes]),
                ].sort();
              }
            }
            return acc;
          }, {});
          setParsedTutorSchedule(parsed);
        } catch (e) {
          console.error("Lỗi parse lịch dạy:", e);
          setParsedTutorSchedule({});
          setError("Lỗi xử lý lịch dạy của gia sư.");
        }
      } else setParsedTutorSchedule({});
    }
  }, [isOpen, availableScheduleRaw, maxHoursPerLesson, availableHoursOptions]);

  useEffect(() => {
    const currentTotalLessons = parseInt(totalLessons, 10) || 0;
    const currentHoursPerLesson = parseFloat(hoursPerLesson) || 0;
    const currentHourlyRate = parseFloat(hourlyRate) || 0;

    console.log("[BookingModal DEBUG] Calculating cost with:", {
      currentTotalLessons,
      currentHoursPerLesson,
      currentHourlyRate,
    });

    if (currentTotalLessons > 0 && currentHoursPerLesson > 0) {
      const totalHrs = currentTotalLessons * currentHoursPerLesson;
      setCalculatedTotalHours(totalHrs);
      if (currentHourlyRate > 0) {
        setCalculatedTotalCoin(totalHrs * currentHourlyRate);
      } else {
        setCalculatedTotalCoin(0);
      }
    } else {
      setCalculatedTotalHours(0);
      setCalculatedTotalCoin(0);
    }
  }, [totalLessons, hoursPerLesson, hourlyRate]);

  const handleSlotToggle = (day, time) => {
    setSelectedScheduleSlots((prevSlots) => {
      const slotIndex = prevSlots.findIndex(
        (slot) => slot.day === day && slot.time === time
      );
      return slotIndex > -1
        ? prevSlots.filter((_, index) => index !== slotIndex)
        : [...prevSlots, { day, time }];
    });
  };

  useEffect(() => {
    const numSelectedSlots = selectedScheduleSlots.length;
    if (numSelectedSlots > 0) {
      const currentLessonsPerWeek = parseInt(lessonsPerWeek, 10) || 1;
      if (currentLessonsPerWeek > numSelectedSlots) {
        setLessonsPerWeek(numSelectedSlots);
      } else if (currentLessonsPerWeek < 1) {
        setLessonsPerWeek(1);
      }
    } else {
      setLessonsPerWeek(1);
    }
  }, [selectedScheduleSlots, lessonsPerWeek]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (selectedScheduleSlots.length === 0) {
      setError("Vui lòng chọn ít nhất một lịch học.");
      setIsSubmitting(false);
      return;
    }

    const currentLessonsPerWeekNum = parseInt(lessonsPerWeek, 10);
    const totalLessonsNum = parseInt(totalLessons, 10);
    const hoursPerLessonNum = parseFloat(hoursPerLesson);

    if (isNaN(currentLessonsPerWeekNum) || currentLessonsPerWeekNum < 1) {
      setError("Số buổi / tuần phải lớn hơn hoặc bằng 1.");
      setIsSubmitting(false);
      return;
    }
    if (currentLessonsPerWeekNum > selectedScheduleSlots.length) {
      setError("Số buổi / tuần không được lớn hơn số lịch đã chọn.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(totalLessonsNum) || totalLessonsNum < 1) {
      setError("Tổng số buổi phải lớn hơn hoặc bằng 1.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(hoursPerLessonNum) || hoursPerLessonNum <= 0) {
      setError("Thời lượng buổi học không hợp lệ.");
      setIsSubmitting(false);
      return;
    }
    if (!startDay) {
      setError("Vui lòng chọn ngày bắt đầu.");
      setIsSubmitting(false);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDay)) {
      setError("Định dạng ngày bắt đầu không hợp lệ.");
      setIsSubmitting(false);
      return;
    }
    const minValidStartDate = new Date(getMinStartDate());
    minValidStartDate.setHours(0, 0, 0, 0);
    const selectedStartDate = new Date(startDay);
    selectedStartDate.setHours(0, 0, 0, 0);
    if (selectedStartDate < minValidStartDate) {
      setError("Ngày bắt đầu phải cách ngày hiện tại ít nhất 1 ngày.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    const dateTimeLearnPayload = selectedScheduleSlots.reduce((acc, slot) => {
      const existingDayEntry = acc.find((entry) => entry.day === slot.day);
      if (existingDayEntry) {
        existingDayEntry.times.push(slot.time);
        existingDayEntry.times.sort();
      } else {
        acc.push({ day: slot.day, times: [slot.time] });
      }
      return acc;
    }, []);
    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    dateTimeLearnPayload.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);

    const payload = {
      dateTimeLearn: dateTimeLearnPayload,
      lessonsPerWeek: currentLessonsPerWeekNum,
      totalLessons: totalLessonsNum,
      hoursPerLesson: hoursPerLessonNum,
      startDay: startDay,
    };

    console.log(
      "[BookingModal] Sending booking request for tutor:",
      tutorId,
      "Payload:",
      JSON.stringify(payload, null, 2)
    );

    try {
      await Api({
        endpoint: `booking-request/create/${tutorId}`,
        method: METHOD_TYPE.POST,
        data: payload,
      });
      toast.success(`Đã gửi yêu cầu thuê gia sư ${tutorName}`);
      if (onBookingSuccess) onBookingSuccess(tutorId);
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu thuê:", err);
      const backendErrorMsg =
        err.response?.data?.errors?.msg || err.response?.data?.message;
      const errorMsg =
        backendErrorMsg || err.message || "Gửi yêu cầu thuê thất bại.";
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
      ariaHideApp={
        typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.MODE === "test"
          ? false
          : true
      }
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
          <label>Chọn lịch học mong muốn (theo lịch có sẵn của gia sư):</label>
          {Object.keys(parsedTutorSchedule).length > 0 ? (
            <div className="available-schedule-picker">
              {daysOfWeek.map((dayKey) => {
                if (
                  parsedTutorSchedule[dayKey] &&
                  parsedTutorSchedule[dayKey].length > 0
                ) {
                  return (
                    <div key={dayKey} className="available-day-group">
                      <strong>{dayLabels[dayKey] || dayKey}:</strong>
                      <div className="available-time-slots">
                        {parsedTutorSchedule[dayKey].map((time) => {
                          const isSelected = selectedScheduleSlots.some(
                            (slot) => slot.day === dayKey && slot.time === time
                          );
                          return (
                            <button
                              type="button"
                              key={`${dayKey}-${time}`}
                              className={`time-slot-btn ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() => handleSlotToggle(dayKey, time)}
                              disabled={isSubmitting}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <p className="no-schedule-message">
              {error && error.startsWith("Lỗi xử lý lịch dạy")
                ? error
                : "Gia sư này chưa cập nhật lịch dạy hoặc lịch không hợp lệ."}
            </p>
          )}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="totalLessons">Tổng số buổi:</label>
            <input
              id="totalLessons"
              type="number"
              min="1"
              value={totalLessons}
              onChange={(e) => setTotalLessons(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="hoursPerLesson">Thời lượng / buổi:</label>
            <select
              id="hoursPerLesson"
              value={hoursPerLesson}
              onChange={(e) => setHoursPerLesson(parseFloat(e.target.value))}
              required
              disabled={availableHoursOptions.length === 0 || isSubmitting}
            >
              {availableHoursOptions.length > 0 ? (
                availableHoursOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {" "}
                    {opt.label}{" "}
                  </option>
                ))
              ) : (
                <option value="">Gia sư chưa đặt</option>
              )}
            </select>
            {maxHoursPerLesson && (
              <small className="input-hint">
                {" "}
                Gia sư dạy tối đa: {formatTeachingTime(maxHoursPerLesson)} /
                buổi{" "}
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="startDay">Ngày bắt đầu:</label>
            <input
              id="startDay"
              type="date"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              required
              min={getMinStartDate()}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {error && !error.startsWith("Lỗi xử lý lịch dạy") && (
          <p className="error-message-modal">{error}</p>
        )}

        <div className="booking-summary">
          <div className="summary-item">
            <FaMoneyBillWave className="summary-icon" />
            <span>Đơn giá:</span>
            <span className="summary-value">
              {parseFloat(hourlyRate) > 0
                ? `${parseFloat(hourlyRate).toLocaleString("vi-VN")} Coin / giờ`
                : "Thỏa thuận"}
            </span>
          </div>
          <div className="summary-item">
            <FaClock className="summary-icon" />
            <span>Tổng số giờ học:</span>
            <span className="summary-value">
              {calculatedTotalHours > 0
                ? `${calculatedTotalHours.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })} giờ`
                : "---"}
            </span>
          </div>
          <div className="summary-item">
            <FaCoins className="summary-icon" />
            <span>Tổng chi phí:</span>
            <span className="summary-value important-value">
              {parseFloat(hourlyRate) > 0 && calculatedTotalCoin > 0
                ? `${calculatedTotalCoin.toLocaleString("vi-VN")} Coin`
                : "Thỏa thuận"}
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              Object.keys(parsedTutorSchedule).length === 0 ||
              selectedScheduleSlots.length === 0
            }
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
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
  availableScheduleRaw: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  ),
  hourlyRate: PropTypes.number,
};

export default BookingModal;
