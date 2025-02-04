// src/components/SearchBar.jsx
import React from "react";
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
  return (
    <div className={searchBarClassName}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={searchInputClassName}
        onKeyDown={onKeyPress}
        {...rest}
      />
      <div className={searchBarButtonClassName} onClick={searchBarOnClick}>
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