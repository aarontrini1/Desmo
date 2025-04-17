import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Fetch movies and TV shows in parallel
        const [moviesData, tvShowsData] = await Promise.all([
          getLatestMovies(),
          getLatestTVShows()
        ]);
        
        // Log the first movie for debugging
        if (moviesData.length > 0) {
          console.log('First movie data:', moviesData[0]);
        }
        
        // Log the first TV show for debugging
        if (tvShowsData.length > 0) {
          console.log('First TV show data:', tvShowsData[0]);
        }
        
        setMovies(moviesData);
        setTvShows(tvShowsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load content');
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <Router>
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
    </Router>
  );
}

export default App;