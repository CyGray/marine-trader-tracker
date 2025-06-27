'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Plus, Search, Filter, Edit, Trash2, TrendingUp, Building2, History, X, Calendar, Wallet, FileText, Activity, Tag, User, DollarSign, Settings, RefreshCw } from 'lucide-react';
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
  generateId
} from '../data/constants'

import { formatDate, getTypeIcon } from "../util/Helpers";
import { memberColors, members } from "../util/Constants";
import WalletCard from "@/components/WalletCard";

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



  const normalizeMemberName = (name) => {
    if (!name) return '';
    return name.trim().toLowerCase();
  };



const MarineTraderTracker = ({ user }) => {
  // State with localStorage persistence
  const [wallets, setWallets] = useLocalStorage('wallets', initialWallets);
  
  const [transactions, setTransactions] = useLocalStorage('transactions', initialTransactions);
  const [pendingPayments, setPendingPayments] = useLocalStorage('pendingPayments', initialPendingPayments);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage('lastSyncTime', null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pnlData, setPnlData] = useState([]);
  const [lastPnlRefresh, setLastPnlRefresh] = useState(new Date());
  const [isRefreshingPnl, setIsRefreshingPnl] = useState(false);
  

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMembers, setSelectedMembers] = useState(['Kyle Yuan Uy']);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState([
  { key: 'date', direction: 'desc' }
]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedFilterField, setSelectedFilterField] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  
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

  const obfuscateData = (value, isNumeric = false) => {
    if (!user) {
      if (isNumeric && typeof value === 'number') {
        return '•'.repeat(value.toString().length);
      }
      return '••••••';
    }
    return value;
  };



  const calculateInvestmentPnL = (investment, allTransactions) => {
  const investmentTransactions = allTransactions.filter(t => 
    t.investment === investment.name
  );
  
  console.log(`[PnL Calculation] Starting for investment: ${investment.name}`);
  console.log(`Found ${investmentTransactions.length} related transactions:`);
  console.log(investmentTransactions);

  const totalInvested = investmentTransactions
    .filter(t => t.type === 'inbound')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawn = investmentTransactions
    .filter(t => t.type === 'outbound')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pnl = totalInvested - totalWithdrawn;
  
  console.log(`[PnL Calculation] Results for ${investment.name}:`);
  console.log(`- Total invested: ${totalInvested}`);
  console.log(`- Total withdrawn: ${totalWithdrawn}`);
  console.log(`- Calculated PnL: ${pnl}`);
  
  return pnl;
};


    const [investments, setInvestments] = useLocalStorage('investments', 
    initialInvestments.map(investment => ({
      ...investment,
      pnl: calculateInvestmentPnL(
        investment,
        initialTransactions.filter(t => t.investment === investment.name)
      )
    }))
  );

  const handleSort = (key) => {
    setSortConfig(prev => {
      // Remove existing sort for this key if it exists
      const existingSortIndex = prev.findIndex(s => s.key === key);
      
      if (existingSortIndex >= 0) {
        // Toggle direction if it exists
        const newSorts = [...prev];
        newSorts[existingSortIndex] = {
          key,
          direction: newSorts[existingSortIndex].direction === 'asc' ? 'desc' : 'asc'
        };
        return newSorts;
      } else {
        // Add new sort (default to ascending)
        return [...prev, { key, direction: 'asc' }];
      }
    });
    setCurrentPage(1);
  };

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

  const filteredData = useMemo(() => {
    console.log('[Member Filter] Selected members:', selectedMembers);
    
    // Normalize all names for comparison
    const normalizedSelected = selectedMembers.map(name => name.trim().toLowerCase());
    const allMemberNames = members.map(m => m.name.trim().toLowerCase());

    if (normalizedSelected.length === allMemberNames.length) {
      console.log('[Member Filter] All members selected, returning all data');
      return { wallets, investments, transactions, pendingPayments };
    }

    const filtered = {
      wallets: wallets.filter(w => 
        normalizedSelected.includes(w.memberInCharge.trim().toLowerCase())
      ),
      investments: investments.filter(i => 
        normalizedSelected.includes(i.memberInCharge.trim().toLowerCase())
      ),
      transactions: transactions.filter(t => {
        // Get member from transaction or associated wallet
        const transactionMember = t.member || 
          wallets.find(w => w.name === t.wallet)?.memberInCharge;
        
        const isIncluded = transactionMember && 
          normalizedSelected.includes(transactionMember.trim().toLowerCase());
        
        if (!isIncluded) {
          console.log(`[Member Filter] Excluded transaction - Wallet: ${t.wallet}, ` +
            `Member: ${transactionMember || 'undefined'}`);
        }
        return isIncluded;
      }),
      pendingPayments: pendingPayments.filter(p => 
        normalizedSelected.includes(p.lender.trim().toLowerCase())
      )
    };

    console.log('[Member Filter] Filtered counts:', {
      transactions: `${filtered.transactions.length}/${transactions.length}`,
      wallets: `${filtered.wallets.length}/${wallets.length}`
    });

    return filtered;
  }, [wallets, investments, transactions, pendingPayments, selectedMembers, members]);

  // Totals calculation
  const totalBalance = useMemo(() => (
    filteredData.wallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  ), [filteredData.wallets]);

  const totalPnL = useMemo(() => {
    return filteredData.investments.reduce((sum, investment) => sum + investment.pnl, 0) +
          filteredData.wallets.reduce((sum, wallet) => sum + (wallet.balance * 0.01), 0); // Adjust with your actual calculation
  }, [filteredData.investments, filteredData.wallets]);


  // Member toggle handler
  const handleMemberToggle = useCallback((memberName) => {
    const normalizedMemberName = normalizeMemberName(memberName);
    
    setSelectedMembers(prev => {
      const normalizedPrev = prev.map(normalizeMemberName);
      
      if (normalizedPrev.includes(normalizedMemberName)) {
        const newSelected = prev.filter(m => 
          normalizeMemberName(m) !== normalizedMemberName
        );
        return newSelected.length === 0 ? members.map(m => m.name) : newSelected;
      } else {
        return [...prev, memberName]; // Keep original casing for display
      }
    });
  }, [members]);

  // logic
  



  const calculatePnL = useCallback(() => {
  setIsRefreshingPnl(true);
  
  try {
    // Update each investment's PnL
    setInvestments(prev => prev.map(investment => ({
      ...investment,
      pnl: calculateInvestmentPnL(investment, filteredData.transactions)
    })));

    // Calculate total PnL
    const totalPnL = filteredData.investments.reduce((sum, investment) => {
      return sum + calculateInvestmentPnL(investment, filteredData.transactions);
    }, 0);

    // Generate historical PnL data
    const now = new Date();
    const newPnlData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (5 - i));
      
      // Calculate PnL for this month
      const monthlyPnL = filteredData.investments.reduce((sum, investment) => {
        const investmentTx = filteredData.transactions.filter(t => 
          t.investment === investment.name &&
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear()
        );
        
        const monthlyInvested = investmentTx
          .filter(t => t.type === 'inbound')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const monthlyWithdrawn = investmentTx
          .filter(t => t.type === 'outbound')
          .reduce((sum, t) => sum + t.amount, 0);
          
        // This is simplified - you might want to track investment value by month
        return (monthlyWithdrawn - monthlyInvested);
      }, 0);

      return {
        date: date.toLocaleString('default', { month: 'short' }),
        pnl: monthlyPnL
      };
    });

    setPnlData(newPnlData);
    setLastPnlRefresh(new Date());
  } finally {
    setIsRefreshingPnl(false);
  }
}, [filteredData.investments, filteredData.transactions, setInvestments]);

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
    const associatedWallet = wallets.find(w => w.name === transaction.wallet);
    const transactionWithMember = {
      ...transaction,
      member: transaction.member || associatedWallet?.memberInCharge
    };

    console.log('[Transaction] Creating transaction with member:', {
      explicitMember: transaction.member,
      walletMember: associatedWallet?.memberInCharge,
      finalMember: transactionWithMember.member
    });
  
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
    
    // Update wallet balance
    setWallets(prev => prev.map(wallet => {
      if (wallet.name === transaction.wallet) {
        const newBalance = wallet.balance + 
          (transaction.type === 'inbound' ? Number(transaction.amount) : -Number(transaction.amount));
        console.log(`[Wallet] Updating ${wallet.name} balance from ${wallet.balance} to ${newBalance}`);
        return { ...wallet, balance: newBalance };
      }
      return wallet;
    }));

    // Update investment value if specified
    // Update investment value if specified
    if (transaction.investment) {
      console.log(`[Investment] Transaction affects investment: ${transaction.investment}`);
      
      setInvestments(prev => prev.map(investment => {
        if (investment.name === transaction.investment) {
          // CHANGED: No longer need to track value change since PnL is transaction-based
          // Get ALL transactions for this investment (including the new one)
          const allTransactions = [
            ...transactions.filter(t => t.investment === investment.name),
            ...transactionsToAdd.filter(t => t.investment === investment.name)
          ];
          
          // CHANGED: Calculate PnL based only on transactions
          const newPnl = calculateInvestmentPnL(investment, allTransactions);
          
          console.log(`[Investment] New PnL for ${investment.name}: ${newPnl}`);
          
          return {
            ...investment,
            pnl: newPnl
          };
        }
        return investment;
      }));
    }
  }

  // Add the transaction(s) to state
  console.log('[Transaction] Adding transaction to state');
  setTransactions(prev => [...prev, ...transactionsToAdd]);
  
  try {
    console.log('[Sync] Attempting to sync with Google Sheets');
    const results = await Promise.all(
      transactionsToAdd.map(tx => syncWithSheets('create', tx))
    );
    
    if (results.some(success => !success)) {
      console.error('[Sync] Failed to sync some transactions');
      setTransactions(prev => prev.filter(t => !transactionsToAdd.some(nt => nt.id === t.id)));
      alert('Failed to sync some transactions with Google Sheets');
    } else {
      console.log('[Sync] Successfully synced transactions');
    }
  } catch (error) {
    console.error('[Transaction] Creation failed:', error);
    setTransactions(prev => prev.filter(t => !transactionsToAdd.some(nt => nt.id === t.id)));
    alert('Failed to create transaction. Please try again.');
  }
}, [setTransactions, syncWithSheets, setWallets, setInvestments, transactions]);

