// server.js
const express = require('express');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.get('/alldata', (req, res) => {
  console.log('GET:', req.query);
  res.send('Data received');
});
const CONSUMER_KEY = '43c88df41d1a18257be9701095b445ac63c78da946f4bbfbc4464b5ef39219fa';
const CONSUMER_SECRET = 'b6537c32de9eb3e9da3c496160d3e98e6a892a3608663e5fc7ecc57354328d2e';
const TOKEN_ID = '10b4f67ebee0b8c9e66114413283a9c70b971f4710da2b34b8f4728cbb5ea65f';
const TOKEN_SECRET = '2c915518a4b55f96c1bdfe4bf0fe665599196590a784ffc137dd023fd4ffb906';
const ACCOUNT_ID = '7952908';
// comment
const oauth = OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: 'HMAC-SHA256',
  hash_function(base_string, key) {
    return crypto.createHmac('sha256', key).update(base_string).digest('base64');
  }
});

app.post('/shopify/order', async (req, res) => {
  var orderData = req.body;
  var request_data = {
    url: `https://${ACCOUNT_ID}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=323&deploy=1`,
    method: 'POST',
  };

  const token = {
    key: TOKEN_ID,
    secret: TOKEN_SECRET
  };

  const oauthHeader = oauth.toHeader(oauth.authorize(request_data, token));

  const headers = {
    Authorization: `${oauthHeader.Authorization}, realm="${ACCOUNT_ID}"`,
    'Content-Type': 'application/json'
  };
  try {
    const response = await axios.post(request_data.url, orderData, { headers });
    res.status(200).send({ success: true, netsuite: response.data });
  } catch (error) {
    console.error('NetSuite error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).send({ error: 'Failed to sync with NetSuite' });
  }
});

app.listen(3000, () => {
  console.log('Middleware running on port 3000');
});
