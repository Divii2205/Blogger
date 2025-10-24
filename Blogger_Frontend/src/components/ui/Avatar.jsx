import React from 'react';

const Avatar = ({ 
  src = '', 
  alt = 'User', 
  size = 'md',
  className = '',
  fallback = null,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`
          ${sizes[size]}
          rounded-full object-cover
          border-2 border-neutral-200 dark:border-neutral-700
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        bg-gradient-to-br from-primary-400 to-primary-600
        flex items-center justify-center
        text-white font-semibold
        border-2 border-neutral-200 dark:border-neutral-700
        ${className}
      `}
    >
      {fallback || getInitials(alt)}
    </div>
  );
};

export default Avatar;

