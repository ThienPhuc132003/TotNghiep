import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Select from "react-select";
import Api from "../../network/Api"; // Import Api
import { METHOD_TYPE } from "../../network/methodType"; // Import METHOD_TYPE

// --- CẬP NHẬT STYLE CHO react-select ĐỂ ĐỒNG BỘ VỚI FORM ---
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "transparent", // Nền trong suốt
    borderColor: state.isFocused ? "#ffffff" : "#ffffff", // Viền trắng (có thể đổi màu khi focus nếu muốn)
    borderWidth: "2px", // Độ dày viền giống input khác
    borderRadius: "16px", // Bo tròn giống input khác
    minHeight: "39px", // Chiều cao tối thiểu giống input khác (có thể cần điều chỉnh)
    height: "39px", // Set chiều cao cố định
    boxShadow: "none", // Bỏ shadow mặc định
    "&:hover": {
      borderColor: "#ffffff", // Giữ viền trắng khi hover
    },
    cursor: "pointer", // Thêm con trỏ
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 0.5rem", // Padding giống input khác (0.5rem)
    height: "39px", // Đảm bảo container giá trị có cùng chiều cao
    alignItems: "center", // Căn giữa giá trị theo chiều dọc
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "rgba(255, 255, 255, 0.7)", // Màu placeholder trắng mờ giống input khác
    fontStyle: "italic", // Giống placeholder input khác
    marginLeft: "2px", // Điều chỉnh nhỏ nếu cần
    marginRight: "2px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffffff", // Màu chữ trắng cho giá trị đã chọn
    marginLeft: "2px",
    marginRight: "2px",
  }),
  input: (provided) => ({
    ...provided,
    color: "#ffffff", // Màu chữ trắng khi đang gõ tìm kiếm
    margin: "0px",
    padding: "0px",
  }),
  indicatorSeparator: () => ({
    display: "none", // Ẩn đường kẻ phân cách
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#ffffff", // Màu mũi tên trắng
    padding: "8px", // Điều chỉnh padding nếu cần
    "&:hover": {
      color: "rgba(255, 255, 255, 0.8)", // Màu mũi tên trắng nhạt hơn khi hover
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#ffffff", // Màu nút clear trắng
    padding: "8px",
    "&:hover": {
      color: "rgba(255, 255, 255, 0.8)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 5, // Giữ z-index cao để menu hiển thị trên các phần tử khác
    backgroundColor: "#ffffff", // Nền trắng cho menu dropdown
    borderRadius: "8px", // Có thể thêm bo tròn nhẹ cho menu
    marginTop: "4px", // Khoảng cách nhỏ giữa control và menu
  }),
  option: (provided, state) => ({
    ...provided,
    // Giữ style option cũ hoặc điều chỉnh màu sắc nếu muốn
    backgroundColor: state.isSelected
      ? "rgba(64, 104, 178, 0.8)" // Màu xanh khi chọn (giống màu nút Đăng ký)
      : state.isFocused
      ? "rgba(64, 104, 178, 0.1)" // Màu nền nhạt khi hover/focus
      : "#ffffff", // Nền trắng mặc định
    color: state.isSelected ? "#ffffff" : "#212529", // Chữ trắng khi chọn, đen khi thường
    padding: "10px 12px", // Tăng padding cho dễ click
    cursor: "pointer",
    "&:active": {
      backgroundColor: "rgba(64, 104, 178, 0.2)", // Màu khi nhấn giữ
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "#6c757d", // Màu chữ xám cho thông báo không có lựa chọn
  }),
  loadingMessage: (provided) => ({
    ...provided,
    color: "#6c757d", // Màu chữ xám cho thông báo đang tải
  }),
};

const MajorList = ({
  onChange,
  value,
  required = false,
  name = "majorId",
  placeholder = "Chọn ngành học của bạn", // Sửa placeholder cho phù hợp
}) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log("MajorList Raw API Response Data:", response?.data);
        console.log("MajorList Extracted Items:", items);

        if (Array.isArray(items)) {
          const formattedOptions = items.map((major) => ({
            value: major.majorId,
            label: major.majorName,
          }));
          setOptions(formattedOptions);
          setError(null);
          if (items.length === 0) {
            console.warn("MajorList: No major data found.");
            // Không cần setError ở đây, component sẽ tự hiển thị noOptionsMessage
          }
        } else {
          console.error(
            "MajorList: Invalid data structure received:",
            response?.data
          );
          setError("Lỗi định dạng dữ liệu ngành học.");
          setOptions([]);
        }
      } catch (err) {
        console.error("MajorList fetch error:", err);
        setError("Lỗi tải dữ liệu ngành học.");
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
    // Khi xóa lựa chọn (isClearable), selected sẽ là null
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
        // isDisabled nên chỉ dùng khi có lỗi nghiêm trọng hoặc không có options
        isDisabled={isLoading || !!error}
        placeholder={
          isLoading
            ? "Đang tải..."
            : error
            ? "Lỗi tải dữ liệu!" // Thông báo lỗi rõ ràng hơn
            : placeholder // Sử dụng placeholder truyền vào
        }
        isClearable={!required} // Cho phép xóa nếu không bắt buộc
        isSearchable={true}
        noOptionsMessage={() => "Không tìm thấy ngành học"}
        loadingMessage={() => "Đang tải..."}
        styles={customSelectStyles} // Áp dụng style đã cập nhật
        required={required} // Truyền prop required xuống để có thể sử dụng ở form cha
      />
      {/* Hiển thị lỗi API riêng biệt nếu muốn */}
      {/* {error && (
        <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>
          {error}
        </p>
      )} */}
      {/* Lỗi validation của form cha sẽ hiển thị bên ngoài component này */}
    </>
  );
};

MajorList.propTypes = {
  onChange: PropTypes.func.isRequired,
  // value có thể là null hoặc chuỗi rỗng khi chưa chọn hoặc khi clear
  value: PropTypes.string, // <<== Nên cho phép null/undefined/""
  required: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

export default MajorList;
