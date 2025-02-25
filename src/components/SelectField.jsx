// src/components/TutorRegistration/SelectField.jsx
import React from 'react';
import PropTypes from 'prop-types';

const SelectFieldComponent = ({ label, id, name, value, onChange, options, required, error }) => {
    return (
        <div className="formGroup">
            <label htmlFor={id} className="selectLabel">{label}</label>
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className="selectField"
                required={required}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {error && <div className="errorMessage">{error}</div>}
        </div>
    );
};

SelectFieldComponent.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    required: PropTypes.bool,
    error: PropTypes.string,
};

const SelectField = React.memo(SelectFieldComponent);
export default SelectField;