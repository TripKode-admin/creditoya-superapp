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
}: DefaultInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [rawValue, setRawValue] = useState("");

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

  return (
    <div className="flex flex-col gap-2 w-full">
      <label 
        htmlFor={id || name || "default-input"} 
        className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2"
      >
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        id={id || name || "default-input"}
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`
          text-base font-thin border rounded-md p-2 
          dark:bg-gray-800 bg-white
          dark:text-gray-200 text-gray-700 
          dark:border-gray-600 border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          ${isValue ? "font-thin tracking-wide" : ""}
        `}
        aria-label={title}
      />
    </div>
  );
}

export default DefaultInput;