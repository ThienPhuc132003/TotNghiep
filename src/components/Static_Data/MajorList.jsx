// src/components/Static_Data/MajorList.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";

// 1. Import file CSS mới
import "../../assets/css/MajorList.style.css"; // Đảm bảo đường dẫn đúng

// 2. Xóa hoặc comment đối tượng customSelectStyles
// const customSelectStyles = { ... };

const MajorList = ({
  onChange,
  value,
  required = false,
  name = "majorId", // name này sẽ được dùng cho instanceId
  placeholder = "Chọn ngành học của bạn",
  disabled = false, // Prop để vô hiệu hóa từ bên ngoài
  classNamePrefix = "select-majorId", // Cho phép tùy chỉnh classNamePrefix từ bên ngoài
}) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tạo instanceId dựa trên name để đảm bảo tính duy nhất và dễ nhắm mục tiêu CSS
  const selectInstanceId = `select-${name}`; // Ví dụ: select-majorId

  useEffect(() => {
    const fetchMajors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await Api({
          endpoint: "major/search",
          method: METHOD_TYPE.GET,
        });
        const items = response?.data?.items || [];
        if (Array.isArray(items)) {
          const formattedOptions = items.map((major) => ({
            value: major.majorId,
            label: major.majorName,
          }));
          console.log("MajorList: Loaded options:", formattedOptions); // Debug log
          setOptions(formattedOptions);
        } else {
          console.error(
            "MajorList: Dữ liệu API không phải là mảng hoặc không hợp lệ.",
            response?.data
          );
          setError("Lỗi định dạng dữ liệu ngành học.");
          setOptions([]);
        }
      } catch (err) {
        console.error("MajorList fetch error:", err);
        setError("Lỗi tải dữ liệu ngành học. Vui lòng thử lại.");
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMajors();
  }, []);

  const selectedOption =
    options.find((option) => option.value === value) || null;
  const handleChange = (selected) => {
    console.log("MajorList handleChange called:", { selected, name }); // Debug log
    const value = selected ? selected.value : "";
    console.log("Calling onChange with:", { name, value }); // Debug log
    onChange(name, value);
  };

  const trulyDisabled = disabled || isLoading || !!error;

  return (
    <>
      {" "}
      <Select
        instanceId={selectInstanceId} // QUAN TRỌNG: Giữ lại để CSS có thể nhắm mục tiêu
        classNamePrefix={classNamePrefix} // Sử dụng classNamePrefix được truyền vào
        name={name}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        isLoading={isLoading}
        isDisabled={trulyDisabled}
        placeholder={
          isLoading
            ? "Đang tải ngành học..."
            : error
            ? "Lỗi tải dữ liệu!"
            : placeholder
        }
        isClearable={!required && !trulyDisabled}
        isSearchable={!trulyDisabled}
        noOptionsMessage={() =>
          error
            ? "Lỗi tải dữ liệu"
            : options.length === 0 && !isLoading
            ? "Không có ngành học nào"
            : "Không tìm thấy ngành học"
        }
        loadingMessage={() => "Đang tải..."}
        // 3. Xóa prop 'styles'
        // styles={customSelectStyles}
        // Bạn có thể thêm classNamePrefix nếu muốn có một tiền tố cố định cho các class thay vì dựa hoàn toàn vào instanceId.
        // Ví dụ: classNamePrefix="custom-major-select"
        // Nếu dùng classNamePrefix, bạn cần cập nhật các class trong file CSS cho phù hợp.
        // Ví dụ: .custom-major-select__control thay vì .select-majorId__control
      />
    </>
  );
};

MajorList.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  required: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  classNamePrefix: PropTypes.string,
};

export default MajorList;
