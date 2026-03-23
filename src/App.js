import { useState } from 'react';
import StationSearch from './StationSearch';
import { calculateFare, isPeakTime } from './fareCalculator';

function App() {
  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [journeys, setJourneys] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchTrips = async () => {
    setLoading(true);
    setJourneys(null);
    setSelectedJourney(null);

    const response = await fetch(
      `http://localhost:3001/api/trip?from=${fromStation.id}&to=${toStation.id}`
    );
    const data = await response.json();

    if (data.journeys) {
      const peak = isPeakTime(new Date());
      const enriched = data.journeys.map((j) => ({
        ...j,
        peak,
        fare: calculateFare(j.totalDistanceKm, peak),
      }));
      setJourneys(enriched);
    }

    setLoading(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div>
      <h1>Opal Fare Calculator</h1>
      <StationSearch label="From" onStationSelect={setFromStation} />
      <StationSearch label="To" onStationSelect={setToStation} />

      {fromStation && toStation && (
        <button onClick={searchTrips}>Calculate Fare</button>
      )}

      {loading && <p>Loading...</p>}

      {journeys && !selectedJourney && (
        <div>
          <h2>Choose a journey</h2>
          {journeys.map((j, i) => (
            <div
              key={i}
              onClick={() => setSelectedJourney(j)}
              style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <strong>{j.summary}</strong>
              <span style={{ float: 'right' }}>${j.fare.toFixed(2)}</span>
              <br />
              <small>
                {j.totalDistanceKm.toFixed(2)} km
                &nbsp;&middot;&nbsp;
                {formatDuration(j.duration)}
                &nbsp;&middot;&nbsp;
                {j.peak ? 'Peak' : 'Off-Peak'}
              </small>
            </div>
          ))}
        </div>
      )}

      {selectedJourney && (
        <div>
          <button onClick={() => setSelectedJourney(null)}>&larr; Back to options</button>
          <h2>{selectedJourney.summary}</h2>
          <p>Distance: {selectedJourney.totalDistanceKm.toFixed(2)} km</p>
          <p>Time: {selectedJourney.peak ? 'Peak' : 'Off-Peak'}</p>
          <p>Fare: ${selectedJourney.fare.toFixed(2)}</p>

          <h3>Legs</h3>
          <ol>
            {selectedJourney.legs.map((leg, i) => (
              <li key={i} style={{ marginBottom: 6, color: leg.isWalking ? '#888' : 'inherit' }}>
                <strong>{leg.mode}</strong>
                {' '}
                {leg.origin} &rarr; {leg.destination}
                {!leg.isWalking && ` (${leg.distanceKm.toFixed(2)} km)`}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default App;
