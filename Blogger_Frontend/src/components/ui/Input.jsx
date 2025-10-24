import React from 'react';

const Input = ({ 
  label = '', 
  error = '', 
  helperText = '',
  icon = null,
  fullWidth = true,
  className = '',
  ...props 
}) => {
  const inputStyles = `
    w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-neutral-900
    text-neutral-900 dark:text-neutral-100
    border-neutral-300 dark:border-neutral-700
    focus:ring-2 focus:ring-primary-500 focus:border-transparent
    placeholder:text-neutral-400 dark:placeholder:text-neutral-600
    transition-all duration-200
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${icon ? 'pl-10' : ''}
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600">
            {icon}
          </div>
        )}
        <input className={inputStyles} {...props} />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-slide-down">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;

