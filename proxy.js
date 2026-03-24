const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coordsDistanceKm(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
  }
  return total;
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/stop_finder', async (req, res) => {
  const query = req.query.name;
  const url = `https://api.transport.nsw.gov.au/v1/tp/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf=${query}&coordOutputFormat=EPSG%3A4326&TfNSWTR=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `apikey ${process.env.REACT_APP_TFNSW_API_KEY}`,
    },
  });

  const data = await response.json();
  res.json(data);
});

const AIRPORT_PATTERN = /\b(Domestic|International) Airport\b/i;

function journeyTouchesAirport(legs) {
  return legs.some(
    (leg) => AIRPORT_PATTERN.test(leg.origin?.name || '') || AIRPORT_PATTERN.test(leg.destination?.name || '')
  );
}

app.get('/api/trip', async (req, res) => {
    const { from, to, date, time } = req.query;

    const itdDate = date || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const itdTime = time || `${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}`;

    const url = `https://api.transport.nsw.gov.au/v1/tp/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&itdDate=${itdDate}&itdTime=${itdTime}&type_origin=any&name_origin=${from}&type_destination=any&name_destination=${to}&TfNSWTR=true`;
  
    const response = await fetch(url, {
      headers: {
        Authorization: `apikey ${process.env.REACT_APP_TFNSW_API_KEY}`,
      },
    });
  
    const data = await response.json();

    if (!data.journeys?.length) {
      console.error('No journeys returned. Full response:', JSON.stringify(data));
      return res.status(502).json({ error: 'No journey data returned from API', detail: data });
    }

    const journeys = data.journeys.map((journey, ji) => {
      let totalDistanceKm = 0;
      const modes = new Set();

      const legs = journey.legs.map((leg, li) => {
        const isWalking = leg.transportation?.product?.class === 99;
        const distKm = leg.coords ? coordsDistanceKm(leg.coords) : 0;
        const modeName = leg.transportation?.product?.name ?? 'Unknown';

        if (!isWalking) {
          totalDistanceKm += distKm;
          modes.add(modeName);
        }

        return {
          mode: modeName,
          origin: leg.origin?.disassembledName || leg.origin?.name,
          destination: leg.destination?.disassembledName || leg.destination?.name,
          distanceKm: Math.round(distKm * 100) / 100,
          isWalking,
        };
      });

      const summary = [...modes].join(' + ');
      const airport = journeyTouchesAirport(journey.legs);
      console.log(`Journey ${ji}: ${summary} | ${totalDistanceKm.toFixed(2)} km${airport ? ' [AIRPORT]' : ''}`);

      return {
        summary,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
        duration: journey.legs.reduce((t, l) => t + (l.duration ?? 0), 0),
        airport,
        legs,
      };
    });

    res.json({ journeys });
});

app.listen(3001, () => console.log('Proxy running on port 3001'));