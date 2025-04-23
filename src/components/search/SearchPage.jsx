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
        
        console.log('Raw movie search results:', moviesData?.length || 0);
        console.log('Raw TV show search results:', tvShowsData?.length || 0);
        
        // Create a mapping of ID to full content
        const idContentMap = {};
        
        // Track which IDs belong to which type
        const movieIds = new Set();
        const tvShowIds = new Set();
        
        // Process movies first
        (moviesData || []).forEach((movie, index) => {
          const id = movie.imdb_id || movie.id || `movie-${index}-${Date.now()}`;
          movieIds.add(id);
          idContentMap[id] = {
            ...movie,
            id,
            imdb_id: movie.imdb_id || id,
            title: movie.title || movie.name || '',
            quality: movie.quality || 'HD',
            type: 'movie'
          };
        });
        
        // Process TV shows
        (tvShowsData || []).forEach((show, index) => {
          const id = show.imdb_id || show.id || `tvshow-${index}-${Date.now()}`;
          tvShowIds.add(id);
          // If this ID already exists in movies, we need to decide where it belongs
          if (idContentMap[id]) {
            // If it's in TVMaze API results, it's definitely a TV show
            // So we'll remove it from movies and add to TV Shows
            movieIds.delete(id);
          }
          
          idContentMap[id] = {
            ...show,
            id,
            imdb_id: show.imdb_id || id,
            title: show.title || show.name || '',
            quality: show.quality || 'HD',
            type: 'tvshow'
          };
        });
        
        // Build the final lists based on our sets
        const processedMovies = Array.from(movieIds).map(id => idContentMap[id]);
        const processedTVShows = Array.from(tvShowIds).map(id => idContentMap[id]);
        
        console.log('Final processed movie results:', processedMovies.length);
        console.log('Final processed TV show results:', processedTVShows.length);
        
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
                key={`movie-${movie.imdb_id || movie.id || index}`} 
                item={movie} 
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
                key={`tvshow-${show.imdb_id || show.id || index}`} 
                item={show} 
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