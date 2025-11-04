export enum ItemStatus {
  Active = 'Active',
  Used = 'Used',
  Donated = 'Donated'
}

export enum UserLevel {
  EcoSaver = 'EcoSaver',
  EcoWarrior = 'EcoWarrior',
  EcoHero = 'EcoHero',
  PlanetProtector = 'Planet Protector'
}

export enum QuantityUnit {
  kg = 'kg',
  g = 'g',
  L = 'L',
  ml = 'ml',
  pcs = 'pcs'
}

export enum UserType {
  Consumer = 'Consumer',
  Restaurant = 'Restaurant',
  NGO = 'NGO'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Made optional for contexts where it's not needed (e.g., leaderboard)
  userType: UserType;
  ecoPoints: number;
  level: UserLevel;
  profileImage: string;
}

export interface PantryItem {
  id: string;
  productName: string;
  category: string;
  expiryDate: string; // ISO date string
  quantity: number;
  quantityUnit: QuantityUnit;
  imageURL: string;
  status: ItemStatus;
  addedDate: string; // ISO date string
  dateCompleted?: string; // ISO date string, set when status becomes Used or Donated
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
}

export interface Donation {
  id: string;
  userId: string;
  itemIds: string[];
  ngoName: string;
  dateDonated: string; // ISO date string
  pointsEarned: number;
}

export interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
  estimatedTime: string;
  sustainabilityTip: string;
  usedIngredients: string[];
}

export interface NGO {
  id: string;
  name: string;
  contact: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number; // Optional, will be calculated at runtime
}

export interface ScannedProductDetails {
  product_name: string;
  expiry_date: string;
  brand: string;
  barcode_number: string;
  notes: string;
}

export type Screen = 'Home' | 'Pantry' | 'Recipes' | 'Donate' | 'Rewards' | 'About' | 'Login' | 'SignUp';