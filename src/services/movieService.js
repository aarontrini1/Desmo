import { fetchData, VIDSRC_API_BASE } from './api';
import * as IMDBService from './imdbService';

/**
 * Get latest movies from VidSrc API
 * @param {number} page - Page number
 * @returns {Promise<Array>} - Array of movies
 */
export const getLatestMovies = async (page = 1) => {
  try {
    const data = await fetchData(`${VIDSRC_API_BASE}/movies/latest/page-${page}.json`);
    
    // Make sure all movies have tmdb_id (some might only have imdb_id)
    const processedMovies = data.result?.map(movie => {
      // If tmdb_id is missing or empty, try to extract it from the title or set a fallback
      if (!movie.tmdb_id && movie.imdb_id) {
        console.log(`Movie ${movie.title} missing tmdb_id, using imdb_id ${movie.imdb_id} instead`);
        // Note: in a real app, you might need an API to convert imdb_id to tmdb_id
        movie.tmdb_id = movie.imdb_id;
      }
      return movie;
    }) || [];
    
    return processedMovies;
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    throw error;
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
    
    // Get poster from IMDB
    const posterUrl = await IMDBService.getIMDBPoster(movie.imdb_id);
    
    // Try to get trailer
    const trailerUrl = await IMDBService.getIMDBTrailer(movie.imdb_id);
    
    // Combine the data
    return {
      ...movie,
      description: imdbDetails.description || movie.description,
      poster: posterUrl || movie.poster,
      trailer: trailerUrl,
      rating: imdbDetails.rating,
      year: imdbDetails.year || extractYearFromTitle(movie.title),
      genres: imdbDetails.genres || [],
      runtime: imdbDetails.runtime || 'N/A',
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
    // Get details from IMDB
    const imdbDetails = await IMDBService.getIMDBDetails(imdbId);
    
    if (!imdbDetails) {
      throw new Error(`No IMDB data found for movie with IMDB ID: ${imdbId}`);
    }
    
    // Get poster from IMDB
    const posterUrl = await IMDBService.getIMDBPoster(imdbId);
    
    // Try to get trailer
    const trailerUrl = await IMDBService.getIMDBTrailer(imdbId);
    
    // Return enhanced movie data
    return {
      imdb_id: imdbId,
      title: imdbDetails.title,
      description: imdbDetails.description,
      poster: posterUrl,
      trailer: trailerUrl,
      rating: imdbDetails.rating,
      year: imdbDetails.year,
      genres: imdbDetails.genres || [],
      runtime: imdbDetails.runtime || 'N/A',
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

/**
 * Extract year from movie title
 * @param {string} title - Movie title
 * @returns {string} - Extracted year or empty string
 */
const extractYearFromTitle = (title) => {
  const match = title.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : '';
};

/**
 * Search movies
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchMovies = async (query) => {
  try {
    const results = await IMDBService.searchIMDB(query);
    
    // Filter to only include movies (not TV shows)
    const movieResults = results.filter(item => 
      item.type === 'movie' || (!item.type && !item.tvSeriesInfo)
    );
    
    // Map to a standardized format
    return movieResults.map(movie => ({
      imdb_id: movie.id,
      title: movie.title || movie.name,
      description: movie.description || movie.plot,
      poster: movie.poster || movie.image,
      rating: movie.rating || movie.imdbRating,
      year: movie.year || (movie.releaseDate ? movie.releaseDate.substring(0, 4) : ''),
      genres: movie.genres || [],
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};