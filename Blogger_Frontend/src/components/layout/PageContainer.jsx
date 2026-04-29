import React from 'react';

/**
 * Shared layout wrapper for consistent width + horizontal padding.
 * UI-only: does not affect routing, state, or any network behavior.
 */
const PageContainer = ({ children, paddingY = 'py-8', className = '' }) => {
  return (
    <div className={`app-container ${paddingY} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;

