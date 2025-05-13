import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import { toast } from "react-toastify";
import Api from "../../network/Api"; // Điều chỉnh đường dẫn nếu cần
import { METHOD_TYPE } from "../../network/methodType"; // Điều chỉnh đường dẫn nếu cần
import "../../assets/css/BookingModal.style.css"; // Điều chỉnh đường dẫn nếu cần

// Đảm bảo Modal.setAppElement được gọi ở file gốc (App.jsx hoặc index.js)
// Ví dụ:
// if (typeof window !== 'undefined' && document.getElementById('root')) {
//   Modal.setAppElement('#root');
// }

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
  if (hours === null || isNaN(hours) || hours <= 0) {
    return null;
  }
  const h = Math.floor(hours);
  const minutes = Math.round((hours - h) * 60);
  let result = `${h} giờ`;
  if (minutes > 0) {
    result += ` ${minutes} phút`;
  }
  return result;
};

const BookingModal = ({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  onBookingSuccess,
  maxHoursPerLesson = null, // Sử dụng tham số mặc định
  availableScheduleRaw = [], // Sử dụng tham số mặc định
}) => {
  const [parsedTutorSchedule, setParsedTutorSchedule] = useState({});
  const [selectedScheduleSlots, setSelectedScheduleSlots] = useState([]);

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
          if (validOptionsBelowDefault.length > 0) {
            initialHoursValue = validOptionsBelowDefault.reduce(
              (max, opt) => (opt.value > max.value ? opt : max),
              validOptionsBelowDefault[0]
            ).value;
          } else {
            initialHoursValue = availableHoursOptions.reduce(
              (min, opt) => (opt.value < min.value ? opt : min),
              availableHoursOptions[0]
            ).value;
          }
        }
      } else {
        initialHoursValue = 1;
      }
      setHoursPerLesson(initialHoursValue);

      if (availableScheduleRaw && availableScheduleRaw.length > 0) {
        try {
          const parsed = availableScheduleRaw.reduce((acc, itemString) => {
            let item;
            if (typeof itemString === "string") {
              item = JSON.parse(itemString);
            } else if (typeof itemString === "object" && itemString !== null) {
              item = itemString;
            }

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
                if (!acc[item.day]) {
                  acc[item.day] = [];
                }
                acc[item.day] = [
                  ...new Set([...acc[item.day], ...validTimes]),
                ].sort();
              }
            }
            return acc;
          }, {});
          setParsedTutorSchedule(parsed);
        } catch (e) {
          console.error("Lỗi parse lịch dạy có sẵn của gia sư:", e);
          setParsedTutorSchedule({});
          setError("Lỗi khi xử lý lịch dạy của gia sư. Vui lòng thử lại.");
        }
      } else {
        setParsedTutorSchedule({});
      }
    }
  }, [isOpen, availableScheduleRaw, maxHoursPerLesson, availableHoursOptions]);

  const handleSlotToggle = (day, time) => {
    setSelectedScheduleSlots((prevSlots) => {
      const slotIndex = prevSlots.findIndex(
        (slot) => slot.day === day && slot.time === time
      );
      if (slotIndex > -1) {
        return prevSlots.filter((_, index) => index !== slotIndex);
      } else {
        return [...prevSlots, { day, time }];
      }
    });
  };

  useEffect(() => {
    const numSelectedSlots = selectedScheduleSlots.length;
    if (numSelectedSlots > 0) {
      if (lessonsPerWeek > numSelectedSlots) {
        setLessonsPerWeek(numSelectedSlots);
      } else if (lessonsPerWeek < 1 && numSelectedSlots > 0) {
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
      setError("Vui lòng chọn ít nhất một lịch học từ lịch của gia sư.");
      setIsSubmitting(false);
      return;
    }

    const currentLessonsPerWeek = parseInt(lessonsPerWeek, 10);
    if (isNaN(currentLessonsPerWeek) || currentLessonsPerWeek < 1) {
      setError("Số buổi / tuần phải là một số lớn hơn hoặc bằng 1.");
      setIsSubmitting(false);
      return;
    }
    if (currentLessonsPerWeek > selectedScheduleSlots.length) {
      setError("Số buổi / tuần không được lớn hơn số lịch học bạn đã chọn.");
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

    const minValidStartDate = new Date(getMinStartDate());
    const selectedStartDate = new Date(startDay);
    minValidStartDate.setHours(0, 0, 0, 0);
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
      lessonsPerWeek: currentLessonsPerWeek,
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
        requireToken: true,
      });
      toast.success(`Đã gửi yêu cầu thuê gia sư ${tutorName}`);
      if (onBookingSuccess) onBookingSuccess(tutorId);
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu thuê:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Gửi yêu cầu thuê thất bại. Vui lòng thử lại.";
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
      // Sử dụng import.meta.env của Vite để xử lý ariaHideApp
      // MODE sẽ là 'development', 'production', hoặc giá trị bạn đặt cho test
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
              {error && error.startsWith("Lỗi khi xử lý lịch dạy")
                ? error
                : "Gia sư này hiện chưa cập nhật lịch dạy hoặc lịch không hợp lệ. Bạn có thể liên hệ trực tiếp với gia sư."}
            </p>
          )}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="lessonsPerWeek">Số buổi / tuần:</label>
            <input
              id="lessonsPerWeek"
              type="number"
              min="1"
              max={
                selectedScheduleSlots.length > 0
                  ? selectedScheduleSlots.length
                  : 7
              }
              value={lessonsPerWeek}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setLessonsPerWeek(
                    val < 1 && selectedScheduleSlots.length > 0 ? 1 : val
                  );
                } else if (e.target.value === "") {
                  setLessonsPerWeek(selectedScheduleSlots.length > 0 ? 1 : "");
                }
              }}
              required
              disabled={selectedScheduleSlots.length === 0 || isSubmitting}
            />
            {selectedScheduleSlots.length > 0 && (
              <small className="input-hint">
                Tối đa: {selectedScheduleSlots.length} (dựa trên lựa chọn của
                bạn)
              </small>
            )}
          </div>
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
              onChange={(e) => setHoursPerLesson(e.target.value)}
              required
              disabled={availableHoursOptions.length === 0 || isSubmitting}
            >
              {availableHoursOptions.length > 0 ? (
                availableHoursOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <option value="">Gia sư chưa đặt</option>
              )}
            </select>
            {maxHoursPerLesson && (
              <small className="input-hint">
                Gia sư dạy tối đa: {formatTeachingTime(maxHoursPerLesson)} /
                buổi
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

        {error && !error.startsWith("Lỗi khi xử lý lịch dạy") && (
          <p className="error-message-modal">{error}</p>
        )}

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
};

// Không còn BookingModal.defaultProps nữa

export default BookingModal;
