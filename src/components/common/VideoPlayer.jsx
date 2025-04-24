import React, { useState, useEffect, useRef } from 'react';

/**
 * VideoPlayer Component
 * A reusable video player that displays an iframe and handles loading states
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - The source URL for the iframe
 * @param {string} props.title - The title attribute for the iframe
 */
const VideoPlayer = ({ src, title }) => {
  const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const iframeRef = useRef(null);
  
  // Handle loading state for iframe
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // Handle iframe errors
  const handleIframeError = () => {
    setLoading(false);
    console.error('Failed to load iframe content');
  };
  
  // Update currentSrc when src prop changes
  useEffect(() => {
    if (src !== currentSrc) {
      setLoading(true);
      setCurrentSrc(src);
    }
  }, [src, currentSrc]);
  
  return (
    <div className="video-player-container">
      <h2>{title}</h2>
      <div className={`video-wrapper ${!loading ? 'loaded' : ''}`}>
        <iframe 
          ref={iframeRef}
          src={currentSrc}
          allowFullScreen
          title={title}
          className="video-iframe"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;