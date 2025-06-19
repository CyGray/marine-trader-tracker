// pages/api/test-sheets.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow GET requests for testing
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Only GET requests are allowed for testing' 
    });
  }

  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ 
      version: 'v4', 
      auth: await auth.getClient() 
    });
    
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
    const TEST_SHEET_NAME = 'TestConnection'; // Create this sheet in your spreadsheet
    const TEST_RANGE = `${TEST_SHEET_NAME}!A1:B2`;

    // Test 1: Verify spreadsheet access
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        test: 'Spreadsheet Access',
        error: `Failed to access spreadsheet: ${error.message}`,
        details: error.response?.data
      });
    }

    // Test 2: Test read operation
    let readResult;
    try {
      readResult = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: TEST_RANGE,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        test: 'Read Operation',
        error: `Failed to read from sheet: ${error.message}`,
        details: error.response?.data
      });
    }

    // Test 3: Test write operation
    const testTimestamp = new Date().toISOString();
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TEST_SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`Last Test: ${testTimestamp}`]]
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        test: 'Write Operation',
        error: `Failed to write to sheet: ${error.message}`,
        details: error.response?.data
      });
    }

    // Test 4: Test append operation
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TEST_SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[`Test Log Entry: ${testTimestamp}`]]
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        test: 'Append Operation',
        error: `Failed to append to sheet: ${error.message}`,
        details: error.response?.data
      });
    }

    // If all tests pass
    return res.status(200).json({
      success: true,
      tests: [
        { name: 'Spreadsheet Access', status: 'OK' },
        { name: 'Read Operation', status: 'OK', data: readResult.data },
        { name: 'Write Operation', status: 'OK', timestamp: testTimestamp },
        { name: 'Append Operation', status: 'OK', timestamp: testTimestamp }
      ],
      environment: {
        spreadsheetId: SPREADSHEET_ID,
        nodeEnv: process.env.NODE_ENV,
        // Don't expose sensitive credentials in response
        credentialsPresent: !!process.env.GOOGLE_CREDENTIALS 
      }
    });

  } catch (error) {
    console.error('Connection Test Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    return res.status(500).json({ 
      success: false,
      error: 'Connection test failed',
      details: {
        message: error.message,
        ...(error.response?.data && { apiError: error.response.data })
      }
    });
  }
}