import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generatePlaceholderColor, extractYearFromTitle, cleanTitleFromYear } from '../../utils/helpers';
import { getMovieDetails, enhanceMovieData } from '../../services/movieService';
import { streamingServers } from '../../services/api';
import Loading from '../common/Loading';
import Error from '../common/Error';

const MovieDetailPage = ({ movies }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState("server1");
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const movie = movies.find(m => m.imdb_id === id);
  
  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        
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
        setError('Failed to load movie details.');
        setLoading(false);
      }
    };
    
    if (id) {
      loadMovieDetails();
    }
  }, [id, movie]);
  
  if (!movie && !movieData) {
    return <Error message="Movie not found" />;
  }
  
  if (loading && !movieData) {
    return <Loading />;
  }
  
  // Use enhanced data if available, otherwise fall back to the basic data
  const displayData = movieData || movie;
  
  // Extract year from either enhanced data or from title
  const year = displayData.year || extractYearFromTitle(movie?.title || '');
  
  // Clean title if needed
  const titleWithoutYear = displayData.title || cleanTitleFromYear(movie?.title || '');
  
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
      const url = server.getUrl(id, movie?.tmdb_id || id);
      console.log(`Opening URL: ${url}`);
      window.open(url, "_blank");
    }
  };
  
  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
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
                {movie?.quality && <span className="quality">{movie.quality}</span>}
                {displayData.rating && (
                  <span className="rating">⭐ {displayData.rating}</span>
                )}
                {displayData.runtime && (
                  <span className="duration">{displayData.runtime}</span>
                )}
              </div>
              
              {displayData.genres && displayData.genres.length > 0 && (
                <div className="genres">
                  {displayData.genres.map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
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