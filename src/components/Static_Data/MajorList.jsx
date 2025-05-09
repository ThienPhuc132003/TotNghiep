// src/components/Static_Data/MajorList.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";

// --- CẬP NHẬT STYLE CHO react-select ĐỂ ĐỒNG BỘ VỚI FORM ---
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "transparent",
    borderColor: state.isFocused
      ? "#ffffff"
      : state.isDisabled
      ? "rgba(255, 255, 255, 0.5)"
      : "#ffffff",
    borderWidth: "2px", // Giữ nguyên vì CSS ghi đè sẽ dùng giá trị này để tính toán
    borderRadius: "16px",
    minHeight: "auto", // Để CSS bên ngoài kiểm soát hoàn toàn minHeight và height
    height: "auto", // Để CSS bên ngoài kiểm soát hoàn toàn
    boxShadow: "none",
    "&:hover": {
      borderColor: state.isFocused
        ? "#ffffff"
        : state.isDisabled
        ? "rgba(255, 255, 255, 0.5)"
        : "rgba(255, 255, 255, 0.85)",
    },
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    display: "flex", // Cần thiết
    alignItems: "stretch", // Cần thiết
    padding: 0, // Control không nên có padding, để valueContainer xử lý
    boxSizing: "border-box", // Quan trọng
  }),
  valueContainer: (provided) => ({
    ...provided,
    // Padding sẽ được ghi đè bởi CSS ngoài, nhưng để giá trị mặc định ở đây
    paddingTop: "0.9rem",
    paddingBottom: "0.9rem",
    paddingLeft: "calc(1.2rem - 2px)",
    paddingRight: "calc(1.2rem - 2px)",
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    overflow: "hidden", // Giúp xử lý text dài nếu không có ellipsis
    boxSizing: "border-box", // Quan trọng
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: state.isDisabled
      ? "rgba(255, 255, 255, 0.4)"
      : "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // margin-left: 0; // Để padding của valueContainer quyết định vị trí
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "rgba(255, 255, 255, 0.5)" : "#ffffff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  input: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "rgba(255, 255, 255, 0.5)" : "#ffffff",
    margin: "0",
    paddingTop: "0",
    paddingBottom: "0",
    boxSizing: "border-box",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    alignSelf: "stretch",
    boxSizing: "border-box",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: "8px",
    color: state.isDisabled ? "rgba(255, 255, 255, 0.4)" : "#ffffff",
    "&:hover": {
      color: state.isDisabled
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(255, 255, 255, 0.8)",
    },
  }),
  clearIndicator: (provided, state) => ({
    ...provided,
    padding: "8px",
    color: state.isDisabled ? "rgba(255, 255, 255, 0.4)" : "#ffffff",
    "&:hover": {
      color: state.isDisabled
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(255, 255, 255, 0.8)",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 10,
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    marginTop: "4px", // Khoảng cách từ control đến menu
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "rgba(180, 30, 45, 0.9)" // Màu Văn Lang
      : state.isFocused
      ? "rgba(180, 30, 45, 0.1)"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#212529",
    padding: "10px 15px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "rgba(180, 30, 45, 0.2)",
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "#6c757d",
    padding: "10px 15px",
  }),
  loadingMessage: (provided) => ({
    ...provided,
    color: "#6c757d",
    padding: "10px 15px",
  }),
};

const MajorList = ({
  onChange,
  value,
  required = false,
  name = "majorId", // name này sẽ được dùng cho instanceId
  placeholder = "Chọn ngành học của bạn",
  disabled = false, // Prop để vô hiệu hóa từ bên ngoài
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
          endpoint: "major/search", // Giả sử API endpoint là đây
          method: METHOD_TYPE.GET,
        });
        // Kiểm tra cấu trúc response cẩn thận
        const items = response?.data?.items || [];
        if (Array.isArray(items)) {
          const formattedOptions = items.map((major) => ({
            value: major.majorId, // Đảm bảo key là 'majorId' hoặc tương ứng với dữ liệu API
            label: major.majorName, // Đảm bảo key là 'majorName'
          }));
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
    onChange(name, selected ? selected.value : ""); // Truyền giá trị rỗng nếu xóa
  };

  const trulyDisabled = disabled || isLoading || !!error;

  return (
    <>
      <Select
        instanceId={selectInstanceId} // QUAN TRỌNG: Dùng để CSS nhắm mục tiêu
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
        styles={customSelectStyles}
        // classNamePrefix={selectInstanceId} // Thêm prefix cho các class nội bộ của react-select nếu muốn (ví dụ: select-majorId__control)
      />
      {/* 
        Không cần hiển thị lỗi ở đây nữa, vì placeholder và noOptionsMessage đã xử lý.
        Lỗi validation của form cha sẽ hiển thị bên ngoài component này.
      */}
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
};

export default MajorList;