const deleteTransaction = useCallback(async (transactionId) => {
  if (!transactionId) {
    console.error('No transaction ID provided for deletion');
    alert('No transaction ID provided for deletion');
    return;
  }

  const transactionToDelete = transactions.find(t => t.id === transactionId);
  if (!transactionToDelete) return;

  const originalTransactions = [...transactions];
  setTransactions(prev => prev.filter(t => t.id !== transactionId));
  
  // Revert wallet balance if needed
  if (transactionToDelete.type === 'transfer') {
    setWallets(prev => prev.map(wallet => {
      if (wallet.name === transactionToDelete.wallet) {
        return { ...wallet, balance: wallet.balance + transactionToDelete.amount };
      }
      if (wallet.name === transactionToDelete.targetWallet) {
        const netAmount = transactionToDelete.amount - (transactionToDelete.transferFee || 0);
        return { ...wallet, balance: wallet.balance - netAmount };
      }
      return wallet;
    }));
  } else if (transactionToDelete.type === 'inbound') {
    setWallets(prev => prev.map(wallet => 
      wallet.name === transactionToDelete.wallet 
        ? { ...wallet, balance: wallet.balance - transactionToDelete.amount }
        : wallet
    ));
  } else {
    setWallets(prev => prev.map(wallet => 
      wallet.name === transactionToDelete.wallet 
        ? { ...wallet, balance: wallet.balance + transactionToDelete.amount }
        : wallet
    ));
  }

  // Revert investment PnL if needed
  if (transactionToDelete.investment) {
    calculatePnL();
  }
  
  try {
    await syncWithSheets('delete', { 
      id: transactionId,
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
}, [transactions, setTransactions, syncWithSheets, setWallets, setInvestments, calculatePnL]);

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


  const renderOverview = useCallback(() => {
  // Calculate investment-specific PnL
  const displayBalance = obfuscateData(totalBalance, true);
  const investmentPnL = obfuscateData(filteredData.investments.reduce((sum, investment) => sum + investment.pnl, 0));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative">
          <h3 className="text-lg text-black dark:text-gray-100 font-semibold mb-2">Total Balance</h3>
          <p className="text-3xl font-bold text-green-600">₱{displayBalance}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative">
          <div className="absolute top-3 right-3">
            <button 
              onClick={calculatePnL}
              disabled={isRefreshingPnl}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh P&L"
            >
              <RefreshCw size={18} className={isRefreshingPnl ? 'animate-spin' : ''} />
            </button>
          </div>
          <h3 className="text-lg text-black dark:text-gray-100 font-semibold mb-2">Investment P&L</h3>
          <p className={`text-3xl font-bold ${investmentPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₱{investmentPnL.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {formatDate(lastPnlRefresh, 'HH:mm:ss')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg text-black dark:text-gray-100 font-semibold mb-2">Pending Payments</h3>
          <p className="text-3xl font-bold text-yellow-600">{filteredData.pendingPayments.filter(p => p.status === 'pending').length}</p>
        </div>
      </div>
    
    
    {/* Pending Payments Table */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg text-black dark:text-gray-100 font-semibold">Pending Payments</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">Payee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">Lender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {filteredData.pendingPayments
              .filter(payment => payment.status === 'pending')
              .map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{payment.payee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{payment.lender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100 font-medium">₱{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{payment.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{payment.wallet}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handlePaymentComplete(payment)}
                        className="text-green-600 hover:text-green-800"
                        title="Mark as completed"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg text-black dark:text-gray-100 font-semibold mb-4">P&L Over Time</h3>
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
  );
}, [filteredData.investments, filteredData.pendingPayments, totalBalance, isRefreshingPnl, lastPnlRefresh, calculatePnL]);


  const renderWallets = useCallback(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {filteredData.wallets.map(wallet => (
      <WalletCard
        key={wallet.id}
        wallet={wallet}
        onClick={() => {
          // Optional: Add click handler if needed
        }}
        onEdit={() => {
          setEditingWallet(wallet);
          setShowEditWalletModal(true);
        }}
        onDelete={() => {
          setWalletToDelete(wallet);
          setShowDeleteWalletModal(true);
        }}
      />
    ))}
    {/* Add Wallet button */}
    <div 
      onClick={() => setShowAddWalletModal(true)}
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-700transition-colors h-48"
    >
      <Plus className="text-black dark:text-gray-100 mb-2" size={32} />
      <p className="text-black dark:text-gray-100">Add Wallet</p>
    </div>
  </div>
), [filteredData.wallets]);

  const renderInvestments = useCallback(() => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-black dark:text-gray-100">Investments</h2>
      <button 
        onClick={calculatePnL}
        disabled={isRefreshingPnl}
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:dark:text-gray-300 text-sm"
      >
        <RefreshCw size={14} className={isRefreshingPnl ? 'animate-spin' : ''} />
        <span>Refresh P&L</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredData.investments.map(investment => {
        const memberColor = memberColors[investment.memberInCharge] || 'bg-gray-500';
        return (
          <div 
            key={investment.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group hover:shadow-lg transition-shadow"
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
            <h3 className="font-semibold text-lg text-black dark:text-gray-100 mb-2">{investment.name}</h3>
            <p className="text-2xl text-black dark:text-gray-100 font-bold mb-2">₱{investment.value.toLocaleString()}</p>
            <p className={`text-lg text-black dark:text-gray-100 font-semibold mb-2 ${investment.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {investment.pnl >= 0 ? '+' : ''}₱{investment.pnl.toLocaleString()}
            </p>
            <p className="text-sm text-black dark:text-gray-100">{investment.memberInCharge}</p>
          </div>
        );
      })}
      <div 
        onClick={() => setShowAddInvestmentModal(true)}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-700transition-colors"
      >
        <Plus className="text-black dark:text-gray-100 mb-2" size={32} />
        <p className="text-black dark:text-gray-100">Add Investment</p>
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
), [filteredData.investments, isRefreshingPnl, calculatePnL]);

const updateTransaction = useCallback(async (updatedData) => {
  const updatedTransaction = {
    ...updatedData,
    amount: Number(updatedData.amount),
    lastmodified: new Date().toISOString()
  };

  // Get the original transaction to calculate differences
  const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
  
  // First update the transaction in state
  setTransactions(prev => prev.map(t => 
    t.id === updatedTransaction.id ? updatedTransaction : t
  ));
  
  try {
    const success = await syncWithSheets('update', updatedTransaction);
    if (!success) {
      // If sync fails, revert the transaction in state
      setTransactions(prev => prev.map(t => 
        t.id === updatedTransaction.id ? originalTransaction : t
      ));
      alert('Failed to sync updates with Google Sheets');
    } else {
      // Calculate wallet balance changes
      if (updatedTransaction.type === 'transfer') {
        // For transfers, we need to update both wallets
        setWallets(prev => prev.map(wallet => {
          if (wallet.name === updatedTransaction.wallet) {
            const originalAmount = originalTransaction.amount;
            const newAmount = updatedTransaction.amount;
            return { ...wallet, balance: wallet.balance + (originalAmount - newAmount) };
          }
          if (wallet.name === updatedTransaction.targetWallet) {
            const originalNet = originalTransaction.amount - (originalTransaction.transferFee || 0);
            const newNet = updatedTransaction.amount - (updatedTransaction.transferFee || 0);
            return { ...wallet, balance: wallet.balance + (newNet - originalNet) };
          }
          return wallet;
        }));
      } else {
        // For regular transactions, update wallet balance
        setWallets(prev => prev.map(wallet => {
          if (wallet.name === updatedTransaction.wallet) {
            const originalAmount = originalTransaction.amount;
            const newAmount = updatedTransaction.amount;
            const originalDirection = originalTransaction.type === 'inbound' ? 1 : -1;
            const newDirection = updatedTransaction.type === 'inbound' ? 1 : -1;
            return { 
              ...wallet, 
              balance: wallet.balance + 
                (originalDirection * originalAmount) - 
                (newDirection * newAmount)
            };
          }
          return wallet;
        }));
      }

      // Handle investment updates if changed
      const investmentChanged = 
        updatedTransaction.investment !== originalTransaction.investment ||
        updatedTransaction.amount !== originalTransaction.amount ||
        updatedTransaction.type !== originalTransaction.type;

      if (investmentChanged) {
        setInvestments(prev => prev.map(investment => {
          // Remove original transaction's effect if it was linked to an investment
          if (originalTransaction.investment && investment.name === originalTransaction.investment) {
            const originalChange = originalTransaction.type === 'inbound' 
              ? originalTransaction.amount 
              : -originalTransaction.amount;
            return {
              ...investment,
              value: investment.value - originalChange,
              pnl: calculateInvestmentPnL(
                {
                  ...investment,
                  value: investment.value - originalChange
                },
                transactions.filter(t => t.id !== originalTransaction.id)
              )
            };
          }
          
          // Add new transaction's effect if it's linked to an investment
          if (updatedTransaction.investment && investment.name === updatedTransaction.investment) {
            const newChange = updatedTransaction.type === 'inbound' 
              ? updatedTransaction.amount 
              : -updatedTransaction.amount;
            return {
              ...investment,
              value: investment.value + newChange,
              pnl: calculateInvestmentPnL(
                {
                  ...investment,
                  value: investment.value + newChange
                },
                [...transactions.filter(t => t.id !== originalTransaction.id), updatedTransaction]
              )
            };
          }
          
          return investment;
        }));
      }
      
      setEditingTransaction(null);
      setShowAddTransactionModal(false);
    }
  } catch (error) {
    console.error('Transaction update failed:', error);
    setTransactions(prev => prev.map(t => 
      t.id === updatedTransaction.id ? originalTransaction : t
    ));
  }
}, [transactions, setTransactions, syncWithSheets, setWallets, setInvestments]);

  const renderHistory = useCallback(() => {
  // Filter by selected members is already handled by filteredData
  
  // Apply search term filter
  let filteredTransactions = filteredData.transactions.filter(transaction => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (transaction.wallet && transaction.wallet.toLowerCase().includes(searchTermLower)) ||
      (transaction.investment && transaction.investment.toLowerCase().includes(searchTermLower)) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTermLower)) ||
      (transaction.payee && transaction.payee.toLowerCase().includes(searchTermLower)) ||
      (transaction.article && transaction.article.toLowerCase().includes(searchTermLower)) ||
      (transaction.member && transaction.member.toLowerCase().includes(searchTermLower))
    );
  });

  // Apply active filters
  Object.entries(activeFilters).forEach(([field, filter]) => {
    if (filter && filter.values && filter.values.length > 0) {
      filteredTransactions = filteredTransactions.filter(t => {
        if (field === 'dateRange') {
          const [startDate, endDate] = filter.values[0].split(' to ');
          const transactionDate = new Date(t.date);
          return (
            (!startDate || transactionDate >= new Date(startDate)) &&
            (!endDate || transactionDate <= new Date(endDate))
          );
        }
        return filter.values.includes(t[field]);
      });
    }
  });

  // Apply sorting - now supports multiple sort criteria
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    for (const sort of sortConfig) {
      let comparison = 0;
      
      switch (sort.key) {
        case 'date':
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          comparison = dateA - dateB;
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'wallet':
          comparison = a.wallet.localeCompare(b.wallet);
          break;
        default:
          continue;
      }

      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });

  // Pagination
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * 20,
    currentPage * 20
  );
  const totalPages = Math.ceil(sortedTransactions.length / 20);

  // Get unique values for each filterable field
  const filterOptions = {
    type: Array.from(new Set(filteredData.transactions.map(t => t.type))),
    category: Array.from(new Set(filteredData.transactions.map(t => t.category))),
    wallet: Array.from(new Set(filteredData.transactions.map(t => t.wallet))),
    dateRange: ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This month', 'Last month']
  };

  // Helper to convert to title case
  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h3 className="text-lg text-black dark:text-gray-100 font-semibold">Transaction History</h3>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black dark:text-gray-100 dark:outline-white" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="pl-10 pr-4 py-2 border rounded-lg w-full dark:text-gray-100 dark:outline-gray-100"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            {/* Add Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="p-2 border rounded-lg text-black dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Filter size={16} />
                <span>Add Filter</span>
              </button>
              
              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Filter by
                    </div>
                    {Object.keys(filterOptions).map(field => (
                      <button
                        key={field}
                        onClick={() => {
                          setSelectedFilterField(field);
                          setShowFilterDropdown(false);
                          setShowFilterOptions(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-900"
                      >
                        <div className="flex items-center gap-2">
                          {field === 'type' && <Activity size={14} />}
                          {field === 'category' && <Tag size={14} />}
                          {field === 'wallet' && <Wallet size={14} />}
                          {field === 'dateRange' && <Calendar size={14} />}
                          {toTitleCase(field)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Add Transaction Button */}
            <button 
              onClick={() => setShowAddTransactionModal(true)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {Object.keys(activeFilters).filter(field => activeFilters[field]?.values?.length > 0).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([field, filter]) => {
              if (!filter?.values?.length) return null;
              
              return filter.values.map(value => (
                <div 
                  key={`${field}-${value}`}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
                >
                  <span className="text-sm text-blue-800">
                    {toTitleCase(field)}: {toTitleCase(value)}
                  </span>
                  <button
                    onClick={() => {
                      setActiveFilters(prev => {
                        const newValues = prev[field].values.filter(v => v !== value);
                        if (newValues.length === 0) {
                          const { [field]: _, ...rest } = prev;
                          return rest;
                        }
                        return {
                          ...prev,
                          [field]: {
                            ...prev[field],
                            values: newValues
                          }
                        };
                      });
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ));
            })}
            <button
              onClick={() => setActiveFilters({})}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
            >
              Clear all
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Filter Options Modal */}
      {showFilterOptions && selectedFilterField && (
        <div 
          className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFilterOptions(false);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {toTitleCase(selectedFilterField)}
              </h3>
              <button 
                onClick={() => setShowFilterOptions(false)}
                className="text-gray-500 dark:text-gray-400 hover:dark:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              {selectedFilterField === 'dateRange' ? (
                <div className="space-y-2">
                  {filterOptions.dateRange.map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        type="radio"
                        id={option}
                        checked={activeFilters.dateRange?.values?.includes(option) || false}
                        onChange={() => {
                          setActiveFilters(prev => ({
                            ...prev,
                            dateRange: {
                              values: [option]
                            }
                          }));
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={option}>{option}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filterOptions[selectedFilterField].map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={option}
                        checked={activeFilters[selectedFilterField]?.values?.includes(option) || false}
                        onChange={() => {
                          const currentValues = activeFilters[selectedFilterField]?.values || [];
                          const newValues = currentValues.includes(option)
                            ? currentValues.filter(v => v !== option)
                            : [...currentValues, option];
                          
                          setActiveFilters(prev => ({
                            ...prev,
                            [selectedFilterField]: {
                              values: newValues
                            }
                          }));
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={option}>{toTitleCase(option)}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setActiveFilters(prev => {
                    const { [selectedFilterField]: _, ...rest } = prev;
                    return rest;
                  });
                  setShowFilterOptions(false);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilterOptions(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Header with Sortable Columns */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-900"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" />
                  Date
                  {sortConfig.some(s => s.key === 'date') && (
                    <span className="ml-1 text-blue-500">
                      {sortConfig.find(s => s.key === 'date')?.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-900"
                onClick={() => handleSort('wallet')}
              >
                <div className="flex items-center">
                  <Wallet size={14} className="mr-2" />
                  Wallet
                  {sortConfig.some(s => s.key === 'wallet') && (
                    <span className="ml-1 text-blue-500">
                      {sortConfig.find(s => s.key === 'wallet')?.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">
                <div className="flex items-center">
                  <FileText size={14} className="mr-2" />
                  Article
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">
                <div className="flex items-center">
                  <Activity size={14} className="mr-2" />
                  Type
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">
                <div className="flex items-center">
                  <Tag size={14} className="mr-2" />
                  Category
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">
                <div className="flex items-center">
                  <User size={14} className="mr-2" />
                  Payee/Lender
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-900"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  <DollarSign size={14} className="mr-2" />
                  Amount
                  {sortConfig.some(s => s.key === 'amount') && (
                    <span className="ml-1 text-blue-500">
                      {sortConfig.find(s => s.key === 'amount')?.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider">
                <div className="flex items-center">
                  <Settings size={14} className="mr-2" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    {transaction.wallet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    {transaction.article || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    <div className="flex items-center justify-center">
                      {getTypeIcon(transaction.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    {transaction.category === 'Loan' 
                      ? transaction.payee || transaction.member 
                      : transaction.payee || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100 font-medium ${
                    transaction.type === 'inbound' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'inbound' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setShowAddTransactionModal(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No transactions found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-black dark:text-gray-100">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, sortedTransactions.length)} of {sortedTransactions.length} results
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 mx-1 rounded ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'border hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="mx-1">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}, [
  filteredData.transactions, 
  searchTerm, 
  currentPage, 
  activeFilters,
  sortConfig,
  showFilterDropdown,
  showFilterOptions,
  selectedFilterField,
  setSearchTerm, 
  setShowAddTransactionModal, 
  setEditingTransaction, 
  confirmDelete, 
  formatDate, 
  getTypeIcon,
  transactions,
  handleSort
]);

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
    <div className={user ? "min-h-screen bg-gray-100 dark:bg-gray-900 relative": " bg-gray-100 dark:bg-gray-900 blur-sm pointer-events-none select-none"}>

      {/* Background texture - more subtle, modern pattern */}
    <div className="dark:hidden absolute inset-0 opacity-40 pointer-events-none" 
         style={{
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23192f59\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            zIndex: 0
          }}
    /> {/*
    <div className="hidden dark:block absolute inset-0 opacity-40 pointer-events-none" 
         style={{
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23a0aec0\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            zIndex: 0
          }}
    /> */}
    <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
      {[
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'wallets', label: 'Wallets', icon: Wallet },
        { id: 'investments', label: 'Investments', icon: Building2, disabled: process.env.NEXT_PUBLIC_WORKING_ENV === 'production' },
        { id: 'history', label: 'History', icon: History }
      ].map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled || false;
        
        if (tab.id === "investments") {
          console.error(`Adding ${tab.id} because NODE_ENV = ${process.env.NEXT_PUBLIC_WORKING_ENV}`);
        }
        
        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && setActiveTab(tab.id)}
            disabled={isDisabled}
            className={`flex items-center justify-center md:justify-start space-x-2 px-3 md:px-4 py-2 rounded-full transition-colors flex-1 md:flex-none ${
              isActive
                ? 'bg-blue-500 text-white'
                : isDisabled
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-blue hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label={tab.label}
          >
            <Icon
              size={16}
              className={`${
                isActive
                  ? 'text-white'
                  : isDisabled
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-black dark:text-white'
              }`}
            />
            <span className={`hidden md:inline ${
              isActive ? 'text-white' : 
              isDisabled ? 'text-gray-400 dark:text-gray-500' : 
              'text-black dark:text-white'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>

        {/* Member Filter - Perfectly Fitted Responsive Design */}
<div className="flex mb-6 w-full">
  <div className="flex flex-1 gap-1 px-1 md:gap-2 md:px-0 overflow-x-auto">
    {members.map(member => {
      const memberColor = memberColors[member.name] || 'bg-gray-500';
      const memberName = obfuscateData(member.name, false);
      return (
        <button
          key={member.id}
          onClick={() => handleMemberToggle(member.name)}
          className={`min-w-[20%] transition-colors border
            /* Mobile */
            flex-1 px-0 py-1.5 rounded-md
            /* Desktop */
            md:min-w-0 md:px-4 md:py-2 md:rounded-full
            /* Shared */
            ${
              selectedMembers.includes(member.name)
                ? `${memberColor} text-white border-transparent`
                : 'bg-white dark:bg-gray-800 text-black dark:text-gray-100 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          {/* Mobile Layout */}
          <div className="flex flex-col items-center w-full overflow-hidden md:hidden">
            <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1">
              {memberName}
            </span>
            <span className="text-[10px] opacity-75 mt-px">
              ₱{obfuscateData(member.totalBalance.toLocaleString())}
            </span>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center">
            <span className="font-medium">{memberName}</span>
            <span className="ml-2 text-sm opacity-75">
              ₱{obfuscateData(member.totalBalance.toLocaleString())}
            </span>
          </div>
        </button>
      );
    })}
  </div>
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
        onClick={() => syncWithSheets()}
        disabled={isSyncing}
        className="p-2 rounded-full text-gray-700 dark:text-white hover:bg-gray-200 disabled:opacity-50"
      >
        <RefreshCw
          size={18}
          className={`transition-transform duration-300 ${isSyncing ? 'animate-spin' : ''}`}
        />
      </button>
      {lastSyncTime && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last synced: {formatDate(lastSyncTime)}
        </span>
      )}
    </div>

    </div>
    </div>
  );
};

export default MarineTraderTracker;