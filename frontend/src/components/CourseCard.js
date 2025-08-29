import React, { useState } from 'react';
import { getSeatStatus, getSeatStatusColor, getSeatStatusBg, formatCourseCode, truncateText } from '../utils/helpers';
import { PlusIcon, ClockIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import CourseDetails from './CourseDetails';

const CourseCard = ({ course, onAddAlert, isLoading }) => {
  const [showDetails, setShowDetails] = useState(false);
  if (isLoading) {
    return (
      <div className="card card-hover p-6 animate-pulse">
        <div className="shimmer h-4 w-3/4 mb-3 rounded"></div>
        <div className="shimmer h-3 w-1/2 mb-4 rounded"></div>
        <div className="shimmer h-3 w-full mb-2 rounded"></div>
        <div className="shimmer h-3 w-2/3 mb-4 rounded"></div>
        <div className="flex justify-between items-center">
          <div className="shimmer h-8 w-20 rounded"></div>
          <div className="shimmer h-8 w-24 rounded"></div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const status = getSeatStatus(course);
  const availableSeats = course.real_time_seat_count || 0;
  const capacity = course.capacity || 0;

  return (
    <div className="card card-hover p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {formatCourseCode(course.course_code)}
          </h3>
          <p className="text-sm text-gray-600">
            {course.section_name} - {course.course_credit} credits
          </p>
        </div>
        <span className={`status-badge ${getSeatStatusBg(status)} ${getSeatStatusColor(status)}`}>
          {availableSeats} / {capacity} seats
        </span>
      </div>

      {/* Course Details */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Title:</span> {truncateText(course.course_title || 'N/A', 50)}
        </p>
        
        {course.instructor && (
          <p className="text-sm text-gray-700 flex items-center">
            <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
            <span className="font-medium">Instructor:</span> {course.instructor}
          </p>
        )}
        
        <p className="text-sm text-gray-700 flex items-center">
          <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
          <span className="font-medium">Faculty:</span> {course.faculties && course.faculties !== "" ? course.faculties : "TBA"}
        </p>

        {course.schedule_data?.class_schedules && course.schedule_data.class_schedules.length > 0 && (
          <div className="text-sm text-gray-700">
            <div className="flex items-start">
              <ClockIcon className="w-4 h-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Schedule:</span>
                <div className="text-xs text-gray-600 mt-1">
                  {course.schedule_data.class_schedules.map((schedule, index) => (
                    <div key={index} className="mb-1">
                      {schedule.day}: {schedule.start_time} - {schedule.end_time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {course.schedule_data?.lab_section && (
          <div className="text-sm text-gray-700">
            <div className="flex items-start">
              <ClockIcon className="w-4 h-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Lab:</span>
                <div className="text-xs text-gray-600 mt-1">
                  {course.schedule_data.lab_section.lab_course_code && course.schedule_data.lab_section.lab_room_name ? 
                    `${course.schedule_data.lab_section.lab_course_code} - ${course.schedule_data.lab_section.lab_room_name}` : 
                    "Lab information not available"}
                  {course.schedule_data.lab_section.lab_schedules?.class_schedules && course.schedule_data.lab_section.lab_schedules.class_schedules.length > 0 && (
                    <div className="mt-1">
                      {course.schedule_data.lab_section.lab_schedules.class_schedules.map((lab_schedule, index) => (
                        <div key={index}>
                          {lab_schedule.day}: {lab_schedule.start_time} - {lab_schedule.end_time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm">
          <span className={`font-medium ${getSeatStatusColor(status)}`}>
            {status === 'available' && 'Seats available'}
            {status === 'limited' && 'Limited seats'}
            {status === 'full' && 'Currently full'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(true)}
            className="btn btn-secondary text-sm"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            Details
          </button>
          
          {onAddAlert && (
            <button
              onClick={() => onAddAlert(course)}
              className="btn btn-primary text-sm"
              disabled={availableSeats === 0}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Track
            </button>
          )}
        </div>
      </div>

      {showDetails && course && course.id && (
        <CourseDetails 
          courseId={course.id} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
};

export default CourseCard;