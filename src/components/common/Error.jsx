import React from 'react';

const Error = ({ message = 'Something went wrong.' }) => {
  return (
    <div className="error">
      <div className="error-icon">⚠️</div>
      <h2>Error</h2>
      <p>{message}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Try Again
      </button>
    </div>
  );
};

export default Error;