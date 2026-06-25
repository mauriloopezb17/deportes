import React from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  closable?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  closable = true,
}) => {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "ℹ",
  };

  return (
    <div
      className={`border-l-4 p-4 rounded-r-lg flex items-start gap-3 ${colors[type]}`}
    >
      <span className="font-bold text-lg mt-0.5">{icons[type]}</span>
      <p className="flex-1">{message}</p>
      {closable && onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
