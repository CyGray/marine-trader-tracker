'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Plus, Search, Filter, Edit, Trash2, TrendingUp, Wallet, Building2, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  AddInvestmentModal, 
  AddTransactionModal, 
  AddWalletModal, 
  CompletePaymentModal, 
  EditWalletModal, 
  EditInvestmentModal, 
  ConfirmationModal 
} from '../lib/Modals';
import {
  initialWallets,
  initialInvestments,
  initialTransactions,
  initialPendingPayments,
  walletTypeColors,
  transactionTypes,
  generateId
} from '../data/constants'

import { formatDate, getTypeIcon } from "../util/Helpers";
import { memberColors, members } from "../util/Constants";

// Custom hook for localStorage persistence
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [storedValue, key]);

  return [storedValue, setValue];
};

const MarineTraderTracker = () => {

  // State with localStorage persistence
  const [wallets, setWallets] = useLocalStorage('wallets', initialWallets);
  const [investments, setInvestments] = useLocalStorage('investments', initialInvestments);
  const [transactions, setTransactions] = useLocalStorage('transactions', initialTransactions);
  const [pendingPayments, setPendingPayments] = useLocalStorage('pendingPayments', initialPendingPayments);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage('lastSyncTime', null);
  const [isSyncing, setIsSyncing] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMembers, setSelectedMembers] = useState(['Kyle Yuan Uy']);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showCompletePaymentModal, setShowCompletePaymentModal] = useState(false);
  const [showEditWalletModal, setShowEditWalletModal] = useState(false);
  const [showDeleteWalletModal, setShowDeleteWalletModal] = useState(false);
  const [showEditInvestmentModal, setShowEditInvestmentModal] = useState(false);
  const [showDeleteInvestmentModal, setShowDeleteInvestmentModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  
  // Editing states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingWallet, setEditingWallet] = useState(null);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [completingPayment, setCompletingPayment] = useState(null);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [paymentCompletionDate, setPaymentCompletionDate] = useState(new Date().toISOString().slice(0, 16));

  // Form states
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: '',
    memberInCharge: '',
    balance: 0
  });

  const [newInvestment, setNewInvestment] = useState({
    name: '',
    memberInCharge: '',
    value: 0,
    pnl: 0
  });

  const [newTransaction, setNewTransaction] = useState({
    wallet: '',
    investment: '',
    amount: 0,
    article: '',
    type: 'inbound', // Default to inbound
    category: '',
    date: new Date().toISOString().slice(0, 10),
    member: '',
    payee: '',
    // Add these for transfers
    targetWallet: '',
    transferFee: 0
  });

  // Mock PnL over time data
  const pnlData = useMemo(() => [
    { date: 'Jan', pnl: 5000 },
    { date: 'Feb', pnl: 12000 },
    { date: 'Mar', pnl: 8000 },
    { date: 'Apr', pnl: 18000 },
    { date: 'May', pnl: 22000 },
    { date: 'Jun', pnl: 40500 }
  ], []);

