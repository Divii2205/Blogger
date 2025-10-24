import React from 'react';

const Card = ({ 
  children, 
  hover = false,
  padding = 'default',
  className = '',
  ...props 
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white dark:bg-neutral-900 
        border border-neutral-200 dark:border-neutral-800
        rounded-xl shadow-sm
        ${hover ? 'hover:shadow-md hover:scale-[1.01] transition-all duration-200' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

