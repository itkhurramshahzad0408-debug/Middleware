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
const CONSUMER_KEY = '4a85783fbc881bb4ba17cdb55b40cc928478cc20a40ff8d9d679030ea705dbf5';
const CONSUMER_SECRET = 'be3b8a61692fce1273388427338dc138f6f0cf2b529a01e0924ae8927bad6b01';
const TOKEN_ID = 'd70097b4ef495ab04860691990139d0a32223b2fdd2315bc9c8d82d0c446aa71';
const TOKEN_SECRET = '9412c4121bf8238565630c04f698eb36eac97cb0d7ce95b5cc6ed1ad1686fa6e';
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
  var request_data = {
    url: `https://${ACCOUNT_ID}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=10322&deploy=1`,
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