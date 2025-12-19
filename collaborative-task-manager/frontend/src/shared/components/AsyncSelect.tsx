// src/shared/components/AsyncSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  [key: string]: any;
}

interface AsyncSelectProps {
  label: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch: (searchTerm: string) => Promise<Option[]>;
  onLoadInitialValue?: (value: string) => Promise<Option[]>; // New prop
  debounceTime?: number;
  isLoading?: boolean;
  defaultOptions?: Option[];
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
  label,
  placeholder = 'Search...',
  error,
  value,
  onChange,
  onSearch,
  onLoadInitialValue,
  debounceTime = 300,
  isLoading: externalLoading,
  defaultOptions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Option[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial value when component mounts
  useEffect(() => {
    if (value && onLoadInitialValue) {
      setIsLoading(true);
      onLoadInitialValue(value)
        .then(initialOptions => {
          if (initialOptions.length > 0) {
            setSelectedOption(initialOptions[0]);
            setOptions(prev => [...initialOptions, ...prev]);
          }
        })
        .catch(error => {
          console.error('Error loading initial value:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [value, onLoadInitialValue]);

  // Set selected option when value changes
  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find(opt => opt.value === value);
      if (found) {
        setSelectedOption(found);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onChange?.(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedOption(null);
    onChange?.('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        {selectedOption ? (
          <div className="flex items-center justify-between p-2 border rounded-md bg-white">
            <span className="text-sm">{selectedOption.label}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading || externalLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`p-3 hover:bg-gray-100 cursor-pointer ${
                  selectedOption?.value === option.value ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">{option.label}</div>
                {option.email && (
                  <div className="text-sm text-gray-500">{option.email}</div>
                )}
              </div>
            ))
          ) : searchTerm.trim() ? (
            <div className="p-4 text-center text-gray-500">
              No users found for "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};