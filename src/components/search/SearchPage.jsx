// src/components/search/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ContentCard from '../shared/ContentCard';
import { searchMovies } from '../../services/movieService';
import { searchTVShows } from '../../services/tvShowService';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { SkeletonGrid } from '../common/SkeletonLoader';

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [searchResults, setSearchResults] = useState({
    movies: [],
    tvShows: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'movies', 'tvshows'
  
  // Perform search when query changes
  useEffect(() => {
    if (!query || query.length < 2) return; // Require at least 2 characters
    
    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Searching for: "${query}"`);
        
        // Search both APIs in parallel
        const [moviesData, tvShowsData] = await Promise.all([
          searchMovies(query),
          searchTVShows(query)
        ]);
        
        console.log('Movie search results:', moviesData?.length || 0);
        console.log('TV show search results:', tvShowsData?.length || 0);
        
        // Make sure IDs are present
        const processedMovies = (moviesData || []).map((movie, index) => {
          if (!movie.imdb_id && !movie.id) {
            // If no ID is present, add a random one to avoid display issues
            movie.id = `movie-${index}-${Date.now()}`;
          }
          return movie;
        });
        
        const processedTVShows = (tvShowsData || []).map((show, index) => {
          if (!show.imdb_id && !show.id) {
            // If no ID is present, add a random one to avoid display issues
            show.id = `tvshow-${index}-${Date.now()}`;
          }
          return show;
        });
        
        // Update the search results
        setSearchResults({
          movies: processedMovies,
          tvShows: processedTVShows
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to complete search. Please try again.');
        setLoading(false);
      }
    };
    
    // Add a small delay before searching
    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  }, [query]);
  
  // Filter results based on active filter
  const filteredResults = {
    movies: activeFilter === 'all' || activeFilter === 'movies' ? searchResults.movies : [],
    tvShows: activeFilter === 'all' || activeFilter === 'tvshows' ? searchResults.tvShows : []
  };
  
  // Count total results
  const totalResults = filteredResults.movies.length + filteredResults.tvShows.length;
  
  // Limit the number of results shown for better performance
  const MAX_RESULTS_PER_CATEGORY = 24;
  const limitedMovies = filteredResults.movies.slice(0, MAX_RESULTS_PER_CATEGORY);
  const limitedTvShows = filteredResults.tvShows.slice(0, MAX_RESULTS_PER_CATEGORY);
  
  // Display skeleton loader while waiting for results
  if (loading && query.length >= 2) {
    return (
      <div className="search-page">
        <h1>Searching for: "{query}"</h1>
        <section className="search-section">
          <h2>Movies</h2>
          <SkeletonGrid count={4} />
        </section>
        <section className="search-section">
          <h2>TV Shows</h2>
          <SkeletonGrid count={4} />
        </section>
      </div>
    );
  }
  
  return (
    <div className="search-page">
      <h1>Search Results for: "{query}"</h1>
      
      {error && <Error message={error} />}
      
      {!query && (
        <div className="search-hint">
          <p>Enter a search term to find movies and TV shows.</p>
        </div>
      )}
      
      {query && query.length < 2 && (
        <div className="search-hint">
          <p>Please enter at least 2 characters to search.</p>
        </div>
      )}
      
      {!loading && query && query.length >= 2 && totalResults === 0 && (
        <div className="no-results">
          <p>No results found for "{query}". Try a different search term.</p>
        </div>
      )}
      
      {totalResults > 0 && (
        <div className="search-filters">
          <button 
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({searchResults.movies.length + searchResults.tvShows.length})
          </button>
          <button 
            className={`filter-button ${activeFilter === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveFilter('movies')}
          >
            Movies ({searchResults.movies.length})
          </button>
          <button 
            className={`filter-button ${activeFilter === 'tvshows' ? 'active' : ''}`}
            onClick={() => setActiveFilter('tvshows')}
          >
            TV Shows ({searchResults.tvShows.length})
          </button>
        </div>
      )}
      
      {/* Movie section */}
      {filteredResults.movies.length > 0 && (
        <section className="search-section">
          <h2>Movies {filteredResults.movies.length > MAX_RESULTS_PER_CATEGORY && 
            `(Showing ${MAX_RESULTS_PER_CATEGORY} of ${filteredResults.movies.length})`}
          </h2>
          <div className="content-grid">
            {limitedMovies.map((movie, index) => (
              <ContentCard 
                key={movie.imdb_id || movie.id || `movie-${index}-${Date.now()}`} 
                item={{
                  ...movie,
                  title: movie.title || movie.name || '',
                  quality: movie.quality || 'HD'
                }} 
                type="movie" 
                showTypeBadge={activeFilter === 'all'}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* TV Show section */}
      {filteredResults.tvShows.length > 0 && (
        <section className="search-section">
          <h2>TV Shows {filteredResults.tvShows.length > MAX_RESULTS_PER_CATEGORY && 
            `(Showing ${MAX_RESULTS_PER_CATEGORY} of ${filteredResults.tvShows.length})`}
          </h2>
          <div className="content-grid">
            {limitedTvShows.map((show, index) => (
              <ContentCard 
                key={show.imdb_id || show.id || `tvshow-${index}-${Date.now()}`} 
                item={{
                  ...show,
                  title: show.title || show.name || '',
                  quality: show.quality || 'HD'
                }} 
                type="tvshow" 
                showTypeBadge={activeFilter === 'all'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;