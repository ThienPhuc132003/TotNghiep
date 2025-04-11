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

const TutorLevelList = ({
  onChange,
  value,
  required = false,
  name = "tutorLevelId",
  placeholder = "-- Chọn hạng gia sư --",
}) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch và format dữ liệu
  useEffect(() => {
    const fetchTutorLevels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await Api({
          endpoint: "tutor-level/search",
          method: METHOD_TYPE.GET,
        });

        const items = response?.data?.items || [];
        if (Array.isArray(items) && items.length > 0) {
          const formattedOptions = items.map((level) => ({
            value: level.tutorLevelId,
            label: level.levelName,
          }));
          setOptions(formattedOptions);
          setError(null);
        } else if (Array.isArray(items) && items.length === 0) {
          setOptions([]);
          console.warn("TutorLevelList: No tutor level data found.");
        } else {
          console.error(
            "TutorLevelList: Invalid data structure received:",
            response?.data
          );
          setError("Lỗi định dạng dữ liệu hạng gia sư.");
          setOptions([]);
        }
      } catch (err) {
        console.error("TutorLevelList fetch error:", err);
        setError("Lỗi tải dữ liệu hạng gia sư.");
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTutorLevels();
  }, []);

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
        noOptionsMessage={() => "Không tìm thấy hạng gia sư"}
        loadingMessage={() => "Đang tải..."}
        styles={customSelectStyles}
      />
      {error && (
        <p className="field-error-message" style={{ marginTop: "0.3rem" }}>
          {error}
        </p>
      )}
    </>
  );
};

TutorLevelList.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
};

export default TutorLevelList;