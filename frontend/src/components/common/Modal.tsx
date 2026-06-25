import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full mx-4 overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10 ${sizeClasses[size]}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 p-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
