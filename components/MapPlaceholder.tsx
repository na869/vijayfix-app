import React, { useEffect, useState } from 'react';
import { Technician } from '../types';
import { MapPin, Home, Navigation2 } from 'lucide-react';

interface MapPlaceholderProps {
  technicians?: Technician[];
  selectedTechId?: string;
  onSelectTech?: (id: string) => void;
  showUser?: boolean;
  destination?: { lat: number; lng: number };
  isTracking?: boolean; // New prop to enable animation
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ 
  technicians = [], 
  selectedTechId, 
  onSelectTech,
  showUser = true,
  destination,
  isTracking = false
}) => {
  const [animatedTechs, setAnimatedTechs] = useState<Technician[]>(technicians);

  // Animation Logic
  useEffect(() => {
    if (!isTracking || !selectedTechId || !destination) {
      setAnimatedTechs(technicians);
      return;
    }

    // Find the tech to animate
    const techIndex = technicians.findIndex(t => t.id === selectedTechId);
    if (techIndex === -1) return;

    const startLat = technicians[techIndex].lat;
    const startLng = technicians[techIndex].lng;
    const endLat = destination.lat; // 16.5062
    const endLng = destination.lng; // 80.6480

    let progress = 0;
    const duration = 10000; // 10 seconds to arrive
    const intervalTime = 50;

    const timer = setInterval(() => {
      progress += intervalTime / duration;
      
      if (progress >= 1) {
        progress = 1;
        clearInterval(timer);
      }

      // Linear interpolation (Lerp)
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;

      const updatedTechs = [...technicians];
      updatedTechs[techIndex] = {
        ...updatedTechs[techIndex],
        lat: currentLat,
        lng: currentLng
      };
      
      setAnimatedTechs(updatedTechs);

    }, intervalTime);

    return () => clearInterval(timer);
  }, [isTracking, selectedTechId, destination]); // Re-run if these change, technically should be careful with dependencies to avoid reset loop

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

      {/* User/Current Location */}
      {showUser && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div className="w-32 h-32 bg-blue-500 rounded-full opacity-5 absolute -top-14 -left-14 animate-ping"></div>
        </div>
      )}

      {/* Destination / Customer Home */}
      {destination && (
        <div 
           className="absolute z-20 flex flex-col items-center"
           style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} // Exactly center for this mock
        >
          <div className="p-1.5 bg-red-500 text-white rounded-full shadow-lg">
             <Home size={16} />
          </div>
        </div>
      )}

      {/* Technicians */}
      {animatedTechs.map((tech) => (
        <div 
          key={tech.id}
          className={`absolute cursor-pointer transition-all duration-75 ease-linear flex flex-col items-center group z-30`}
          style={{ 
            // Mock projection: map lat/lng to percentage relative to center
            top: `${50 + (tech.lat - 16.5062) * 1000}%`, 
            left: `${50 + (tech.lng - 80.6480) * 1000}%` 
          }}
          onClick={() => onSelectTech && onSelectTech(tech.id)}
        >
          {isTracking && selectedTechId === tech.id ? (
             <div className="bg-black text-white p-2 rounded-full shadow-xl transform rotate-45 border-2 border-white">
                <Navigation2 size={20} className="transform -rotate-45" />
             </div>
          ) : (
            <>
              <div className={`p-2 rounded-full shadow-lg transition-transform hover:scale-110 ${selectedTechId === tech.id ? 'bg-black text-white scale-125' : 'bg-white text-gray-700'}`}>
                <MapPin size={20} fill={selectedTechId === tech.id ? "currentColor" : "none"} />
              </div>
              <span className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-md bg-white/90 shadow-sm ${selectedTechId === tech.id ? 'text-black' : 'text-gray-600'}`}>
                ₹{tech.priceEstimate}
              </span>
            </>
          )}
        </div>
      ))}

      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 text-[10px] text-gray-500 rounded z-40">
        Google Maps (Mock)
      </div>
    </div>
  );
};