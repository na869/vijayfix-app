export enum ServiceType {
  AC = 'AC Repair',
  FRIDGE = 'Refrigerator',
  WASHING = 'Washing Machine',
  RO = 'RO Purifier',
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
}

export interface Technician {
  id: string;
  name: string;
  rating: number;
  jobsCompleted: number;
  lat: number;
  lng: number;
  specialties: ServiceType[];
  available: boolean;
  distance: string; // pre-calculated for mock
  priceEstimate: number;
  isVerified?: boolean; // For admin approval
}

export interface Booking {
  id: string;
  serviceType: ServiceType;
  technicianId: string;
  technicianName: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'payment-pending' | 'completed' | 'cancelled';
  totalAmount: number;
  date: string;
  location: string;
  jobStatus?: JobStatus; // Granular status for tracking
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: UserRole | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
}

export type Page = 
  | 'AUTH' 
  | 'HOME' 
  | 'DIAGNOSIS' 
  | 'TECH_SELECT' 
  | 'BOOKING_CONFIRM' 
  | 'TRACKING' 
  | 'RATING' 
  | 'HISTORY' 
  | 'ADMIN'
  | 'TECH_DASHBOARD'
  | 'TECH_JOB_DETAILS'
  | 'CHAT';

export type JobStatus = 'PENDING' | 'ACCEPTED' | 'ON_WAY' | 'IN_PROGRESS' | 'PAYMENT_PENDING' | 'COMPLETED';

export type UserRole = 'CUSTOMER' | 'TECHNICIAN';