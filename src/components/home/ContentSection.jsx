import React from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../shared/ContentCard';

const ContentSection = ({ title, items, type, seeAllLink }) => {
  return (
    <section className="content-section">
      <div className="section-header">
        <h2>{title}</h2>
        <Link to={seeAllLink} className="see-all">See All</Link>
      </div>
      <div className="content-list">
        {items.slice(0, 6).map((item) => (
          <ContentCard key={item.imdb_id} item={item} type={type} />
        ))}
      </div>
    </section>
  );
};

export default ContentSection;