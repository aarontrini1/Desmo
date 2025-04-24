import { fetchData, VIDSRC_API_BASE } from './api';
import * as TVMazeService from './tvMazeService';
import * as IMDBService from './imdbService';
import { convertTVMazeShow } from '../utils/helpers';

/**
 * Get latest TV shows from VidSrc API
 * @param {number} page - Page number
 * @returns {Promise<Array>} - Array of TV shows
 */
export const getLatestTVShows = async (page = 1) => {
  try {
    // Fixed API endpoint to match documentation
    const data = await fetchData(`${VIDSRC_API_BASE}/tvshows/latest/page-${page}.json`);
    
    // Make sure all TV shows have tmdb_id (some might only have imdb_id)
    const processedShows = data.result?.map(show => {
      // If tmdb_id is missing or empty, try to extract it from the title or set a fallback
      if (!show.tmdb_id && show.imdb_id) {
        console.log(`TV Show ${show.title} missing tmdb_id, using imdb_id ${show.imdb_id} instead`);
        // Note: in a real app, you might need an API to convert imdb_id to tmdb_id
        show.tmdb_id = show.imdb_id;
      }
      
      // Ensure every show has a poster if it has an imdb_id
      if (show.imdb_id && !show.poster) {
        show.poster = `https://imdb.iamidiotareyoutoo.com/photo/${show.imdb_id}`;
      }
      
      // Explicitly mark as TV show to help with filtering
      show.type = 'tvshow';
      return show;
    }) || [];
    
    // Further enhance TV shows with posters from TVMaze
    const enhancedShows = await Promise.all(
      processedShows.map(async (show) => {
        if (!show.poster && show.imdb_id) {
          try {
            // Try to get show from TVMaze by IMDB ID
            const tvMazeShow = await TVMazeService.getTVShowByExternalId(show.imdb_id);
            if (tvMazeShow && tvMazeShow.image) {
              show.poster = tvMazeShow.image.original || tvMazeShow.image.medium;
            }
          } catch (error) {
            console.error(`Failed to get TVMaze poster for ${show.title}:`, error);
          }
        }
        return show;
      })
    );
    
    return enhancedShows;
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    // Return empty array instead of throwing to gracefully handle API errors
    return [];
  }
};

/**
 * Enhance TV show data with details from TVMaze API
 * @param {Object} show - Basic TV show data
 * @returns {Promise<Object>} - Enhanced TV show data
 */
export const enhanceTVShowData = async (show) => {
  try {
    // Skip if no IMDB ID is available
    if (!show.imdb_id) {
      console.warn('Cannot enhance TV show data: Missing IMDB ID');
      return show;
    }
    
    // First try to get the TVMaze show by IMDB ID
    const tvMazeShow = await TVMazeService.getTVShowByExternalId(show.imdb_id);
    
    if (!tvMazeShow) {
      console.warn(`No TVMaze data found for show with IMDB ID: ${show.imdb_id}`);
      return show;
    }
    
    // Get poster image from TVMaze or IMDB if not available
    let posterUrl = null;
    if (tvMazeShow.image?.original) {
      posterUrl = tvMazeShow.image.original;
    } else if (tvMazeShow.image?.medium) {
      posterUrl = tvMazeShow.image.medium;
    } else {
      posterUrl = await IMDBService.getIMDBPoster(show.imdb_id);
    }
    
    // Combine the data
    return {
      ...show,
      tvmaze_id: tvMazeShow.id,
      description: tvMazeShow.summary || show.description,
      poster: posterUrl || show.poster,
      rating: tvMazeShow.rating?.average || 'N/A',
      // Removing status field
      premiered: tvMazeShow.premiered || 'Unknown',
      genres: tvMazeShow.genres || [],
      type: 'tvshow' // Explicitly mark as TV show
    };
  } catch (error) {
    console.error('Error enhancing TV show data:', error);
    return show;
  }
};

/**
 * Get TV show details including seasons and episodes
 * @param {string} imdbId - IMDB ID of the TV show
 * @returns {Promise<Object>} - TV show details with seasons and episodes
 */
