import { ServiceType, Technician } from './types';
import { Thermometer, Zap, Droplets, Wrench, Snowflake, WashingMachine } from 'lucide-react';

export const VIJAYAWADA_CENTER = { lat: 16.5062, lng: 80.6480 };

export const SERVICES = [
  { id: ServiceType.AC, icon: Snowflake, label: 'AC Service', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: ServiceType.FRIDGE, icon: Thermometer, label: 'Fridge', color: 'text-cyan-500', bg: 'bg-cyan-100' },
  { id: ServiceType.WASHING, icon: WashingMachine, label: 'Washing Machine', color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { id: ServiceType.RO, icon: Droplets, label: 'RO Purifier', color: 'text-blue-400', bg: 'bg-blue-50' },
  { id: ServiceType.PLUMBING, icon: Wrench, label: 'Plumbing', color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: ServiceType.ELECTRICAL, icon: Zap, label: 'Electrical', color: 'text-yellow-500', bg: 'bg-yellow-100' },
];

export const MOCK_TECHNICIANS: Technician[] = [
  {
    id: 'T001',
    name: 'Ramesh Kumar',
    rating: 4.8,
    jobsCompleted: 124,
    lat: 16.5082,
    lng: 80.6500,
    specialties: [ServiceType.AC, ServiceType.ELECTRICAL],
    available: true,
    distance: '0.8 km',
    priceEstimate: 450,
  },
  {
    id: 'T002',
    name: 'Suresh Reddy',
    rating: 4.5,
    jobsCompleted: 89,
    lat: 16.5042,
    lng: 80.6460,
    specialties: [ServiceType.PLUMBING, ServiceType.RO],
    available: true,
    distance: '1.2 km',
    priceEstimate: 350,
  },
  {
    id: 'T003',
    name: 'Vijay Singh',
    rating: 4.9,
    jobsCompleted: 310,
    lat: 16.5022,
    lng: 80.6520,
    specialties: [ServiceType.FRIDGE, ServiceType.WASHING],
    available: true,
    distance: '2.1 km',
    priceEstimate: 500,
  },
  {
    id: 'T004',
    name: 'Manoj P.',
    rating: 4.2,
    jobsCompleted: 45,
    lat: 16.5092,
    lng: 80.6420,
    specialties: [ServiceType.AC],
    available: true,
    distance: '0.5 km',
    priceEstimate: 400,
  }
];