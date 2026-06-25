import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: any; label: string }>;
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, fullWidth = false, className = "", ...props },
    ref,
  ) => {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 shadow-sm outline-none
            focus:border-primary-500 focus:ring-4 focus:ring-primary-100
            transition-all duration-200 ${error ? "border-red-500" : "border-gray-300"}
            disabled:bg-gray-100 disabled:cursor-not-allowed ${className}
          `}
          {...props}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
