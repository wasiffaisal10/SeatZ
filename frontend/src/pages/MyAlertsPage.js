import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { alertsAPI, coursesAPI } from '../services/api';
import { TrashIcon, BellIcon, ClockIcon } from '@heroicons/react/24/outline';
import { calculateTimeAgo, formatCourseCode } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyAlertsPage = () => {
  const [email, setEmail] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const queryClient = useQueryClient();

  // Fetch alerts based on email
  const { data: alerts, isLoading, error, refetch } = useQuery(
    ['alerts', email],
    () => alertsAPI.getByUser(email).then(res => res.data),
    {
      enabled: isEmailSubmitted && email.length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch course details for each alert
  const { data: coursesData } = useQuery(
    ['courses-for-alerts', alerts?.map(a => a.course_id)],
    async () => {
      if (!alerts) return {};
      const courses = {};
      await Promise.all(
        alerts.map(async (alert) => {
          try {
            const course = await coursesAPI.getById(alert.course_id).then(res => res.data);
            courses[alert.course_id] = course;
          } catch (error) {
            console.error(`Failed to fetch course ${alert.course_id}:`, error);
          }
        })
      );
      return courses;
    },
    {
      enabled: !!alerts && alerts.length > 0,
    }
  );

  // Delete alert mutation
  const deleteAlertMutation = useMutation(
    (alertId) => alertsAPI.delete(alertId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['alerts', email]);
        toast.success('Alert removed successfully');
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Failed to remove alert';
        toast.error(message);
      },
    }
  );

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsEmailSubmitted(true);
    }
  };

  const handleDeleteAlert = (alertId) => {
    if (window.confirm('Are you sure you want to remove this alert?')) {
      deleteAlertMutation.mutate(alertId);
    }
  };

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
    setIsEmailSubmitted(false);
  };

  const getIntervalLabel = (minutes) => {
    if (minutes < 60) return `Every ${minutes} minutes`;
    if (minutes === 60) return 'Every hour';
    if (minutes < 1440) return `Every ${minutes / 60} hours`;
    return 'Every day';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Alerts</h1>
        <p className="text-gray-600">
          Manage your course alerts and notification settings
        </p>
      </div>

      {/* Email Input */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Enter your email to view alerts</h2>
        <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="your.email@bracu.ac.bd"
            required
            className="input flex-1"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!email.trim()}
          >
            View Alerts
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error loading alerts</div>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Alerts List */}
      {isEmailSubmitted && !isLoading && alerts && (
        <>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-600">
                You haven't set up any course alerts yet. 
                <a href="/courses" className="text-primary-600 hover:text-primary-700">Browse courses</a> to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Active Alerts ({alerts.length})
                </h2>
              </div>

              {alerts.map((alert) => {
                const course = coursesData?.[alert.course_id];
                const availableSeats = course?.real_time_seat_count || 0;
                const capacity = course?.capacity || 0;

                return (
                  <div key={alert.id} className="card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {course ? formatCourseCode(course.course_code) : 'Loading...'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {course?.section_name} - {course?.course_title || 'Course Title'}
                            </p>
                          </div>
                          
                          <div className="ml-4 flex-shrink-0">
                            <span className={`status-badge ${
                              availableSeats > 0 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-error-100 text-error-800'
                            }`}>
                              {availableSeats} / {capacity} seats
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            <span>{getIntervalLabel(alert.notification_interval_minutes)}</span>
                          </div>
                          <div className="flex items-center">
                            <BellIcon className="w-4 h-4 mr-1" />
                            <span>Last notification: {calculateTimeAgo(alert.last_notification_sent)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          disabled={deleteAlertMutation.isLoading}
                          className="btn btn-error text-sm"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyAlertsPage;