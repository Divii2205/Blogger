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
        bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm
        border border-neutral-200/50 dark:border-neutral-800/50
        rounded-2xl shadow-sm dark:shadow-neutral-950/50
        ${hover ? 'hover:shadow-md dark:hover:shadow-primary-900/15 hover:-translate-y-0.5 transition-all duration-300' : ''}
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

