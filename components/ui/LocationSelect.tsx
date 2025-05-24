"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { SingleValue } from 'react-select';

// Dynamic import to avoid SSR issues
const CreatableSelect = dynamic(() => import('react-select/creatable'), { 
  ssr: false,
  loading: () => (
    <input 
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
      placeholder="Loading..."
      disabled
    />
  )
});

interface LocationOption {
  value: string;
  label: string;
}

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Popular US cities with proper formatting
const US_CITIES: LocationOption[] = [
  // Major cities
  { value: 'New York, NY', label: 'New York, NY' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
  { value: 'Chicago, IL', label: 'Chicago, IL' },
  { value: 'Houston, TX', label: 'Houston, TX' },
  { value: 'Phoenix, AZ', label: 'Phoenix, AZ' },
  { value: 'Philadelphia, PA', label: 'Philadelphia, PA' },
  { value: 'San Antonio, TX', label: 'San Antonio, TX' },
  { value: 'San Diego, CA', label: 'San Diego, CA' },
  { value: 'Dallas, TX', label: 'Dallas, TX' },
  { value: 'San Jose, CA', label: 'San Jose, CA' },
  { value: 'Austin, TX', label: 'Austin, TX' },
  { value: 'Jacksonville, FL', label: 'Jacksonville, FL' },
  { value: 'Fort Worth, TX', label: 'Fort Worth, TX' },
  { value: 'Columbus, OH', label: 'Columbus, OH' },
  { value: 'San Francisco, CA', label: 'San Francisco, CA' },
  { value: 'Charlotte, NC', label: 'Charlotte, NC' },
  { value: 'Indianapolis, IN', label: 'Indianapolis, IN' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
  { value: 'Denver, CO', label: 'Denver, CO' },
  { value: 'Washington, DC', label: 'Washington, DC' },
  { value: 'Boston, MA', label: 'Boston, MA' },
  { value: 'El Paso, TX', label: 'El Paso, TX' },
  { value: 'Nashville, TN', label: 'Nashville, TN' },
  { value: 'Detroit, MI', label: 'Detroit, MI' },
  { value: 'Portland, OR', label: 'Portland, OR' },
  { value: 'Las Vegas, NV', label: 'Las Vegas, NV' },
  { value: 'Memphis, TN', label: 'Memphis, TN' },
  { value: 'Louisville, KY', label: 'Louisville, KY' },
  { value: 'Baltimore, MD', label: 'Baltimore, MD' },
  { value: 'Milwaukee, WI', label: 'Milwaukee, WI' },
  { value: 'Albuquerque, NM', label: 'Albuquerque, NM' },
  { value: 'Tucson, AZ', label: 'Tucson, AZ' },
  { value: 'Fresno, CA', label: 'Fresno, CA' },
  { value: 'Sacramento, CA', label: 'Sacramento, CA' },
  { value: 'Atlanta, GA', label: 'Atlanta, GA' },
  { value: 'Kansas City, MO', label: 'Kansas City, MO' },
  { value: 'Miami, FL', label: 'Miami, FL' },
  { value: 'Raleigh, NC', label: 'Raleigh, NC' },
  { value: 'Omaha, NE', label: 'Omaha, NE' },
  { value: 'Minneapolis, MN', label: 'Minneapolis, MN' },
  { value: 'Tampa, FL', label: 'Tampa, FL' },
  { value: 'Arlington, TX', label: 'Arlington, TX' },
  { value: 'New Orleans, LA', label: 'New Orleans, LA' },
  
  // Tech hubs
  { value: 'Palo Alto, CA', label: 'Palo Alto, CA' },
  { value: 'Mountain View, CA', label: 'Mountain View, CA' },
  { value: 'Cupertino, CA', label: 'Cupertino, CA' },
  { value: 'Redmond, WA', label: 'Redmond, WA' },
  { value: 'Cambridge, MA', label: 'Cambridge, MA' },
  { value: 'Boulder, CO', label: 'Boulder, CO' },
  
  // Other major metros
  { value: 'Salt Lake City, UT', label: 'Salt Lake City, UT' },
  { value: 'Orlando, FL', label: 'Orlando, FL' },
  { value: 'San Bernardino, CA', label: 'San Bernardino, CA' },
  { value: 'Pittsburgh, PA', label: 'Pittsburgh, PA' },
  { value: 'Cincinnati, OH', label: 'Cincinnati, OH' },
  { value: 'St. Louis, MO', label: 'St. Louis, MO' },
  { value: 'Cleveland, OH', label: 'Cleveland, OH' },
  { value: 'Virginia Beach, VA', label: 'Virginia Beach, VA' },
  { value: 'Riverside, CA', label: 'Riverside, CA' },
  { value: 'Oklahoma City, OK', label: 'Oklahoma City, OK' },
  { value: 'Buffalo, NY', label: 'Buffalo, NY' },
  { value: 'Newark, NJ', label: 'Newark, NJ' },
  { value: 'Fort Lauderdale, FL', label: 'Fort Lauderdale, FL' },
  
  // Remote options
  { value: 'Remote', label: 'Remote' },
  { value: 'Remote, USA', label: 'Remote, USA' },
  { value: 'Hybrid - New York, NY', label: 'Hybrid - New York, NY' },
  { value: 'Hybrid - San Francisco, CA', label: 'Hybrid - San Francisco, CA' },
  { value: 'Hybrid - Los Angeles, CA', label: 'Hybrid - Los Angeles, CA' },
  { value: 'Hybrid - Chicago, IL', label: 'Hybrid - Chicago, IL' },
  { value: 'Hybrid - Seattle, WA', label: 'Hybrid - Seattle, WA' },
  { value: 'Hybrid - Austin, TX', label: 'Hybrid - Austin, TX' },
  { value: 'Hybrid - Boston, MA', label: 'Hybrid - Boston, MA' },
  { value: 'Hybrid - Denver, CO', label: 'Hybrid - Denver, CO' },
];

// Custom styles for react-select to match our design
const customStyles = {
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
    '&:hover': {
      backgroundColor: state.isSelected ? '#6366f1' : '#e0e7ff',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
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
};

const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  placeholder = 'Select or type a location...',
  className = '',
}) => {
  const [selectedOption, setSelectedOption] = useState<LocationOption | null>(null);

  // Find the matching option when value changes
  useEffect(() => {
    const option = US_CITIES.find(city => city.value === value);
    setSelectedOption(option || (value ? { value, label: value } : null));
  }, [value]);

  const handleChange = (option: SingleValue<LocationOption>) => {
    if (option) {
      onChange(option.value);
      setSelectedOption(option);
    } else {
      onChange('');
      setSelectedOption(null);
    }
  };

  // Allow custom values to be created
  const formatCreateLabel = (inputValue: string) => `Use "${inputValue}"`;

  return (
    <div className={className}>
      <CreatableSelect<LocationOption>
        value={selectedOption}
        onChange={handleChange}
        options={US_CITIES}
        styles={customStyles}
        placeholder={placeholder}
        isClearable
        isSearchable
        // Allow creating custom values
        formatCreateLabel={formatCreateLabel}
        // Better search - search anywhere in the string, not just the beginning
        filterOption={(option, inputValue) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        }}
        // Show more options in the dropdown
        maxMenuHeight={300}
        // Better performance for long lists
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        // Accessibility
        classNamePrefix="location-select"
        // Clean look without dropdown arrow
        components={{
          DropdownIndicator: () => null,
        }}
      />
    </div>
  );
};

export default LocationSelect;