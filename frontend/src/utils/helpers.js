import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid Date';
  } catch {
    return 'Invalid Date';
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

export const getSeatStatus = (course) => {
  const available = course.real_time_seat_count || 0;
  const capacity = course.capacity || 0;
  
  if (available === 0) return 'full';
  if (available <= capacity * 0.1) return 'limited';
  return 'available';
};

export const getSeatStatusColor = (status) => {
  switch (status) {
    case 'available': return 'text-success-600';
    case 'limited': return 'text-warning-600';
    case 'full': return 'text-error-600';
    default: return 'text-gray-600';
  }
};

export const getSeatStatusBg = (status) => {
  switch (status) {
    case 'available': return 'bg-success-50';
    case 'limited': return 'bg-warning-50';
    case 'full': return 'bg-error-50';
    default: return 'bg-gray-50';
  }
};

export const formatCourseCode = (code) => {
  return code?.toUpperCase().trim() || '';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateInterval = (interval) => {
  const num = parseInt(interval);
  return num >= 1 && num <= 1440; // 1 minute to 24 hours
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const calculateTimeAgo = (dateString) => {
  if (!dateString) return 'Never';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid Date';
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  } catch {
    return 'Invalid Date';
  }
};

export const generateNotificationMessage = (course) => {
  const seats = course.real_time_seat_count || 0;
  const code = formatCourseCode(course.course_code);
  const section = course.section_name;
  
  if (seats === 1) {
    return `🎉 1 seat available in ${code} ${section}!`;
  } else {
    return `🎉 ${seats} seats available in ${code} ${section}!`;
  }
};