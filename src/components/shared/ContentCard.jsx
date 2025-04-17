import React from 'react';
import { Link } from 'react-router-dom';
import { generatePlaceholderColor, extractYearFromTitle, cleanTitleFromYear } from '../../utils/helpers';

/**
 * ContentCard component
 * 
 * A flexible card component that works for both movies and TV shows.
 * It displays basic information like title, year, and quality.
 * 
 * @param {Object} item - The movie or TV show object
 * @param {string} type - Either "movie" or "tvshow" to determine routing
 * @param {boolean} showTypeBadge - Whether to show the type badge (default: false)
 * @param {boolean} compact - Whether to use a compact view (default: false)
 * @param {Object} additionalProps - Any additional props to pass to the component
 */
const ContentCard = ({ 
  item, 
  type, 
  showTypeBadge = false, 
  compact = false, 
  ...additionalProps 
}) => {
  // Handle case when item is null or undefined
  if (!item) {
    return null;
  }
  
  // Get IMDB ID
  const imdbId = item.imdb_id || item.id;
  
  if (!imdbId) {
    console.warn('ContentCard: Missing IMDB ID', item);
    return null;
  }
  
  // Get title
  const title = item.title || item.name || '';
  
  // Get placeholder color based on title
  const placeholderColor = generatePlaceholderColor(title);
  
  // Extract year from title or use provided year property
  const year = item.year || extractYearFromTitle(title);
  
  // Clean title if it has a year in it and we already have a year value
  const titleWithoutYear = year ? cleanTitleFromYear(title) : title;
  
  // Determine the route path based on the content type
  const routePath = type === 'movie' ? '/movie/' : '/tvshow/';
  
  // Determine appropriate labels based on content type
  const typeLabel = type === 'movie' ? 'Movie' : 'TV Show';
  
  // Function to handle quick play action
  const handleQuickPlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate directly to the content player
    window.location.href = `${routePath}${imdbId}`;
  };
  
  return (
    <div 
      className={`content-card ${type}-card ${compact ? 'compact' : ''}`} 
      {...additionalProps}
    >
      <Link to={`${routePath}${imdbId}`} className="content-link">
        <div 
          className="content-poster" 
          style={{ 
            backgroundColor: placeholderColor,
            backgroundImage: item.poster ? `url(${item.poster})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!item.poster && (
            <div className="poster-text">{titleWithoutYear.charAt(0)}</div>
          )}
          
          {/* Display a "NEW" badge if the content is marked as new */}
          {item.is_new && (
            <div className="new-badge">NEW</div>
          )}
          
          {/* Quick play overlay */}
          <div className="quick-play-overlay" onClick={handleQuickPlay}>
            <div className="play-button">
              <i className="play-icon">▶</i>
            </div>
          </div>
        </div>
        
        <div className="content-info">
          <h3>{titleWithoutYear}</h3>
          {year && <span className="year">{year}</span>}
          
          <div className="meta-info">
            {item.quality && (
              <div className="quality-badge">{item.quality}</div>
            )}
            
            {item.rating && (
              <div className="rating-badge">⭐ {item.rating}</div>
            )}
            
            {/* Show content type badge only if requested */}
            {showTypeBadge && (
              <div className="type-badge">{typeLabel}</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ContentCard;