import React from 'react';
import { Link } from 'react-router-dom';
import { generatePlaceholderColor, extractYearFromTitle, cleanTitleFromYear } from '../../utils/helpers';

const ContentCard = ({ 
  item, 
  type, 
  showTypeBadge = false, 
  compact = false, 
  ...additionalProps 
}) => {
  // Handle case when item is null or undefined
  if (!item) {
    console.warn('ContentCard: Received null or undefined item');
    return null;
  }
  
  // Get IMDB ID with fallbacks
  const imdbId = item.imdb_id || item.id || item.imdbID || '';
  
  if (!imdbId) {
    console.warn('ContentCard: Missing IMDB ID', item);
    // We'll generate a random ID for display purposes when none exists
    const randomId = `temp-${Math.random().toString(36).substring(2, 15)}`;
    item.temp_id = randomId;
  }
  
  // Use the ID with fallback to temporary ID
  const contentId = imdbId || item.temp_id;
  
  // Get title
  const title = item.title || item.name || '';
  
  // Get placeholder color based on title
  const placeholderColor = generatePlaceholderColor(title);
  
  // Extract year from title or use provided year property
  const year = item.year || (item.premiered ? item.premiered.substring(0, 4) : '') || extractYearFromTitle(title);
  
  // Clean title if it has a year in it and we already have a year value
  const titleWithoutYear = year ? cleanTitleFromYear(title) : title;
  
  // Determine the route path based on the content type
  const routePath = type === 'movie' ? '/movie/' : '/tvshow/';
  
  // Determine appropriate labels based on content type
  const typeLabel = type === 'movie' ? 'Movie' : 'TV Show';
  
  // Format the rating to display only one decimal place if it's a number
  const formattedRating = 
    item.rating && !isNaN(item.rating) 
      ? Number(item.rating).toFixed(1) 
      : item.rating;
  
  // Get the poster URL with proper fallbacks
  let posterUrl = item.poster;
  
  // For TV shows, handle nested image structure from TVMaze
  if (!posterUrl && type === 'tvshow' && item.image) {
    posterUrl = item.image.original || item.image.medium;
  }
  
  // For movies without a poster, use the IMDb API
  if (!posterUrl && type === 'movie' && imdbId && imdbId.startsWith('tt')) {
    posterUrl = `https://imdb.iamidiotareyoutoo.com/photo/${imdbId}`;
  }
  
  // Function to handle quick play action
  const handleQuickPlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `${routePath}${contentId}`;
  };
  
  return (
    <div 
      className={`content-card ${type}-card ${compact ? 'compact' : ''}`} 
      {...additionalProps}
    >
      <Link to={contentId ? `${routePath}${contentId}` : '#'} className="content-link">
        <div 
          className="content-poster" 
          style={{ 
            backgroundColor: placeholderColor,
            backgroundImage: posterUrl ? `url(${posterUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!posterUrl && (
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
            
            {formattedRating && (
              <div className="rating-badge">⭐ {formattedRating}</div>
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