import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { coursesAPI } from '../services/api';
import { ArrowRightIcon, BellIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const HomePage = () => {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useQuery(
    'course-stats',
    () => {
      console.log('Fetching stats from:', `${API_BASE_URL}/api/realtime/stats`);
      // Try using realtimeAPI directly instead of coursesAPI
      return fetch(`${API_BASE_URL}/api/realtime/stats`)
        .then(response => {
          console.log('Stats response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Stats response data:', data);
          return data.data;
        })
        .catch(err => {
          console.error('Error fetching stats:', err);
          throw err;
        });
    },
    {
      staleTime: 0, // Don't use cache
      cacheTime: 0, // Don't cache at all
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );
  
  // Force a refetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Never Miss a
              <span className="text-primary-600"> Seat</span>
              <br className="hidden sm:block" />
              Again
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get instant email notifications when seats become available in your desired BRAC University courses. 
              Track multiple courses and set custom notification intervals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse Courses
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/my-alerts"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                My Alerts
                <BellIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card card-hover p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {statsLoading ? '...' : stats?.total_courses || '0'}
            </h3>
            <p className="text-gray-600">Total Courses</p>
          </div>

          <div className="card card-hover p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {statsLoading ? '...' : stats?.available_courses || '0'}
            </h3>
            <p className="text-gray-600">Available Courses</p>
          </div>

          <div className="card card-hover p-6 text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {statsLoading ? '...' : stats?.availability_rate || '0'}%
            </h3>
            <p className="text-gray-600">Availability Rate</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to get notified about seat availability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Courses</h3>
            <p className="text-gray-600">
              Browse all available BRACU courses and check real-time seat availability
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Alerts</h3>
            <p className="text-gray-600">
              Add courses to your watchlist and customize notification intervals
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Notified</h3>
            <p className="text-gray-600">
              Receive instant email notifications when seats become available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;