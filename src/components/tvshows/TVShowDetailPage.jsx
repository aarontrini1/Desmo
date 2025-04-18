// src/components/tvshows/TVShowDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generatePlaceholderColor, extractYearFromTitle, cleanTitleFromYear } from '../../utils/helpers';
import { getTVShowDetails, getTVShowSeasons, getSeasonEpisodes } from '../../services/tvShowService';
import SeasonSelector from './SeasonSelector';
import EpisodeCard from './EpisodeCard';
import Loading from '../common/Loading';
import Error from '../common/Error';

const TVShowDetailPage = ({ tvShows }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [tvShowData, setTVShowData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const tvShow = tvShows.find(show => show.imdb_id === id);
  
  // Function to load episodes for a specific season
  const loadEpisodes = async (imdbId, seasonNumber) => {
    try {
      setLoading(true);
      const episodesData = await getSeasonEpisodes(imdbId, seasonNumber);
      setEpisodes(episodesData);
      setLoading(false);
    } catch (err) {
      console.error(`Error loading episodes for season ${seasonNumber}:`, err);
      setError(`Failed to load episodes for season ${seasonNumber}.`);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Function to load TV show details from TVMaze
    const loadTVShowDetails = async () => {
      try {
        setLoading(true);
        
        // Get TV show details from TVMaze
        const details = await getTVShowDetails(id);
        
        if (!details) {
          setError('Could not find TV show details.');
          setLoading(false);
          return;
        }
        
        setTVShowData(details);
        
        // Get seasons
        const seasonsData = details.seasons || await getTVShowSeasons(id);
        
        // Filter out season 0 (specials) if it exists
        const filteredSeasons = seasonsData.filter(season => season.number > 0);
        setSeasons(filteredSeasons);
        
        // Set default selected season (first season or season 1)
        const defaultSeason = filteredSeasons.length > 0 
          ? filteredSeasons[0].number 
          : 1;
        
        setSelectedSeason(defaultSeason);
        
        // Load episodes for the default season
        await loadEpisodes(id, defaultSeason);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading TV show data:', err);
        setError('Failed to load TV show details. Please try again later.');
        setLoading(false);
      }
    };
    
    if (id) {
      loadTVShowDetails();
    }
  }, [id]);
  
  // When selected season changes, load episodes for that season
  useEffect(() => {
    if (id && selectedSeason && !loading) {
      loadEpisodes(id, selectedSeason);
    }
  }, [selectedSeason, id]);
  
  if (!tvShow && !tvShowData) {
    return <Error message="TV Show not found" />;
  }
  
  if (loading && !episodes.length) {
    return <Loading />;
  }
  
  // Use TVMaze data if available, otherwise fall back to the basic data
  const displayData = tvShowData || tvShow;
  
  // Extract year from title or premiered date
  const year = displayData.premiered 
    ? displayData.premiered.substring(0, 4) 
    : extractYearFromTitle(tvShow?.title || '');
    
  // Clean title
  const titleWithoutYear = displayData.name || cleanTitleFromYear(tvShow?.title || '');
  
  // Placeholder color for poster
  const placeholderColor = generatePlaceholderColor(titleWithoutYear);
  
  // HTML parser to clean description from HTML tags
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  const handleSeasonChange = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
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
                {tvShow?.quality && <span className="quality">{tvShow.quality}</span>}
                {displayData.rating && (
                  <span className="rating">⭐ {displayData.rating}</span>
                )}
                {seasons.length > 0 && (
                  <span className="seasons">{seasons.length} Seasons</span>
                )}
                {displayData.status && (
                  <span className="status">{displayData.status}</span>
                )}
              </div>
              
              {displayData.genres && displayData.genres.length > 0 && (
                <div className="genres">
                  {displayData.genres.map((genre, index) => (
                    <span key={`${genre}-${index}`} className="genre-tag">{genre}</span>
                  ))}
                </div>
              )}
              
              <div 
                className="description"
                dangerouslySetInnerHTML={createMarkup(displayData.description || "No description available.")}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="episodes-container">
        <div className="episodes-header">
          <h2>Episodes</h2>
          {seasons.length > 0 && (
            <SeasonSelector 
              seasons={seasons} 
              currentSeason={selectedSeason} 
              onChange={handleSeasonChange} 
            />
          )}
        </div>
        
        {loading ? (
          <div className="episodes-loading">
            <Loading message="Loading episodes..." />
          </div>
        ) : error ? (
          <Error message={error} />
        ) : episodes.length > 0 ? (
          <div className="episodes-list">
            {episodes.map(episode => (
              <EpisodeCard 
                key={episode.id} 
                episode={episode} 
                tvShowId={id}
                seasonNumber={selectedSeason}
              />
            ))}
          </div>
        ) : (
          <div className="no-episodes">
            <p>No episodes found for this season.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TVShowDetailPage;