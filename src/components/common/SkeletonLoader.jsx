import React from 'react';

// Skeleton loader for content cards
const CardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster"></div>
      <div className="skeleton-info">
        <div className="skeleton-title"></div>
        <div className="skeleton-year"></div>
        <div className="skeleton-badge"></div>
      </div>
    </div>
  );
};

// Grid of skeleton cards
const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="content-grid">
      {Array(count).fill().map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export { CardSkeleton, SkeletonGrid };