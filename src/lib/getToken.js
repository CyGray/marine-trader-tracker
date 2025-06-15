const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../data/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../data/token.json');

async function getNewToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  try {
    // This will open a browser window for authentication
    const client = await auth.getClient();
    
    // Get the access token
    const token = await client.getAccessToken();
    
    // Save the token for later use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
      type: 'authorized_user',
      client_id: client.credentials.client_id,
      client_secret: client.credentials.client_secret,
      refresh_token: client.credentials.refresh_token
    }));
    
    console.log('Token stored to', TOKEN_PATH);
  } catch (error) {
    console.error('Error getting token:', error);
  }
}

getNewToken();