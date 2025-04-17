import React from 'react';
import ContentCard from '../shared/ContentCard';

const TVShowsPage = ({ tvShows }) => {
  return (
    <div className="tvshows-page">
      <h1>TV Shows</h1>
      <div className="content-grid">
        {tvShows.map((show) => (
          <ContentCard key={show.imdb_id} item={show} type="tvshow" />
        ))}
      </div>
    </div>
  );
};

export default TVShowsPage;