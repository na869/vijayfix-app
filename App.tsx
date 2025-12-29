import React, { useState, useEffect } from 'react';
import { Page, ServiceType, Technician } from './types';
import { Button } from './components/Button';
import { SERVICES, MOCK_TECHNICIANS } from './constants';
import { MapPlaceholder } from './components/MapPlaceholder';
import { diagnoseIssue } from './services/geminiService';
import { 
  Phone, 
  MapPin, 
  Camera, 
  ChevronLeft, 
  Star, 
  Clock, 
  CheckCircle, 
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Menu,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('AUTH');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [diagnosisImage, setDiagnosisImage] = useState<string | null>(null);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [bookingStep, setBookingStep] = useState(0);

  // Filter techs by service
  const availableTechs = selectedService 
    ? MOCK_TECHNICIANS.filter(t => t.specialties.includes(selectedService))
    : [];

  const handleLogin = () => {
    // Simulate OTP verification
    if (otp.length === 6) {
      setCurrentPage('HOME');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setDiagnosisImage(base64);
        
        // Call Gemini
        setIsDiagnosing(true);
        const diagnosis = await diagnoseIssue(base64.split(',')[1]);
        setDiagnosisText(diagnosis);
        setIsDiagnosing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBooking = () => {
    // Simulate Razorpay and Booking
    setCurrentPage('TRACKING');
  };

  // --- PAGES ---

  const renderAuth = () => (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">VijayFix</h1>
        <p className="text-gray-500">Hyperlocal Expert Repairs</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              +91
            </span>
            <input
              type="tel"
              className="flex-1 min-w-0 block w-full px-3 py-3 rounded-r-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {phoneNumber.length === 10 && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input
              type="text"
              className="block w-full px-3 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center text-lg"
              placeholder="1 2 3 4 5 6"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        <Button 
          fullWidth 
          onClick={handleLogin}
          disabled={otp.length !== 6}
        >
          Verify & Login
        </Button>

        <p className="text-xs text-center text-gray-400 mt-4">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-600" size={20} />
          <div>
            <p className="text-xs text-gray-500">Current Location</p>
            <p className="font-semibold text-sm">Benz Circle, Vijayawada</p>
          </div>
        </div>
        <Menu className="text-gray-600" />
      </header>

      <div className="p-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-blue-200">
          <h2 className="text-2xl font-bold mb-1">Instant Repairs</h2>
          <p className="text-blue-100 text-sm mb-4">Professional techs at your doorstep in 30 mins.</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
            Book Now
          </button>
        </div>

        <h3 className="font-bold text-lg mb-4 text-gray-800">What needs fixing?</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {SERVICES.map((service) => (
            <div 
              key={service.id}
              onClick={() => {
                setSelectedService(service.id);
                setCurrentPage('DIAGNOSIS');
              }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform cursor-pointer"
            >
              <div className={`p-3 rounded-full ${service.bg} ${service.color}`}>
                <service.icon size={28} />
              </div>
              <span className="font-medium text-sm text-gray-700">{service.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDiagnosis = () => (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <button onClick={() => setCurrentPage('HOME')} className="p-2 -ml-2">
          <ChevronLeft />
        </button>
        <h2 className="font-bold text-lg">Diagnosis</h2>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Upload a photo of the issue</h3>
          <p className="text-sm text-gray-500 mb-4">Our AI will analyze the problem and suggest a fix.</p>
          
          <label className="border-2 border-dashed border-blue-300 rounded-xl h-48 flex flex-col items-center justify-center bg-blue-50 cursor-pointer overflow-hidden relative">
            {diagnosisImage ? (
              <img src={diagnosisImage} alt="Issue" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="text-blue-400 mb-2" size={32} />
                <span className="text-blue-500 font-medium">Tap to take photo</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {isDiagnosing && (
          <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-3 border border-yellow-100">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            <p className="text-yellow-800 text-sm font-medium">AI is analyzing your appliance...</p>
          </div>
        )}

        {!isDiagnosing && diagnosisText && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 animate-fade-in">
             <div className="flex items-start gap-2 mb-1">
                <Zap className="text-green-600 mt-1" size={16} />
                <h4 className="font-bold text-green-800">AI Diagnosis</h4>
             </div>
             <p className="text-sm text-green-800 leading-relaxed">{diagnosisText}</p>
          </div>
        )}
        
        <div className="mt-auto">
          <Button fullWidth onClick={() => setCurrentPage('TECH_SELECT')}>
            Find Technicians
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTechSelect = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 bg-white shadow-sm z-10 flex items-center gap-2">
        <button onClick={() => setCurrentPage('DIAGNOSIS')} className="p-2 -ml-2">
          <ChevronLeft />
        </button>
        <div>
           <h2 className="font-bold text-lg">Nearby Technicians</h2>
           <p className="text-xs text-gray-500">Found {availableTechs.length} experts nearby</p>
        </div>
      </div>

      <div className="h-64 relative bg-gray-200">
        <MapPlaceholder 
          technicians={availableTechs} 
          selectedTechId={selectedTech?.id} 
          onSelectTech={(id) => {
             const t = availableTechs.find(tech => tech.id === id);
             if(t) setSelectedTech(t);
          }}
        />
      </div>

      <div className="flex-1 p-4 -mt-4 bg-white rounded-t-2xl shadow-lg overflow-y-auto no-scrollbar">
         <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
         </div>
         
         <div className="space-y-4">
           {availableTechs.map(tech => (
             <div 
               key={tech.id} 
               onClick={() => setSelectedTech(tech)}
               className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTech?.id === tech.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}
             >
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <h3 className="font-bold text-gray-900">{tech.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                         <Star size={14} className="text-yellow-400 fill-current" />
                         <span>{tech.rating}</span>
                         <span className="text-gray-300">•</span>
                         <span>{tech.jobsCompleted} jobs</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="block font-bold text-blue-600">₹{tech.priceEstimate}</span>
                      <span className="text-xs text-gray-500">Visiting Charge</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                   <Clock size={12} />
                   <span>Arrives in 15 mins</span>
                   <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                   <span>{tech.distance} away</span>
                </div>
             </div>
           ))}
         </div>
      </div>

      <div className="p-4 bg-white border-t">
         <Button 
            fullWidth 
            disabled={!selectedTech}
            onClick={() => setCurrentPage('BOOKING_CONFIRM')}
         >
            Select & Continue
         </Button>
      </div>
    </div>
  );

  const renderBookingConfirm = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <div className="p-4 bg-white shadow-sm flex items-center gap-2">
        <button onClick={() => setCurrentPage('TECH_SELECT')} className="p-2 -ml-2">
          <ChevronLeft />
        </button>
        <h2 className="font-bold text-lg">Booking Summary</h2>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-3">Service Details</h3>
           <div className="flex justify-between text-sm py-2 border-b border-dashed">
              <span className="text-gray-600">Service Type</span>
              <span className="font-medium">{selectedService}</span>
           </div>
           <div className="flex justify-between text-sm py-2 border-b border-dashed">
              <span className="text-gray-600">Technician</span>
              <span className="font-medium">{selectedTech?.name}</span>
           </div>
           <div className="flex justify-between text-sm py-2 pt-3">
              <span className="font-bold text-gray-900">Total Estimate</span>
              <span className="font-bold text-blue-600">₹{selectedTech?.priceEstimate}</span>
           </div>
           <p className="text-xs text-gray-400 mt-2">*Final price depends on parts used. "No fix, no fee" policy applies.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-3">Address</h3>
           <div className="flex gap-3">
              <div className="p-2 bg-blue-50 rounded-lg h-fit text-blue-600">
                 <MapPin size={20} />
              </div>
              <div>
                 <p className="font-medium text-sm">Home</p>
                 <p className="text-sm text-gray-500">Flat 402, Sunrise Towers, Benz Circle, Vijayawada, 520010</p>
                 <button className="text-blue-600 text-xs font-semibold mt-1">Change</button>
              </div>
           </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2 border border-green-100">
           <ShieldCheck className="text-green-600" size={20} />
           <p className="text-xs text-green-800 font-medium">Verified Professional • Insurance Covered</p>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
         <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Pay via</span>
            <div className="flex items-center gap-1">
               <span className="font-bold text-blue-900">Razorpay</span>
               <CreditCard size={16} className="text-gray-400" />
            </div>
         </div>
         <Button fullWidth onClick={handleBooking}>
            Confirm Booking
         </Button>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="min-h-screen bg-white flex flex-col relative">
       {/* Full screen map */}
       <div className="absolute inset-0 pb-64">
          <MapPlaceholder 
             technicians={selectedTech ? [selectedTech] : []}
             selectedTechId={selectedTech?.id}
             showUser={true}
          />
       </div>

       {/* Floating Back Button */}
       <button 
         onClick={() => setCurrentPage('HOME')}
         className="absolute top-4 left-4 p-3 bg-white rounded-full shadow-lg z-10"
       >
         <ChevronLeft />
       </button>

       {/* Bottom Sheet */}
       <div className="mt-auto bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-6 relative z-10">
          <div className="flex justify-center mb-6">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          <div className="flex items-center gap-2 mb-6 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full">
             <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold uppercase tracking-wide">Technician on the way</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
             <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
               {selectedTech?.name.charAt(0)}
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedTech?.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                   <Star size={14} className="text-yellow-400 fill-current" />
                   <span>{selectedTech?.rating}</span>
                </div>
             </div>
             <button className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                <Phone size={20} />
             </button>
             <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <MessageSquare size={20} />
             </button>
          </div>

          <div className="space-y-4">
             <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                </div>
                <div>
                   <p className="font-bold text-sm">Booking Confirmed</p>
                   <p className="text-xs text-gray-400">10:30 AM</p>
                </div>
             </div>
             <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                   <div className="w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                </div>
                <div>
                   <p className="font-bold text-sm text-blue-600">On the way</p>
                   <p className="text-xs text-gray-400">Arriving in 8 mins</p>
                </div>
             </div>
          </div>

          <div className="mt-8 pt-4 border-t">
             <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">OTP for Technician</span>
                <span className="font-mono text-xl font-bold tracking-widest text-gray-800">8921</span>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <>
      {currentPage === 'AUTH' && renderAuth()}
      {currentPage === 'HOME' && renderHome()}
      {currentPage === 'DIAGNOSIS' && renderDiagnosis()}
      {currentPage === 'TECH_SELECT' && renderTechSelect()}
      {currentPage === 'BOOKING_CONFIRM' && renderBookingConfirm()}
      {currentPage === 'TRACKING' && renderTracking()}
    </>
  );
};

export default App;