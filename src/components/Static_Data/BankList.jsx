import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import Select from "react-select"; // <-- Import react-select
import Api from "../../network/Api";
import { METHOD_TYPE } from "../../network/methodType";

// Style (có thể dùng chung hoặc tạo riêng)
const customSelectStyles = {
  /* ... (Copy style từ MajorList hoặc tạo style riêng) ... */
};

const BankList = ({
  onChange,
  value,
  required = false,
  name = "bankName",
  placeholder = "-- Chọn ngân hàng --",
}) => {
  const [options, setOptions] = useState([]); // Chỉ cần state options
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await Api({
          endpoint: "static-data/bank",
          method: METHOD_TYPE.GET,
        });

        // --- *** KIỂM TRA CẤU TRÚC RESPONSE *** ---
        // Giả sử response.data là mảng trực tiếp hoặc response.data.data là mảng
        const items = response?.data?.data || response?.data || []; // Thử cả hai cấu trúc phổ biến

        if (items.length > 0) {
          // API trả về vn_name và shortName. Dùng shortName làm value, vn_name làm label
          const formattedOptions = items.map((bank) => ({
            value: bank.shortName, // <-- Value là shortName
            label: bank.vn_name, // <-- Label là vn_name
          }));
          setOptions(formattedOptions);
        } else {
          setOptions([]);
          console.warn("BankList: No bank data found.");
          // setError("Không tìm thấy dữ liệu ngân hàng.");
        }
      } catch (err) {
        console.error("BankList fetch error:", err);
        setError("Lỗi tải dữ liệu ngân hàng.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Tìm option dựa trên value (shortName)
  const selectedOption =
    options.find((option) => option.value === value) || null;

  const handleChange = (selected) => {
    // Gọi onChange của cha với name và value (shortName)
    onChange(name, selected ? selected.value : "");
  };

  return (
    // Chỉ cần component Select của react-select
    <>
      <Select
        name={name}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        isLoading={isLoading}
        isDisabled={isLoading || !!error}
        placeholder={isLoading ? "Đang tải..." : error ? "Lỗi!" : placeholder}
        isClearable={!required}
        isSearchable={true}
        noOptionsMessage={() => "Không tìm thấy ngân hàng"}
        loadingMessage={() => "Đang tải..."}
        styles={customSelectStyles}
        required={required}
      />
      {error && (
        <p className="field-error-message" style={{ marginTop: "0.3rem" }}>
          {error}
        </p>
      )}
    </>
  );
};

BankList.propTypes = {
  onChange: PropTypes.func.isRequired, // Hàm nhận (name, value)
  value: PropTypes.string.isRequired, // Là shortName string
  required: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

export default BankList;
