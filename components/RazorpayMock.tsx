import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ChevronRight, CreditCard, Smartphone, Globe } from 'lucide-react';

interface RazorpayMockProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const RazorpayMock: React.FC<RazorpayMockProps> = ({ amount, onSuccess, onClose }) => {
  const [step, setStep] = useState<'OPTIONS' | 'PROCESSING' | 'SUCCESS'>('OPTIONS');

  const handlePay = () => {
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0c2243] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-[#0c2243] font-bold text-xl">R</span>
             </div>
             <div>
               <h3 className="font-bold text-sm">VijayFix Repairs</h3>
               <p className="text-xs text-blue-200">Test Mode</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-blue-200">Amount</p>
             <p className="font-bold text-lg">₹{amount}.00</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {step === 'OPTIONS' && (
            <div className="p-4 space-y-4">
               <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                 <ShieldCheck size={14} className="text-green-600" />
                 Trusted by 100M+ Indians
               </div>

               <div className="space-y-3">
                 <div className="bg-white p-4 rounded shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors" onClick={handlePay}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                         <Smartphone size={20} />
                       </div>
                       <div className="flex-1">
                          <p className="font-medium text-gray-800">UPI</p>
                          <p className="text-xs text-gray-400">Google Pay, PhonePe, Paytm</p>
                       </div>
                       <ChevronRight size={16} className="text-gray-400" />
                    </div>
                 </div>

                 <div className="bg-white p-4 rounded shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors" onClick={handlePay}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                         <CreditCard size={20} />
                       </div>
                       <div className="flex-1">
                          <p className="font-medium text-gray-800">Card</p>
                          <p className="text-xs text-gray-400">Visa, Mastercard, RuPay</p>
                       </div>
                       <ChevronRight size={16} className="text-gray-400" />
                    </div>
                 </div>

                 <div className="bg-white p-4 rounded shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors" onClick={handlePay}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                         <Globe size={20} />
                       </div>
                       <div className="flex-1">
                          <p className="font-medium text-gray-800">Netbanking</p>
                          <p className="text-xs text-gray-400">All Indian banks</p>
                       </div>
                       <ChevronRight size={16} className="text-gray-400" />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="flex flex-col items-center justify-center h-64">
               <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
               <p className="font-bold text-gray-800">Processing Payment...</p>
               <p className="text-sm text-gray-500 mt-2">Do not close this window</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center h-64">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
                  <ShieldCheck size={32} />
               </div>
               <p className="font-bold text-xl text-gray-800">Payment Successful</p>
               <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'OPTIONS' && (
          <div className="p-3 bg-gray-100 border-t flex justify-between items-center">
            <button onClick={onClose} className="text-gray-500 text-sm font-medium hover:text-gray-700">Cancel Payment</button>
            <div className="flex items-center gap-1 opacity-50">
               <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};