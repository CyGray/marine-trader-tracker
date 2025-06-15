export const walletTypeColors = {
    'GCash': 'bg-blue-500',
    'Crypto': 'bg-yellow-500',
    'On-hand': 'bg-green-500',
    'Bank': 'bg-red-500'
  };

export const transactionTypes = ['inbound', 'outbound', 'transfer'];


  export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Initial data states
  export const initialWallets = [
    { id: generateId(), name: 'Kyle GCash', type: 'GCash', balance: 45000, memberInCharge: 'Kyle Yuan Uy' },
    { id: generateId(), name: 'Kyle Onhand', type: 'GCash', balance: 45000, memberInCharge: 'Kyle Yuan Uy' },
    { id: generateId(), name: 'Kyle Bybit', type: 'ByBit', balance: 45000, memberInCharge: 'Kyle Yuan Uy' },
    { id: generateId(), name: 'Yong GCash', type: 'GCash', balance: 80000, memberInCharge: 'Louis Uy' },
    { id: generateId(), name: 'Yong Onhand', type: 'On-hand', balance: 80000, memberInCharge: 'Louis Uy' },
    { id: generateId(), name: 'Fritz Onhand', type: 'On-hand', balance: 25000, memberInCharge: 'Fritz Gioranz Tayo' },
    { id: generateId(), name: 'Fritz GCash', type: 'GCash', balance: 25000, memberInCharge: 'Fritz Gioranz Tayo' }
    // { id: generateId(), name: 'Fritz BPI', type: 'On-hand', balance: 25000, memberInCharge: 'Fritz Gioranz Tayo' }
  ];
  
  export const initialInvestments = [
    { id: generateId(), name: 'ByBit', memberInCharge: 'Kyle Yuan Uy', pnl: 15000, value: 75000 },
    { id: generateId(), name: 'Forex Trading', memberInCharge: 'Kyle Yuan Uy', pnl: 15000, value: 75000 },
    { id: generateId(), name: 'Crayfish', memberInCharge: 'Louis Uy', pnl: -2500, value: 32500 },
    { id: generateId(), name: 'Banana Chips', memberInCharge: 'Fritz Gioranz Tayo', pnl: -5000, value: 50000 },
    { id: generateId(), name: 'Loans', memberInCharge: 'Fritz Gioranz Tayo', pnl: 28000, value: 128000 }
  ];
  
  export const initialTransactions =[
      { 
        id: generateId(), 
        wallet: 'Kyle GCash', 
        investment: 'Banana Chips', 
        amount: 10000, 
        article: 'Uling',
        type: 'outbound', 
        category: 'Material', 
        date: '2024-06-08', 
        member: 'Kyle Yuan Uy',
        payee: null 
      },
      { 
        id: generateId(), 
        wallet: 'Fritz GCash', 
        investment: 'Loan', 
        amount: 15000, 
        article: 'BSN Loan',
        type: 'outbound', 
        category: 'Loan', 
        date: '2024-06-07', 
        member: 'Fritz Gioraz Tayo',
        payee: 'BSN' 
      },
      { 
        id: generateId(), 
        wallet: 'Yong Onhand', 
        investment: 'Crayfish', 
        amount: 25000, 
        article: 'Epoxy para sa filter',
        type: 'outbound', 
        category: 'Material', 
        date: '2024-06-06', 
        member: 'Louis Uy',
        payee: '' 
      },
      { 
        id: generateId(), 
        wallet: 'Fritz GCash', 
        investment: 'Loan', 
        amount: 15000, 
        article: 'Bayad Tiago',
        type: 'inbound', 
        category: 'Repayment', 
        date: '2024-06-05', 
        member: 'Fritz Gioranz Tayo',
        payee: 'Jaylow Lorca' 
      }
    ];
  
  export const initialPendingPayments = [
      { 
        id: generateId(), 
        payee: 'Mary Grace Lorca', 
        lender: 'Fritz Griotanz Tayo', 
        amount: 15000, 
        dueDate: '2024-06-15', 
        wallet: 'Fritz Onhand',
        status: 'pending' 
      },
      { 
        id: generateId(), 
        payee: 'Malou', 
        lender: 'Louis Uy', 
        amount: 25000, 
        dueDate: '2024-06-20', 
        wallet: 'Yong Onhand',
        status: 'pending' 
      },
      { 
        id: generateId(), 
        payee: 'Material Supplier', 
        lender: 'Fritz Gioranz Tayo', 
        amount: 18000, 
        dueDate: '2024-06-25', 
        wallet: 'Fritz BPI',
        status: 'pending' 
      }
    ]