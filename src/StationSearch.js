import { useState } from 'react';

function StationSearch({ label, onStationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchStations = async (searchText) => {
    if (searchText.length < 2) {
      setResults([]);
      return;
    }

    const response = await fetch(
      `http://localhost:3001/api/stop_finder?name=${searchText}`
    );

    const data = await response.json();

    const filtered = data.locations.filter(
      (loc) =>
        loc.type === 'stop' &&
        loc.modes &&
        loc.modes.some((m) => [1, 2, 4].includes(m))
    );

    setResults(filtered);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchStations(value);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type a station name..."
      />
      <ul>
        {results.map((station) => (
          <li
            key={station.id}
            onClick={() => {
              setQuery(station.name);
              setResults([]);
              onStationSelect(station);
            }}
            style={{ cursor: 'pointer' }}
          >
            {station.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StationSearch;