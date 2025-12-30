import React from 'react';
import { Booking } from '../types';
import { ChevronLeft, Calendar, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MyBookingsProps {
  bookings: Booking[];
  onBack: () => void;
  onViewBooking: (booking: Booking) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ bookings, onBack, onViewBooking }) => {
  const activeBookings = bookings.filter(b => 
    ['pending', 'confirmed', 'in-progress', 'payment-pending'].includes(b.status)
  );
  
  const pastBookings = bookings.filter(b => 
    ['completed', 'cancelled'].includes(b.status)
  );

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isCompleted = booking.status === 'completed';
    const isCancelled = booking.status === 'cancelled';
    
    return (
      <div 
        onClick={() => onViewBooking(booking)}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer relative overflow-hidden"
      >
        {/* Status Color Strip */}
        <div className={`absolute top-0 left-0 w-1 h-full ${
            isCompleted ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-blue-500'
        }`}></div>
        
        <div className="flex justify-between items-start mb-3 pl-3">
          <div>
            <h3 className="font-bold text-gray-800">{booking.serviceType}</h3>
            <p className="text-xs text-gray-500">{booking.technicianName}</p>
          </div>
          <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-1 ${
            isCompleted ? 'bg-green-100 text-green-700' : 
            isCancelled ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {isCompleted && <CheckCircle size={10} />}
            {isCancelled && <XCircle size={10} />}
            {!isCompleted && !isCancelled && <Clock size={10} />}
            {booking.status.replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pl-3">
          <div className="flex items-center gap-1">
             <Calendar size={12} />
             <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-1">
             <span className="font-bold text-gray-700">₹{booking.totalAmount}</span>
          </div>
        </div>
        
        {!isCompleted && !isCancelled && (
           <div className="pl-3 border-t border-gray-100 pt-2 flex justify-end">
              <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                 Track Service <ChevronRight size={14} />
              </span>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">My Bookings</h1>
      </div>

      <div className="p-4 space-y-6">
        {bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
             <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
               <Calendar size={32} className="text-gray-400" />
             </div>
             <h3 className="text-lg font-bold text-gray-700">No bookings yet</h3>
             <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">Book a service from the home screen to get started.</p>
             <button onClick={onBack} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-lg shadow-blue-200">
                Book Now
             </button>
          </div>
        )}

        {activeBookings.length > 0 && (
          <div className="animate-slide-up">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">In Progress</h2>
            <div className="space-y-3">
              {activeBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {pastBookings.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Past Bookings</h2>
            <div className="space-y-3">
              {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};