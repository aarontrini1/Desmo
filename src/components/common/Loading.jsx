import React from 'react';

const Loading = ({ message = 'Loading content...' }) => {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;