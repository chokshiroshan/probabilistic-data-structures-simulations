import React from 'react';
import { Twitter, Linkedin, Coffee, Briefcase } from 'lucide-react';

const Footer = () => {
  const handleHireMe = (e: React.MouseEvent<HTMLButtonElement>) => { // Specify the type for 'e'
    e.preventDefault();
    const subject = encodeURIComponent('Inquiry about hiring');
    const body = encodeURIComponent('Hello,\n\nI am interested in hiring you for a project. Here are some details:\n\n[Please describe your project or requirements here]\n\nLooking forward to hearing from you!\n\nBest regards,\n[Your Name]');
    window.location.href = `mailto:chokshiroshan@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <footer className="w-full max-w-4xl mt-auto py-4 fixed bottom-0 bg-white dark:bg-gray-800">
        <div className="flex flex-wrap justify-center items-center space-x-6">
          <div className="relative group">
            <a href="https://twitter.com/roshanchokshi" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              <Twitter size={24} />
              <span className="sr-only">Twitter</span>
            </a>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Twitter
            </span>
          </div>
          <div className="relative group">
            <a href="https://www.linkedin.com/in/chokshiroshan" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              <Linkedin size={24} />
              <span className="sr-only">LinkedIn</span>
            </a>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              LinkedIn
            </span>
          </div>
          <div className="relative group">
            <a href="https://www.buymeacoffee.com/chokshiroshan" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              <Coffee size={24} />
              <span className="sr-only">Buy Me a Coffee</span>
            </a>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Buy Me a Coffee
            </span>
          </div>
          <a 
            href="#" 
            onClick={handleHireMe}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Hire Me
          </a>
        </div>
    </footer>
  );
};

export default Footer;

