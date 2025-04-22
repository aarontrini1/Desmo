import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Simple scroll to top without affecting history/back behavior
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;