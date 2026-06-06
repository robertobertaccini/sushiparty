import React from 'react';
import { LOCATIONS } from '../lib/constants';

interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

/**
 * Reusable LocationDropdown component for selecting cities
 * Used in admin tables and event forms
 */
export default function LocationDropdown({
  value,
  onChange,
  disabled = false,
  className = '',
  allowEmpty = false,
  emptyLabel = 'Select a location',
}: LocationDropdownProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`border rounded p-2 bg-white ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${className}`}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {LOCATIONS.map((location) => (
        <option key={location} value={location}>
          {location}
        </option>
      ))}
    </select>
  );
}
