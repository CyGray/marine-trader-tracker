import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    // 1. Check for required environment variables
    if (!process.env.GOOGLE_CREDENTIALS) {
      return res.status(500).json({ 
        success: false,
        error: 'Missing GOOGLE_CREDENTIALS environment variable' 
      });
    }

    if (!process.env.SPREADSHEET_ID) {
      return res.status(500).json({ 
        success: false,
        error: 'Missing SPREADSHEET_ID environment variable' 
      });
    }

    // 2. Authenticate with Google
    let auth;
    try {
      auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (authError) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to authenticate with Google',
        details: authError.message 
      });
    }

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // 3. Generate random number between 1-100
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const timestamp = new Date().toISOString();

    // 4. Attempt to write to the sheet
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Transactions!A1', // Targeting Transactions, cell A1
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            `Test Success! Random #: ${randomNumber} (${timestamp})`
          ]]
        }
      });

      // 5. If successful, try reading back to verify
      const readResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Transactions!A1',
      });

      return res.status(200).json({
        success: true,
        message: 'Connection test successful',
        data: {
          writtenValue: `Test Success! Random #: ${randomNumber} (${timestamp})`,
          readValue: readResponse.data.values?.[0]?.[0] || 'No value read',
          spreadsheetId,
          sheetName: 'Transactions'
        }
      });

    } catch (writeError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to write to Google Sheet',
        details: writeError.message,
        attemptedValue: `Test Success! Random #: ${randomNumber} (${timestamp})`
      });
    }

  } catch (error) {
    console.error('Connection test failed:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Unexpected error during connection test',
      details: error.message 
    });
  }
}