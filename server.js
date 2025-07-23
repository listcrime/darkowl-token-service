const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Load DarkOwl credentials from environment variables
const DARKOWL_API_KEY = process.env.DARKOWL_API_KEY;
const DARKOWL_API_SECRET = process.env.DARKOWL_API_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

// 🔐 Token endpoint route
app.get('/darkowl-token', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached token if still valid
    if (cachedToken && now < tokenExpiresAt) {
      return res.json({ access_token: cachedToken });
    }

    // 🔁 Request a new token from DarkOwl
    const response = await axios.post('https://api.darkowl.com/token', {
      api_key: DARKOWL_API_KEY,
      api_secret: DARKOWL_API_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // ✅ Save and return new token
    cachedToken = response.data.access_token;
    tokenExpiresAt = now + (response.data.expires_in * 1000);
    res.json({ access_token: cachedToken });

  } catch (error) {
    // ❌ Enhanced logging to debug errors
    console.error('Error fetching token from DarkOwl:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error.message
    });

    res.status(500).json({
      error: 'Failed to retrieve token from DarkOwl',
      details: error?.response?.data || error.message
    });
  }
});

// 🌐 Start the server
app.listen(PORT, () => {
  console.log(`DarkOwl token server running on port ${PORT}`);
});
