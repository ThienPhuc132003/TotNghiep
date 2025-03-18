import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../assets/css/FormDetail.style.css"; // Import the CSS file

const FormDetailComponent = ({
  formData,
  fields,
  mode,
  onChange,
  onSubmit,
  title,
  onClose,
  errors,
}) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {};
    fields.forEach((field) => {
      submitData[field.key] = field.getValue
        ? field.getValue(formData[field.key])
        : formData[field.key];
    });
    onSubmit(submitData);
  };

  return (
    <div className="form-detail-container">
      <div className="form-header">
        <h2>{title}</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="form-grid">
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label>{t(field.label)}</label>
              {field.type === "select" ? (
                <select
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  disabled={mode === "view" || field.readOnly}
                  className={
                    mode === "view" || field.readOnly ? "non-fillable" : ""
                  }
                >
                  {mode !== "edit" && (
                    <option value="">Chọn</option>
                  )}
                  {field.options &&
                    field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleChange}
                  readOnly={mode === "view" || field.readOnly}
                  className={
                    mode === "view" || field.readOnly ? "non-fillable" : ""
                  }
                />
              )}
              {errors && errors[field.key] && (
                <p className="error-message">{errors[field.key]}</p>
              )}
            </div>
          ))}
          <div className="form-actions">
            {mode !== "view" && (
              <button
                type="submit"
                className="save-button"
                onClick={handleSubmit}
              >
                {t("common.save")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

FormDetailComponent.propTypes = {
  formData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        })
      ),
      readOnly: PropTypes.bool,
      required: PropTypes.bool,
      getValue: PropTypes.func, // Thêm getValue
      renderOption: PropTypes.func, // Thêm renderOption
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit", "view"]).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

export default React.memo(FormDetailComponent);
