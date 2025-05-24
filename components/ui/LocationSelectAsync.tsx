/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { searchCities, LocationOption } from '@/lib/geonames';
import { preloadPopularCities } from '@/lib/geonames-cache';

// Dynamic import to avoid SSR issues
const AsyncPaginate = dynamic(
  () => import('react-select-async-paginate').then(mod => mod.AsyncPaginate),
  { 
    ssr: false,
    loading: () => (
      <input 
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
        placeholder="Loading..."
        disabled
      />
    )
  }
);

interface LocationSelectAsyncProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Types for react-select styling
type StylesConfig = {
  control: (provided: any, state: any) => any;
  option: (provided: any, state: any) => any;
  menu: (provided: any) => any;
  menuList: (provided: any) => any;
  input: (provided: any) => any;
  placeholder: (provided: any) => any;
  singleValue: (provided: any) => any;
  loadingIndicator: (provided: any) => any;
  noOptionsMessage: (provided: any) => any;
};

// Custom styles for react-select to match our design
const customStyles: StylesConfig = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '42px',
    borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#6366f1',
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#6366f1' 
      : state.isFocused 
      ? '#e0e7ff' 
      : 'white',
    color: state.isSelected ? 'white' : '#111827',
    padding: '10px 12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#6366f1' : '#e0e7ff',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: '4px',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#111827',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#111827',
  }),
  loadingIndicator: (provided: any) => ({
    ...provided,
    color: '#6366f1',
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    padding: '20px',
    color: '#6b7280',
  }),
};

const LocationSelectAsync: React.FC<LocationSelectAsyncProps> = ({
  value,
  onChange,
  placeholder = 'Type to search cities...',
  className = '',
}) => {
  const [selectedOption, setSelectedOption] = useState<LocationOption | null>(null);

  // Preload popular cities on component mount
  useEffect(() => {
    preloadPopularCities();
  }, []);

  // Find the matching option when value changes
  useEffect(() => {
    if (value) {
      setSelectedOption({ value, label: value });
    } else {
      setSelectedOption(null);
    }
  }, [value]);

  const loadOptions = async (
    search: string,
    _loadedOptions: unknown,
    { page }: { page: number }
  ) => {
    const offset = (page - 1) * 10;
    const { options, hasMore } = await searchCities(search, offset, 10);

    return {
      options,
      hasMore,
      additional: {
        page: page + 1,
      },
    };
  };

  const handleChange = (option: LocationOption | null) => {
    if (option) {
      onChange(option.value);
      setSelectedOption(option);
    } else {
      onChange('');
      setSelectedOption(null);
    }
  };

  // Custom components for better UX
  const components = {
    DropdownIndicator: () => null, // Remove dropdown arrow for cleaner look
    LoadingMessage: () => (
      <div className="text-gray-500 py-2 px-3">Searching cities...</div>
    ),
    NoOptionsMessage: (props: { selectProps: { inputValue?: string } }) => {
      const inputValue = props.selectProps.inputValue || '';
      return (
        <div className="text-gray-500 py-4 px-3 text-center">
          {inputValue.length < 2 
            ? 'Type at least 2 characters to search' 
            : `No cities found for "${inputValue}"`
          }
        </div>
      );
    },
  };

  return (
    <div className={className}>
      <AsyncPaginate
        value={selectedOption}
        onChange={handleChange as any}
        loadOptions={loadOptions}
        styles={customStyles}
        placeholder={placeholder}
        isClearable
        cacheUniqs={[]}
        debounceTimeout={200}
        additional={{
          page: 1,
        }}
        components={components}
        classNamePrefix="location-select"
        // Minimum 2 characters to search
        filterOption={() => true}
        // Allow custom input
        isValidNewOption={(inputValue: string) => inputValue.length >= 2}
        formatCreateLabel={(inputValue: string) => `Use "${inputValue}"`}
      />
    </div>
  );
};

export default LocationSelectAsync;