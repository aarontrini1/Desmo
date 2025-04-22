import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { scrollToTop } from '../../utils/scrollUtils';

/**
 * An intelligent back button that determines the best route to navigate back to
 * based on browser history and current location.
 * 
 * @param {Object} props - Component props
 * @param {string} props.fallbackPath - Path to navigate to if no history is available
 * @param {string} props.label - Button label text
 * @param {string} props.className - Additional CSS classes
 */
const BackButton = ({ 
  fallbackPath = '/', 
  label = '← Back', 
  className = 'back-button',
  ...restProps 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  
  // Check if we can go back in history
  useEffect(() => {
    // We can only check if we can go back if we have window.history
    if (window.history && window.history.length > 1) {
      setCanGoBack(true);
    } else {
      setCanGoBack(false);
    }
  }, [location]);
  
  const handleClick = (e) => {
    e.preventDefault();
    
    // Scroll to top first
    scrollToTop();
    
    // If we can use the browser's history, go back
    if (canGoBack) {
      navigate(-1);
    } else {
      // Otherwise go to the fallback path
      navigate(fallbackPath);
    }
  };

  return (
    <a 
      href="#" 
      className={className} 
      onClick={handleClick}
      {...restProps}
    >
      {label}
    </a>
  );
};

export default BackButton;