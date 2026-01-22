import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`bg-transparent border-b border-white/30 text-white placeholder-white/40 focus:border-white focus:outline-none py-2 px-1 transition-colors w-full ${className}`}
      {...props}
    />
  );
}
