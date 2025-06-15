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
  transaction,
  onUpdateWallet,
  onUpdateInvestment
}) => {
  const [transactionData, setTransactionData] = useState({
    wallet: '',
    investment: '',
    article: '',
    amount: 0,
    type: 'inbound',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    payee: '',
    targetWallet: '',
    transferFee: 0
  });

  const [useCustomDate, setUseCustomDate] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryType, setCustomCategoryType] = useState('inbound');

  // Define category options based on transaction type
  const getCategoryOptions = (type) => {
    const baseOptions = [
      { value: '', label: 'Select Category' },
      { value: 'Custom', label: '+ Add Custom Category' }
    ];

    const inboundOptions = [
      { value: 'Capital In', label: 'Capital In' },
      { value: 'Repayment', label: 'Repayment' },
      { value: 'Sell Crypto', label: 'Sell Crypto' },
      { value: 'Close Trade', label: 'Close Trade' }
    ];

    const outboundOptions = [
      { value: 'Capital Out', label: 'Capital Out' },
      { value: 'Loan', label: 'Loan' },
      { value: 'Materials', label: 'Materials' },
      { value: 'Buy Crypto', label: 'Buy Crypto' },
      { value: 'Open Trade', label: 'Open Trade' }
    ];

    const transferOptions = [
      { value: 'Transfer Out', label: 'Transfer Out' }
    ];

    switch (type) {
      case 'inbound':
        return [...baseOptions, ...inboundOptions];
      case 'outbound':
        return [...baseOptions, ...outboundOptions];
      case 'transfer':
        return [...baseOptions, ...transferOptions];
      default:
        return baseOptions;
    }
  };

  const [categoryOptions, setCategoryOptions] = useState(getCategoryOptions('inbound'));

  useEffect(() => {
    if (transaction) {
      setTransactionData({
        wallet: transaction.wallet,
        investment: transaction.investment || '',
        article: transaction.article || '',
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        payee: transaction.payee || '',
        targetWallet: transaction.targetWallet || '',
        transferFee: transaction.transferFee || 0
      });
      setUseCustomDate(true);
    }
  }, [transaction]);

  useEffect(() => {
    // Update category options when transaction type changes
    setCategoryOptions(getCategoryOptions(transactionData.type));
    
    // Reset category if it's not valid for the new type
    if (transactionData.category && !getCategoryOptions(transactionData.type).some(opt => opt.value === transactionData.category)) {
      setTransactionData(prev => ({ ...prev, category: '' }));
    }
  }, [transactionData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      if (value === 'Custom') {
        setShowCustomCategoryInput(true);
        setTransactionData(prev => ({ ...prev, [name]: '' }));
      } else {
        setShowCustomCategoryInput(false);
        setTransactionData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setTransactionData(prev => ({
        ...prev,
        [name]: name === 'amount' || name === 'transferFee' ? Number(value) : value
      }));
    }
    
    if (name === 'amount' || name === 'type' || name === 'wallet' || name === 'targetWallet') {
      setValidationError('');
    }
  };

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) {
      setValidationError('Please enter a category name');
      return;
    }

    // Add the new category to the appropriate options
    const newCategory = {
      value: customCategory,
      label: customCategory
    };

    const updatedOptions = [
      ...getCategoryOptions(customCategoryType).filter(opt => opt.value !== 'Custom'),
      newCategory,
      { value: 'Custom', label: '+ Add Custom Category' }
    ];

    setCategoryOptions(updatedOptions);
    setTransactionData(prev => ({ ...prev, category: customCategory }));
    setShowCustomCategoryInput(false);
    setCustomCategory('');
    setValidationError('');
  };

  const validateTransaction = () => {
    if (!transactionData.wallet) return 'Please select a source wallet';
    if (transactionData.type === 'transfer' && !transactionData.targetWallet) return 'Please select a target wallet';
    if (transactionData.amount <= 0) return 'Amount must be greater than 0';
    if (transactionData.type === 'transfer' && transactionData.transferFee < 0) return 'Transfer fee cannot be negative';
    if (!transactionData.category) return 'Please select a category';

    const sourceWallet = wallets.find(w => w.name === transactionData.wallet);
    if (!sourceWallet) return 'Selected source wallet not found';

    if (transactionData.type === 'transfer') {
      const targetWallet = wallets.find(w => w.name === transactionData.targetWallet);
      if (!targetWallet) return 'Selected target wallet not found';
      if (sourceWallet.name === targetWallet.name) return 'Source and target wallets cannot be the same';
    }

    if (transactionData.type !== 'inbound' && (sourceWallet.balance - transactionData.amount < 0)) {
      return 'This transaction would result in a negative wallet balance';
    }

    if (transactionData.investment) {
      const investment = investments.find(i => i.name === transactionData.investment);
      if (investment) {
        const change = transactionData.type === 'inbound' ? transactionData.amount : -transactionData.amount;
        if (investment.value + change < 0) return 'This would result in negative investment value';
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

    setIsSubmitting(true);
    onSave(transactionData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        {validationError && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={transactionData.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Source Wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {transactionData.type === 'transfer' ? 'From Wallet' : 'Wallet'}
                </label>
                <select
                  name="wallet"
                  value={transactionData.wallet}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Wallet</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.name}>
                      {wallet.name} (₱{wallet.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Wallet (for transfers) */}
              {transactionData.type === 'transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Wallet</label>
                    <select
                      name="targetWallet"
                      value={transactionData.targetWallet}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Target Wallet</option>
                      {wallets
                        .filter(w => w.name !== transactionData.wallet)
                        .map(wallet => (
                          <option key={wallet.id} value={wallet.name}>
                            {wallet.name} (₱{wallet.balance.toLocaleString()})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Fee</label>
                    <input
                      type="number"
                      name="transferFee"
                      min="0"
                      step="0.01"
                      value={transactionData.transferFee}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">
                      Net Amount: ₱{(transactionData.amount - transactionData.transferFee).toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  value={transactionData.amount}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Investment (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment (optional)</label>
                <select
                  name="investment"
                  value={transactionData.investment}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Select Investment</option>
                  {investments.map(investment => (
                    <option key={investment.id} value={investment.name}>
                      {investment.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category - Hidden for transfers */}
              {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={transactionData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom category input */}
            {showCustomCategoryInput && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter category name"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Type
                  </label>
                  <div className="flex space-x-4">
                    {['inbound', 'outbound'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="customCategoryType"
                          value={type}
                          checked={customCategoryType === type}
                          onChange={() => setCustomCategoryType(type)}
                          className="mr-2"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Add Category
                </button>
              </div>
            )}

              {/* Article */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article/Description</label>
                <input
                  type="text"
                  name="article"
                  value={transactionData.article}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Payee - Hidden for transfers */}
              {transactionData.type !== 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {transactionData.type === 'inbound' ? 'From' : 'To'} (Payee)
                  </label>
                  <input
                    type="text"
                    name="payee"
                    value={transactionData.payee}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Date */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useCustomDate"
                  checked={useCustomDate}
                  onChange={() => setUseCustomDate(!useCustomDate)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="useCustomDate" className="text-sm font-medium text-gray-700">
                  Use custom date
                </label>
              </div>

              {useCustomDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={transactionData.date}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : transaction ? 'Update' : 'Add'} Transaction
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