import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
}) => {
  return (
    <div
      className={`
        rounded-lg border border-primary-100 bg-white p-6 shadow-[0_10px_28px_rgba(5,40,69,0.08)] ring-1 ring-white transition-all
        ${hoverable ? "hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-[0_16px_36px_rgba(0,157,205,0.18)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
