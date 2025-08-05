// api/alldata.js

import axios from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const CONSUMER_KEY = 'your_key';
const CONSUMER_SECRET = 'your_secret';
const TOKEN_ID = 'your_token_id';
const TOKEN_SECRET = 'your_token_secret';
const ACCOUNT_ID = 'your_account_id';

const oauth = OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: 'HMAC-SHA256',
  hash_function(base_string, key) {
    return crypto.createHmac('sha256', key).update(base_string).digest('base64');
  }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    console.log('GET query:', req.query);
    res.status(200).json({ message: 'GET success', query: req.query });

  } else if (req.method === 'POST') {
    const orderData = req.body;

    const request_data = {
      url: `https://${ACCOUNT_ID}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=323&deploy=1`,
      method: 'POST',
    };

    const token = {
      key: TOKEN_ID,
      secret: TOKEN_SECRET,
    };

    const oauthHeader = oauth.toHeader(oauth.authorize(request_data, token));

    const headers = {
      Authorization: `${oauthHeader.Authorization}, realm="${ACCOUNT_ID}"`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(request_data.url, orderData, { headers });
      res.status(200).json({ success: true, netsuite: response.data });
    } catch (error) {
      console.error('NetSuite error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      res.status(500).json({ error: 'NetSuite sync failed' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
