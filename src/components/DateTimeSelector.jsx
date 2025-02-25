import React, { useMemo } from "react";
import PropTypes from "prop-types";

const DateTimeSelector = React.memo(function DateTimeSelector({
  selectedDates,
  onChange,
}) {
  const daysOfWeek = useMemo(
    () => [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    []
  );

  // Tạo mảng các khung giờ hợp lệ
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 22; hour += 2) {
      const time = String(hour).padStart(2, "0") + ":00";
      slots.push(time);
    }
    return slots;
  }, []);

  const handleTimeChange = (dayIndex, timeIndex, timeValue) => {
    const newDateTimeLearn = selectedDates.map((day, index) => {
      if (index === dayIndex) {
        // Create a new array with the updated time
        const newTimes = [...day.times];
        newTimes[timeIndex] = timeValue;
        return { ...day, times: newTimes };
      }
      return day;
    });
    onChange(newDateTimeLearn);
  };

  const canAddMoreTimes = (dayIndex) => {
    return selectedDates[dayIndex]?.times?.length < 8;
  };

  const handleAddTime = (dayIndex) => {
    if (canAddMoreTimes(dayIndex)) {
      const newDateTimeLearn = selectedDates.map((day, index) => {
        if (index === dayIndex) {
          return { ...day, times: [...day.times, ""] }; // Add an empty time slot
        }
        return day;
      });
      onChange(newDateTimeLearn);
    }
  };

  return (
    <div className="formGroup">
      <label className="inputLabel">Select Availability</label>
      {daysOfWeek.map((day, dayIndex) => (
        <div key={day} className="dayContainer">
          <label className="dayLabel">{day}</label>
          {selectedDates[dayIndex]?.times?.map((time, timeIndex) => (
            <select
              key={timeIndex}
              value={time}
              onChange={(e) =>
                handleTimeChange(dayIndex, timeIndex, e.target.value)
              }
              className="timeInput"
            >
              <option value="">-- Select Time --</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          ))}
          {canAddMoreTimes(dayIndex) ? (
            <button
              type="button"
              onClick={() => handleAddTime(dayIndex)}
              className="addTimeButton"
            >
              Add Time
            </button>
          ) : (
            <div>Đã đủ số buổi</div>
          )}
        </div>
      ))}
    </div>
  );
});

DateTimeSelector.displayName = "DateTimeSelector";

DateTimeSelector.propTypes = {
  selectedDates: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      times: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DateTimeSelector;