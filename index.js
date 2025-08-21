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
const CONSUMER_KEY = '81bf0664dcc848e99285d09aab5fb205a17774d1ee3db0779e70d99857cbe635';
const CONSUMER_SECRET = '31e862e169c97416be94cabc26b53d99f339c1072fdeff2c30829c0c9b04fc80';
const TOKEN_ID = '94f1e1dbeb6500320282b9a464c6da2d6ca113ee74fc2772bb4c7801ebd593bf';
const TOKEN_SECRET = '1d43ed4fd4440a5865a7c1c4fd87ad24b8f6e5ebdfce2a71d48f35467fdf82a7';
const ACCOUNT_ID = 'TD3025443';
const oauth = OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: 'HMAC-SHA256',
  hash_function(base_string, key) {
    return crypto.createHmac('sha256', key).update(base_string).digest('base64');
  }
});

app.post('/shopify/order', async (req, res) => {
  var orderData = req.body;
  console.log("orderData" , orderData);
  var request_data = {
    url: `https://td3025443.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=10323&deploy=1`,
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



module.exports = app;