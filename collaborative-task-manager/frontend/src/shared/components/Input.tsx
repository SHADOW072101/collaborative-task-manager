import { forwardRef, type InputHTMLAttributes } from 'react';
import { type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  leftAddon?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
                      w-full px-4 py-3 rounded-xl shadow-sm
          focus:outline-none focus:ring-3 focus:ring-blue-400/50
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          bg-white/70 backdrop-blur-sm
          ${error
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/50'
                      : 'border-white/50 focus:border-blue-400'
                    }
          ${className}
        `}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';