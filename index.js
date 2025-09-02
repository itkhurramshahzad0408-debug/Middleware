// For Shopify 
// server.js
// const express = require('express');
// const axios = require('axios');
// const OAuth = require('oauth-1.0a');
// const crypto = require('crypto');

// const app = express();
// app.use(express.json());

// app.get('/alldata', (req, res) => {
//   console.log('GET:', req.query);
//   res.send('Data received');
// });
// const CONSUMER_KEY = '81bf0664dcc848e99285d09aab5fb205a17774d1ee3db0779e70d99857cbe635';
// const CONSUMER_SECRET = '31e862e169c97416be94cabc26b53d99f339c1072fdeff2c30829c0c9b04fc80';
// const TOKEN_ID = '94f1e1dbeb6500320282b9a464c6da2d6ca113ee74fc2772bb4c7801ebd593bf';
// const TOKEN_SECRET = '1d43ed4fd4440a5865a7c1c4fd87ad24b8f6e5ebdfce2a71d48f35467fdf82a7';
// const ACCOUNT_ID = 'TD3025443';
// const oauth = OAuth({
//   consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
//   signature_method: 'HMAC-SHA256',
//   hash_function(base_string, key) {
//     return crypto.createHmac('sha256', key).update(base_string).digest('base64');
//   }
// });

// app.post('/shopify/order', async (req, res) => {
//   var orderData = req.body;
//   console.log("orderData", orderData);
//   var request_data = {
//     url: `https://td3025443.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=10323&deploy=1`,
//     method: 'POST',
//   };

//   const token = {
//     key: TOKEN_ID,
//     secret: TOKEN_SECRET
//   };

//   const oauthHeader = oauth.toHeader(oauth.authorize(request_data, token));

//   const headers = {
//     Authorization: `${oauthHeader.Authorization}, realm="${ACCOUNT_ID}"`,
//     'Content-Type': 'application/json'
//   };
//   try {
//     const response = await axios.post(request_data.url, orderData, { headers });
//     res.status(200).send({ success: true, netsuite: response.data });
//   } catch (error) {
//     console.error('NetSuite error:', error.message);
//     if (error.response) {
//       console.error('Status:', error.response.status);
//       console.error('Data:', error.response.data);
//     }
//     res.status(500).send({ error: 'Failed to sync with NetSuite' });
//   }
// });

// app.listen(3000, () => {
//   console.log('Middleware running on port 3000');
// });

// module.exports = app;

// End Shopify 




// Start For 1Link
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const qs = require('qs');

const app = express();
app.use(bodyParser.json());

// Replace with actual 1LINK credentials
const CLIENT_ID = '361dd796eddf6a5ba9b3295409e2b10e';
const CLIENT_SECRET = 'fe4c4d977afce1285ae7e1537836116c';
const TOKEN_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/oauth2/token';
const RASST_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/1Link';

// ✅ Step 1: API endpoint for NetSuite
app.post('/api/testLink1', async (req, res) => {
  try {
    console.log('Request from NetSuite:', req.body);

    // Extract payload from NetSuite
    // const { recordId, amount, message } = req.body;

    // ✅ Step 2: Get OAuth token
    const tokenResponse = await axios.post(TOKEN_URL, qs.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: '1LinkApi'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('Access Token:', accessToken);

    // ✅ Step 3: Prepare 1LINK IBFT / Raast API payload
    const oneLinkPayload = {
      info: {
        stan: "123456",
        rtpId: "2204031378259968",
        merchantID: "70425271300379",
        subDept: "0001"
      }
    };

    console.log('link payload', oneLinkPayload);

    const ibftResponse = await axios.post(
      'https://sandboxapi.1link.net.pk/uat-1link/sandbox/1Link/statusInquiry',
      oneLinkPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-IBM-Client-Id': '361dd796eddf6a5ba9b3295409e2b10e',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'User-Agent': 'PostmanRuntime/7.45.0'
          // 'Cookie': '_cf_bm=rXX7dYq6.9qPAQJBmFYETvuSDH3CYzZJjFcQwOuH1i...' // Optional
        }
      }
    );


    console.log('1LINK Response headers:', ibftResponse.headers);
    console.log('1LINK Response:', ibftResponse.data);

    // ✅ Step 5: Send response back to NetSuite
    res.json({
      status: 'SUCCESS',
      recordId: recordId,
      oneLinkResponse: ibftResponse.data
    });

  } catch (error) {
    console.error('Error in middleware:', error.response ? error.response.data : error.message);
    res.status(500).json({
      status: 'FAILED',
      message: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Middleware running on http://localhost:${PORT}`);
});

module.exports = app;
