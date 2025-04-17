import React from 'react';
import { useNavigate } from 'react-router-dom';

const EpisodeCard = ({ episode, tvShowId, seasonNumber }) => {
  const navigate = useNavigate();
  
  const handleWatchEpisode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/tvshow/${tvShowId}/season/${seasonNumber}/episode/${episode.number}`);
  };
  
  // HTML parser to clean description from HTML tags
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  // Format air date if available
  const formatAirDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="episode-card">
      <div className="episode-number">{episode.number}</div>
      <div className="episode-details">
        <h4>{episode.name || `Episode ${episode.number}`}</h4>
        
        {episode.airdate && (
          <div className="episode-airdate">
            {formatAirDate(episode.airdate)}
          </div>
        )}
        
        <div 
          className="episode-summary"
          dangerouslySetInnerHTML={createMarkup(
            episode.summary 
              ? (episode.summary.length > 150 
                  ? `${episode.summary.substring(0, 150)}...` 
                  : episode.summary)
              : 'No description available.'
          )}
        />
      </div>
      
      {episode.image && (
        <div 
          className="episode-image" 
          style={{
            backgroundImage: `url(${episode.image.medium || episode.image.original})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      <button onClick={handleWatchEpisode} className="watch-episode-button">
        <span className="play-icon">▶</span> Watch
      </button>
    </div>
  );
};

export default EpisodeCard;