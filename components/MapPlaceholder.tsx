import React from 'react';
import { Technician } from '../types';
import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
  technicians?: Technician[];
  selectedTechId?: string;
  onSelectTech?: (id: string) => void;
  showUser?: boolean;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ 
  technicians = [], 
  selectedTechId, 
  onSelectTech,
  showUser = true 
}) => {
  return (
    <div className="relative w-full h-full bg-gray-200 overflow-hidden rounded-xl border border-gray-300">
      {/* Fake Map Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}>
      </div>
      
      {/* Abstract Roads */}
      <div className="absolute top-0 left-1/3 w-4 h-full bg-white opacity-40 rotate-12"></div>
      <div className="absolute top-1/2 left-0 w-full h-4 bg-white opacity-40 -rotate-6"></div>

      {/* User Location */}
      {showUser && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div className="w-16 h-16 bg-blue-500 rounded-full opacity-10 absolute -top-6 -left-6 animate-ping"></div>
        </div>
      )}

      {/* Technicians */}
      {technicians.map((tech) => (
        <div 
          key={tech.id}
          className={`absolute cursor-pointer transition-all duration-300 flex flex-col items-center group z-10`}
          style={{ 
            top: `${50 + (tech.lat - 16.5062) * 1000}%`, 
            left: `${50 + (tech.lng - 80.6480) * 1000}%` 
          }}
          onClick={() => onSelectTech && onSelectTech(tech.id)}
        >
          <div className={`p-2 rounded-full shadow-lg transition-transform hover:scale-110 ${selectedTechId === tech.id ? 'bg-black text-white scale-125' : 'bg-white text-gray-700'}`}>
            <MapPin size={20} fill={selectedTechId === tech.id ? "currentColor" : "none"} />
          </div>
          <span className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-md bg-white/90 shadow-sm ${selectedTechId === tech.id ? 'text-black' : 'text-gray-600'}`}>
            ₹{tech.priceEstimate}
          </span>
        </div>
      ))}

      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 text-[10px] text-gray-500 rounded">
        Mock Map View (Vijayawada)
      </div>
    </div>
  );
};