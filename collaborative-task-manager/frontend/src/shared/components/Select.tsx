// Select.tsx
import { forwardRef, type SelectHTMLAttributes, type ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

// Use the correct interface - HTML select onChange gives ChangeEvent, not string
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  value: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: any;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    options, 
    placeholder, 
    className, 
    id,
    onChange, // Get our custom onChange
    ...props 
  }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    // Handle HTML select change event and convert to string
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value); // Convert event to string
      }
    };
    
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm bg-white
            focus:outline-none focus:ring-2 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${className || ''}
          `}
          onChange={handleChange} // Use our handler
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';