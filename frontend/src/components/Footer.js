import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} SeatZ - BRAC University Seat Monitor
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <a 
              href="mailto:support@seatz.app" 
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="https://github.com/seatz-app/seatz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              GitHub
            </a>
            <div className="text-sm text-gray-500">
              Built with ❤️ for BRACU students
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;