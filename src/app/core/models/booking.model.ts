export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  currency: string;
  date: string;         // ISO date "2024-06-15"
  time: string;         // "14:00"
  duration: number;     // minutes
  status: BookingStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
