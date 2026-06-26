import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantStyles = {
      primary:
        "bg-accent-500 text-gray-950 hover:bg-accent-600 focus:ring-accent-500 disabled:bg-accent-100",
      secondary:
        "bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-100",
      danger:
        "bg-white text-gray-900 border border-accent-500 hover:bg-accent-50 focus:ring-accent-500 disabled:bg-gray-100",
      success:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-100",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const finalClass = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className} ${
      disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
    }`;

    return (
      <button
        ref={ref}
        className={finalClass}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
