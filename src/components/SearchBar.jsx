// src/components/SearchBar.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";

const SearchBarComponent = ({
  value,
  onChange,
  searchBarClassName,
  searchInputClassName,
  searchBarButtonClassName,
  searchBarOnClick,
  onKeyPress,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleSearch = () => {
    searchBarOnClick();
    setInputValue(""); // Clear the input value
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };
  const handClearInput = () => {
    setInputValue("");
    onChange("");
  };
  return (
    <div className={searchBarClassName}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={searchInputClassName}
        onKeyDown={onKeyPress}
        {...rest}
      />
      <div className="search-clear-input">
        {inputValue && (
          <i className="fa-solid fa-xmark fa-xs" onClick={handClearInput}></i>
        )}
      </div>
      <div className={searchBarButtonClassName} onClick={handleSearch}>
        <i className="fa-solid fa-magnifying-glass"></i>
      </div>
    </div>
  );
};

SearchBarComponent.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  searchBarClassName: PropTypes.string,
  searchInputClassName: PropTypes.string,
  searchBarButtonClassName: PropTypes.string,
  searchBarOnClick: PropTypes.func,
  onKeyPress: PropTypes.func,
};

const SearchBar = React.memo(SearchBarComponent);
export default SearchBar;
