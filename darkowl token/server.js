const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const DARKOWL_API_KEY = process.env.DARKOWL_API_KEY;
const DARKOWL_API_SECRET = process.env.DARKOWL_API_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

app.get('/darkowl-token', async (req, res) => {
  try {
    const now = Date.now();

    if (cachedToken && now < tokenExpiresAt) {
      return res.json({ access_token: cachedToken });
    }

    const response = await axios.post('https://api.darkowl.com/token', {
      api_key: DARKOWL_API_KEY,
      api_secret: DARKOWL_API_SECRET,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    cachedToken = response.data.access_token;
    tokenExpiresAt = now + (response.data.expires_in * 1000);

    res.json({ access_token: cachedToken });
  } catch (error) {
    console.error('Error fetching token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to retrieve token from DarkOwl' });
  }
});

app.listen(PORT, () => {
  console.log(`DarkOwl token server running on port ${PORT}`);
});
