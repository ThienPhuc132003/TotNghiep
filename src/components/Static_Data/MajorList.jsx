import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../network/Api"; // Import Api
import { METHOD_TYPE } from "../../network/methodType"; // Import METHOD_TYPE

// Style cơ bản cho react-select
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: "#ced4da",
    minHeight: "calc(1.5em + 1.8rem + 2px)",
    padding: "0.2rem 0.1rem",
    boxShadow: "none",
    "&:hover": { borderColor: "#b41e2d" },
  }),
  valueContainer: (provided) => ({ ...provided, padding: "0 0.8rem" }),
  input: (provided) => ({ ...provided, margin: "0px", padding: "0px" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (provided) => ({ ...provided, padding: "1px" }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#b41e2d"
      : state.isFocused
      ? "#f8d7da"
      : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
    "&:active": { backgroundColor: "#f5c6cb" },
  }),
  menu: (provided) => ({ ...provided, zIndex: 5 }),
};

const MajorList = ({
  onChange,
  value,
  required = false,
  name = "majorId",
  placeholder = "-- Chọn ngành học --",
}) => {
  const [options, setOptions] = useState([]); // <-- Sử dụng setOptions
  const [isLoading, setIsLoading] = useState(true); // <-- Sử dụng setIsLoading
  const [error, setError] = useState(null); // <-- Sử dụng setError

  // Fetch và format dữ liệu
  useEffect(() => {
    const fetchMajors = async () => {
      setIsLoading(true); // <-- SỬ DỤNG
      setError(null); // <-- SỬ DỤNG
      try {
        // --- *** Gọi API *** ---
        const response = await Api({
          // <-- SỬ DỤNG Api
          endpoint: "major/search",
          method: METHOD_TYPE.GET, // <-- SỬ DỤNG METHOD_TYPE
        });

        // --- *** Xử lý response (Kiểm tra cấu trúc thực tế) *** ---
        const items = response?.data?.items || [];
        console.log("MajorList tét nè", items);


        console.log("MajorList Raw API Response Data:", response?.data);
        console.log("MajorList Extracted Items:", items);

        if (Array.isArray(items) && items.length > 0) {
          const formattedOptions = items.map((major) => ({
            value: major.majorId,
            label: major.majorName,
          }));
          setOptions(formattedOptions); // <-- SỬ DỤNG
          setError(null); // <-- SỬ DỤNG
        } else if (Array.isArray(items) && items.length === 0) {
          setOptions([]); // <-- SỬ DỤNG
          console.warn("MajorList: No major data found.");
        } else {
          console.error(
            "MajorList: Invalid data structure received:",
            response?.data
          );
          setError("Lỗi định dạng dữ liệu ngành học."); // <-- SỬ DỤNG
          setOptions([]); // <-- SỬ DỤNG
        }
      } catch (err) {
        console.error("MajorList fetch error:", err);
        setError("Lỗi tải dữ liệu ngành học."); // <-- SỬ DỤNG
        setOptions([]); // <-- SỬ DỤNG
      } finally {
        setIsLoading(false); // <-- SỬ DỤNG
      }
    };
    fetchMajors();
  }, []); // Dependency trống

  const selectedOption =
    options.find((option) => option.value === value) || null;

  const handleChange = (selected) => {
    onChange(name, selected ? selected.value : "");
  };

  return (
    <>
      <Select
        name={name}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        isLoading={isLoading}
        isDisabled={isLoading || !!error || options.length === 0}
        placeholder={
          isLoading
            ? "Đang tải..."
            : error
            ? "Lỗi!"
            : options.length === 0
            ? "Không có dữ liệu"
            : placeholder
        }
        isClearable={!required}
        isSearchable={true}
        noOptionsMessage={() => "Không tìm thấy ngành học"}
        loadingMessage={() => "Đang tải..."}
        styles={customSelectStyles}
        // required prop không dùng trực tiếp bởi react-select nhưng có thể cần cho logic form cha
      />
      {error && (
        <p className="field-error-message" style={{ marginTop: "0.3rem" }}>
          {error}
        </p>
      )}
    </>
  );
};

MajorList.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

export default MajorList;
