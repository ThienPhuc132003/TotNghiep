import React, { useState } from "react";
import PropTypes from "prop-types";
import "../../assets/css/Admin/AdminFilterButton.style.css";
import Button from "../Button";

const AdminFilterButtonComponent = ({ fields, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({});

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = fields.find((f) => f.key === name);
    setFilterValues({
      ...filterValues,
      [name]: {
        value: value,
        operator: field.operator,
      },
    });
  };

  const handleApply = () => {
    const filters = Object.entries(filterValues).map(([key, value]) => {
      if (value.value !== "") {
        return {
          key: key,
          operator: value.operator,
          value: value.value,
        };
      }
      return null;
    }).filter(Boolean); // Remove null values

    onApply(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    onApply([]);
  };

  return (
    <div className="filter-button-container">
      <Button onClick={toggleFilter} className="filter-button">
        Lọc nâng cao
      </Button>
      {isOpen && (
        <div className="filter-panel">
          <div className="field-box">
            {fields.map((field) => (
              <div key={field.key} className="filter-field">
                <label>{field.label}</label>
                {field.type === "select" ? (
                  <select
                    name={field.key}
                    value={filterValues[field.key]?.value || ""}
                    onChange={handleChange}
                  >
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
                    value={filterValues[field.key]?.value || ""}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
            <div className="apply-clear-container">
              <Button onClick={handleClearFilters} className="clear-button">
                Xóa
              </Button>
              <Button onClick={handleApply} className="apply-button">
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdminFilterButtonComponent.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["text", "select", "date"]).isRequired,
      operator: PropTypes.oneOf(["equal", "like", "in", "range", "greater", "less"]).isRequired,
      options: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onApply: PropTypes.func.isRequired,
};

const AdminFilterButton = React.memo(AdminFilterButtonComponent);
export default AdminFilterButton;