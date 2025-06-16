'use client'

import React from 'react';
import { Wallet, Edit, Trash2 } from 'lucide-react';
import { walletTypeColors, memberColors } from '@/data/constants';

const WalletCard = ({ wallet, onClick, onEdit, onDelete }) => {
  const memberColor = memberColors[wallet.memberInCharge] || 'bg-gray-500';
  const walletColor = walletTypeColors[wallet.type] || 'bg-indigo-500';
  const walletIcon = `/wallet-icons/${wallet.type.toLowerCase()}.png`;

  
  return (
    <div 
      className={`relative rounded-lg shadow-lg overflow-hidden ${walletColor} text-white h-48 cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
    >
      {/* Clipping mask effect */}
      <div className={`absolute inset-0 ${walletColor} bg-opacity-10 backdrop-blur-sm`}></div>
      
      {/* Large wallet icon positioned 20% from bottom and left */}
      <div className="absolute left-[10%] bottom-[10%] opacity-10">
        <img 
          src={walletIcon} 
          alt={wallet.name}
          className="w-40 h-auto object-contain"
          onError={(e) => {
            e.target.style.display = 'none'; // Hide if image fails to load
          }}
        />
      </div>
      
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Wallet name and balance */}
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{wallet.name}</h3>
          <p className="text-3xl font-bold">₱{wallet.balance.toLocaleString()}</p>
        </div>
        
        {/* Wallet type and member */}
        <div className="mt-auto">
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-opacity-20 rounded-full mb-2">
            {wallet.type}
          </span>
          <div className="flex items-center">
            <span className="text-sm">{wallet.memberInCharge}</span>
          </div>
        </div>
        
        {/* Edit/Delete buttons */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 bg-opacity-20 rounded-full hover:bg-opacity-30"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 bg-opacity-20 rounded-full hover:bg-opacity-30"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;