import { MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import { getModeLabel } from './modeConfig';

const LEG_COLORS = ['#1976d2', '#2e7d32', '#ef6c00', '#8e24aa', '#d32f2f', '#00838f'];

function formatCost(leg, cost) {
  if (leg.isWalking) return 'Walk';
  if (cost === 0) return 'Free';
  return `$${cost.toFixed(2)}`;
}

function JourneyMap({ legs }) {
  const mapLegs = legs.filter((leg) => Array.isArray(leg.coords) && leg.coords.length > 1);
  const allCoords = mapLegs.flatMap((leg) => leg.coords);

  if (allCoords.length < 2) {
    return (
      <p style={{ color: '#666' }}>
        Map preview is unavailable for this journey.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Journey map</h3>
      <div style={{ height: 420, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
        <MapContainer
          bounds={allCoords}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapLegs.map((leg, index) => (
            <Polyline
              key={`${leg.origin}-${leg.destination}-${index}`}
              positions={leg.coords}
              pathOptions={{
                color: LEG_COLORS[index % LEG_COLORS.length],
                weight: leg.isWalking ? 4 : 6,
                opacity: 0.85,
                dashArray: leg.isWalking ? '8 8' : undefined,
              }}
            >
              <Tooltip sticky>
                <div style={{ minWidth: 200 }}>
                  <strong>Leg {index + 1}: {getModeLabel(leg.mode)}</strong>
                  <br />
                  {leg.origin} &rarr; {leg.destination}
                  <br />
                  Distance: {leg.distanceKm.toFixed(2)} km
                  <br />
                  Cost: {formatCost(leg, leg.cost)}
                </div>
              </Tooltip>
            </Polyline>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default JourneyMap;
