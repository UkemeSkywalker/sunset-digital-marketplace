import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', text = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${colorClasses[color]}`}></div>
      {text && <p className={`mt-4 text-${color === 'primary' ? 'primary-600' : color}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;