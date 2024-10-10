import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-12 h-6 bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      <motion.div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isDarkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
      <span className="absolute left-1 text-yellow-500">
        <Sun size={16} />
      </span>
      <span className="absolute right-1 text-gray-800">
        <Moon size={16} />
      </span>
    </button>
  );
};

export default ToggleSwitch;
