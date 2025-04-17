import { fetchData, IMDB_API_BASE } from './api';

/**
 * Search for movies and TV shows on IMDB
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchIMDB = async (query) => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const data = await fetchData(`${IMDB_API_BASE}/search?q=${encodedQuery}`);
    
    // Ensure we return an array, even if the API doesn't return results in the expected format
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.results && Array.isArray(data.results)) {
      return data.results;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && typeof data === 'object') {
      // If we get a single result, wrap it in an array
      return [data];
    }
    
    // If no valid response, return empty array
    return [];
  } catch (error) {
    console.error('Error searching IMDB:', error);
    return [];
  }
};

/**
 * Get details for a specific IMDB ID
 * @param {string} imdbId - IMDB ID (e.g., tt0944947)
 * @returns {Promise<Object>} - Movie or TV show details
 */
export const getIMDBDetails = async (imdbId) => {
  try {
    const data = await fetchData(`${IMDB_API_BASE}/search?tt=${imdbId}`);
    
    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    console.warn('No details found for IMDB ID:', imdbId);
    return null;
  } catch (error) {
    console.error('Error fetching IMDB details:', error);
    return null;
  }
};

/**
 * Get poster image URL for a given IMDB ID
 * @param {string} imdbId - IMDB ID
 * @returns {Promise<string>} - Poster image URL
 */
export const getIMDBPoster = async (imdbId) => {
  try {
    const response = await fetch(`${IMDB_API_BASE}/photo/${imdbId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch poster: ${response.status}`);
    }
    
    // If the API returns the image directly
    const imageUrl = response.url;
    return imageUrl;
  } catch (error) {
    console.error('Error fetching IMDB poster:', error);
    return null;
  }
};

/**
 * Get trailer video URL for a given IMDB ID
 * @param {string} imdbId - IMDB ID
 * @returns {Promise<string>} - Trailer video URL
 */
export const getIMDBTrailer = async (imdbId) => {
  try {
    const data = await fetchData(`${IMDB_API_BASE}/media/${imdbId}`);
    return data.videoUrl || null;
  } catch (error) {
    console.error('Error fetching IMDB trailer:', error);
    return null;
  }
};

/**
 * Search for streaming availability on JustWatch
 * @param {string} query - Search query
 * @param {string} region - Region code (e.g., 'en_US')
 * @returns {Promise<Array>} - Array of streaming options
 */
export const searchJustWatch = async (query, region = 'en_US') => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const data = await fetchData(`${IMDB_API_BASE}/justwatch?q=${encodedQuery}&L=${region}`);
    return data.items || [];
  } catch (error) {
    console.error('Error searching JustWatch:', error);
    return [];
  }
};