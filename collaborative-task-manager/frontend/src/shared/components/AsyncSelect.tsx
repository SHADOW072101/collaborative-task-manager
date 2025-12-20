// src/shared/components/AsyncSelect.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  onLoadInitialValue?: (value: string) => Promise<Option[]>;
  debounceTime?: number;
  isLoading?: boolean;
  defaultOptions?: Option[];
  minSearchLength?: number;
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
  minSearchLength = 1,
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
            setOptions(prev => [...initialOptions, ...prev.filter(opt => opt.value !== initialOptions[0].value)]);
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

  // Search function
  const performSearch = useCallback(async (term: string) => {
    if (term.length < minSearchLength) {
      setOptions(defaultOptions);
      return;
    }

    setIsLoading(true);
    try {
      const results = await onSearch(term);
      setOptions(results);
    } catch (error) {
      console.error('Search error:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, defaultOptions, minSearchLength]);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (isOpen && searchTerm.trim().length >= minSearchLength) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm.trim());
      }, debounceTime);
    } else if (searchTerm.trim().length === 0) {
      // If search is cleared, show default options
      setOptions(defaultOptions);
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, isOpen, performSearch, debounceTime, defaultOptions, minSearchLength]);

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
    console.log('✅ Option selected:', option);
    console.log('✅ Calling onChange with value:', option.value);

    setSelectedOption(option);
    onChange?.(option.value);
    setSearchTerm('');
    setIsOpen(false);
    
    // Add selected option to options list if not already present
    if (!options.some(opt => opt.value === option.value)) {
      setOptions(prev => [option, ...prev]);
    }
  };

  const handleClear = () => {
    setSelectedOption(null);
    onChange?.('');
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // If no search term, show default options
    if (!searchTerm.trim() && defaultOptions.length > 0) {
      setOptions(defaultOptions);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // If cleared, show default options
    if (!newValue.trim()) {
      setOptions(defaultOptions);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        {selectedOption ? (
          <div className="flex items-center justify-between p-2 border rounded-md bg-white">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{selectedOption.label}</span>
              {selectedOption.email && (
                <span className="text-xs text-gray-500">{selectedOption.email}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 text-sm ml-2"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {(isLoading || externalLoading) && searchTerm.trim().length >= minSearchLength ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : options.length > 0 ? (
            <div className="py-1">
              {options.map((option) => (
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
              ))}
            </div>
          ) : searchTerm.trim().length >= minSearchLength ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{searchTerm}"
            </div>
          ) : searchTerm.trim().length > 0 && searchTerm.trim().length < minSearchLength ? (
            <div className="p-4 text-center text-gray-500">
              Type at least {minSearchLength} character{minSearchLength > 1 ? 's' : ''} to search
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