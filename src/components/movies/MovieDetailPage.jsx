import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generatePlaceholderColor, extractYearFromTitle, cleanTitleFromYear, formatRuntime } from '../../utils/helpers';
import { getMovieDetails, enhanceMovieData } from '../../services/movieService';
import { streamingServers } from '../../services/api';
import Loading from '../common/Loading';
import Error from '../common/Error';

const MovieDetailPage = ({ movies }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState("server1");
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Loading movie details...");
  
  // Find movie in our existing list (if available)
  const movie = movies.find(m => m.imdb_id === id);
  
  // Handle back button and scroll to top
  const handleBackButton = () => {
    // Force scroll to top before navigating back
    window.scrollTo(0, 0);
    navigate(-1);
  };
  
  useEffect(() => {
    // Set up a loading timer to update loading message after delay
    const loadingTimer = setTimeout(() => {
      if (loading) {
        setLoadingMessage("Still loading... The server might be responding slowly.");
      }
    }, 3000);
    
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to enhance the basic movie data we already have
        if (movie) {
          const enhancedMovie = await enhanceMovieData(movie);
          setMovieData(enhancedMovie);
        } else {
          // If we don't have the movie in our list, fetch it directly by IMDB ID
          const details = await getMovieDetails(id);
          if (details) {
            setMovieData(details);
          } else {
            setError('Movie details not found.');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading movie details:', err);
        setError('Failed to load movie details. Please try again.');
        setLoading(false);
      }
    };
    
    if (id) {
      loadMovieDetails();
    }
    
    return () => {
      clearTimeout(loadingTimer);
    };
  }, [id, movie]);
  
  // Show loading state with animation
  if (loading) {
    return <Loading message={loadingMessage} />;
  }
  
  // Show error state if no movie data found
  if (!movie && !movieData && error) {
    return <Error message={error} />;
  }
  
  // Show generic error if no data and no specific error
  if (!movie && !movieData) {
    return <Error message="Movie not found" />;
  }
  
  // Use enhanced data if available, otherwise fall back to the basic data
  const displayData = movieData || movie;
  
  // Extract year from either enhanced data or from title
  const year = displayData.year || extractYearFromTitle(movie?.title || '');
  
  // Clean title if needed
  const titleWithoutYear = displayData.title || cleanTitleFromYear(movie?.title || '');
  
  // Format runtime from minutes to hours and minutes if needed
  const runtime = typeof displayData.runtime === 'number' 
    ? formatRuntime(displayData.runtime) 
    : displayData.runtime;
  
  // Format actors for display
  const actorsDisplay = displayData.actors && Array.isArray(displayData.actors)
    ? displayData.actors.join(', ')
    : '';
  
  // Placeholder color for poster background
  const placeholderColor = generatePlaceholderColor(titleWithoutYear);
  
  // Get server list for streaming
  const servers = streamingServers.movie;
  
  const handleServerSelect = (serverId) => {
    setSelectedServer(serverId);
  };
  
  const handleWatchNow = () => {
    const server = servers.find(s => s.id === selectedServer);
    if (server) {
      // Get the URL for the selected server
      const url = server.getUrl(id, displayData?.tmdb_id || id);
      
      // Check if the URL is valid
      if (!url) {
        setError(`The selected server requires a TMDB ID, which is not available for this movie.`);
        return;
      }
      
      console.log(`Opening URL: ${url}`);
      window.open(url, "_blank");
    }
  };
  
  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={handleBackButton} className="back-button">
          ← Back
        </button>
      </div>
      
      <div className="detail-container">
        <div className="detail-backdrop" style={{ backgroundColor: placeholderColor }}>
          <div className="detail-content">
            <div className="detail-poster" style={{ 
              backgroundColor: placeholderColor,
              backgroundImage: displayData.poster ? `url(${displayData.poster})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!displayData.poster && (
                <div className="poster-text">{titleWithoutYear.charAt(0)}</div>
              )}
            </div>
            
            <div className="detail-info">
              <h1>{titleWithoutYear}</h1>
              <div className="content-meta">
                {year && <span className="year">{year}</span>}
                {displayData?.quality && <span className="quality">{displayData.quality}</span>}
                {displayData?.rating && (
                  <span className="rating">⭐ {displayData.rating}</span>
                )}
                {runtime && (
                  <span className="duration">{runtime}</span>
                )}
              </div>
              
              {/* Display cast information if available */}
              {actorsDisplay && (
                <div className="cast-info">
                  <span className="cast-label">Cast: </span>
                  <span className="cast-names">{actorsDisplay}</span>
                </div>
              )}
              
              {displayData.genres && displayData.genres.length > 0 && (
                <div className="genres">
                  {displayData.genres.map((genre, index) => (
                    <span key={`${genre}-${index}`} className="genre-tag">{genre}</span>
                  ))}
                </div>
              )}
              
              <p className="description">
                {displayData.description || "No description available."}
              </p>
              
              {displayData.trailer && (
                <div className="trailer-section">
                  <h3>Trailer</h3>
                  <button className="trailer-button" onClick={() => window.open(displayData.trailer, "_blank")}>
                    <span className="play-icon">▶</span> Watch Trailer
                  </button>
                </div>
              )}
              
              <div className="server-selection">
                <h3>Select Server:</h3>
                <div className="server-buttons">
                  {servers.map(server => (
                    <button 
                      key={server.id}
                      onClick={() => handleServerSelect(server.id)}
                      className={`server-button ${selectedServer === server.id ? 'active' : ''}`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <button 
                  onClick={handleWatchNow}
                  className="watch-now-button"
                >
                  <span className="play-icon">▶</span> WATCH NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;