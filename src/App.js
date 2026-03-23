import StationSearch from './StationSearch';

function App() {
  return (
    <div>
      <h1>Opal Fare Calculator</h1>
      <StationSearch label="From" />
      <StationSearch label="To" />
    </div>
  );
}

export default App;