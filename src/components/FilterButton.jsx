import React, { useState } from "react";
import PropTypes from "prop-types";
import "../assets/css/FilterButton.style.css";
import Button from "./Button";

const FilterButtonComponent = ({ fields, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({});

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterValues({ ...filterValues, [name]: value });
  };

  const handleApply = () => {
    onApply(filterValues);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    onApply({});
  };

  return (
    <div className="filter-button-container">
      <Button onClick={toggleFilter} className="filter-button">
        Filter
      </Button>
      {isOpen && (
        <div className="filter-panel">
          {fields.map((field) => (
            <div key={field.key} className="filter-field">
              <label>{field.label}</label>
              {field.type === "select" ? (
                <select name={field.key} value={filterValues[field.key] || ""} onChange={handleChange}>
                  <option value="">Select</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name={field.key}
                  value={filterValues[field.key] || ""}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <Button onClick={handleApply} className="apply-button">
            Apply
          </Button>
          <Button onClick={handleClearFilters} className="clear-button">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

FilterButtonComponent.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onApply: PropTypes.func.isRequired,
};

const FilterButton = React.memo(FilterButtonComponent);
export default FilterButton;