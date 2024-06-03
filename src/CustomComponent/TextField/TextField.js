import React, { useState } from "react";

// Define CSS styles as a JavaScript object
const styles = {
  container: {
    position: "relative",
    margin: "16px 0",
    width: "100%",
  },
  label: {
    position: "absolute",
    left: "12px",
    top: "12px",
    background: "#384a5f",
    padding: "0 4px",
    transition: "0.2s ease all",
    color: "white",
    cursor: "text",
    pointerEvents: "none",
    borderRadius: "2px",
  },
  labelShrink: {
    top: "-6px",
    left: "8px",
    fontSize: "12px",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "12px 12px 12px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    outline: "none",
    transition: "0.2s ease all",
    background: "#384a5f",
    color: "white",
  },
  inputFocus: {
    borderColor: "#ced4da",
    outline: "-webkit-focus-ring-color auto 1px",
  },
  noSpinButtons: {
    // Removing spin buttons for input[type=number]
    WebkitAppearance: "none",
    MozAppearance: "textfield",
  },
};

const OutlinedTextField = ({
  label,
  type = "text",
  value,
  disabled = false,
}) => {
  const [textValue, setTextValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event) => {
    setTextValue(event.target.value);
    if (typeof value === "function") {
      value(event.target.value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const inputId = `outlined-textfield-${label.replace(/\s+/g, "-")}`;

  return (
    <div style={styles.container}>
      <label
        htmlFor={inputId}
        style={{
          ...styles.label,
          ...(textValue || isFocused ? styles.labelShrink : {}),
          ...(isFocused ? styles.inputFocus : {}),
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        style={{
          ...styles.input,
          ...(isFocused ? styles.inputFocus : {}),
          ...(type === "number" ? styles.noSpinButtons : {}),
        }}
        value={textValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />
      {/* Inline styles to remove spin buttons for input[type=number] */}
      <style>
        {`
          input[type=number]::-webkit-outer-spin-button,
          input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
    </div>
  );
};

export default OutlinedTextField;
