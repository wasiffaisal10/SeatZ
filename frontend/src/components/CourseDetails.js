import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchCourseById, fetchCourseStats } from '../services/api';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

const CourseDetails = ({ courseId, onClose }) => {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const { data: course, isLoading, refetch } = useQuery(
    ['course', courseId],
    () => fetchCourseById(courseId),
    {
      refetchInterval: refreshInterval,
      staleTime: 15000,
    }
  );

  const { data: stats } = useQuery('courseStats', fetchCourseStats, {
    refetchInterval: 60000, // 1 minute
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refetch]);

  if (isLoading) return <LoadingSpinner />;

  if (!course) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Not Found</h3>
          <p className="text-gray-600 mb-4">The requested course could not be found.</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const availableSeats = course.real_time_seat_count || 0;
  const totalSeats = course.capacity || 0;
  const occupiedSeats = Math.max(0, totalSeats - availableSeats);
  const occupancyRate = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;

  const getSeatStatusColor = () => {
    if (availableSeats === 0) return 'text-red-600 bg-red-50';
    if (availableSeats <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getSeatStatusText = () => {
    if (availableSeats === 0) return 'Full';
    if (availableSeats <= 5) return 'Limited';
    return 'Available';
  };

  const formatScheduleTime = (timeString) => {
    if (!timeString) return '';
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {course.course_code} - Section {course.section_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Real-time Seat Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Seat Status</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getSeatStatusColor().split(' ')[0]}`}>
                  {availableSeats}
                </div>
                <div className="text-sm text-gray-600">Available Seats</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {occupiedSeats}
                </div>
                <div className="text-sm text-gray-600">Occupied Seats</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {totalSeats}
                </div>
                <div className="text-sm text-gray-600">Total Capacity</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                <span className="text-sm font-medium text-gray-900">{occupancyRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-md ${getSeatStatusColor()}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${getSeatStatusColor().split(' ')[1]}`}></div>
                <span className="font-medium">{getSeatStatusText()}</span>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Course Code</h4>
                <p className="text-lg font-semibold text-gray-900">{course.course_code}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Section</h4>
                <p className="text-lg font-semibold text-gray-900">{course.section_name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Credits</h4>
                <p className="text-lg font-semibold text-gray-900">{course.course_credit}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Room</h4>
                <p className="text-lg font-semibold text-gray-900">{course.room_name || 'TBA'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Faculty</h4>
                <p className="text-lg font-semibold text-gray-900">{course.faculties || 'TBA'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Type</h4>
                <p className="text-lg font-semibold text-gray-900 capitalize">{course.section_type.toLowerCase()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(course.last_updated || course.last_fetched_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Class Schedule */}
      {course.schedule_data && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Schedule</h3>
          
          {/* Main Class Schedule */}
          {course.schedule_data?.class_schedules && course.schedule_data.class_schedules.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2">📚</span>
                Lecture Schedule
              </h4>
              {course.schedule_data.class_schedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <div>
                    <span className="font-medium text-gray-900 capitalize">{schedule?.day?.toLowerCase() || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      {formatScheduleTime(schedule?.start_time)} - {formatScheduleTime(schedule?.end_time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lab Schedule */}
          {course.schedule_data?.lab_section && course.schedule_data.lab_section.lab_schedules && course.schedule_data.lab_section.lab_schedules.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2">🧪</span>
                Lab Schedule
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Lab Section:</span>
                    <span className="ml-2 font-medium text-gray-900">{course.schedule_data.lab_section.lab_course_code}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <span className="ml-2 font-medium text-gray-900">{course.schedule_data.lab_section.lab_room_name}</span>
                  </div>
                  {course.schedule_data.lab_section.lab_faculties && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Faculty:</span>
                      <span className="ml-2 font-medium text-gray-900">{course.schedule_data.lab_section.lab_faculties}</span>
                    </div>
                  )}
                </div>
              </div>
              {course.schedule_data.lab_section.lab_schedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-blue-100">
                  <div>
                    <span className="font-medium text-gray-900 capitalize">{schedule?.day?.toLowerCase() || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      {formatScheduleTime(schedule?.start_time)} - {formatScheduleTime(schedule?.end_time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {course.schedule_data?.class_start_date && (
              <div>
                <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Class Period</h5>
                <p className="text-sm text-gray-900">
                  {formatDate(course.schedule_data.class_start_date)} - {formatDate(course.schedule_data.class_end_date)}
                </p>
              </div>
            )}
            
            {course.schedule_data?.mid_exam_date && (
              <div>
                <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Midterm Exam</h5>
                <p className="text-sm text-gray-900">
                  {formatDate(course.schedule_data.mid_exam_date)} {formatScheduleTime(course.schedule_data.mid_exam_start_time)} - {formatScheduleTime(course.schedule_data.mid_exam_end_time)}
                </p>
              </div>
            )}
            
            {course.schedule_data?.final_exam_date && (
              <div>
                <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Final Exam</h5>
                <p className="text-sm text-gray-900">
                  {formatDate(course.schedule_data.final_exam_date)} {formatScheduleTime(course.schedule_data.final_exam_start_time)} - {formatScheduleTime(course.schedule_data.final_exam_end_time)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

          {/* Refresh Controls */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Auto-refresh</h4>
              <p className="text-xs text-gray-600">Data updates automatically</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => refetch()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Now
              </button>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;