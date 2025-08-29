import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchCourses } from '../services/api';

const CourseSearchAutocomplete = ({ onSearchChange, placeholder = "Search courses..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);



  useEffect(() => {
    // No dropdown functionality needed
    setIsOpen(false);
  }, [searchTerm]);



  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Notify parent component immediately with debounced value
    setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };



  const handleKeyDown = (e) => {
    // Prevent form submission on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    
    // Simple Enter key handling without dropdown
    if (e.key === 'Enter' && searchTerm.length > 0) {
      onSearchChange(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={(e) => e.preventDefault()} role="search" aria-label="Course search" className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          spellCheck="false"
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition-all duration-200 ${
            isFocused 
              ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
              searchTerm ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } text-gray-400 hover:text-gray-600 hover:scale-110`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </form>


    </div>
  );
};

export default CourseSearchAutocomplete;