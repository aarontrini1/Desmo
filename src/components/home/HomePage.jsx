import React from 'react';
import ContentSection from './ContentSection';

const HomePage = ({ movies, tvShows }) => {
  return (
    <div className="home-page">
      <ContentSection 
        title="Latest Movies" 
        items={movies} 
        type="movie" 
        seeAllLink="/movies" 
      />
      
      <ContentSection 
        title="Latest TV Shows" 
        items={tvShows} 
        type="tvshow" 
        seeAllLink="/tvshows" 
      />
    </div>
  );
};

export default HomePage;