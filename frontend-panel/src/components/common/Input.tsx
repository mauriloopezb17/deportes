import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  as?: "input" | "textarea";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = "",
      type = "text",
      as = "input",
      ...props
    },
    ref,
  ) => {
    const inputClassName = `
      w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 shadow-sm outline-none
      placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100
      transition-all duration-200 ${error ? "border-red-500" : "border-gray-300"}
      disabled:bg-gray-100 disabled:cursor-not-allowed ${className}
    `;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {as === "textarea" ? (
          <textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            className={`${inputClassName} min-h-[96px] resize-y`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input ref={ref} type={type} className={inputClassName} {...props} />
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-500 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
