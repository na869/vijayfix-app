import React from 'react';
import { X, Home, Clock, Shield, LogOut } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">VijayFix</h2>
            <p className="text-xs text-blue-100">+91 98765 43210</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => onNavigate('HOME')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentPage === 'HOME' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </button>

          <button 
            onClick={() => onNavigate('HISTORY')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentPage === 'HISTORY' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Clock size={20} />
            <span className="font-medium">My Bookings</span>
          </button>

          <div className="my-4 border-t border-gray-100"></div>

          <button 
            onClick={() => onNavigate('ADMIN')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentPage === 'ADMIN' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Shield size={20} />
            <span className="font-medium">Admin Panel</span>
          </button>

          <button 
            onClick={() => onNavigate('AUTH')}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};