// src/components/TutorRegistration/CheckboxField.jsx
import React from 'react';
import PropTypes from 'prop-types';

const CheckboxFieldComponent = ({ label, id, name, checked, onChange }) => {
    return (
        <div className="checkboxContainer">
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={onChange}
                className="checkboxInput"
            />
            <label htmlFor={id} className="checkboxLabel">{label}</label>
        </div>
    );
};

CheckboxFieldComponent.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

const CheckboxField = React.memo(CheckboxFieldComponent);
export default CheckboxField;