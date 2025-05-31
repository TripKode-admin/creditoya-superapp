import React, { useState, useEffect, ChangeEvent } from "react";

interface DefaultInputProps {
  title: string;
  isValue?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  name?: string;
  id?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function DefaultInput({
  title,
  isValue = false,
  placeholder = "",
  value: initialValue = "",
  onChange,
  required = false,
  name,
  id,
  icon: Icon,
}: DefaultInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Initialize values
  useEffect(() => {
    if (initialValue) {
      setRawValue(initialValue);
      if (isValue) {
        setDisplayValue(formatCurrencyValue(initialValue));
      } else {
        setDisplayValue(initialValue);
      }
    }
  }, [initialValue, isValue]);

  // Format currency value with Colombian peso format (dot as thousands separator, comma as decimal)
  const formatCurrencyValue = (value: string): string => {
    // Remove all non-digit characters except commas
    const cleanValue = value.replace(/[^\d,]/g, "");

    // Split by comma to separate integer and decimal parts
    const parts = cleanValue.split(",");
    const integerPart = parts[0] || "";
    const decimalPart = parts.length > 1 ? parts[1] : "";

    // Format integer part with dots as thousands separators
    let formattedInteger = "";
    for (let i = 0; i < integerPart.length; i++) {
      if (i > 0 && (integerPart.length - i) % 3 === 0) {
        formattedInteger += ".";
      }
      formattedInteger += integerPart[i];
    }

    // Combine with decimal part if it exists
    return decimalPart ? `${formattedInteger},${decimalPart.slice(0, 2)}` : formattedInteger;
  };

  // Get raw numeric value without formatting
  const getRawValue = (formattedValue: string): string => {
    // For currency values, remove dots but keep commas for decimals
    if (isValue) {
      return formattedValue.replace(/\./g, "");
    }
    return formattedValue;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value;

    if (isValue) {
      // If this is a currency input
      // Extract cursor position before formatting
      const cursorPosition = e.target.selectionStart || 0;
      const previousDotsBeforeCursor = (newDisplayValue.substring(0, cursorPosition).match(/\./g) || []).length;

      // Format the value
      const formatted = formatCurrencyValue(newDisplayValue);
      setDisplayValue(formatted);

      // Get raw value for onChange callback
      const newRawValue = getRawValue(formatted);
      setRawValue(newRawValue);

      // Call onChange if provided
      if (onChange) {
        onChange(newRawValue);
      }

      // Adjust cursor position after formatting
      setTimeout(() => {
        if (e.target) {
          const input = e.target as HTMLInputElement;
          const newDotsBeforeCursor = (formatted.substring(0, cursorPosition).match(/\./g) || []).length;
          const cursorOffset = newDotsBeforeCursor - previousDotsBeforeCursor;
          const newPosition = cursorPosition + cursorOffset;

          input.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else {
      // Regular text input
      setDisplayValue(newDisplayValue);
      setRawValue(newDisplayValue);

      // Call onChange if provided
      if (onChange) {
        onChange(newDisplayValue);
      }
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="group flex flex-col gap-2 w-full">
      <label
        htmlFor={id || name || "default-input"}
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 z-10 ${isFocused
            ? 'text-blue-500 dark:text-blue-400'
            : 'text-gray-400 dark:text-gray-500'
            }`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          type="text"
          id={id || name || "default-input"}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`
            w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5
            bg-white dark:bg-gray-700/50
            border-2 transition-all duration-200
            ${isFocused
              ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/10 dark:ring-blue-400/10'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }
            rounded-xl
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${isValue ? "font-mono text-lg tracking-wider" : "font-medium"}
            backdrop-blur-sm
            group-hover:shadow-sm
            focus:shadow-lg focus:shadow-blue-500/10 dark:focus:shadow-blue-400/10
            relative
          `}
          aria-label={title}
        />

        {/* Focus indicator line */}
        <div className={`
          absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 
          transition-all duration-300 rounded-full
          ${isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'}
        `} />
      </div>

      {isValue && displayValue && (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">
          {isValue && rawValue && `COP $${displayValue}`}
        </div>
      )}
    </div>
  );
}

export default DefaultInput;