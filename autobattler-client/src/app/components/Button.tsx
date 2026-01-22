import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "success";
}

export default function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const baseStyles = "px-6 py-2 border-2 text-sm uppercase tracking-widest transition-all duration-200 cursor-pointer font-medium";
  
  const variants = {
    primary: "border-white bg-transparent text-white hover:bg-white hover:text-black",
    danger: "border-white bg-transparent text-white hover:bg-white hover:text-red-600 hover:border-red-600",
    success: "border-white bg-transparent text-white hover:bg-white hover:text-green-600 hover:border-green-600"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
