'use client';

import React, { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, children, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: () => setIsOpen(!isOpen),
            'aria-expanded': isOpen
          });
        }
        if (React.isValidElement(child) && child.type === SelectContent) {
          return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
            onValueChange,
            closeDropdown: () => setIsOpen(false)
          }) : null;
        }
        return child;
      })}
    </div>
  );
}

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SelectTrigger({ children, className = '', onClick }: SelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  return (
    <span className="block truncate text-gray-200">
      {children || <span className="text-gray-500">{placeholder}</span>}
    </span>
  );
}

interface SelectContentProps {
  children: ReactNode;
  className?: string;
  onValueChange?: (value: string) => void;
  closeDropdown?: () => void;
}

export function SelectContent({ children, className = '', onValueChange, closeDropdown }: SelectContentProps) {
  return (
    <div className={`mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-700 bg-gray-900 py-1 shadow-lg ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect: (value: string) => {
              onValueChange?.(value);
              closeDropdown?.();
            }
          });
        }
        return child;
      })}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
}

export function SelectItem({ value, children, className = '', onSelect }: SelectItemProps) {
  return (
    <div
      role="option"
      onClick={() => onSelect?.(value)}
      className={`relative cursor-pointer select-none py-1.5 pl-8 pr-2 text-sm text-gray-200 hover:bg-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

export type { SelectProps, SelectTriggerProps, SelectValueProps, SelectContentProps, SelectItemProps }; 