// Data synchronization
  const syncWithSheets = useCallback(async (action = 'sync', data = null) => {
  if (action && typeof action === 'object') {
    console.error('Received event object instead of action:', action);
    action = 'sync'; // Reset to default
    data = null;
  }
  
    try {
    setIsSyncing(true);
    
    console.log('--- Starting sync ---');
    console.log('Action:', action);
    console.log('Initial transactions data:', transactions);

    // Prepare the payload based on action
    let payload;
    if (action === 'sync') {
      const filteredTransactions = transactions
        .filter(t => {
          const hasId = !!t?.id;
          if (!hasId) {
            console.warn('Transaction missing ID:', t);
          }
          return hasId;
        })
        .map(t => ({
          id: t.id,
          date: t.date || new Date().toISOString().slice(0, 10),
          wallet: t.wallet || '',
          article: t.article || '',
          amount: t.amount || 0,
          type: t.type || 'inbound',
          category: t.category || '',
          member: t.member || '',
          payee: t.payee || '',
          lastmodified: t.lastmodified || new Date().toISOString()
        }));

      console.log('Filtered transactions for sync:', filteredTransactions);
      
      payload = {
        action,
        transactions: filteredTransactions
      };
    } else {
      console.log('Data for non-sync action:', data);
      
      if (!data?.id) {
        console.error('Missing ID in data:', data);
        throw new Error(`Invalid data for ${action} action - missing ID`);
      }
      
      payload = {
        action,
        transaction: {
          id: data.id,
          date: data.date || new Date().toISOString().slice(0, 10),
          wallet: data.wallet || '',
          article: data.article || '',
          amount: data.amount || 0,
          type: data.type || 'inbound',
          category: data.category || '',
          member: data.member || '',
          payee: data.payee || '',
          lastmodified: data.lastmodified || new Date().toISOString()
        }
      };
    }

    console.log('Prepared payload:', payload);

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error response:', errorData);
      throw new Error(errorData.error || `Sync failed with status ${response.status}`);
    }
    
    if (action === 'sync') {
      const mergedTransactions = await response.json();
      console.log('Received merged transactions:', mergedTransactions);
      setTransactions(mergedTransactions);
    }
    
    setLastSyncTime(new Date().toISOString());
    console.log('Sync completed successfully');
    return true;
  } catch (error) {
    console.error('Sync error:', {
      message: error.message,
      stack: error.stack,
      action,
      data,
      transactionsAtError: transactions
    });
    alert(`Sync failed: ${error.message}`);
    return false;
  } finally {
    setIsSyncing(false);
  }
}, [transactions, setTransactions]);

  useEffect(() => {
  // Initial sync
  syncWithSheets('sync');
  // Sync every 30 minutes
  const interval = setInterval(() => syncWithSheets('sync'), 30 * 60 * 1000);
  return () => clearInterval(interval);
}, []); // Empty dependency array means this runs only once on mount

  // Data filtering
  const filteredData = useMemo(() => {
    if (selectedMembers.length === members.length) {
      return { wallets, investments, transactions, pendingPayments };
    }
    
    return {
      wallets: wallets.filter(w => selectedMembers.includes(w.memberInCharge)),
      investments: investments.filter(i => selectedMembers.includes(i.memberInCharge)),
      transactions: transactions.filter(t => selectedMembers.includes(t.member)),
      pendingPayments: pendingPayments.filter(p => selectedMembers.includes(p.lender))
    };
  }, [wallets, investments, transactions, pendingPayments, selectedMembers, members.length]);

  // Totals calculation
  const totalBalance = useMemo(() => (
    filteredData.wallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  ), [filteredData.wallets]);

  const totalPnL = useMemo(() => (
    filteredData.investments.reduce((sum, investment) => sum + investment.pnl, 0)
  ), [filteredData.investments]);


  // Member toggle handler
  const handleMemberToggle = useCallback((memberName) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberName)) {
        const newSelected = prev.filter(m => m !== memberName);
        return newSelected.length === 0 ? members.map(m => m.name) : newSelected;
      } else {
        return [...prev, memberName];
      }
    });
  }, [members]);

  // CRUD operations
  const addWallet = useCallback(() => {
    const wallet = {
      id: generateId(),
      ...newWallet,
      balance: Number(newWallet.balance)
    };
    setWallets(prev => [...prev, wallet]);
    setNewWallet({
      name: '',
      type: '',
      memberInCharge: '',
      balance: 0
    });
    setShowAddWalletModal(false);
  }, [newWallet, setWallets]);

  const addInvestment = useCallback(() => {
    const investment = {
      id: generateId(),
      ...newInvestment,
      value: Number(newInvestment.value),
      pnl: Number(newInvestment.pnl)
    };
    setInvestments(prev => [...prev, investment]);
    setNewInvestment({
      name: '',
      memberInCharge: '',
      value: 0,
      pnl: 0
    });
    setShowAddInvestmentModal(false);
  }, [newInvestment, setInvestments]);

 const addNewTransaction = useCallback(async (transaction) => {
  let transactionsToAdd = [];
  
  if (transaction.type === 'transfer') {
    // Create two transactions for transfer:
    // 1. Outbound from source wallet
    // 2. Inbound to target wallet
    
    const outboundTx = {
      ...transaction,
      id: generateId(),
      type: 'outbound',
      category: 'Transfer Out',
      amount: Number(transaction.amount),
      lastmodified: new Date().toISOString()
    };
    
    const inboundTx = {
      ...transaction,
      id: generateId(),
      type: 'inbound',
      category: 'Transfer In',
      wallet: transaction.targetWallet,
      amount: Number(transaction.amount) - Number(transaction.transferFee || 0),
      lastmodified: new Date().toISOString()
    };
    
    transactionsToAdd = [outboundTx, inboundTx];
    
    // Update wallet balances immediately
    setWallets(prev => prev.map(wallet => {
      if (wallet.name === transaction.wallet) {
        return { ...wallet, balance: wallet.balance - transaction.amount };
      }
      if (wallet.name === transaction.targetWallet) {
        return { ...wallet, balance: wallet.balance + (transaction.amount - (transaction.transferFee || 0)) };
      }
      return wallet;
    }));
  } else {
    transactionsToAdd = [{
      ...transaction,
      id: generateId(),
      amount: Number(transaction.amount),
      lastmodified: new Date().toISOString()
    }];
    
    // Update wallet balance for non-transfer transactions
    if (transaction.type === 'inbound') {
      setWallets(prev => prev.map(wallet => 
        wallet.name === transaction.wallet 
          ? { ...wallet, balance: wallet.balance + Number(transaction.amount) }
          : wallet
      ));
    } else {
      setWallets(prev => prev.map(wallet => 
        wallet.name === transaction.wallet 
          ? { ...wallet, balance: wallet.balance - Number(transaction.amount) }
          : wallet
      ));
    }
  }

  // Add the transaction(s) to state
  setTransactions(prev => [...prev, ...transactionsToAdd]);
  
  try {
    // Sync all new transactions
    const results = await Promise.all(
      transactionsToAdd.map(tx => syncWithSheets('create', tx))
    );
    
    if (results.some(success => !success)) {
      // Rollback if any sync fails
      setTransactions(prev => prev.filter(t => !transactionsToAdd.some(nt => nt.id === t.id)));
      alert('Failed to sync some transactions with Google Sheets');
    }
  } catch (error) {
    console.error('Transaction creation failed:', error);
    setTransactions(prev => prev.filter(t => !transactionsToAdd.some(nt => nt.id === t.id)));
    alert('Failed to create transaction. Please try again.');
  }
}, [setTransactions, syncWithSheets, setWallets]);

