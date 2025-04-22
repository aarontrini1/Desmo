/**
 * Utility function to reset scroll position to top
 */
export const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' // Use 'smooth' for smooth scrolling or 'instant' for immediate jump
    });
  };
  
  /**
   * Saves the current scroll position with a key
   * @param {string} key - Unique identifier for this scroll position
   */
  export const saveScrollPosition = (key) => {
    const scrollPosition = {
      x: window.scrollX,
      y: window.scrollY
    };
    sessionStorage.setItem(`scroll_${key}`, JSON.stringify(scrollPosition));
  };
  
  /**
   * Restores a saved scroll position by key
   * @param {string} key - Unique identifier for the scroll position to restore
   * @returns {boolean} - Whether a position was restored
   */
  export const restoreScrollPosition = (key) => {
    const savedPosition = sessionStorage.getItem(`scroll_${key}`);
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition);
        window.scrollTo(x, y);
        return true;
      } catch (e) {
        console.error('Error restoring scroll position:', e);
      }
    }
    return false;
  };
  
  /**
   * Clears a saved scroll position
   * @param {string} key - Unique identifier for the scroll position to clear
   */
  export const clearScrollPosition = (key) => {
    sessionStorage.removeItem(`scroll_${key}`);
  };
  
  export default {
    scrollToTop,
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition
  };