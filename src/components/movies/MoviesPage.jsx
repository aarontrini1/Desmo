import React from 'react';
import ContentCard from '../shared/ContentCard';

const MoviesPage = ({ movies }) => {
  return (
    <div className="movies-page">
      <h1>Movies</h1>
      <div className="content-grid">
        {movies.map((movie) => (
          <ContentCard key={movie.imdb_id} item={movie} type="movie" />
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;