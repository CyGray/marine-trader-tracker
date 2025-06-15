// pages/api/transactions.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  // Enhanced logging
  // In your /api/transactions.js
  console.log('Received delete request with:', {
    action: req.body.action,
    transactionId: req.body.transaction?.id,
    fullBody: req.body
  });
  
  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.log('Method not allowed');
      return res.status(405).json({ 
        success: false,
        error: 'Only POST requests are allowed' 
      });
    }

    // Validate action parameter
    if (!req.body?.action) {
      console.log('Missing action parameter');
      return res.status(400).json({ 
        success: false,
        error: 'Missing action parameter' 
      });
    }

    // Validate action type
    const validActions = ['sync', 'create', 'update', 'delete'];
    if (!validActions.includes(req.body.action)) {
      console.log('Invalid action:', req.body.action);
      return res.status(400).json({ 
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
      });
    }

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
    const SHEET_NAME = 'Transactions';
    const RANGE = `${SHEET_NAME}!A1:J`;

    // Helper function to get sheet data
    const getSheetData = async () => {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: RANGE,
        });

        if (!response.data.values || response.data.values.length === 0) {
          return { headers: [], rows: [] };
        }

        const headers = response.data.values[0];
        const rows = response.data.values.slice(1).filter(row => 
          row.some(cell => cell && cell.toString().trim() !== '')
        );

        return { headers, rows };
      } catch (error) {
        console.error('Error getting sheet data:', error);
        throw error;
      }
    };

    // Handle different actions
    switch (req.body.action) {
      case 'sync': {
        // Get existing data from sheet
        const { headers, rows } = await getSheetData();
        
        // Format remote transactions
        const remoteTransactions = rows.map(row => ({
          ...Object.fromEntries(headers.map((h, i) => [
            h.toLowerCase(), 
            row[i] || null
          ])),
          rowNumber: rows.indexOf(row) + 2 // +2 for header row
        }));

        // Get local transactions from request
        const localTransactions = req.body.transactions || [];
        
        // Merge transactions (latest modification wins)
        const mergedTransactions = mergeTransactions(
          localTransactions,
          remoteTransactions
        );

        // Filter out invalid transactions
        const validTransactions = mergedTransactions.filter(t => 
          t.id && t.date && !t.date.startsWith('1970-01-01')
        );

        // Prepare update data
        const updateData = [
          headers || [
            'ID', 'Date', 'Wallet', 'Article', 'Amount', 
            'Type', 'Category', 'Member', 'Payee', 'LastModified'
          ],
          ...validTransactions.map(t => [
            t.id,
            t.date,
            t.wallet,
            t.article,
            t.amount,
            t.type,
            t.category,
            t.member,
            t.payee || '',
            t.lastmodified || new Date().toISOString()
          ])
        ];

        // Clear and update sheet
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: RANGE,
        });

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: RANGE,
          valueInputOption: 'USER_ENTERED',
          resource: { values: updateData }
        });

        return res.status(200).json(validTransactions);
      }

      case 'create':
      case 'update': {
        const transaction = req.body.transaction;
        if (!transaction) {
          return res.status(400).json({ 
            success: false,
            error: 'Missing transaction data' 
          });
        }

        // For updates, we need to find the row number
        let rowNumber = null;
        if (req.body.action === 'update') {
          const { rows } = await getSheetData();
          rowNumber = rows.findIndex(row => row[0] === transaction.id) + 2;
        }

        const values = [
          transaction.id,
          transaction.date,
          transaction.wallet,
          transaction.article,
          transaction.amount,
          transaction.type,
          transaction.category,
          transaction.member,
          transaction.payee || '',
          transaction.lastmodified || new Date().toISOString()
        ];

        if (rowNumber) {
          // Update existing row
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [values] }
          });
        } else {
          // Append new row
          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [values] }
          });
        }

        return res.status(200).json({ 
          success: true,
          action: req.body.action,
          rowUpdated: rowNumber 
        });
      }

      case 'delete': {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ 
            success: false,
            error: 'Missing transaction ID' 
          });
        }

        const { rows } = await getSheetData();
        const rowNumber = rows.findIndex(row => row[0] === id) + 2;

        if (rowNumber < 2) {
          return res.status(404).json({ 
            success: false,
            error: 'Transaction not found' 
          });
        }

        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
        });

        return res.status(200).json({ 
          success: true,
          rowDeleted: rowNumber 
        });
      }

      default:
        return res.status(400).json({ 
          success: false,
          error: 'Unknown action' 
        });
    }

  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    return res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
}

// Helper function to merge transactions (latest modification wins)
function mergeTransactions(local, remote) {
  const transactionMap = new Map();

  // Add remote transactions first
  remote.forEach(t => {
    if (t.id && t.date) {
      transactionMap.set(t.id, {
        ...t,
        source: 'remote',
        lastmodified: t.lastmodified || new Date(0).toISOString()
      });
    }
  });

  // Merge local transactions
  local.forEach(t => {
    if (t.id && t.date) {
      const existing = transactionMap.get(t.id);
      const localLastModified = new Date(t.lastmodified || 0);
      const remoteLastModified = new Date(existing?.lastmodified || 0);

      if (!existing || localLastModified > remoteLastModified) {
        transactionMap.set(t.id, {
          ...t,
          source: 'local',
          lastmodified: t.lastmodified || new Date().toISOString()
        });
      }
    }
  });

  return Array.from(transactionMap.values());
}