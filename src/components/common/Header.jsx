import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize search query from URL if we're on the search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const queryParam = new URLSearchParams(location.search).get('q');
      if (queryParam) {
        setSearchQuery(queryParam);
      }
    }
  }, [location]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // Auto-search after a short delay when typing
    if (newQuery.trim().length >= 2) {
      // If already on search page, update URL with debounce
      if (location.pathname === '/search') {
        const params = new URLSearchParams(location.search);
        params.set('q', newQuery.trim());
        
        // Use replace to avoid filling browser history with each keystroke
        navigate(`/search?${params.toString()}`, { replace: true });
      }
    }
  };
  
  return (
    <header className="main-header">
      <div className="logo">
        <Link to="/">🎬 Desmo</Link>
      </div>
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search movies & TV shows..." 
            value={searchQuery}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          <button type="submit" className="search-button">🔍</button>
        </form>
      </div>
      <nav className="main-nav">
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/movies" className="nav-item">Movies</Link>
        <Link to="/tvshows" className="nav-item">TV Shows</Link>
      </nav>
    </header>
  );
};

export default Header;