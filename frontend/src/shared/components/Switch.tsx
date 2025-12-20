import * as React from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <div className={cn('relative inline-flex items-center', className)}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'h-6 w-11 rounded-full transition-colors duration-200 ease-in-out',
            checked 
              ? 'bg-blue-600' 
              : 'bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0.5',
              'top-0.5 relative'
            )}
          />
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';