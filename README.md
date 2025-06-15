# Marine Trader - Investments and Wallets Tracker

![Application Screenshot](public/icons/logofullinverted.png)

## Project Overview

The Marine Trader Investments and Wallets Tracker is a React/Next.js web application designed to help members consolidate and manage their various investments and wallets.

## Key Features

### Multi-tab Interface
- 📊 Overview dashboard with key metrics
- 💰 Wallet management
- 📈 Investment tracking
- 🕒 Transaction history

### Member-based Filtering
- 👥 View data for selected members
- 🧮 Consolidated totals per member

### Data Management
- ➕ Create wallets, investments, and transactions
- ✏️ Edit existing records
- 🗑️ Delete entries with confirmation
- ✅ Complete pending payments

### Data Visualization
- 📉 PnL over time charts
- 🎨 Color-coded wallet/investment cards

## File Structure
marine-trader/
├── app/
│ └── marineTraderTracker.jsx # Main application component
├── components/
│ └── Navbar.tsx # Navigation bar with auth
├── lib/
│ ├── firebaseConfig.js # Firebase configuration
│ └── Modals.jsx # All modal components
├── pages/
│ └── api/
│ └── transactions.js # Google Sheets API integration
├── public/
│ └── icons/ # Application assets
├── util/
│ ├── Constants.jsx # Application constants
│ └── Helpers.jsx # Utility functions
└── package.json # Project dependencies

text

## Technical Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS 3.3
- **Charts**: Recharts 2.8
- **Icons**: Lucide React 0.2

### Backend
- **Authentication**: Firebase Google OAuth
- **Database**: Firebase Firestore
- **Integration**: Google Sheets API

## Data Models

### Wallet
```typescript
{
  id: string;
  name: string;
  type: 'GCash' | 'Crypto' | 'On-hand' | 'Bank';
  balance: number;
  memberInCharge: string;
}
Investment
typescript
{
  id: string;
  name: string;
  memberInCharge: string;
  pnl: number;
  value: number;
}
Transaction
typescript
{
  id: string;
  wallet: string;
  investment?: string;
  amount: number;
  type: 'inbound' | 'outbound';
  category: string;
  date: string;
  member: string;
  payee?: string;
}
Setup Instructions
Environment Setup

bash
# Create .env.local file
GOOGLE_CREDENTIALS=your_credentials_json
SPREADSHEET_ID=your_sheet_id
FIREBASE_CONFIG=your_firebase_config
Install Dependencies

bash
npm install
Development

bash
npm run dev
Production Build

bash
npm run build
npm start
API Endpoints
Endpoint	Method	Description
/api/transactions	POST	Sync with Google Sheets
Component Documentation
Main Application (marineTraderTracker.jsx)
Manages all application state

Handles data persistence

Implements all core features

Navbar (Navbar.tsx)
typescript
interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}
Modals (Modals.jsx)
Modal	Purpose
AddWalletModal	Create new wallets
EditWalletModal	Modify wallet details
AddTransactionModal	Record financial transactions
ConfirmationModal	Confirm destructive actions
Error Handling
The application includes:

🛡️ Input validation

🔄 Automatic retry for sync operations

📝 Detailed error logging

💬 User-friendly error messages

Security
🔒 Google OAuth authentication

🔐 Firebase security rules

🛡️ Environment variable protection

🧹 Local storage sanitization

Performance
⚡ Memoized calculations

📑 Paginated transaction history

🔄 Optimistic UI updates

🗃️ Efficient data fetching

Future Roadmap
🚀 Real-time updates with Firebase

📱 Enhanced mobile experience

📤 Data export functionality

🔍 Advanced filtering options

Troubleshooting
Issue	Solution
Sync failures	Check API quotas & permissions
Auth problems	Verify Firebase config
Data mismatch	Force sync and check logs
License
This project is proprietary software developed for Marine Trader.

text

This Markdown document provides:
- Clean, organized structure
- Proper code formatting
- Easy-to-read tables
- Clear section headings
- Visual emoji indicators
- Comprehensive technical details

You can copy this directly into your `README.md` file and it will render beautifully on GitHub or any other Markdown viewer. The documentation covers all aspects from setup to architecture to future plans.