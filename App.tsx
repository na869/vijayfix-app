import React, { useState, useEffect } from 'react';
import { Page, ServiceType, Technician, JobStatus, Booking, UserRole, ChatMessage } from './types';
import { Button } from './components/Button';
import { SERVICES, MOCK_TECHNICIANS, VIJAYAWADA_CENTER } from './constants';
import { MapPlaceholder } from './components/MapPlaceholder';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { RazorpayMock } from './components/RazorpayMock';
import { MyBookings } from './components/MyBookings';
import { diagnoseIssue } from './services/geminiService';
import { 
  Phone, 
  MapPin, 
  Camera, 
  ChevronLeft, 
  Star, 
  Clock, 
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Menu,
  Zap,
  Wrench,
  Receipt,
  ThumbsUp,
  TrendingUp,
  Users,
  Calendar,
  Check,
  Power,
  Navigation,
  DollarSign,
  User,
  Bell
} from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('AUTH');
  const [userRole, setUserRole] = useState<UserRole>('CUSTOMER');
  
  // Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  // Customer Flow State
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [diagnosisImage, setDiagnosisImage] = useState<string | null>(null);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Shared Data State
  const [allBookings, setAllBookings] = useState<Booking[]>([
    {
      id: 'B001',
      serviceType: ServiceType.AC,
      technicianId: 'T001',
      technicianName: 'Ramesh Kumar',
      status: 'completed',
      totalAmount: 650,
      date: '2023-10-15',
      location: 'Benz Circle, Vijayawada',
      jobStatus: 'COMPLETED'
    }
  ]);

  // Admin State
  const [verifiedTechs, setVerifiedTechs] = useState<string[]>(['T001', 'T003']);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const activeBooking = allBookings.find(b => 
    ['pending', 'confirmed', 'in-progress', 'payment-pending'].includes(b.status)
  );
  
  const jobStatus: JobStatus = activeBooking?.jobStatus || 'PENDING';
  const [isTechOnline, setIsTechOnline] = useState(true);
  
  // Rating State
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const availableTechs = selectedService 
    ? MOCK_TECHNICIANS.filter(t => t.specialties.includes(selectedService))
    : [];

  // --- ACTIONS ---

  const handleLogin = (role: UserRole) => {
    if (otp.length === 6) {
      setUserRole(role);
      setCurrentPage(role === 'CUSTOMER' ? 'HOME' : 'TECH_DASHBOARD');
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setDiagnosisImage(base64);
        setIsDiagnosing(true);
        const diagnosis = await diagnoseIssue(base64.split(',')[1]);
        setDiagnosisText(diagnosis);
        setIsDiagnosing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSystemMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'SYSTEM',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCustomerBooking = () => {
    if (selectedTech && selectedService) {
      const newBooking: Booking = {
        id: `B${Math.floor(Math.random() * 1000)}`,
        serviceType: selectedService,
        technicianId: selectedTech.id,
        technicianName: selectedTech.name,
        status: 'confirmed',
        jobStatus: 'PENDING',
        totalAmount: selectedTech.priceEstimate,
        date: new Date().toISOString().split('T')[0],
        location: 'Flat 402, Sunrise Towers, Benz Circle'
      };
      setAllBookings([newBooking, ...allBookings]);
      setChatMessages([]); // Reset chat for new booking
      addSystemMessage('Booking Request Sent. Waiting for Technician...');
      setCurrentPage('TRACKING');
    }
  };

  const updateJobStatus = (newStatus: JobStatus) => {
    const updatedBookings = allBookings.map(b => {
      if (b.id === activeBooking?.id) {
        return { 
          ...b, 
          jobStatus: newStatus,
          status: newStatus === 'COMPLETED' ? 'completed' : 
                  newStatus === 'PAYMENT_PENDING' ? 'payment-pending' : 
                  'in-progress'
        } as Booking;
      }
      return b;
    });
    setAllBookings(updatedBookings);
    
    // Add system notification in chat
    const statusMessages: Record<string, string> = {
      'ACCEPTED': 'Technician accepted your request.',
      'ON_WAY': 'Technician is on the way.',
      'IN_PROGRESS': 'Technician has arrived and started working.',
      'PAYMENT_PENDING': 'Job completed. Bill generated.',
      'COMPLETED': 'Payment received. Thank you!'
    };
    if (statusMessages[newStatus]) {
      addSystemMessage(statusMessages[newStatus]);
    }
  };

  const onPaymentSuccess = () => {
    setShowPaymentModal(false);
    updateJobStatus('COMPLETED');
    setCurrentPage('RATING');
  };

  const handleSubmitRating = () => {
    setSelectedService(null);
    setDiagnosisImage(null);
    setDiagnosisText('');
    setSelectedTech(null);
    setRating(0);
    setReview('');
    setCurrentPage('HOME');
  };

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: userRole,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const getUnreadCount = () => {
    return chatMessages.filter(m => m.sender !== userRole && m.sender !== 'SYSTEM' && !m.isRead).length;
  };

  const toggleTechVerification = (techId: string) => {
    if (verifiedTechs.includes(techId)) {
      setVerifiedTechs(verifiedTechs.filter(id => id !== techId));
    } else {
      setVerifiedTechs([...verifiedTechs, techId]);
    }
  };

  // --- PAGES ---

  const renderAuth = () => (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">VijayFix</h1>
        <p className="text-gray-500">Hyperlocal Expert Repairs</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${userRole === 'CUSTOMER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            onClick={() => setUserRole('CUSTOMER')}
          >
            Customer
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${userRole === 'TECHNICIAN' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            onClick={() => setUserRole('TECHNICIAN')}
          >
            Partner
          </button>
        </div>

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
          onClick={() => handleLogin(userRole)}
          disabled={otp.length !== 6}
        >
          {userRole === 'CUSTOMER' ? 'Verify & Login' : 'Login as Partner'}
        </Button>
        
        {userRole === 'CUSTOMER' && (
          <div className="mt-4 flex justify-center">
             <button onClick={() => setCurrentPage('ADMIN')} className="text-xs text-gray-300 hover:text-gray-500">
               Admin Login
             </button>
          </div>
        )}
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
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu className="text-gray-600" />
        </button>
      </header>

      {activeBooking && (
         <div 
            onClick={() => setCurrentPage('TRACKING')}
            className="mx-4 mt-4 bg-blue-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center cursor-pointer animate-pulse"
         >
            <div>
               <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">Active Service</p>
               <p className="font-bold">{activeBooking.serviceType}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg relative">
               <Clock size={20} />
               {getUnreadCount() > 0 && (
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-blue-900"></span>
               )}
            </div>
         </div>
      )}

      <div className="p-4">
        {!activeBooking && (
          <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-blue-200">
            <h2 className="text-2xl font-bold mb-1">Instant Repairs</h2>
            <p className="text-blue-100 text-sm mb-4">Professional techs at your doorstep in 30 mins.</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
              Book Now
            </button>
          </div>
        )}

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

  const renderAdmin = () => {
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.totalAmount : 0), 0);
    const completedJobs = allBookings.filter(b => b.status === 'completed').length;

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-slate-800 text-white p-6">
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold">Admin Panel</h1>
             <button onClick={() => setCurrentPage('HOME')} className="bg-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-600">
               Exit
             </button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-xl">
                 <p className="text-xs text-slate-400">Revenue</p>
                 <p className="text-2xl font-bold text-green-400">₹{totalRevenue}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-xl">
                 <p className="text-xs text-slate-400">Completed Jobs</p>
                 <p className="text-2xl font-bold text-blue-400">{completedJobs}</p>
              </div>
           </div>
        </div>

        <div className="p-4">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Users size={18} /> Manage Technicians
           </h3>
           <div className="space-y-3">
             {MOCK_TECHNICIANS.map(tech => {
               const isVerified = verifiedTechs.includes(tech.id);
               return (
                 <div key={tech.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                         {tech.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-medium flex items-center gap-1">
                           {tech.name}
                           {isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                         </p>
                         <p className="text-xs text-gray-500">{tech.specialties.join(', ')}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => toggleTechVerification(tech.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isVerified 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {isVerified ? 'Verified' : 'Verify'}
                    </button>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    );
  };

  const renderDiagnosis = () => (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <button onClick={() => setCurrentPage('HOME')} className="mb-4 w-fit p-2 -ml-2">
        <ChevronLeft />
      </button>
      <h2 className="text-xl font-bold mb-4">Diagnosis</h2>
      <div className="border-2 border-dashed h-48 flex items-center justify-center bg-gray-50 rounded-xl mb-4 relative overflow-hidden">
        {diagnosisImage ? (
          <img src={diagnosisImage} className="w-full h-full object-cover" alt="Diagnosis" />
        ) : (
          <div className="text-center">
            <Camera size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Tap to upload photo</p>
          </div>
        )}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
      </div>
      {isDiagnosing && (
        <div className="flex items-center gap-2 text-blue-600 mb-4 bg-blue-50 p-3 rounded-lg">
           <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
           Analyzing with AI...
        </div>
      )}
      {diagnosisText && <p className="bg-green-50 p-4 rounded-xl text-sm mb-4 border border-green-200 text-green-800">{diagnosisText}</p>}
      <div className="mt-auto">
        <Button fullWidth onClick={() => setCurrentPage('TECH_SELECT')}>Find Technicians</Button>
      </div>
    </div>
  );

  const renderTechSelect = () => (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 bg-white shadow-sm z-10">
        <button onClick={() => setCurrentPage('DIAGNOSIS')} className="p-2 -ml-2">
          <ChevronLeft />
        </button>
      </div>
      <div className="h-64 relative bg-gray-200">
        <MapPlaceholder 
          technicians={availableTechs} 
          selectedTechId={selectedTech?.id} 
          onSelectTech={(id) => setSelectedTech(availableTechs.find(t => t.id === id) || null)} 
        />
      </div>
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        <h3 className="font-bold text-lg mb-3">Available Technicians</h3>
        {availableTechs.map(t => (
          <div 
            key={t.id} 
            onClick={() => setSelectedTech(t)} 
            className={`p-4 border rounded-xl mb-3 cursor-pointer transition-colors relative ${selectedTech?.id === t.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span>{t.rating}</span>
                    <span>•</span>
                    <span>{t.jobsCompleted} jobs</span>
                  </div>
               </div>
               <p className="font-bold text-blue-600">₹{t.priceEstimate}</p>
            </div>
            {verifiedTechs.includes(t.id) && (
              <div className="absolute top-4 right-16 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck size={10} /> Verified
              </div>
            )}
          </div>
        ))}
        <Button 
          fullWidth 
          disabled={!selectedTech} 
          onClick={() => setCurrentPage('BOOKING_CONFIRM')} 
          className="mt-4"
        >
          Select & Continue
        </Button>
      </div>
    </div>
  );

  const renderBookingConfirm = () => (
    <div className="p-6 min-h-screen bg-gray-50">
      <button onClick={() => setCurrentPage('TECH_SELECT')} className="mb-4 w-fit p-2 -ml-2">
        <ChevronLeft />
      </button>
      <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex justify-between py-1 border-b border-dashed pb-2">
          <span className="text-gray-500">Service</span> 
          <span className="font-medium">{selectedService}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-dashed pb-2">
          <span className="text-gray-500">Technician</span> 
          <span className="font-medium">{selectedTech?.name}</span>
        </div>
        <div className="flex justify-between py-1 pt-2">
           <span className="font-bold">Total Estimate</span> 
           <span className="font-bold text-blue-600">₹{selectedTech?.priceEstimate}</span>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
           * Includes visiting charge. Final amount may vary based on parts used.
        </div>
      </div>
      <Button fullWidth onClick={handleCustomerBooking}>Confirm & Book</Button>
    </div>
  );

  const renderRating = () => (
    <div className="p-6 text-center min-h-screen flex flex-col justify-center bg-white">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
        <ThumbsUp size={40} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
      <p className="text-gray-500 mb-8">You paid ₹{(activeBooking?.totalAmount || 0) + 250} to {activeBooking?.technicianName || 'Technician'}</p>
      <Button fullWidth onClick={handleSubmitRating}>Return Home</Button>
    </div>
  );

  const renderTracking = () => {
    // Safety check: If no active booking, redirect home
    if (!activeBooking) {
      // Use useEffect in a real component, but for this structure we return null and schedule update
      // For simplicity in this structure, we just render a "No Active Job" state
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
           <Zap size={48} className="text-gray-300 mb-4" />
           <h2 className="text-xl font-bold text-gray-700">No active job</h2>
           <Button onClick={() => setCurrentPage('HOME')} className="mt-4">Go Home</Button>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-white flex flex-col relative">
       <div className="absolute inset-0 pb-64">
          <MapPlaceholder 
             technicians={selectedTech ? [selectedTech] : []}
             selectedTechId={selectedTech?.id}
             showUser={true}
             destination={VIJAYAWADA_CENTER}
             isTracking={['ON_WAY', 'IN_PROGRESS'].includes(jobStatus)}
          />
       </div>

       <button 
         onClick={() => setCurrentPage('HOME')}
         className="absolute top-4 left-4 p-3 bg-white rounded-full shadow-lg z-10"
       >
         <ChevronLeft />
       </button>

       <div className="mt-auto bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-6 relative z-10">
          <div className="flex justify-center mb-6">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2
              ${jobStatus === 'PENDING' ? 'bg-gray-100 text-gray-600' : 
                jobStatus === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-600' :
                jobStatus === 'PAYMENT_PENDING' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
              {jobStatus === 'PENDING' && 'Connecting...'}
              {['ACCEPTED', 'ON_WAY'].includes(jobStatus) && 'Technician on the way'}
              {jobStatus === 'IN_PROGRESS' && 'Work in Progress'}
              {jobStatus === 'PAYMENT_PENDING' && 'Payment Due'}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
             <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
               {activeBooking?.technicianName.charAt(0) || 'T'}
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-lg">{activeBooking?.technicianName}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                   <Star size={14} className="text-yellow-400 fill-current" />
                   <span>4.8</span>
                </div>
             </div>
             <button className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                <Phone size={20} />
             </button>
             <button 
                onClick={() => setCurrentPage('CHAT')}
                className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors relative"
             >
                <MessageSquare size={20} />
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-blue-900"></span>
                )}
             </button>
          </div>

          {jobStatus === 'PAYMENT_PENDING' ? (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 animate-fade-in">
                <h4 className="font-bold text-gray-800 mb-2">Final Bill</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                   <span>Visiting Charges</span>
                   <span>₹{activeBooking?.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                   <span>Parts & Labor</span>
                   <span>₹250</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                   <span>Total to Pay</span>
                   <span className="text-blue-600">₹{(activeBooking?.totalAmount || 0) + 250}</span>
                </div>
             </div>
          ) : (
             <div className="space-y-4">
                <div className="flex gap-4 items-start">
                   <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
                      <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                   </div>
                   <div>
                      <p className="font-bold text-sm">Booking Confirmed</p>
                      <p className="text-xs text-gray-400">10:30 AM</p>
                   </div>
                </div>
                
                <div className="flex gap-4 items-start">
                   <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${['ACCEPTED','ON_WAY','IN_PROGRESS','PAYMENT_PENDING','COMPLETED'].includes(jobStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                   </div>
                   <div>
                      <p className={`font-bold text-sm ${jobStatus === 'PENDING' ? 'text-gray-400' : 'text-gray-800'}`}>Tech Accepted</p>
                   </div>
                </div>

                 <div className="flex gap-4 items-start">
                   <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${['ON_WAY','IN_PROGRESS','PAYMENT_PENDING','COMPLETED'].includes(jobStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                   </div>
                   <div>
                      <p className={`font-bold text-sm ${['ON_WAY'].includes(jobStatus) ? 'text-blue-600' : 'text-gray-800'}`}>On the way</p>
                   </div>
                </div>
             </div>
          )}

          <div className="mt-6">
             {jobStatus === 'PAYMENT_PENDING' ? (
                <Button fullWidth onClick={() => setShowPaymentModal(true)}>Pay via Razorpay</Button>
             ) : (
                <div className="flex justify-between items-center pt-4 border-t">
                   <span className="text-gray-500 text-sm">OTP for Technician</span>
                   <span className="font-mono text-xl font-bold tracking-widest text-gray-800">8921</span>
                </div>
             )}
          </div>
       </div>
    </div>
    );
  };

  const renderTechDashboard = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <div className="bg-slate-900 text-white p-6 pb-20 rounded-b-[2.5rem] shadow-xl relative z-10">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold border-2 border-slate-600">
                   {MOCK_TECHNICIANS[0].name.charAt(0)}
                </div>
                <div>
                   <h2 className="font-bold text-lg">{MOCK_TECHNICIANS[0].name}</h2>
                   <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span>4.8 Rating</span>
                   </div>
                </div>
             </div>
             <button 
                onClick={() => setIsTechOnline(!isTechOnline)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isTechOnline ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}
             >
                <Power size={14} />
                {isTechOnline ? 'ONLINE' : 'OFFLINE'}
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Today's Earnings</p>
                <div className="flex items-center gap-1 text-green-400">
                   <DollarSign size={18} />
                   <span className="text-2xl font-bold">₹2,450</span>
                </div>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Jobs Completed</p>
                <div className="flex items-center gap-1 text-blue-400">
                   <Check size={18} />
                   <span className="text-2xl font-bold">4</span>
                </div>
             </div>
          </div>
       </div>

       <div className="flex-1 px-4 -mt-10 relative z-20 space-y-4">
          {activeBooking && activeBooking.jobStatus === 'PENDING' && (
             <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-blue-500 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">New Request</span>
                   <span className="text-xs text-gray-500">2 mins ago</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{activeBooking.serviceType}</h3>
                <p className="text-gray-500 text-sm mb-4">{activeBooking.location}</p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => updateJobStatus('ACCEPTED')} 
                     className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow hover:bg-blue-700"
                   >
                      Accept Job
                   </button>
                   <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm">
                      Decline
                   </button>
                </div>
             </div>
          )}

           {activeBooking && ['ACCEPTED', 'ON_WAY', 'IN_PROGRESS', 'PAYMENT_PENDING'].includes(activeBooking.jobStatus || '') && (
             <div 
               onClick={() => setCurrentPage('TECH_JOB_DETAILS')}
               className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500 cursor-pointer active:scale-95 transition-transform"
             >
                <div className="flex justify-between items-start mb-2">
                   <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Active Job</span>
                   <Navigation size={16} className="text-blue-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{activeBooking.serviceType}</h3>
                <p className="text-gray-500 text-sm">{activeBooking.location}</p>
                <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                   <span className="text-gray-600">Status</span>
                   <span className="font-bold text-green-600">{activeBooking.jobStatus?.replace('_', ' ')}</span>
                </div>
             </div>
          )}

          {!activeBooking && (
             <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                   <Zap size={24} />
                </div>
                <p className="text-gray-500 font-medium">No active jobs</p>
             </div>
          )}
       </div>
       
       <button 
          onClick={() => setCurrentPage('AUTH')}
          className="m-4 mt-auto py-3 text-red-500 font-medium text-sm flex justify-center items-center gap-2"
       >
          <User size={16} /> Logout Partner
       </button>
    </div>
  );

  const renderTechJobDetails = () => {
     // Handle job completion state (activeBooking is gone)
     if (!activeBooking) {
        return (
           <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                 <Check size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Completed!</h2>
              <p className="text-gray-500 mb-8">Payment has been processed successfully.</p>
              <Button fullWidth onClick={() => setCurrentPage('TECH_DASHBOARD')}>Back to Dashboard</Button>
           </div>
        );
     }

     return (
     <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-64 relative">
           {/* Passed destination for customer home location */}
           <MapPlaceholder technicians={[]} showUser={false} destination={VIJAYAWADA_CENTER} />
           <button 
              onClick={() => setCurrentPage('TECH_DASHBOARD')}
              className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg"
           >
              <ChevronLeft size={20} />
           </button>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 relative z-10 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-xl font-bold text-gray-900">Customer Name</h2>
                  <p className="text-gray-500 text-sm">Flat 402, Sunrise Towers</p>
               </div>
               <div className="flex gap-2">
                  <button className="p-3 bg-green-100 text-green-600 rounded-full">
                     <Phone size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage('CHAT')}
                    className="p-3 bg-blue-100 text-blue-600 rounded-full relative"
                  >
                     <MessageSquare size={20} />
                     {getUnreadCount() > 0 && (
                       <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                     )}
                  </button>
               </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
               <h3 className="font-bold text-sm text-gray-800 mb-2">Service Details</h3>
               <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{activeBooking?.serviceType}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Payout</span>
                  <span className="font-medium text-blue-600">₹{activeBooking?.totalAmount} + 250</span>
               </div>
            </div>

            <div className="mt-auto space-y-3">
               <p className="text-xs text-center text-gray-400 font-medium uppercase tracking-wider mb-2">Job Actions</p>
               
               {activeBooking?.jobStatus === 'ACCEPTED' && (
                  <Button fullWidth onClick={() => updateJobStatus('ON_WAY')}>
                     Confirm On The Way
                  </Button>
               )}

               {activeBooking?.jobStatus === 'ON_WAY' && (
                  <Button fullWidth onClick={() => updateJobStatus('IN_PROGRESS')} className="bg-orange-600 hover:bg-orange-700">
                     Arrived & Start Job
                  </Button>
               )}

               {activeBooking?.jobStatus === 'IN_PROGRESS' && (
                  <Button fullWidth onClick={() => updateJobStatus('PAYMENT_PENDING')} className="bg-green-600 hover:bg-green-700">
                     Job Completed & Bill
                  </Button>
               )}

               {activeBooking?.jobStatus === 'PAYMENT_PENDING' && (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                     <div className="animate-pulse w-2 h-2 bg-blue-700 rounded-full"></div>
                     Waiting for Customer Payment...
                  </div>
               )}
            </div>
        </div>
     </div>
     );
  };

  return (
    <>
      <Sidebar 
         isOpen={isSidebarOpen} 
         onClose={() => setIsSidebarOpen(false)} 
         onNavigate={handleNavigate}
         currentPage={currentPage}
      />
      
      {showPaymentModal && (
        <RazorpayMock 
           amount={(activeBooking?.totalAmount || 0) + 250} 
           onSuccess={onPaymentSuccess}
           onClose={() => setShowPaymentModal(false)}
        />
      )}
      
      {currentPage === 'CHAT' && (
        <ChatWindow 
          messages={chatMessages}
          currentUserRole={userRole}
          peerName={userRole === 'CUSTOMER' ? (activeBooking?.technicianName || 'Technician') : 'Customer'}
          onSendMessage={handleSendMessage}
          onBack={() => setCurrentPage(userRole === 'CUSTOMER' ? 'TRACKING' : 'TECH_JOB_DETAILS')}
        />
      )}

      {currentPage === 'AUTH' && renderAuth()}
      {currentPage === 'HOME' && renderHome()}
      {currentPage === 'HISTORY' && (
         <MyBookings 
           bookings={allBookings} 
           onBack={() => setCurrentPage('HOME')}
           onViewBooking={(booking) => {
              if (['pending', 'confirmed', 'in-progress', 'payment-pending'].includes(booking.status)) {
                setCurrentPage('TRACKING');
              }
           }}
         />
      )}
      {currentPage === 'ADMIN' && renderAdmin()}
      {currentPage === 'DIAGNOSIS' && renderDiagnosis()}
      {currentPage === 'TECH_SELECT' && renderTechSelect()}
      {currentPage === 'BOOKING_CONFIRM' && renderBookingConfirm()}
      {currentPage === 'TRACKING' && renderTracking()}
      {currentPage === 'RATING' && renderRating()}
      {currentPage === 'TECH_DASHBOARD' && renderTechDashboard()}
      {currentPage === 'TECH_JOB_DETAILS' && renderTechJobDetails()}
    </>
  );
};

export default App;