export const getTVShowDetails = async (imdbId) => {
  try {
    // First, get the TVMaze show by IMDB ID
    const tvMazeShow = await TVMazeService.getTVShowByExternalId(imdbId);
    
    if (!tvMazeShow) {
      throw new Error(`No TVMaze data found for show with IMDB ID: ${imdbId}`);
    }
    
    // Get the poster from TVMaze or from IMDB if not available
    let posterUrl = null;
    if (tvMazeShow.image?.original) {
      posterUrl = tvMazeShow.image.original;
    } else if (tvMazeShow.image?.medium) {
      posterUrl = tvMazeShow.image.medium;
    } else {
      posterUrl = await IMDBService.getIMDBPoster(imdbId);
    }
    
    // Get seasons
    const seasons = await TVMazeService.getTVShowSeasons(tvMazeShow.id);
    
          // Enhanced TV show data
    return {
      id: tvMazeShow.id,
      imdb_id: imdbId,
      name: tvMazeShow.name,
      description: tvMazeShow.summary,
      poster: posterUrl,
      rating: tvMazeShow.rating?.average || 'N/A',
      // Removing status field to prevent it from being displayed
      premiered: tvMazeShow.premiered || 'Unknown',
      genres: tvMazeShow.genres || [],
      seasons: seasons,
      type: 'tvshow', // Explicitly mark as TV show
      // We don't fetch all episodes at once due to performance concerns
    };
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    return null;
  }
};

/**
 * Get all seasons for a TV show
 * @param {string} imdbId - IMDB ID of the TV show
 * @returns {Promise<Array>} - Array of seasons
 */
export const getTVShowSeasons = async (imdbId) => {
  try {
    // First, get the TVMaze show by IMDB ID
    const tvMazeShow = await TVMazeService.getTVShowByExternalId(imdbId);
    
    if (!tvMazeShow) {
      throw new Error(`No TVMaze data found for show with IMDB ID: ${imdbId}`);
    }
    
    // Get seasons
    return await TVMazeService.getTVShowSeasons(tvMazeShow.id);
  } catch (error) {
    console.error('Error fetching TV show seasons:', error);
    return [];
  }
};

/**
 * Get episodes for a specific season
 * @param {string} imdbId - IMDB ID of the TV show
 * @param {number} seasonNumber - Season number
 * @returns {Promise<Array>} - Array of episodes
 */
export const getSeasonEpisodes = async (imdbId, seasonNumber) => {
  try {
    // First, get the TVMaze show by IMDB ID
    const tvMazeShow = await TVMazeService.getTVShowByExternalId(imdbId);
    
    if (!tvMazeShow) {
      throw new Error(`No TVMaze data found for show with IMDB ID: ${imdbId}`);
    }
    
    // Get seasons to find the right season ID
    const seasons = await TVMazeService.getTVShowSeasons(tvMazeShow.id);
    const season = seasons.find(s => s.number === parseInt(seasonNumber));
    
    if (!season) {
      throw new Error(`Season ${seasonNumber} not found for show with IMDB ID: ${imdbId}`);
    }
    
    // Get episodes for this season
    return await TVMazeService.getSeasonEpisodes(season.id);
  } catch (error) {
    console.error('Error fetching season episodes:', error);
    return [];
  }
};

/**
 * Get a specific episode by season and episode number
 * @param {string} imdbId - IMDB ID of the TV show
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @returns {Promise<Object>} - Episode details
 */
export const getEpisode = async (imdbId, seasonNumber, episodeNumber) => {
  try {
    // First, get the TVMaze show by IMDB ID
    const tvMazeShow = await TVMazeService.getTVShowByExternalId(imdbId);
    
    if (!tvMazeShow) {
      throw new Error(`No TVMaze data found for show with IMDB ID: ${imdbId}`);
    }
    
    // Get episode by number using the TVMaze API
    return await TVMazeService.getEpisodeByNumber(
      tvMazeShow.id, 
      parseInt(seasonNumber), 
      parseInt(episodeNumber)
    );
  } catch (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
};

/**
 * Search TV shows using TVMaze API
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchTVShows = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    console.log(`Searching TV shows for: "${query}"`);
    const results = await TVMazeService.searchTVShows(query);
    
    if (!results || !Array.isArray(results)) {
      return [];
    }
    
    console.log(`Got ${results.length} TV show results from TVMaze`);
    
    // Map to a standardized format and ensure type is set
    const standardizedResults = results.map(show => {
      const standardizedShow = {
        id: show.id,
        imdb_id: show.externals?.imdb || null,
        title: show.name,
        description: show.summary,
        poster: show.image?.original || show.image?.medium || null,
        rating: show.rating?.average || 'N/A',
        premiered: show.premiered || 'Unknown',
        genres: show.genres || [],
        // Removing status from search results
        type: 'tvshow' // Explicitly mark as TV show
      };
      
      return standardizedShow;
    });
    
    console.log(`Returning ${standardizedResults.length} standardized TV show results`);
    return standardizedResults;
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return [];
  }
};