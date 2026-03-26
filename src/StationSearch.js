import { useState, useRef, useCallback } from 'react';
import { MODE_INFO } from './modeConfig';

const SUPPORTED_MODES = Object.keys(MODE_INFO).map(Number);
const ICON_STYLE = { width: 20, height: 20, marginRight: 4, verticalAlign: 'middle' };
const DEBOUNCE_MS = 250;

function StationSearch({ label, onStationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const requestIdRef = useRef(0);
  const timerRef = useRef(null);

  const PREVIEW_LIMIT = 5;

  const searchStations = useCallback((searchText) => {
    clearTimeout(timerRef.current);

    if (searchText.length < 2) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const myId = ++requestIdRef.current;

      const response = await fetch(
        `http://localhost:3001/api/stop_finder?name=${searchText}`
      );
      const data = await response.json();

      if (myId !== requestIdRef.current) return;

      const filtered = data.locations.filter(
        (loc) =>
          loc.type === 'stop' &&
          loc.modes &&
          loc.modes.some((m) => SUPPORTED_MODES.includes(m))
      );

      if (filtered.length > 0) {
        setResults(filtered);
        setShowAll(false);
      } else {
        setResults((prev) =>
          prev.filter((s) => s.name.toLowerCase().includes(searchText.toLowerCase()))
        );
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchStations(value);
  };

  const visible = showAll ? results : results.slice(0, PREVIEW_LIMIT);
  const hasMore = results.length > PREVIEW_LIMIT;

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <label>{label}</label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type a station name..."
        style={{ display: 'block', width: '100%', boxSizing: 'border-box' }}
      />
      {results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 6,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            maxHeight: showAll ? 300 : 'none',
            overflowY: showAll ? 'auto' : 'visible',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {visible.map((station) => (
            <li
              key={station.id}
              onClick={() => {
                setQuery(station.name);
                setResults([]);
                setShowAll(false);
                onStationSelect(station);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <span style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                {station.modes
                  ?.filter((m) => MODE_INFO[m])
                  .map((m) => (
                    <img
                      key={m}
                      src={MODE_INFO[m].icon}
                      alt={MODE_INFO[m].label}
                      title={MODE_INFO[m].label}
                      style={ICON_STYLE}
                    />
                  ))}
              </span>
              <span>{station.name}</span>
            </li>
          ))}
          {hasMore && !showAll && (
            <li
              onClick={() => setShowAll(true)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#0066cc',
                fontWeight: 'bold',
                borderTop: '1px solid #ddd',
              }}
            >
              View all ({results.length} results)
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default StationSearch;
