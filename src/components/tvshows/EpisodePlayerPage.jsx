import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEpisode, getTVShowDetails, getSeasonEpisodes } from '../../services/tvShowService';
import { streamingServers } from '../../services/api';
import Loading from '../common/Loading';
import Error from '../common/Error';
import BackButton from '../common/BackButton';
import VideoPlayer from '../common/VideoPlayer';
import { scrollToTop } from '../../utils/scrollUtils';

const EpisodePlayerPage = ({ tvShows }) => {
  const { id, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState("server1");
  const [episode, setEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [tvShowDetails, setTVShowDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Loading episode details...");
  const [videoUrl, setVideoUrl] = useState(null);
  
  const tvShow = tvShows.find(show => show.imdb_id === id);
  
  const season = Number(seasonNumber);
  const episodeNum = Number(episodeNumber);
  
  // Scroll to top on component mount
  useEffect(() => {
    scrollToTop();
  }, []);
  
  useEffect(() => {
    // Set up a loading timer to update loading message after delay
    const loadingTimer = setTimeout(() => {
      if (loading) {
        setLoadingMessage("Still loading... The server might be responding slowly.");
      }
    }, 3000);
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get episode details
        const episodeData = await getEpisode(id, season, episodeNum);
        if (!episodeData) {
          setError("Episode not found");
          setLoading(false);
          return;
        }
        setEpisode(episodeData);
        
        // Get TV show details
        const showDetails = await getTVShowDetails(id);
        setTVShowDetails(showDetails);
        
        // Get all episodes for the season to enable next/prev navigation
        const seasonEpisodes = await getSeasonEpisodes(id, season);
        setEpisodes(seasonEpisodes);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading episode data:', err);
        setError('Failed to load episode information.');
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      clearTimeout(loadingTimer);
    };
  }, [id, season, episodeNum]);
  
  // Update video URL when the selected server changes or when the episode data loads
  useEffect(() => {
    if (!loading && episode) {
      const server = streamingServers.tv.find(s => s.id === selectedServer);
      if (server) {
        // Get the URL for this server
        const url = server.getUrl(id, tvShow?.tmdb_id || id, season, episodeNum);
        
        // Check if the URL is valid (some servers may require TMDB ID)
        if (!url) {
          setError(`The selected server requires a TMDB ID, which is not available for this TV Show.`);
          setVideoUrl(null);
          return;
        }
        
        console.log(`Setting URL: ${url}`);
        setVideoUrl(url);
        setError(null);
      }
    }
  }, [selectedServer, episode, loading, id, tvShow, season, episodeNum]);
  
  if (loading) {
    return <Loading message={loadingMessage} />;
  }
  
  if (!tvShow && !tvShowDetails) {
    return <Error message="TV Show not found" />;
  }
  
  if (!episode) {
    return <Error message="Episode not found" />;
  }
  
  // Use the show name from TVMaze if available, otherwise use the basic data
  const showName = tvShowDetails?.name || tvShow?.title || 'Unknown Show';
  
  const servers = streamingServers.tv;
  
  const handleServerSelect = (serverId) => {
    setSelectedServer(serverId);
  };
  
  // Find the current episode's index in the season's episodes
  const currentEpisodeIndex = episodes.findIndex(ep => ep.number === episodeNum);
  
  // Determine if we can navigate to previous or next episodes
  const isFirstEpisode = currentEpisodeIndex <= 0;
  const isLastEpisode = currentEpisodeIndex >= episodes.length - 1;
  
  // Get previous and next episode numbers
  const prevEpisodeNumber = isFirstEpisode ? null : episodes[currentEpisodeIndex - 1].number;
  const nextEpisodeNumber = isLastEpisode ? null : episodes[currentEpisodeIndex + 1].number;
  
  // HTML parser to clean description from HTML tags
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent || 'No description available.' };
  };
  
  // Navigation function for previous episode
  const goToPreviousEpisode = () => {
    if (prevEpisodeNumber) {
      scrollToTop();
      navigate(`/tvshow/${id}/season/${season}/episode/${prevEpisodeNumber}`);
    }
  };
  
  // Navigation function for next episode
  const goToNextEpisode = () => {
    if (nextEpisodeNumber) {
      scrollToTop();
      navigate(`/tvshow/${id}/season/${season}/episode/${nextEpisodeNumber}`);
    }
  };
  
  return (
    <div className="episode-player-page">
      <div className="detail-header">
        {/* Use BackButton with fallback to TV show page */}
        <BackButton 
          fallbackPath={`/tvshow/${id}`}
          label="← Back to Show"
        />
      </div>
      
      <div className="episode-info">
        <h1>{showName}</h1>
        <h2>Season {season}, Episode {episodeNum} - {episode.name}</h2>
        
        {episode.image && (
          <div 
            className="episode-banner"
            style={{
              backgroundImage: `url(${episode.image.original || episode.image.medium})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '200px',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          />
        )}
        
        <div 
          className="episode-summary"
          dangerouslySetInnerHTML={createMarkup(episode.summary)}
        />
        
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
        </div>
      </div>
      
      {/* Video player section using the VideoPlayer component */}
      {videoUrl && (
        <VideoPlayer 
          src={videoUrl}
          title={`Now Playing: Season ${season}, Episode ${episodeNum} - ${episode.name}`}
        />
      )}
      
      <div className="episode-navigation">
        <button 
          className="nav-button prev-button"
          onClick={goToPreviousEpisode}
          disabled={isFirstEpisode}
        >
          ← Previous Episode
        </button>
        
        <button 
          className="nav-button next-button"
          onClick={goToNextEpisode}
          disabled={isLastEpisode}
        >
          Next Episode →
        </button>
      </div>
    </div>
  );
};

export default EpisodePlayerPage;