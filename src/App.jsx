// src/App.jsx
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Services
import { getLatestMovies } from './services/movieService';
import { getLatestTVShows } from './services/tvShowService';

// Common components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import Error from './components/common/Error';

// Home components
import HomePage from './components/home/HomePage';

// Movie components
import MoviesPage from './components/movies/MoviesPage';
import MovieDetailPage from './components/movies/MovieDetailPage';

// TV Show components
import TVShowsPage from './components/tvshows/TVShowsPage';
import TVShowDetailPage from './components/tvshows/TVShowDetailPage';
import EpisodePlayerPage from './components/tvshows/EpisodePlayerPage';

// Search component
import SearchPage from './components/search/SearchPage';

// Main App Component
function App() {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Loading content...");

  useEffect(() => {
    // Set up a loading timer to update messages after delays
    const shortTimer = setTimeout(() => {
      if (loading) {
        setLoadingMessage("Still loading content...");
      }
    }, 3000);
    
    const longTimer = setTimeout(() => {
      if (loading) {
        setLoadingMessage("Loading is taking longer than expected. Please be patient...");
      }
    }, 8000);
    
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Fetch movies and TV shows in parallel
        const results = await Promise.allSettled([
          getLatestMovies(),
          getLatestTVShows()
        ]);
        
        // Check for errors and extract values
        const [moviesResult, tvShowsResult] = results;
        
        if (moviesResult.status === 'fulfilled') {
          const moviesData = moviesResult.value;
          
          // Log the first movie for debugging
          if (moviesData.length > 0) {
            console.log('First movie data:', moviesData[0]);
          }
          
          setMovies(moviesData);
        } else {
          console.error('Error fetching movies:', moviesResult.reason);
        }
        
        if (tvShowsResult.status === 'fulfilled') {
          const tvShowsData = tvShowsResult.value;
          
          // Log the first TV show for debugging
          if (tvShowsData.length > 0) {
            console.log('First TV show data:', tvShowsData[0]);
          }
          
          setTvShows(tvShowsData);
        } else {
          console.error('Error fetching TV shows:', tvShowsResult.reason);
        }
        
        // If both failed, set an error
        if (moviesResult.status === 'rejected' && tvShowsResult.status === 'rejected') {
          setError('Failed to load content. Please try again later.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load content');
        setLoading(false);
      }
    };
    
    fetchContent();
    
    // Clear timers on unmount
    return () => {
      clearTimeout(shortTimer);
      clearTimeout(longTimer);
    };
  }, []);

  // Show loading screen only during initial load
  if (loading && movies.length === 0 && tvShows.length === 0) {
    return (
      <div className="app">
        <Header />
        <main>
          <Loading message={loadingMessage} />
        </main>
        <Footer />
      </div>
    );
  }

  // Show error screen if there's a critical error
  if (error && movies.length === 0 && tvShows.length === 0) {
    return (
      <div className="app">
        <Header />
        <main>
          <Error message={error} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage movies={movies} tvShows={tvShows} />} />
          <Route path="/movies" element={<MoviesPage movies={movies} />} />
          <Route path="/tvshows" element={<TVShowsPage tvShows={tvShows} />} />
          <Route path="/movie/:id" element={<MovieDetailPage movies={movies} />} />
          <Route path="/tvshow/:id" element={<TVShowDetailPage tvShows={tvShows} />} />
          <Route path="/tvshow/:id/season/:seasonNumber/episode/:episodeNumber" element={<EpisodePlayerPage tvShows={tvShows} />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;