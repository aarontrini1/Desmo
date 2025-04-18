// src/services/tvMazeService.js
import { fetchData, TVMAZE_API_BASE } from './api';

/**
 * Search for TV shows on TVMaze
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchTVShows = async (query) => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const data = await fetchData(`${TVMAZE_API_BASE}/search/shows?q=${encodedQuery}`);
    
    // TVMaze returns an array of {score, show} objects, we extract just the shows
    return data.map(item => item.show) || [];
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return [];
  }
};

/**
 * Get TV show details by ID
 * @param {number} id - TVMaze show ID
 * @returns {Promise<Object>} - TV show details
 */
export const getTVShowDetails = async (id) => {
  try {
    return await fetchData(`${TVMAZE_API_BASE}/shows/${id}`);
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    return null;
  }
};

/**
 * Get TV show by external ID (IMDB, TheTVDB)
 * @param {string} imdbId - IMDB ID
 * @returns {Promise<Object>} - TV show details
 */
export const getTVShowByExternalId = async (imdbId) => {
  try {
    // Using the lookup endpoint as documented in TVMaze API
    return await fetchData(`${TVMAZE_API_BASE}/lookup/shows?imdb=${imdbId}`);
  } catch (error) {
    // If the show is not found, TVMaze returns a 404, which is handled in fetchData
    console.error('Error fetching TV show by external ID:', error);
    return null;
  }
};

/**
 * Get episodes for a TV show
 * @param {number} showId - TVMaze show ID
 * @param {boolean} includeSpecials - Whether to include specials
 * @returns {Promise<Array>} - Array of episodes
 */
export const getTVShowEpisodes = async (showId, includeSpecials = false) => {
  try {
    const url = includeSpecials 
      ? `${TVMAZE_API_BASE}/shows/${showId}/episodes?specials=1`
      : `${TVMAZE_API_BASE}/shows/${showId}/episodes`;
    
    return await fetchData(url);
  } catch (error) {
    console.error('Error fetching TV show episodes:', error);
    return [];
  }
};

/**
 * Get seasons for a TV show
 * @param {number} showId - TVMaze show ID
 * @returns {Promise<Array>} - Array of seasons
 */
export const getTVShowSeasons = async (showId) => {
  try {
    return await fetchData(`${TVMAZE_API_BASE}/shows/${showId}/seasons`);
  } catch (error) {
    console.error('Error fetching TV show seasons:', error);
    return [];
  }
};

/**
 * Get episodes for a specific season
 * @param {number} seasonId - TVMaze season ID
 * @returns {Promise<Array>} - Array of episodes
 */
export const getSeasonEpisodes = async (seasonId) => {
  try {
    return await fetchData(`${TVMAZE_API_BASE}/seasons/${seasonId}/episodes`);
  } catch (error) {
    console.error('Error fetching season episodes:', error);
    return [];
  }
};

/**
 * Get a specific episode by show ID, season number, and episode number
 * @param {number} showId - TVMaze show ID
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {Promise<Object>} - Episode details
 */
export const getEpisodeByNumber = async (showId, season, episode) => {
  try {
    return await fetchData(`${TVMAZE_API_BASE}/shows/${showId}/episodebynumber?season=${season}&number=${episode}`);
  } catch (error) {
    console.error('Error fetching episode by number:', error);
    return null;
  }
};

/**
 * Get cast information for a TV show
 * @param {number} showId - TVMaze show ID
 * @returns {Promise<Array>} - Array of cast members
 */
export const getTVShowCast = async (showId) => {
  try {
    return await fetchData(`${TVMAZE_API_BASE}/shows/${showId}/cast`);
  } catch (error) {
    console.error('Error fetching TV show cast:', error);
    return [];
  }
};

/**
 * Get images for a TV show
 * @param {number} showId - TVMaze show ID
 * @returns {Promise<Array>} - Array of images
 */
export const getTVShowImages = async (showId) => {
  try {
    return await fetchData(`${TVMAZE_API_BASE}/shows/${showId}/images`);
  } catch (error) {
    console.error('Error fetching TV show images:', error);
    return [];
  }
};