import { useState } from 'react';
import StationSearch from './StationSearch';

function App() {
  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);

  return (
    <div>
      <h1>Opal Fare Calculator</h1>
      <StationSearch label="From" onStationSelect={setFromStation} />
      <StationSearch label="To" onStationSelect={setToStation} />
      {fromStation && toStation && (
        <p>From: {fromStation.name} → To: {toStation.name}</p>
      )}
    </div>
  );
}

export default App;