import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";

const SearchBarComponent = ({
  value = "", // Default parameter
  onChange,
  searchBarClassName,
  searchInputClassName,
  placeholder = "", // Default parameter
  onKeyPress,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = useCallback(
    (e) => {
      const newInputValue = e.target.value;
      setInputValue(newInputValue);
      onChange(newInputValue); // Truyền giá trị mới trực tiếp
    },
    [onChange]
  );

  const handClearInput = useCallback(() => {
    setInputValue("");
    onChange(""); // Truyền giá trị rỗng
  }, [onChange]);

  return (
    <div className={searchBarClassName}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={searchInputClassName}
        placeholder={placeholder}
        onKeyDown={onKeyPress}
        {...rest}
      />
      <div className="search-clear-input">
        {inputValue && (
          <i className="fa-solid fa-xmark fa-xs" onClick={handClearInput}></i>
        )}
      </div>
    </div>
  );
};

SearchBarComponent.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  searchBarClassName: PropTypes.string,
  searchInputClassName: PropTypes.string,
  placeholder: PropTypes.string,
  onKeyPress: PropTypes.func,
};

const SearchBar = React.memo(SearchBarComponent);
export default SearchBar;
