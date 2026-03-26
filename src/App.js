import { useState } from 'react';
import StationSearch from './StationSearch';
import {
  calculateFare,
  isPeakTime,
  isWeekend,
  isSchoolCardValid,
  getAirportFee,
  CARD_TYPES,
} from './fareCalculator';
import { getModeLabel, getModeIcon } from './modeConfig';

function App() {
  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [cardType, setCardType] = useState('adult');
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [journeys, setJourneys] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSelectedDate = () => {
    if (useCurrentTime) return new Date();
    if (!customDate || !customTime) return new Date();
    return new Date(`${customDate}T${customTime}`);
  };

  const computeFareInfo = (journey, card) => {
    const date = getSelectedDate();
    const peak = isPeakTime(date);
    const weekend = isWeekend(date);
    const schoolValid = isSchoolCardValid(date);

    const effectiveCard = card === 'school' && !schoolValid ? 'concession' : card;
    const schoolFallback = card === 'school' && !schoolValid;

    let fare = 0
    journey.legs.forEach((leg) => { fare += calculateFare(leg.distanceKm, peak, effectiveCard, leg.mode);
    });
     
    const airportFee = journey.airport ? getAirportFee(effectiveCard) : 0;
    const total = Math.round((fare + airportFee) * 100) / 100;

    return { peak, weekend, fare, airportFee, total, schoolFallback, effectiveCard };
  };

  const searchTrips = async () => {
    setLoading(true);
    setJourneys(null);
    setSelectedJourney(null);

    const date = getSelectedDate();
    const itdDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    const itdTime = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;

    const response = await fetch(
      `http://localhost:3001/api/trip?from=${fromStation.id}&to=${toStation.id}&date=${itdDate}&time=${itdTime}`
    );
    const data = await response.json();

    if (data.journeys) {
      setJourneys(data.journeys);
    }

    setLoading(false);
  };

  const handleCardTypeChange = (newType) => {
    setCardType(newType);
  };

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const changeNames = (summary) => {
    return summary
      .split(' + ')
      .map((n) => getModeLabel(n))
      .join(' + ');
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

      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="radio"
            checked={useCurrentTime}
            onChange={() => setUseCurrentTime(true)}
          />
          {' '}Current time
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            checked={!useCurrentTime}
            onChange={() => setUseCurrentTime(false)}
          />
          {' '}Custom time
        </label>
        {!useCurrentTime && (
          <div style={{ marginTop: 8 }}>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16, padding: 10, background: '#f5f5f5', borderRadius: 6, fontSize: 14 }}>
        {cardType === 'school' ? (
          <span>School Opal: Free on school days (Mon–Fri, 6:30am–7pm). Outside those hours, concession fares apply.</span>
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
          {journeys.map((j, i) => {
            const info = computeFareInfo(j, cardType);
            const modes = changeNames(j.summary);
            return (
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
                <strong>{modes}</strong>
                <span style={{ float: 'right' }}>
                  {info.total === 0 ? 'Free' : `$${info.total.toFixed(2)}`}
                </span>
                <br />
                <small>
                  {j.totalDistanceKm.toFixed(2)} km
                  &nbsp;&middot;&nbsp;
                  {formatDuration(j.duration)}
                  &nbsp;&middot;&nbsp;
                  {info.peak ? 'Peak' : 'Off-Peak'}
                  {j.airport && <> &middot; Includes airport fee</>}
                  {info.schoolFallback && <> &middot; Concession rate (outside school hours)</>}
                </small>
              </div>
            );
          })}
        </div>
      )}

      {selectedJourney && (() => {
        const info = computeFareInfo(selectedJourney, cardType);
        const modes = changeNames(selectedJourney.summary);
        return (
          <div>
            <button onClick={() => setSelectedJourney(null)}>&larr; Back to options</button>
            <h2>{modes}</h2>
            <p>Distance: {selectedJourney.totalDistanceKm.toFixed(2)} km</p>
            <p>Time: {info.peak ? 'Peak' : 'Off-Peak'}</p>
            <p>
              Fare: {info.fare === 0 ? 'Free' : `$${info.fare.toFixed(2)}`}
            </p>
            {selectedJourney.airport && (
              <p>Airport station access fee: ${info.airportFee.toFixed(2)}</p>
            )}
            {info.total !== info.fare && (
              <p><strong>Total: ${info.total.toFixed(2)}</strong></p>
            )}
            {info.schoolFallback && (
              <p style={{ color: '#c55' }}>
                School Opal not valid at this time — concession fare applied.
              </p>
            )}

            <h3>Legs</h3>
            <ol>
              {selectedJourney.legs.map((leg, i) => {
                const icon = getModeIcon(leg.mode);
                return (
                  <li key={i} style={{ marginBottom: 6, color: leg.isWalking ? '#888' : 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {icon && (
                      <img src={icon} alt={getModeLabel(leg.mode)} style={{ width: 20, height: 20, flexShrink: 0 }} />
                    )}
                    <span>
                      <strong>{getModeLabel(leg.mode)}:</strong>
                      {' '}
                      {leg.origin} &rarr; {leg.destination}
                      {!leg.isWalking && ` (${leg.distanceKm.toFixed(2)} km)`}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })()}
    </div>
  );
}

export default App;
