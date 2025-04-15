// src/components/FormDetail.jsx
import React from "react";
import PropTypes from "prop-types";
import "../assets/css/FormDetail.style.css"; // Ensure this CSS file is imported and updated

// Helper to safely access nested properties
const getNestedValue = (obj, path) => {
  if (!path || typeof path !== "string") return undefined;
  // Handle cases where obj might be null/undefined at some point
  return path.split(".").reduce((acc, part) => {
    // Ensure acc is not null/undefined before accessing the next part
    return acc && acc[part] !== undefined && acc[part] !== null
      ? acc[part]
      : undefined;
  }, obj);
};

const FormDetailComponent = ({
  formData,
  fields,
  mode,
  onChange,
  onSubmit,
  title,
  onClose,
  errors,
  avatarUrl, // Optional avatar URL prop
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox input type
    const newValue = type === "checkbox" ? checked : value;
    // Ensure onChange is callable before calling
    if (typeof onChange === "function") {
      onChange(name, newValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && typeof onSubmit === "function") {
      const submitData = {};
      fields.forEach((field) => {
        // Only include fields relevant to add/edit modes, or handle based on field config
        if (!field.readOnly || mode !== "view") {
          // Basic check
          submitData[field.key] = field.getValue
            ? field.getValue(formData[field.key])
            : formData[field.key];
        }
      });
      onSubmit(submitData);
    }
  };

  return (
    <div className="form-detail-container">
      <div className="form-detail-header">
        <h2>{title}</h2>
        <button
          className="form-detail-close-button"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
      {/* Conditional Avatar Rendering */}
      {avatarUrl && (
        <div className="form-detail-avatar-container">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="form-detail-avatar-img"
          />
        </div>
      )}
      {/* Scrollable Content Area */}
      <div className="form-content">
        <form onSubmit={handleSubmit}>
          <div className="form-detail-grid">
            {fields.map((field) => {
              // Determine if the field should be non-editable based on mode or field.readOnly
              const isReadOnly = mode === "view" || field.readOnly;
              // Get the current value, handling nested keys safely
              const currentValue = getNestedValue(formData, field.key);

              return (
                <div className="form-detail-group" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    {field.required && mode !== "view" && (
                      <span className="required-asterisk">*</span>
                    )}
                  </label>
                  {isReadOnly && field.renderValue ? (
                    // Use renderValue for custom display in view mode
                    <div className="form-detail-value">
                      {/* Pass currentValue and full formData */}
                      {field.renderValue(currentValue, formData)}
                    </div>
                  ) : isReadOnly ? (
                    // Default display for read-only fields without renderValue
                    <div className="form-detail-non-editable">
                      {/* Handle boolean, null/undefined/empty specifically */}
                      {typeof currentValue === "boolean"
                        ? currentValue
                          ? "Có"
                          : "Không"
                        : currentValue !== null &&
                          currentValue !== undefined &&
                          currentValue !== ""
                        ? currentValue
                        : "Không có"}
                    </div>
                  ) : field.type === "select" ? (
                    // Editable Select
                    <select
                      id={field.key}
                      name={field.key}
                      value={currentValue || ""} // Use controlled value
                      onChange={handleChange}
                      disabled={field.disabled} // Optional disabled prop per field
                      required={field.required}
                      className={
                        errors && errors[field.key] ? "input-error" : ""
                      } // Add error class if needed
                    >
                      {/* Add placeholder option */}
                      <option value="" disabled={field.required}>
                        {field.placeholder ||
                          `-- Chọn ${field.label.toLowerCase()} --`}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {" "}
                          {option.label}{" "}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    // Editable Textarea
                    <textarea
                      id={field.key}
                      name={field.key}
                      value={currentValue || ""}
                      onChange={handleChange}
                      rows={field.rows || 4}
                      disabled={field.disabled}
                      required={field.required}
                      placeholder={
                        field.placeholder ||
                        `Nhập ${field.label.toLowerCase()}...`
                      }
                      className={
                        errors && errors[field.key] ? "input-error" : ""
                      }
                    />
                  ) : field.type === "checkbox" ? (
                    // Editable Checkbox
                    <input
                      id={field.key}
                      name={field.key}
                      type="checkbox"
                      checked={!!currentValue} // Ensure boolean value
                      onChange={handleChange}
                      disabled={field.disabled}
                      className="form-detail-checkbox"
                    />
                  ) : (
                    // Default Editable Input
                    <input
                      id={field.key}
                      type={field.type || "text"}
                      name={field.key}
                      value={currentValue || ""}
                      onChange={handleChange}
                      disabled={field.disabled}
                      required={field.required}
                      placeholder={
                        field.placeholder ||
                        `Nhập ${field.label.toLowerCase()}...`
                      }
                      className={
                        errors && errors[field.key] ? "input-error" : ""
                      }
                      pattern={field.pattern}
                      min={field.min}
                      max={field.max}
                    />
                  )}
                  {errors && errors[field.key] && (
                    <p className="form-detail-error-message">
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions only shown if not in view mode */}
          {mode !== "view" && (
            <div className="form-detail-actions">
              <button
                type="button"
                className="form-detail-cancel-button"
                onClick={onClose}
              >
                Hủy
              </button>
              <button type="submit" className="form-detail-save-button">
                Lưu
              </button>
            </div>
          )}
        </form>
      </div>{" "}
      {/* End of form-content */}
    </div> // End of form-detail-container
  );
};

FormDetailComponent.propTypes = {
  formData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string, // text, select, textarea, checkbox, date, number etc.
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.any.isRequired,
        })
      ),
      readOnly: PropTypes.bool, // Field specific readOnly (overrides mode='edit')
      disabled: PropTypes.bool, // Field specific disable
      required: PropTypes.bool,
      getValue: PropTypes.func, // For complex value extraction before submit
      renderValue: PropTypes.func, // For custom rendering in view mode (receives value, fullFormData)
      rows: PropTypes.number, // For textarea
      placeholder: PropTypes.string,
      pattern: PropTypes.string,
      min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  onChange: PropTypes.func, // Optional for view mode
  onSubmit: PropTypes.func, // Optional for view mode
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  errors: PropTypes.object,
  avatarUrl: PropTypes.string, // Optional avatar URL prop
};

// Default props
FormDetailComponent.defaultProps = {
  onChange: () => {},
  onSubmit: () => {},
  errors: {},
  avatarUrl: null,
};

export default React.memo(FormDetailComponent);
