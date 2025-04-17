import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ContentCard from '../shared/ContentCard';
import { searchIMDB } from '../../services/imdbService';
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
  
  useEffect(() => {
    if (!query || query.length < 2) return; // Require at least 2 characters
    
    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay before searching
    
    return () => clearTimeout(searchTimeout);
  }, [query]);
  
  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      
      // Search both APIs in parallel
      const [imdbResults, tvMazeResults] = await Promise.allSettled([
        searchIMDB(searchQuery),
        searchTVShows(searchQuery)
      ]);
      
      // Process IMDB results
      let movieResults = [];
      if (imdbResults.status === 'fulfilled') {
        // Filter to only include movies (not TV shows)
        movieResults = imdbResults.value
          .filter(item => 
            item.type === 'movie' || (!item.type && !item.tvSeriesInfo)
          )
          .map(movie => ({
            imdb_id: movie.id,
            title: movie.title || movie.name,
            description: movie.description || movie.plot,
            poster: movie.poster || movie.image,
            rating: movie.rating || movie.imdbRating,
            year: movie.year || (movie.releaseDate ? movie.releaseDate.substring(0, 4) : ''),
            quality: 'HD',
            genres: movie.genres || []
          }));
      }
      
      // Process TVMaze results
      let tvShowResults = [];
      if (tvMazeResults.status === 'fulfilled') {
        tvShowResults = tvMazeResults.value.map(show => ({
          id: show.id,
          imdb_id: show.imdb_id || `tvmaze-${show.id}`,
          title: show.title || show.name,
          description: show.description,
          poster: show.poster,
          rating: show.rating,
          premiered: show.premiered ? show.premiered.substring(0, 4) : '',
          quality: 'HD',
          genres: show.genres || []
        }));
      }
      
      setSearchResults({
        movies: movieResults,
        tvShows: tvShowResults
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to complete search. Please try again.');
      setLoading(false);
    }
  };
  
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
      
      {filteredResults.movies.length > 0 && (
        <section className="search-section">
          <h2>Movies {filteredResults.movies.length > MAX_RESULTS_PER_CATEGORY && 
            `(Showing ${MAX_RESULTS_PER_CATEGORY} of ${filteredResults.movies.length})`}
          </h2>
          <div className="content-grid">
            {limitedMovies.map(movie => (
              <ContentCard 
                key={movie.imdb_id} 
                item={{
                  ...movie,
                  title: movie.title,
                  quality: movie.quality || 'HD'
                }} 
                type="movie" 
                showTypeBadge={activeFilter === 'all'}
              />
            ))}
          </div>
        </section>
      )}
      
      {filteredResults.tvShows.length > 0 && (
        <section className="search-section">
          <h2>TV Shows {filteredResults.tvShows.length > MAX_RESULTS_PER_CATEGORY && 
            `(Showing ${MAX_RESULTS_PER_CATEGORY} of ${filteredResults.tvShows.length})`}
          </h2>
          <div className="content-grid">
            {limitedTvShows.map(show => (
              <ContentCard 
                key={show.imdb_id || show.id} 
                item={{
                  ...show,
                  title: show.title,
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