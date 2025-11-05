import { PantryItem, User, NGO, ItemStatus, UserLevel, QuantityUnit, UserType } from './types';

// Helper to get future dates
const getDateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const SAMPLE_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'p1',
    productName: 'orange',
    category: 'Fruits',
    expiryDate: "2025-11-12T11:48:31.006Z",
    quantity: 1,
    quantityUnit: QuantityUnit.pcs,
    imageURL: 'https://picsum.photos/seed/orange/300/200',
    status: ItemStatus.Active,
    addedDate: new Date().toISOString(),
    nutrition: { calories: '47 kcal', protein: '0.9g', carbs: '12g', fat: '0.1g', fiber: '2.4g' },
  },
];

// FIX: Added missing walletBalance and hasEcoBadge properties to User objects to conform to the User type.
export const SAMPLE_USERS: User[] = [
  {
    id: 'user1',
    name: 'Affan',
    email: 'affan@ecoeats.com',
    userType: UserType.Consumer,
    ecoPoints: 165,
    level: UserLevel.EcoWarrior,
    profileImage: 'https://i.pravatar.cc/150?u=affan',
    walletBalance: 25,
    hasEcoBadge: false,
  },
  {
    id: 'user-ngo',
    name: 'Green Food Bank',
    email: 'contact@greenfood.org',
    userType: UserType.NGO,
    ecoPoints: 0,
    level: UserLevel.EcoSaver,
    profileImage: 'https://i.pravatar.cc/150?u=ngo',
    walletBalance: 0,
    hasEcoBadge: false,
  }
];


// FIX: Added missing walletBalance and hasEcoBadge properties to all user objects to conform to the User type.
export const LEADERBOARD_USERS: User[] = [
    { id: 'user1', name: 'Affan', email: '', userType: UserType.Consumer, ecoPoints: 165, level: UserLevel.EcoWarrior, profileImage: 'https://i.pravatar.cc/150?u=affan', walletBalance: 25, hasEcoBadge: false },
    { id: 'user2', name: 'MOHAMED AFFAN', email: '', userType: UserType.Consumer, ecoPoints: 15, level: UserLevel.EcoSaver, profileImage: 'https://i.pravatar.cc/150?u=mohamed', walletBalance: 0, hasEcoBadge: false },
    { id: 'user3', name: 'ROSHAN', email: '', userType: UserType.Consumer, ecoPoints: 10, level: UserLevel.EcoSaver, profileImage: 'https://i.pravatar.cc/150?u=roshan', walletBalance: 0, hasEcoBadge: false },
    { id: 'user4', name: 'Mohit', email: '', userType: UserType.Consumer, ecoPoints: 0, level: UserLevel.EcoSaver, profileImage: 'https://i.pravatar.cc/150?u=mohit', walletBalance: 0, hasEcoBadge: false },
    { id: 'user5', name: 'AGod', email: '', userType: UserType.Consumer, ecoPoints: 0, level: UserLevel.EcoSaver, profileImage: 'https://i.pravatar.cc/150?u=agod', walletBalance: 0, hasEcoBadge: false },
].sort((a, b) => b.ecoPoints - a.ecoPoints);


export const SAMPLE_NGOS: NGO[] = [
  // India
  {
    id: 'ngo1',
    name: 'Feeding India',
    contact: '+91-9876543210',
    address: 'Delhi, India',
    latitude: 28.6315,
    longitude: 77.2167,
  },
  {
    id: 'ngo2',
    name: 'No Food Waste',
    contact: '+91-9087790877',
    address: 'Chennai, Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: 'ngo3',
    name: 'Roti Bank',
    contact: '+91-8655580001',
    address: 'Mumbai, Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
  },
  {
    id: 'ngo4',
    name: 'Rise Against Hunger India',
    contact: '+91-8041121832',
    address: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  // International
  {
    id: 'ngo5',
    name: 'City Harvest',
    contact: '+1-646-412-0700',
    address: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    id: 'ngo6',
    name: 'The Felix Project',
    contact: '+44-20-3034-4370',
    address: 'London, UK',
    latitude: 51.5072,
    longitude: -0.1276,
  },
  {
    id: 'ngo7',
    name: 'OzHarvest',
    contact: '+61-2-9516-3877',
    address: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    id: 'ngo8',
    name: 'Second Harvest Japan',
    contact: '+81-3-5822-5371',
    address: 'Tokyo, Japan',
    latitude: 35.6895,
    longitude: 139.6917,
  },
];

export const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Proteins', 'Snacks', 'Cereals'];