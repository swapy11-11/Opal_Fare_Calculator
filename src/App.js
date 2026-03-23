import { useState } from 'react';
import StationSearch from './StationSearch';
import { calculateFare, isPeakTime, isWeekend, CARD_TYPES } from './fareCalculator';

function App() {
  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [cardType, setCardType] = useState('adult');
  const [journeys, setJourneys] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [loading, setLoading] = useState(false);

  const enrichJourneys = (rawJourneys) => {
    const now = new Date();
    const peak = isPeakTime(now);
    const weekend = isWeekend(now);
    return rawJourneys.map((j) => ({
      ...j,
      peak,
      weekend,
      fare: calculateFare(j.totalDistanceKm, peak, cardType),
    }));
  };

  const searchTrips = async () => {
    setLoading(true);
    setJourneys(null);
    setSelectedJourney(null);

    const response = await fetch(
      `http://localhost:3001/api/trip?from=${fromStation.id}&to=${toStation.id}`
    );
    const data = await response.json();

    if (data.journeys) {
      setJourneys(enrichJourneys(data.journeys));
    }

    setLoading(false);
  };

  const handleCardTypeChange = (newType) => {
    setCardType(newType);
    if (journeys) {
      const now = new Date();
      const peak = isPeakTime(now);
      const recalculated = journeys.map((j) => ({
        ...j,
        fare: calculateFare(j.totalDistanceKm, peak, newType),
      }));
      setJourneys(recalculated);
      if (selectedJourney) {
        const updated = recalculated.find(
          (j) => j.summary === selectedJourney.summary && j.totalDistanceKm === selectedJourney.totalDistanceKm
        );
        if (updated) setSelectedJourney(updated);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const card = CARD_TYPES[cardType];

  return (
    <div>
      <h1>Opal Fare Calculator</h1>

      <div style={{ marginBottom: 12 }}>
        <label>Card type: </label>
        <select value={cardType} onChange={(e) => handleCardTypeChange(e.target.value)}>
          {Object.entries(CARD_TYPES).map(([key, c]) => (
            <option key={key} value={key}>{c.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16, padding: 10, background: '#f5f5f5', borderRadius: 6, fontSize: 14 }}>
        {cardType === 'school' ? (
          <span>School Opal: Free travel on eligible services</span>
        ) : (
          <>
            <strong>{card.label}</strong> caps:
            Daily {card.dailyCap.weekday === card.dailyCap.weekend
              ? `$${card.dailyCap.weekday.toFixed(2)}`
              : `$${card.dailyCap.weekday.toFixed(2)} (Mon–Thu) / $${card.dailyCap.weekend.toFixed(2)} (Fri–Sun)`}
            {card.weeklyCap != null && <> &middot; Weekly ${card.weeklyCap.toFixed(2)}</>}
          </>
        )}
      </div>

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
              <span style={{ float: 'right' }}>
                {cardType === 'school' ? 'Free' : `$${j.fare.toFixed(2)}`}
              </span>
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
          <p>Fare: {cardType === 'school' ? 'Free' : `$${selectedJourney.fare.toFixed(2)}`}</p>

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
