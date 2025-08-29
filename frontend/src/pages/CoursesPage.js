import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { coursesAPI } from '../services/api';
import { debounce } from '../utils/helpers';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CourseCard from '../components/CourseCard';
import AddAlertModal from '../components/AddAlertModal';

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debouncedSetSearch = debounce((value) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 300);

  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  const { data: courses, isLoading, error, refetch } = useQuery(
    ['courses', debouncedSearch, selectedFilter, page, limit],
    () => {
      const params = {
        skip: (page - 1) * limit,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedFilter === 'available' && { available_only: true }),
        ...(selectedFilter === 'full' && { available_only: false }),
        ...(selectedFilter === 'lab' && { section_type: 'LAB' }),
      };
      return coursesAPI.getAll(params).then(res => res.data);
    },
    {
      keepPreviousData: true,
    }
  );

  const handleAddAlert = (course) => {
    setSelectedCourse(course);
    setShowAlertModal(true);
  };

  const handleCloseModal = () => {
    setShowAlertModal(false);
    setSelectedCourse(null);
  };

  const filters = [
    { value: 'all', label: 'All Courses' },
    { value: 'available', label: 'Available' },
    { value: 'full', label: 'Full' }
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error loading courses</div>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Courses</h1>
        <p className="text-gray-600">
          Find and track courses with real-time seat availability
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={(e) => e.preventDefault()} role="search" aria-label="Course search" className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by code, name, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            aria-autocomplete="list"
            className="input pl-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </form>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setSelectedFilter(filter.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && courses && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {courses?.length || 0} courses
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CourseCard key={i} course={null} isLoading />
          ))}
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && courses && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onAddAlert={handleAddAlert}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && courses && courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">No courses found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </div>
      )}

      {/* Pagination - disabled since API doesn't support pagination */}
      {/* <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div> */}

      {/* Add Alert Modal */}
      {showAlertModal && selectedCourse && (
        <AddAlertModal
          course={selectedCourse}
          isOpen={showAlertModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CoursesPage;