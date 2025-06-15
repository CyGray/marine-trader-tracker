'use client'

import { useState, useEffect } from 'react';
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const AddWalletModal = ({ onClose, onSave, members }) => {
  const [walletData, setWalletData] = useState({
    name: '',
    type: '',
    memberInCharge: '',
    balance: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWalletData(prev => ({
      ...prev,
      [name]: name === 'balance' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: generateId(),
      ...walletData
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={onClose} // Changed to onMouseDown
    >
      <div 
        className="bg-white rounded-lg p-6 w-96"
        onMouseDown={(e) => e.stopPropagation()} // Changed to onMouseDown
      >
        <h2 className="text-xl font-bold mb-4 text-black">Add New Wallet</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Wallet Name"
              className="w-full p-2 border rounded"
              value={walletData.name}
              onChange={handleChange}
            />
            <select
              name="type"
              className="w-full p-2 border rounded"
              value={walletData.type}
              onChange={handleChange}
            >
              <option value="">Select Wallet Type</option>
              <option value="GCash">GCash</option>
              <option value="Crypto">Crypto</option>
              <option value="On-hand">On-hand</option>
              <option value="Bank">Bank</option>
            </select>
            <select
              name="memberInCharge"
              className="w-full p-2 border rounded"
              value={walletData.memberInCharge}
              onChange={handleChange}
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
            <input
              type="number"
              name="balance"
              placeholder="Initial Balance"
              className="w-full p-2 border rounded"
              value={walletData.balance}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddInvestmentModal = ({ onClose, onSave, members }) => {
  const [investmentData, setInvestmentData] = useState({
    name: '',
    memberInCharge: '',
    value: 0,
    pnl: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestmentData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'pnl' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: generateId(),
      ...investmentData
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-96"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-black">Add New Investment</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Investment Name"
              className="w-full p-2 border rounded"
              value={investmentData.name}
              onChange={handleChange}
            />
            <select
              name="memberInCharge"
              className="w-full p-2 border rounded"
              value={investmentData.memberInCharge}
              onChange={handleChange}
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
            <input
              type="number"
              name="value"
              placeholder="Initial Value"
              className="w-full p-2 border rounded"
              value={investmentData.value}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="pnl"
              placeholder="Initial P&L"
              className="w-full p-2 border rounded"
              value={investmentData.pnl}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddTransactionModal = ({ 
  onClose, 
  onSave, 
  wallets, 
  investments, 
  members,
  editingTransaction,
  onUpdateWallet,
  onUpdateInvestment
}) => {
  const [transactionData, setTransactionData] = useState({
    wallet: '',
    investment: '',
    article: '', // New field
    amount: 0,
    type: 'inbound',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    payee: ''
  });

  const [useCustomDate, setUseCustomDate] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      // For existing transactions, we'll keep the original member
      setTransactionData({
        wallet: editingTransaction.wallet,
        investment: editingTransaction.investment || '',
        article: editingTransaction.article || '', // New field
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category: editingTransaction.category,
        date: editingTransaction.date,
        payee: editingTransaction.payee || ''
      });
      setUseCustomDate(true);
    }
  }, [editingTransaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
    
    // Clear validation error when user makes changes
    if (name === 'amount' || name === 'type' || name === 'wallet') {
      setValidationError('');
    }
  };

  const validateTransaction = () => {
    if (!transactionData.wallet || !transactionData.amount) {
      return 'Please fill in all required fields';
    }

    const wallet = wallets.find(w => w.name === transactionData.wallet);
    if (!wallet) {
      return 'Selected wallet not found';
    }

    const amount = transactionData.type === 'inbound' 
      ? transactionData.amount 
      : -transactionData.amount;

    const newWalletBalance = wallet.balance + amount;
    if (newWalletBalance < 0) {
      return 'This transaction would result in a negative wallet balance';
    }

    if (transactionData.investment) {
      const investment = investments.find(i => i.name === transactionData.investment);
      if (investment) {
        const investmentChange = transactionData.type === 'inbound'
          ? transactionData.amount
          : -transactionData.amount;

        const newInvestmentValue = investment.value + investmentChange;
        if (newInvestmentValue < 0) {
          return 'This transaction would result in a negative investment value';
        }
      }
    }

    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const error = validateTransaction();
    if (error) {
      setValidationError(error);
      return;
    }

    const wallet = wallets.find(w => w.name === transactionData.wallet);
    const amount = transactionData.type === 'inbound' 
      ? transactionData.amount 
      : -transactionData.amount;

    // Get member from wallet
    const member = wallet.memberInCharge;

    // Update investment if specified
    if (transactionData.investment) {
      const investment = investments.find(i => i.name === transactionData.investment);
      if (investment) {
        const investmentChange = transactionData.type === 'inbound'
          ? transactionData.amount
          : -transactionData.amount;

        onUpdateInvestment({
          ...investment,
          value: investment.value + investmentChange
        });
      }
    }

    // Update the wallet balance
    onUpdateWallet({
      ...wallet,
      balance: wallet.balance + amount
    });

    // Save the transaction with member from wallet
    onSave({
      id: editingTransaction?.id || generateId(),
      ...transactionData,
      member: member, // Automatically set from wallet
      investment: transactionData.investment || null,
      payee: transactionData.payee || null
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-black">
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <select
              name="wallet"
              className="w-full p-2 border rounded"
              value={transactionData.wallet}
              onChange={handleChange}
              required
            >
              <option value="">Select Wallet</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.name}>
                  {wallet.name} ({wallet.memberInCharge})
                </option>
              ))}
            </select>
            <select
              name="investment"
              className="w-full p-2 border rounded"
              value={transactionData.investment}
              onChange={handleChange}
            >
              <option value="">Select Investment (Optional)</option>
              {investments.map(investment => (
                <option key={investment.id} value={investment.name}>
                  {investment.name} ({investment.memberInCharge})
                </option>
              ))}
            </select>
            <input
              type="text"
              name="article"
              placeholder="Article/Item Name"
              className="w-full p-2 border rounded"
              value={transactionData.article}
              onChange={handleChange}
            />
            <div>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                className={`w-full p-2 border rounded ${
                  validationError.includes('negative') ? 'border-red-500' : ''
                }`}
                value={transactionData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="any"
              />
              {validationError && (
                <p className="text-red-500 text-sm mt-1">{validationError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-black font-medium">Transaction Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="inbound"
                    className="mr-2"
                    checked={transactionData.type === 'inbound'}
                    onChange={handleChange}
                  />
                  Inbound
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="outbound"
                    className="mr-2"
                    checked={transactionData.type === 'outbound'}
                    onChange={handleChange}
                  />
                  Outbound
                </label>
              </div>
            </div>
            <select
              name="category"
              className="w-full p-2 border rounded"
              value={transactionData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Capital In">Capital In</option>
              <option value="Repayment">Repayment</option>
              <option value="Trade">Trade</option>
              <option value="Payment">Payment</option>
              <option value="Loan">Loan</option>
              <option value="Materials">Materials</option>
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customDate"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
              />
              <label htmlFor="customDate" className="text-sm text-black">Custom Date?</label>
            </div>
            {useCustomDate && (
              <input
                type="date"
                name="date"
                className="w-full p-2 border rounded"
                value={transactionData.date}
                onChange={handleChange}
              />
            )}
            <input
              type="text"
              name="payee"
              placeholder="Payee (for Loans/Repayments)"
              className="w-full p-2 border rounded"
              value={transactionData.payee}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CompletePaymentModal = ({ payment, onClose, onComplete, wallets, onUpdateWallet }) => {
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().slice(0, 16));
  
  // Find the wallet
    const wallet = wallets.find(w => w.name === payment.wallet);
    if (!wallet) {
        alert('Wallet not found');
        return;
    }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create the transaction as an inbound repayment
    const transaction = {
      id: generateId(),
      wallet: payment.wallet,
      investment: null,
      amount: payment.amount,
      type: 'inbound', // Changed to inbound
      category: 'Repayment', // Changed to Repayment
      date: completionDate.split('T')[0],
      member: payment.lender,
      payee: payment.payee,
      article: `Loan repayment from ${payment.payee}` // Added article description
    };

    // Update wallet balance
    const updatedWallet = {
      ...wallet,
      balance: wallet.balance + payment.amount // Add repayment amount to balance
    };

    // Call the update handler
    onUpdateWallet(updatedWallet);
    
    onComplete(transaction);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-96"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-black">Complete Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payee: {payment?.payee}</p>
              <p className="text-sm text-gray-600 mb-1">Amount: ₱{payment?.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mb-1">Type: <span className="text-green-500">Inbound Repayment</span></p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date & Time</label>
              <input
                type="datetime-local"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Confirm Repayment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add this to your Modals.jsx
export const EditWalletModal = ({ wallet, onClose, onSave, members }) => {
  const [walletData, setWalletData] = useState(wallet);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWalletData(prev => ({
      ...prev,
      [name]: name === 'balance' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(walletData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onMouseDown={onClose}>
      <div className="bg-white rounded-lg p-6 w-96" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-black">Edit Wallet</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Wallet Name"
              className="w-full p-2 border rounded"
              value={walletData.name}
              onChange={handleChange}
            />
            <select
              name="type"
              className="w-full p-2 border rounded"
              value={walletData.type}
              onChange={handleChange}
            >
              <option value="GCash">GCash</option>
              <option value="Crypto">Crypto</option>
              <option value="On-hand">On-hand</option>
              <option value="Bank">Bank</option>
            </select>
            <input
              type="number"
              name="balance"
              placeholder="Balance"
              className="w-full p-2 border rounded"
              value={walletData.balance}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onMouseDown={onCancel}>
      <div className="bg-white rounded-lg p-6 w-96" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-black">{title}</h2>
        <p className="text-black mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-black hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditInvestmentModal = ({ investment, onClose, onSave, members }) => {
  const [investmentData, setInvestmentData] = useState(investment);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestmentData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'pnl' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(investmentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onMouseDown={onClose}>
      <div className="bg-white rounded-lg p-6 w-96" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-black">Edit Investment</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Investment Name"
              className="w-full p-2 border rounded"
              value={investmentData.name}
              onChange={handleChange}
            />
            <select
              name="memberInCharge"
              className="w-full p-2 border rounded"
              value={investmentData.memberInCharge}
              onChange={handleChange}
            >
              {members.map(member => (
                <option key={member.id} value={member.name}>{member.name}</option>
              ))}
            </select>
            <input
              type="number"
              name="value"
              placeholder="Value"
              className="w-full p-2 border rounded"
              value={investmentData.value}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="pnl"
              placeholder="P&L"
              className="w-full p-2 border rounded"
              value={investmentData.pnl}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};