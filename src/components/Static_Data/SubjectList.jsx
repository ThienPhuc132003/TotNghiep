import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../network/Api"; // <-- Import Api
import { METHOD_TYPE } from "../../network/methodType"; // <-- Import METHOD_TYPE

// Style (có thể dùng chung với MajorList hoặc tạo riêng)

const SubjectList = ({
  onChange,
  value,
  required = false,
  name = "subjectId",
  placeholder = "-- Chọn môn học --",
}) => {
  const [options, setOptions] = useState([]); // <-- Sử dụng setOptions
  const [isLoading, setIsLoading] = useState(true); // <-- Sử dụng setIsLoading
  const [error, setError] = useState(null); // <-- Sử dụng setError

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true); // <-- SỬ DỤNG
      setError(null); // <-- SỬ DỤNG
      try {
        // --- *** Gọi API *** ---
        const response = await Api({
          // <-- SỬ DỤNG Api
          endpoint: "subject/search",
          method: METHOD_TYPE.GET, // <-- SỬ DỤNG METHOD_TYPE
        });

        // --- *** Xử lý response (Kiểm tra cấu trúc thực tế) *** ---
        const items = response?.data?.items || [];
        console.log("SubjectList Raw API Response Data:", response?.data);
        console.log("SubjectList Extracted Items:", items);

        if (Array.isArray(items) && items.length > 0) {
          const formattedOptions = items.map((subject) => ({
            value: subject.subjectId,
            label: subject.subjectName,
          }));
          setOptions(formattedOptions); // <-- SỬ DỤNG
          setError(null); // <-- SỬ DỤNG
        } else if (Array.isArray(items) && items.length === 0) {
          setOptions([]); // <-- SỬ DỤNG
          console.warn("SubjectList: API returned empty items array.");
        } else {
          console.error(
            "SubjectList: Invalid data structure received:",
            response?.data
          );
          setError("Lỗi định dạng dữ liệu môn học."); // <-- SỬ DỤNG
          setOptions([]); // <-- SỬ DỤNG
        }
      } catch (err) {
        console.error("SubjectList fetch error:", err);
        setError("Lỗi tải dữ liệu môn học."); // <-- SỬ DỤNG
        setOptions([]); // <-- SỬ DỤNG
      } finally {
        setIsLoading(false); // <-- SỬ DỤNG
      }
    };
    fetchSubjects();
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
        noOptionsMessage={() => "Không tìm thấy môn học"}
        loadingMessage={() => "Đang tải..."}

        // required prop không dùng trực tiếp bởi react-select
      />
      {error && (
        <p className="field-error-message" style={{ marginTop: "0.3rem" }}>
          {error}
        </p>
      )}
    </>
  );
};

SubjectList.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

export default SubjectList;
