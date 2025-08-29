import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { fetchCourses, fetchCourseStats } from '../services/api';
import CourseCard from './CourseCard';
import AddAlertModal from './AddAlertModal';
import LoadingSpinner from './LoadingSpinner';
import CourseSearchAutocomplete from './CourseSearchAutocomplete';
import { 
  ChartBarIcon, 
  BellIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const RealTimeDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('available');
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const { 
    data: courses, 
    isLoading, 
    refetch, 
    isFetching 
  } = useQuery(
    ['courses', debouncedSearchTerm, filterStatus, sortBy],
    () => {
      const params = {
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterStatus === 'available' && { available_only: true }),
        ...(filterStatus === 'full' && { available_only: false }),
        ...(filterStatus === 'lab' && { section_type: 'LAB' }),
      };
      return fetchCourses(params);
    },
    {
      refetchInterval: refreshInterval,
      staleTime: 15000,
      cacheTime: 300000,
      keepPreviousData: true,
    }
  );

  const { data: stats } = useQuery('courseStats', fetchCourseStats, {
    refetchInterval: 60000,
  });
  
  // Calculate lab section stats
  const labStats = useMemo(() => {
    if (!courses) return { totalLabs: 0, availableLabs: 0 };
    const labs = courses.filter(course => course.section_type === 'LAB');
    const availableLabs = labs.filter(lab => lab.real_time_seat_count > 0);
    return {
      totalLabs: labs.length,
      availableLabs: availableLabs.length,
      labAvailabilityRate: labs.length > 0 ? Math.round((availableLabs.length / labs.length) * 100) : 0
    };
  }, [courses]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refetch]);

  // Debounce search term
  useEffect(() => {
    // Clear any existing timer
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger refetch when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      refetch();
    }
  }, [debouncedSearchTerm, refetch]);

  const handleAddAlert = (course) => {
    setSelectedCourse(course);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'limited':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'full':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-orange-100 text-orange-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    let filtered = courses.filter(course => {
      const matchesSearch = debouncedSearchTerm.length === 0 || 
        course.course_code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.course_title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Only apply client-side filtering for search when backend filtering isn't used
      return matchesSearch;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'available':
          return b.real_time_seat_count - a.real_time_seat_count;
        case 'code':
          return a.course_code.localeCompare(b.course_code);
        case 'credits':
          return b.course_credit - a.course_credit;
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, debouncedSearchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-time Course Monitor</h1>
            <p className="text-sm text-gray-600 mt-1">
              Live seat availability for BRACU courses
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10000}>10s refresh</option>
              <option value={30000}>30s refresh</option>
              <option value={60000}>1m refresh</option>
              <option value={300000}>5m refresh</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_courses || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Available</p>
                  <p className="text-2xl font-bold text-green-900">{stats.available_courses || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-600">Full Courses</p>
                  <p className="text-2xl font-bold text-red-900">{stats.full_courses || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Availability Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.availability_rate || 0}%</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 text-indigo-600 mr-3 flex items-center justify-center">
                  <span className="text-lg font-bold">L</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-600">Lab Sections</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {labStats.availableLabs} / {labStats.totalLabs}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <CourseSearchAutocomplete
              onSearchChange={setSearchTerm}
              placeholder="Search courses by code or title..."
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="full">Full</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">By Availability</option>
              <option value="code">By Code</option>
              <option value="credits">By Credits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="relative">
        {isFetching && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Updating...</span>
            </div>
          </div>
        )}

        {filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onAddAlert={handleAddAlert}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No courses match your filters'}
            </p>
          </div>
        )}
      </div>

      {/* Add Alert Modal */}
      <AddAlertModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
};

export default RealTimeDashboard;