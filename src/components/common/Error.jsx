import React from 'react';

const Error = ({ message = 'Something went wrong.' }) => {
  return (
    <div className="error">
      <div className="error-icon">⚠️</div>
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  );
};

export default Error;