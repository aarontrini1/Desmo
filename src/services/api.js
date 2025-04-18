// src/services/api.js

// Base API URLs - Updated to match documentation
const VIDSRC_API_BASE = 'https://vidsrc.xyz';
const TVMAZE_API_BASE = 'https://api.tvmaze.com';
const IMDB_API_BASE = 'https://imdb.iamidiotareyoutoo.com';

// Simple in-memory cache
const apiCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Generic fetch function with error handling and caching
const fetchData = async (url, options = {}) => {
  try {
    // Check if we have a cached response
    const cacheKey = url;
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`Using cached data for: ${url}`);
      return cachedData.data;
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

// Updated server configurations for streaming based on documentation
export const streamingServers = {
  movie: [
    { 
      id: 'server1', 
      name: 'VidSrc', 
      getUrl: (imdbId, tmdbId) => {
        // Updated to match API documentation
        return `${VIDSRC_API_BASE}/embed/movie?imdb=${imdbId}`;
      }
    },
    { 
      id: 'server2', 
      name: 'VidLink', 
      getUrl: (imdbId, tmdbId) => {
        // VidLink requires tmdbId according to docs
        if (!tmdbId) {
          console.warn('VidLink requires TMDB ID, which is not available');
          return null;
        }
        return `https://vidlink.pro/movie/${tmdbId}`;
      }
    },
    { 
      id: 'server3', 
      name: 'Embed.su', 
      getUrl: (imdbId, tmdbId) => {
        // Embed.su can use either tmdbId or imdbId according to docs
        const id = tmdbId || imdbId;
        return `https://embed.su/embed/movie/${id}`;
      }
    }
  ],
  tv: [
    { 
      id: 'server1', 
      name: 'VidSrc', 
      getUrl: (imdbId, tmdbId, season, episode) => {
        // Updated to match API documentation
        return `${VIDSRC_API_BASE}/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
      }
    },
    { 
      id: 'server2', 
      name: 'VidLink', 
      getUrl: (imdbId, tmdbId, season, episode) => {
        // VidLink requires tmdbId according to docs
        if (!tmdbId) {
          console.warn('VidLink requires TMDB ID, which is not available');
          return null;
        }
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
      }
    },
    { 
      id: 'server3', 
      name: 'Embed.su', 
      getUrl: (imdbId, tmdbId, season, episode) => {
        // Embed.su can use either tmdbId or imdbId according to docs
        const id = tmdbId || imdbId;
        return `https://embed.su/embed/tv/${id}/${season}/${episode}`;
      }
    }
  ]
};

export { fetchData, VIDSRC_API_BASE, TVMAZE_API_BASE, IMDB_API_BASE };