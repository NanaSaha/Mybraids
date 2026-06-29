export type ServiceCategory = 'hair' | 'makeup' | 'eyelashes' | 'nails' | 'skincare';

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  currency: string;
}

export interface AvailabilitySlot {
  open: string;  // "09:00"
  close: string; // "18:00"
  available: boolean;
}

export interface Availability {
  monday: AvailabilitySlot;
  tuesday: AvailabilitySlot;
  wednesday: AvailabilitySlot;
  thursday: AvailabilitySlot;
  friday: AvailabilitySlot;
  saturday: AvailabilitySlot;
  sunday: AvailabilitySlot;
}

export interface ProviderLocation {
  city: string;
  state: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  bio: string;
  tagline: string;
  category: ServiceCategory;
  specialties: string[];
  location: ProviderLocation;
  profileImage: string;
  galleryImages: string[];
  services: ServiceOffering[];
  availability: Availability;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  currency: string;
  verified: boolean;
  featured: boolean;
  yearsExperience: number;
  instagram: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  providerId: string;
  clientId: string;
  clientName: string;
  clientPhoto: string;
  rating: number;
  comment: string;
  serviceProvided: string;
  createdAt: Date;
}

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; icon: string; color: string }[] = [
  { value: 'hair', label: 'Hair Styling', icon: 'fa-scissors', color: '#C85A2E' },
  { value: 'makeup', label: 'Makeup Artist', icon: 'fa-palette', color: '#E8A030' },
  { value: 'eyelashes', label: 'Eyelash Tech', icon: 'fa-eye', color: '#4A7C59' },
  { value: 'nails', label: 'Nail Artist', icon: 'fa-hand-sparkles', color: '#7B3F35' },
  { value: 'skincare', label: 'Skincare', icon: 'fa-spa', color: '#A04420' },
];
