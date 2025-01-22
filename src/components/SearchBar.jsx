// src/components/SearchBar.jsx
import React from "react";
import PropTypes from "prop-types";
import "../assets/css/SearchBar.style.css";

const SearchBarComponent = ({
  value,
  onChange,
  searchBarClassName,
  searchInputClassName,
  ...rest
}) => {
  return (
    <div className={searchBarClassName}>
      <i className="fa-solid fa-magnifying-glass"></i>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={searchInputClassName}
        {...rest}
      />
    </div>
  );
};

SearchBarComponent.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  searchBarClassName: PropTypes.string,
  searchInputClassName: PropTypes.string,
};

const SearchBar = React.memo(SearchBarComponent);
export default SearchBar;
