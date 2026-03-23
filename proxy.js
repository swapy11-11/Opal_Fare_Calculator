const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

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

app.listen(3001, () => console.log('Proxy running on port 3001'));