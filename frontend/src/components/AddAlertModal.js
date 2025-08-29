import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from 'react-query';
import { alertsAPI } from '../services/api';
import { validateEmail, validateInterval } from '../utils/helpers';
import toast from 'react-hot-toast';

const AddAlertModal = ({ course, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [interval, setInterval] = useState(30); // minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const createAlertMutation = useMutation(
    (alertData) => alertsAPI.create(alertData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('alerts');
        toast.success('Alert created successfully!');
        onClose();
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Failed to create alert';
        toast.error(message);
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validateInterval(interval)) {
      toast.error('Please enter a valid interval (1-1440 minutes)');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create or get user
      const userResponse = await fetch('/api/users/email/' + email, {
        method: 'GET',
      });

      let userId;
      if (userResponse.ok) {
        const user = await userResponse.json();
        userId = user.id;
      } else {
        // Create new user
        const createUserResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, full_name: email.split('@')[0] }),
        });
        const newUser = await createUserResponse.json();
        userId = newUser.id;
      }

      await createAlertMutation.mutateAsync({
        user_id: userId,
        course_id: course.id,
        notification_interval_minutes: interval,
      });
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Set Course Alert
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-primary-900 mb-1">
                {course?.course_code} - {course?.section_name}
              </h4>
              <p className="text-sm text-primary-700">
                {course?.course_title || 'Course Title'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="your.email@bracu.ac.bd"
                />
              </div>

              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Interval
                </label>
                <select
                  id="interval"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value))}
                  className="input"
                >
                  <option value={5}>Every 5 minutes</option>
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                  <option value={120}>Every 2 hours</option>
                  <option value={240}>Every 4 hours</option>
                  <option value={720}>Every 12 hours</option>
                  <option value={1440}>Every 24 hours</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <BellIcon className="h-4 w-4 mr-2" />
                    Create Alert
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddAlertModal;