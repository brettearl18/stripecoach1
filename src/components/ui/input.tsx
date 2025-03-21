import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 
        text-gray-100 placeholder-gray-400 ${className}`}
      {...props}
    />
  );
} 