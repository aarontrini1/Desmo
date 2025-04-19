// src/utils/helpers.js

// Utility function to generate a placeholder color
export const generatePlaceholderColor = (title) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${color.padEnd(6, '0')}`;
};

// Extract year from title
export const extractYearFromTitle = (title) => {
  if (!title) return '';
  return title.match(/\b(19|20)\d{2}\b/)?.[0] || '';
};

// Clean title by removing year
export const cleanTitleFromYear = (title) => {
  if (!title) return '';
  return title.replace(/\s*\b(19|20)\d{2}\b\s*/, '');
};

// Clean HTML content from strings
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, "");
};

// Format runtime in minutes to hours and minutes
export const formatRuntime = (runtime) => {
  if (!runtime || isNaN(runtime)) return 'N/A';
  
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
};

// Parse PT2H18M format to minutes
export const parseDuration = (durationStr) => {
  if (!durationStr) return null;
  
  let minutes = 0;
  
  // Extract hours
  const hoursMatch = durationStr.match(/(\d+)H/);
  if (hoursMatch && hoursMatch[1]) {
    minutes += parseInt(hoursMatch[1]) * 60;
  }
  
  // Extract minutes
  const minutesMatch = durationStr.match(/(\d+)M/);
  if (minutesMatch && minutesMatch[1]) {
    minutes += parseInt(minutesMatch[1]);
  }
  
  return minutes || null;
};

// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Convert TVMaze API data to our format
export const convertTVMazeShow = (tvMazeShow) => {
  if (!tvMazeShow) return null;
  
  return {
    id: tvMazeShow.id,
    imdb_id: tvMazeShow.externals?.imdb || `tvmaze-${tvMazeShow.id}`,
    title: tvMazeShow.name,
    description: stripHtml(tvMazeShow.summary),
    poster: tvMazeShow.image?.original || tvMazeShow.image?.medium,
    rating: tvMazeShow.rating?.average,
    premiered: tvMazeShow.premiered,
    genres: tvMazeShow.genres || [],
    status: tvMazeShow.status,
    quality: 'HD' // Default quality
  };
};

// Check if a string is a valid IMDB ID
export const isImdbId = (id) => {
  return /^tt\d+$/.test(id);
};

// Check if a string is a valid TVMaze ID
export const isTVMazeId = (id) => {
  return /^tvmaze-\d+$/.test(id);
};

// Extract the actual ID from a prefixed ID
export const extractId = (prefixedId) => {
  if (isImdbId(prefixedId)) {
    return prefixedId;
  }
  
  if (isTVMazeId(prefixedId)) {
    return prefixedId.replace('tvmaze-', '');
  }
  
  return prefixedId;
};