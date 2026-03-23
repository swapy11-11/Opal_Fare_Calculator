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
      `https://api.transport.nsw.gov.au/v1/tp/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf=${searchText}&coordOutputFormat=EPSG%3A4326&TfNSWTR=true`,
      {
        headers: {
          Authorization: `apikey ${process.env.REACT_APP_TFNSW_API_KEY}`,
        },
      }
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
          <li key={station.id}>{station.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default StationSearch;