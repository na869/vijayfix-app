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
}

export interface Booking {
  id: string;
  serviceType: ServiceType;
  technicianId: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
  diagnosis?: string;
  imageUrl?: string;
  totalAmount: number;
  date: string;
}

export type Page = 'AUTH' | 'HOME' | 'DIAGNOSIS' | 'TECH_SELECT' | 'BOOKING_CONFIRM' | 'TRACKING';