const deleteTransaction = useCallback(async (transactionId) => {
  if (!transactionId) {
    console.error('No transaction ID provided for deletion');
    alert('No transaction ID provided for deletion');
    return;
  }

  const originalTransactions = [...transactions];
  setTransactions(prev => prev.filter(t => t.id !== transactionId));
  
  try {
    // Now using the same payload structure as other actions
    await syncWithSheets('delete', { 
      id: transactionId,
      // Include minimal required fields (date is required for merge logic)
      date: new Date().toISOString().slice(0, 10),
      wallet: '',
      amount: 0,
      type: 'inbound',
      category: '',
      member: '',
      payee: ''
    });
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    setTransactions(originalTransactions);
    alert(`Failed to delete transaction: ${error.message}`);
  }
}, [transactions, setTransactions, syncWithSheets]);

  const handleUpdateWallet = useCallback((updatedWallet) => {
    setWallets(prev => prev.map(w => 
      w.id === updatedWallet.id ? updatedWallet : w
    ));
  }, [setWallets]);

  const handleDeleteWallet = useCallback((id) => {
    setWallets(prev => prev.filter(wallet => wallet.id !== id));
  }, [setWallets]);

  const handleUpdateInvestment = useCallback((updatedInvestment) => {
    setInvestments(prev => prev.map(i => 
      i.id === updatedInvestment.id ? updatedInvestment : i
    ));
  }, [setInvestments]);

  const handleDeleteInvestment = useCallback((id) => {
    setInvestments(prev => prev.filter(investment => investment.id !== id));
  }, [setInvestments]);

  const handlePaymentComplete = useCallback((payment) => {
    setCompletingPayment(payment);
    setPaymentCompletionDate(new Date().toISOString().slice(0, 16));
    setShowCompletePaymentModal(true);
  }, []);

  const completePayment = useCallback(() => {
    const updatedPayments = pendingPayments.map(p => 
      p.id === completingPayment.id ? { ...p, status: 'completed' } : p
    );
    setPendingPayments(updatedPayments);
    
    const newTransaction = {
      id: generateId(),
      wallet: completingPayment.wallet,
      investment: null,
      amount: completingPayment.amount,
      type: 'outbound',
      category: 'Payment',
      date: paymentCompletionDate.split('T')[0],
      member: completingPayment.lender,
      payee: completingPayment.payee
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    setShowCompletePaymentModal(false);
  }, [completingPayment, pendingPayments, paymentCompletionDate, setPendingPayments, setTransactions]);

  const handlePaymentDelete = useCallback((paymentId) => {
    setPendingPayments(prev => prev.filter(payment => payment.id !== paymentId));
  }, [setPendingPayments]);

  const confirmDelete = useCallback((transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (transactionToDelete && transactionToDelete.id) {
      try {
        await deleteTransaction(transactionToDelete.id); 
      } catch (error) {
        console.error('Deletion failed:', error);
      }
    }
    setShowDeleteConfirmation(false);
    setTransactionToDelete(null);
  }, [transactionToDelete, deleteTransaction]);


  const renderOverview = useCallback(() => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg text-black font-semibold mb-2">Total Balance</h3>
        <p className="text-3xl font-bold text-green-600">₱{totalBalance.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg text-black font-semibold mb-2">Total P&L</h3>
        <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ₱{totalPnL.toLocaleString()}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg text-black font-semibold mb-2">Pending Payments</h3>
        <p className="text-3xl font-bold text-yellow-600">{filteredData.pendingPayments.filter(p => p.status === 'pending').length}</p>
      </div>
    </div>
    
    {/* Pending Payments Table */}
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg text-black font-semibold">Pending Payments</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Payee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Lender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.pendingPayments
              .filter(payment => payment.status === 'pending')
              .map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.payee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.lender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">₱{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.wallet}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handlePaymentComplete(payment)}
                        className="text-green-600 hover:text-green-800"
                        title="Mark as completed"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit payment"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handlePaymentDelete(payment.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete payment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* P&L Chart */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg text-black font-semibold mb-4">P&L Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={pnlData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'P&L']} />
          <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
), [filteredData.pendingPayments, totalBalance, totalPnL, pnlData, handlePaymentComplete, handlePaymentDelete]);


  const renderWallets = useCallback(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {filteredData.wallets.map(wallet => {
      const memberColor = memberColors[wallet.memberInCharge] || 'bg-gray-500';
      return (
        <div 
          key={wallet.id} 
          className="bg-white rounded-lg shadow p-6 relative group hover:shadow-lg transition-shadow"
        >
          {/* Edit/Delete buttons - visible on hover (desktop) and always on mobile */}
          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from reaching parent
                setEditingWallet(wallet);
                setShowEditWalletModal(true);
              }}
              className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Edit wallet"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from reaching parent
                setWalletToDelete(wallet);
                setShowDeleteWalletModal(true);
              }}
              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              title="Delete wallet"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          {/* Wallet content */}
          <div className={`w-12 h-12 rounded-lg ${memberColor} flex items-center justify-center mb-4`}>
            <Wallet className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-lg text-black mb-2">{wallet.name}</h3>
          <p className="text-2xl font-bold mb-2">₱{wallet.balance.toLocaleString()}</p>
          <p className="text-sm text-black mb-1">{wallet.memberInCharge}</p>
          <p className="text-xs text-black">{wallet.type}</p>
        </div>
      );
    })}
    {/* Add Wallet button */}
    <div 
      onClick={() => setShowAddWalletModal(true)}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
    >
      <Plus className="text-black mb-2" size={32} />
      <p className="text-black">Add Wallet</p>
    </div>
  </div>
), [filteredData.wallets]);

  const renderInvestments = useCallback(() => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredData.investments.map(investment => {
        const memberColor = memberColors[investment.memberInCharge] || 'bg-gray-500';
        return (
          <div 
            key={investment.id} 
            className="bg-white rounded-lg shadow p-6 relative group hover:shadow-lg transition-shadow"
          >
            {/* Edit/Delete buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button 
                onClick={() => {
                  setEditingInvestment(investment);
                  setShowEditInvestmentModal(true);
                }}
                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                title="Edit investment"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => {
                  setInvestmentToDelete(investment);
                  setShowDeleteInvestmentModal(true);
                }}
                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                title="Delete investment"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className={`w-12 h-12 rounded-lg ${memberColor} flex items-center justify-center mb-4`}>
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-lg text-black mb-2">{investment.name}</h3>
            <p className="text-2xl font-bold mb-2">₱{investment.value.toLocaleString()}</p>
            <p className={`text-lg text-black font-semibold mb-2 ${investment.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {investment.pnl >= 0 ? '+' : ''}₱{investment.pnl.toLocaleString()}
            </p>
            <p className="text-sm text-black">{investment.memberInCharge}</p>
          </div>
        );
      })}
      <div 
        onClick={() => setShowAddInvestmentModal(true)}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <Plus className="text-black mb-2" size={32} />
        <p className="text-black">Add Investment</p>
      </div>
    </div>
    
    {/* Add the modals to your return statement */}
    {showEditWalletModal && (
      <EditWalletModal
        wallet={editingWallet}
        onClose={() => setShowEditWalletModal(false)}
        onSave={handleUpdateWallet}
        members={members}
      />
    )}
    
    {showDeleteWalletModal && (
      <ConfirmationModal
        title="Delete Wallet"
        message={`Are you sure you want to delete ${walletToDelete?.name}?`}
        onConfirm={() => {
          handleDeleteWallet(walletToDelete.id);
          setShowDeleteWalletModal(false);
        }}
        onCancel={() => setShowDeleteWalletModal(false)}
      />
    )}
    
    {showEditInvestmentModal && (
      <EditInvestmentModal
        investment={editingInvestment}
        onClose={() => setShowEditInvestmentModal(false)}
        onSave={handleUpdateInvestment}
        members={members}
      />
    )}
    
    {showDeleteInvestmentModal && (
      <ConfirmationModal
        title="Delete Investment"
        message={`Are you sure you want to delete ${investmentToDelete?.name}?`}
        onConfirm={() => {
          handleDeleteInvestment(investmentToDelete.id);
          setShowDeleteInvestmentModal(false);
        }}
        onCancel={() => setShowDeleteInvestmentModal(false)}
      />
    )}
  </div>
), [filteredData.investments]);

  const updateTransaction = useCallback(async (updatedData) => {
  const updatedTransaction = {
    ...updatedData,
    amount: Number(updatedData.amount),
    lastmodified: new Date().toISOString()
  };
  
  // First update the transaction in state
  setTransactions(prev => prev.map(t => 
    t.id === updatedTransaction.id ? updatedTransaction : t
  ));
  
  try {
    const success = await syncWithSheets('update', updatedTransaction);
    if (!success) {
      // If sync fails, revert the transaction in state
      setTransactions(prev => prev.map(t => 
        t.id === updatedTransaction.id ? updatedData : t
      ));
      alert('Failed to sync updates with Google Sheets');
    } else {
      // Only update wallet balances after successful sync
      if (updatedTransaction.type === 'transfer') {
        // For transfers, we need to update both wallets
        setWallets(prev => prev.map(wallet => {
          if (wallet.name === updatedTransaction.wallet) {
            return { ...wallet, balance: wallet.balance - updatedTransaction.amount };
          }
          if (wallet.name === updatedTransaction.targetWallet) {
            return { ...wallet, balance: wallet.balance + (updatedTransaction.amount - (updatedTransaction.transferFee || 0)) };
          }
          return wallet;
        }));
      } else if (updatedTransaction.type === 'inbound') {
        setWallets(prev => prev.map(wallet => 
          wallet.name === updatedTransaction.wallet 
            ? { ...wallet, balance: wallet.balance + updatedTransaction.amount }
            : wallet
        ));
      } else {
        setWallets(prev => prev.map(wallet => 
          wallet.name === updatedTransaction.wallet 
            ? { ...wallet, balance: wallet.balance - updatedTransaction.amount }
            : wallet
        ));
      }
      
      setEditingTransaction(null);
      setShowAddTransactionModal(false);
    }
  } catch (error) {
    console.error('Transaction update failed:', error);
    setTransactions(prev => prev.map(t => 
      t.id === updatedTransaction.id ? updatedData : t
    ));
  }
}, [setTransactions, syncWithSheets, setWallets]);

  const renderHistory = useCallback(() => {
  const filteredTransactions = filteredData.transactions.filter(transaction => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (transaction.wallet && transaction.wallet.toLowerCase().includes(searchTermLower)) ||
      (transaction.investment && transaction.investment.toLowerCase().includes(searchTermLower)) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTermLower)) ||
      (transaction.payee && transaction.payee.toLowerCase().includes(searchTermLower)) ||
      (transaction.article && transaction.article.toLowerCase().includes(searchTermLower))
    );
  });

  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * 20, currentPage * 20);
  const totalPages = Math.ceil(filteredTransactions.length / 20);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg text-black font-semibold">Transaction History</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
            <button 
              onClick={() => setShowAddTransactionModal(true)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Article</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Payee/Lender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {transaction.wallet}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {transaction.article || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <div className="flex items-center justify-center">
                    {getTypeIcon(transaction.type)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {transaction.category === 'Transfer Out' 
                    ? `Transfer to ${transaction.targetWallet || 'Unknown'}`
                    : transaction.category === 'Transfer In'
                      ? `Transfer from ${transactions.find(t => 
                          t.date === transaction.date && 
                          Math.abs(t.amount - transaction.amount) <= (t.transferFee || 0) &&
                          t.category === 'Transfer Out'
                        )?.wallet || 'Unknown'}`
                      : transaction.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {transaction.category === 'Loan' 
                    ? transaction.payee || transaction.member 
                    : transaction.payee || '-'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-black font-medium ${
                  transaction.type === 'inbound' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'inbound' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setShowAddTransactionModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(transaction)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t flex justify-between items-center">
          <p className="text-sm text-black">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, filteredTransactions.length)} of {filteredTransactions.length} results
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}, [filteredData.transactions, searchTerm, currentPage, setSearchTerm, setShowAddTransactionModal, setEditingTransaction, confirmDelete, formatDate, getTypeIcon]);

  const renderContent = useCallback(() => {
  switch (activeTab) {
    case 'overview': return renderOverview();
    case 'wallets': return renderWallets();
    case 'investments': return renderInvestments();
    case 'history': return renderHistory();
    default: return renderOverview();
  }
}, [activeTab, renderOverview, renderWallets, renderInvestments, renderHistory]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[  
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'wallets', label: 'Wallets', icon: Wallet },
            { id: 'investments', label: 'Investments', icon: Building2 },
            { id: 'history', label: 'History', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span className="text-black">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Member Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {members.map(member => {
            const memberColor = memberColors[member.name] || 'bg-gray-500';
            return (
              <button
                key={member.id}
                onClick={() => handleMemberToggle(member.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-colors ${
                  selectedMembers.includes(member.name)
                    ? `${memberColor} text-white border-transparent`
                    : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{member.name}</span>
                <span className="ml-2 text-sm opacity-75">₱{member.totalBalance.toLocaleString()}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Modals */}
      {showAddWalletModal && (
        <AddWalletModal 
          onClose={() => setShowAddWalletModal(false)}
          onSave={addWallet}
          members={members}
        />
      )}

  {showAddInvestmentModal && (
  <AddInvestmentModal
    onClose={() => setShowAddInvestmentModal(false)}
    onSave={(newInvestment) => {
      setInvestments(prev => [...prev, {
        id: generateId(),
        ...newInvestment,
        value: Number(newInvestment.value),
        pnl: Number(newInvestment.pnl)
      }]);
    }}
    members={members}
  />
)}

  {showAddTransactionModal && (
  <AddTransactionModal
    onClose={() => {
      setShowAddTransactionModal(false);
      setEditingTransaction(null);
    }}
    onSave={(transactionData) => {
      if (editingTransaction) {
        updateTransaction(transactionData);
      } else {
        const newTransaction = {
          ...transactionData,
          id: generateId(),
          amount: Number(transactionData.amount),
          lastmodified: new Date().toISOString()
        };
        addNewTransaction(newTransaction);
      }
    }}
    wallets={wallets}
    investments={investments}
    members={members}
    transaction={editingTransaction}
    onUpdateWallet={handleUpdateWallet}
    onUpdateInvestment={handleUpdateInvestment} // Add this line
  />
)}

  {showCompletePaymentModal && (
  <CompletePaymentModal
    payment={completingPayment}
    onClose={() => setShowCompletePaymentModal(false)}
    onComplete={(transaction) => {
      // Update payment status
      const updatedPayments = pendingPayments.map(p => 
        p.id === completingPayment.id ? { ...p, status: 'completed' } : p
      );
      setPendingPayments(updatedPayments);
      
      // Add the transaction
      setTransactions([...transactions, transaction]);
    }}
    wallets={wallets}
    onUpdateWallet={handleUpdateWallet}
  />
)}

{showEditWalletModal && (
  <EditWalletModal
    wallet={editingWallet}
    onClose={() => {
      setShowEditWalletModal(false);
      setEditingWallet(null);
    }}
    onSave={(updatedWallet) => {
      handleUpdateWallet(updatedWallet);
      setShowEditWalletModal(false);
      setEditingWallet(null);
    }}
    members={members}
  />
)}

{showDeleteWalletModal && (
  <ConfirmationModal
    title="Delete Wallet"
    message={`Are you sure you want to delete ${walletToDelete?.name}?`}
    onConfirm={() => {
      handleDeleteWallet(walletToDelete.id);
      setShowDeleteWalletModal(false);
      setWalletToDelete(null);
    }}
    onCancel={() => {
      setShowDeleteWalletModal(false);
      setWalletToDelete(null);
    }}
  />
)}

{showDeleteConfirmation && (
  <ConfirmationModal
    title="Delete Transaction"
    message="Are you sure you want to delete this transaction?"
    onConfirm={handleDeleteConfirmed}
    onCancel={() => setShowDeleteConfirmation(false)}
  />
)}

      <div className="fixed bottom-4 right-4 flex items-center space-x-2">
        <button 
          onClick={() => syncWithSheets()} // Wrap in arrow function
          disabled={isSyncing}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
        {lastSyncTime && (
          <span className="text-sm text-gray-500">
            Last synced: {formatDate(lastSyncTime)}
          </span>
        )}
      </div>
    </div>
  );
};

export default MarineTraderTracker;