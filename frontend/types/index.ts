// User Types
export enum UserRole {
  OWNER = 'OWNER',
  SEEKER = 'SEEKER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Property Types
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL',
}

export enum ListingType {
  RENT = 'RENT',
  SALE = 'SALE',
}

export enum FurnishingType {
  UNFURNISHED = 'UNFURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  FULLY_FURNISHED = 'FULLY_FURNISHED',
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RENTED = 'RENTED',
  SOLD = 'SOLD',
}

export interface Property {
  id: string;
  userId: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  deposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  furnishing?: FurnishingType;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  availableFrom?: string;
  status: PropertyStatus;
  isVerified: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  images?: PropertyImage[];
  amenities?: Amenity[];
  user?: User;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  order: number;
}

export interface Amenity {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
