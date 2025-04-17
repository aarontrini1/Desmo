import React from 'react';

const SeasonSelector = ({ seasons, currentSeason, onChange }) => {
  // Sort seasons by number
  const sortedSeasons = [...seasons].sort((a, b) => a.number - b.number);
  
  return (
    <div className="season-selector">
      <label htmlFor="season-select">Season:</label>
      <select 
        id="season-select" 
        value={currentSeason} 
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {sortedSeasons.map(season => (
          <option key={season.id} value={season.number}>
            Season {season.number} {season.name && season.name !== `Season ${season.number}` && `- ${season.name}`}
            {season.episodeOrder && ` (${season.episodeOrder} episodes)`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;