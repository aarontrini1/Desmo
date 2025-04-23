import { fetchData, VIDSRC_API_BASE } from './api';
import * as IMDBService from './imdbService';
import { extractYearFromTitle } from '../utils/helpers';

/**
 * Get latest movies from VidSrc API
 * @param {number} page - Page number
 * @returns {Promise<Array>} - Array of movies
 */
export const getLatestMovies = async (page = 1) => {
  try {
    // Fixed API endpoint to match documentation
    const data = await fetchData(`${VIDSRC_API_BASE}/movies/latest/page-${page}.json`);
    
    // Make sure all movies have tmdb_id (some might only have imdb_id)
    const processedMovies = data.result?.map(movie => {
      // If tmdb_id is missing or empty, try to extract it from the title or set a fallback
      if (!movie.tmdb_id && movie.imdb_id) {
        console.log(`Movie ${movie.title} missing tmdb_id, using imdb_id ${movie.imdb_id} instead`);
        // Note: in a real app, you might need an API to convert imdb_id to tmdb_id
        movie.tmdb_id = movie.imdb_id;
      }
      
      // Ensure every movie has a poster if it has an imdb_id
      if (movie.imdb_id && !movie.poster) {
        movie.poster = `https://imdb.iamidiotareyoutoo.com/photo/${movie.imdb_id}`;
      }
      
      return movie;
    }) || [];
    
    return processedMovies;
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    // Return empty array instead of throwing to gracefully handle API errors
    return [];
  }
};

/**
 * Enhance movie data with details from IMDB API
 * @param {Object} movie - Basic movie data
 * @returns {Promise<Object>} - Enhanced movie data
 */
export const enhanceMovieData = async (movie) => {
  try {
    // Skip if no IMDB ID is available
    if (!movie.imdb_id) {
      console.warn('Cannot enhance movie data: Missing IMDB ID');
      return movie;
    }
    
    // Get details from IMDB
    const imdbDetails = await IMDBService.getIMDBDetails(movie.imdb_id);
    
    if (!imdbDetails) {
      console.warn(`No IMDB data found for movie with IMDB ID: ${movie.imdb_id}`);
      return movie;
    }
    
    // Direct poster URL for IMDb
    const posterUrl = `https://imdb.iamidiotareyoutoo.com/photo/${movie.imdb_id}`;
    
    // Try to get trailer
    const trailerUrl = imdbDetails.trailer || null;
    
    // Combine the data
    return {
      ...movie,
      description: imdbDetails.description || movie.description,
      poster: posterUrl || movie.poster,
      trailer: trailerUrl,
      rating: imdbDetails.rating || movie.rating,
      year: imdbDetails.year || extractYearFromTitle(movie.title),
      genres: imdbDetails.genres || [],
      runtime: imdbDetails.runtime || 'N/A',
      actors: imdbDetails.actors || []
    };
  } catch (error) {
    console.error('Error enhancing movie data:', error);
    return movie;
  }
};

/**
 * Get movie details from IMDB
 * @param {string} imdbId - IMDB ID of the movie
 * @returns {Promise<Object>} - Movie details
 */
export const getMovieDetails = async (imdbId) => {
  try {
    if (!imdbId) {
      throw new Error('Invalid IMDB ID: ' + imdbId);
    }
    
    // Get details from IMDB
    const imdbDetails = await IMDBService.getIMDBDetails(imdbId);
    
    if (!imdbDetails) {
      throw new Error(`No IMDB data found for movie with IMDB ID: ${imdbId}`);
    }
    
    // Get poster from IMDB if not already included
    const posterUrl = `https://imdb.iamidiotareyoutoo.com/photo/${imdbId}`;
    
    // Return movie data
    return {
      imdb_id: imdbId,
      title: imdbDetails.title || 'Unknown Title',
      description: imdbDetails.description || 'No description available',
      poster: posterUrl || null,
      trailer: imdbDetails.trailer || null,
      rating: imdbDetails.rating || 'N/A',
      year: imdbDetails.year || '',
      genres: imdbDetails.genres || ['Action'],
      runtime: imdbDetails.runtime || 'N/A',
      actors: imdbDetails.actors || []
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

/**
 * Search movies
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchMovies = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      console.log('Search query too short');
      return [];
    }

    console.log(`Searching movies for: "${query}"`);
    const results = await IMDBService.searchIMDB(query);
    
    if (!results || !Array.isArray(results)) {
      console.log('No results or invalid format returned from IMDB search');
      return [];
    }
    
    console.log(`Got ${results.length} raw results from IMDB`);
    
    // Filter to only include movies with a more strict check
    const movieResults = results.filter(item => {
      // Consider an item a movie ONLY if one of these conditions is met:
      return (
        // Explicitly marked as a movie
        item.type === 'movie' || 
        // Not explicitly marked as a TV show
        (item.type !== 'tvshow' && 
         // AND doesn't have TV series info
         !item.tvSeriesInfo &&
         // AND title doesn't contain TV show indicators
         !(item.title && 
           (item.title.toLowerCase().includes('tv series') || 
            item.title.toLowerCase().includes('tv show') ||
            item.title.toLowerCase().includes('season')))
        )
      );
    });
    
    console.log(`Filtered to ${movieResults.length} movie results`);
    
    // Map to a standardized format
    const standardizedResults = movieResults.map((movie, index) => {
      // Add direct poster URL for each movie with an ID
      const posterUrl = movie.id ? `https://imdb.iamidiotareyoutoo.com/photo/${movie.id}` : '';
      
      // Create the standardized movie object with exactly the properties needed
      const standardizedMovie = {
        imdb_id: movie.id || '',
        title: movie.title || '',
        description: movie.description || 'No description available',
        poster: posterUrl,
        rating: movie.rating || '',
        year: movie.year || '',
        genres: movie.genres || ['Action'],
        quality: 'HD', // Default value
        actors: movie.actors || [],
        type: 'movie' // Explicitly mark as movie
      };
      
      return standardizedMovie;
    });
    
    console.log(`Returning ${standardizedResults.length} standardized movie results`);
    return standardizedResults;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};