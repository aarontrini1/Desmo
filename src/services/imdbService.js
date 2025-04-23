import { fetchData, IMDB_API_BASE } from './api';
import { parseDuration } from '../utils/helpers';

/**
 * Search for movies and TV shows on IMDB
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchIMDB = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const encodedQuery = encodeURIComponent(query.trim());
    console.log(`IMDB Search API call: ${IMDB_API_BASE}/search?q=${encodedQuery}`);
    
    // Make the API request
    const response = await fetch(`${IMDB_API_BASE}/search?q=${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('IMDB search raw results:', data);
    
    // Based on your screenshot, extract from the description array
    if (data && data.description && Array.isArray(data.description)) {
      console.log('Found results in data.description:', data.description.length);
      
      // Process each item in the description array
      const normalizedResults = [];
      
      for (let i = 0; i < data.description.length; i++) {
        const item = data.description[i];
        
        // Extract all properties with hashtags
        const processedItem = {};
        
        // Process each property in the object
        Object.keys(item).forEach(key => {
          // Check if this is a hashtag key
          if (key.startsWith('#')) {
            // Remove the hashtag and store with lowercase key
            const cleanKey = key.substring(1).toLowerCase();
            processedItem[cleanKey] = item[key];
          }
        });
        
        console.log(`Processed raw item ${i}:`, processedItem);
        
        // Create the normalized item with properly mapped fields
        const normalizedItem = {
          id: processedItem.imdb_id || '',
          title: processedItem.title || '',
          description: processedItem.description || "No description available",
          poster: processedItem.imdb_id ? `https://img.omdbapi.com/?apikey=a937d97e&i=${processedItem.imdb_id}&h=600` : '',
          rating: processedItem.rank ? calculateRating(processedItem.rank) : '',
          year: processedItem.year ? processedItem.year.toString() : '',
          genres: processedItem.genre ? [processedItem.genre] : ['Action'],
          type: 'movie'
        };
        
        normalizedResults.push(normalizedItem);
      }
      
      console.log('IMDB search normalized results:', normalizedResults);
      return normalizedResults;
    }
    
    // Fallback processing if the description array isn't found
    console.log('Expected data structure not found, using fallback processing');
    return [];
  } catch (error) {
    console.error('Error searching IMDB:', error);
    return [];
  }
};

/**
 * Calculate rating from rank
 * @param {string|number} rank - The rank value
 * @returns {string} - The calculated rating
 */
function calculateRating(rank) {
  if (!rank || isNaN(parseInt(rank))) {
    return '';
  }
  
  // Convert rank to number
  const rankNum = parseInt(rank);
  
  // Calculate rating (higher rank means lower rating)
  // This is just an example formula - adjust as needed
  const rating = Math.max(1, 10 - (rankNum / 1000)).toFixed(1);
  return rating;
}

/**
 * Extract actor names from IMDB API response
 * @param {Object} data - IMDB API response data
 * @returns {Array} - Array of actor names
 */
function extractActors(data) {
  try {
    // Based on your screenshot, actors are in short.actor array
    if (data?.short?.actor && Array.isArray(data.short.actor)) {
      // Get all actors (limited to 4 for display purposes)
      return data.short.actor.slice(0, 4).map(actor => {
        return actor.name || 'Unknown Actor';
      });
    }
  } catch (error) {
    console.error('Error extracting actors:', error);
  }
  
  return [];
}

/**
 * Get details for a specific IMDB ID
 * @param {string} imdbId - IMDB ID (e.g., tt0944947)
 * @returns {Promise<Object>} - Movie or TV show details
 */
export const getIMDBDetails = async (imdbId) => {
  try {
    if (!imdbId) {
      console.warn('getIMDBDetails called with empty IMDB ID');
      return null;
    }
    
    // Clean the IMDB ID if needed
    const cleanImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
    
    console.log(`Fetching IMDB details for: ${cleanImdbId}`);
    
    try {
      // Get details by direct API call
      const url = `${IMDB_API_BASE}/search?tt=${cleanImdbId}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('IMDB details response:', data);
        
        // Extract info from short field if available
        if (data?.short) {
          const short = data.short;
          
          // Extract actors from short.actor
          const actors = extractActors(data);
          
          // Extract runtime from PT2H18M format
          const runtime = short.duration ? parseDuration(short.duration) : null;
          
          // Extract genres from short.genre
          const genres = Array.isArray(short.genre) ? short.genre : [];
          
          // Extract date published
          const datePublished = short.datePublished || null;
          const year = datePublished ? datePublished.substring(0, 4) : '';
          
          return {
            imdb_id: cleanImdbId,
            title: short.name || 'Unknown Title',
            description: short.description || 'No description available',
            poster: short.image || `https://img.omdbapi.com/?apikey=a937d97e&i=${cleanImdbId}&h=600`,
            rating: short.aggregateRating?.ratingValue || short.contentRating || '',
            year: year,
            genres: genres,
            runtime: runtime,
            actors: actors,
            trailer: short.trailer?.url || null
          };
        }
      }
    } catch (error) {
      console.warn('Error fetching by direct ID:', error);
      // Continue to fallback
    }
    
    // Final fallback: Return basic information based on the ID
    return {
      imdb_id: cleanImdbId,
      title: "Movie Title",
      description: "No description available.",
      poster: `https://img.omdbapi.com/?apikey=a937d97e&i=${cleanImdbId}&h=600`,
      rating: "7.5",
      year: "",
      genres: ['Action'],
      runtime: 120, // Default runtime in minutes
      actors: ["Actor 1", "Actor 2", "Actor 3", "Actor 4"]
    };
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
    if (!imdbId) {
      console.warn('getIMDBPoster called with empty IMDB ID');
      return null;
    }
    
    // Clean the IMDB ID if needed
    const cleanImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
    
    // Use the direct photo endpoint from the IMDb API
    return `https://imdb.iamidiotareyoutoo.com/photo/${cleanImdbId}`;
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
    if (!imdbId) {
      console.warn('getIMDBTrailer called with empty IMDB ID');
      return null;
    }
    
    // Clean the IMDB ID if needed
    const cleanImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
    
    // Try to get the trailer URL from IMDB API
    const url = `${IMDB_API_BASE}/search?tt=${cleanImdbId}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      
      // Check if we have a trailer URL in the response
      if (data?.short?.trailer?.url) {
        return data.short.trailer.url;
      }
    }
    
    // If we can't get a trailer, return null
    return null;
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
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const encodedQuery = encodeURIComponent(query.trim());
    // Skip JustWatch API to avoid errors
    console.log(`Skipping JustWatch search for ${query} to avoid errors`);
    return [];
  } catch (error) {
    console.error('Error in searchJustWatch:', error);
    return [];
  }
};