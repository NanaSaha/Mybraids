import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminStats {
  users: { total: number; clients: number; providers: number; active: number; suspended: number; newThisMonth: number };
  providers: { pendingApprovals: number };
  bookings: { total: number; byStatus: Record<string, number> };
  revenue: number;
}

export interface AdminUser {
  id: string; email: string; displayName: string; photoURL: string | null;
  role: string; status: string; phone?: string; createdAt: string;
}

export interface AdminProvider {
  id: string; userId: string; name: string; email: string; photoURL: string | null;
  phone?: string; address?: string;
  category: string; rating: number; reviewCount: number;
  verified: boolean; featured: boolean; approved: boolean;
  userStatus: string; city?: string; country?: string;
  startingPrice: number; currency: string; createdAt: string;
}

export interface AdminBooking {
  id: string; clientName: string; clientEmail: string;
  providerName: string; serviceName: string;
  servicePrice: number; currency: string;
  date: string; time: string; status: string; notes?: string; createdAt: string;
}

export interface AdminReview {
  id: string; rating: number; comment: string; serviceProvided?: string;
  clientName: string; providerName: string; createdAt: string;
}

export interface PagedResult<T> {
  data: T[]; total: number; page: number; perPage: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  getStats(): Promise<AdminStats> {
    return firstValueFrom(this.api.get<AdminStats>('/admin/stats'));
  }

  getUsers(params: Record<string, string> = {}): Promise<PagedResult<AdminUser>> {
    const q = new URLSearchParams(params).toString();
    return firstValueFrom(this.api.get<PagedResult<AdminUser>>(`/admin/users${q ? '?' + q : ''}`));
  }

  updateUser(id: string, updates: { role?: string; status?: string }): Promise<void> {
    return firstValueFrom(this.api.patch<void>(`/admin/users/${id}`, updates));
  }

  createUser(data: { email: string; displayName: string; password: string; role: string }): Promise<AdminUser> {
    return firstValueFrom(this.api.post<AdminUser>('/admin/users', data));
  }

  deleteUser(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<void>(`/admin/users/${id}`));
  }

  getUserDetail(id: string): Promise<any> {
    return firstValueFrom(this.api.get<any>(`/admin/users/${id}`));
  }

  getProviders(params: Record<string, string> = {}): Promise<PagedResult<AdminProvider>> {
    const q = new URLSearchParams(params).toString();
    return firstValueFrom(this.api.get<PagedResult<AdminProvider>>(`/admin/providers${q ? '?' + q : ''}`));
  }

  updateProvider(id: string, updates: { approved?: boolean; verified?: boolean; featured?: boolean }): Promise<void> {
    return firstValueFrom(this.api.patch<void>(`/admin/providers/${id}`, updates));
  }

  getBookings(params: Record<string, string> = {}): Promise<AdminBooking[]> {
    const q = new URLSearchParams(params).toString();
    return firstValueFrom(this.api.get<AdminBooking[]>(`/admin/bookings${q ? '?' + q : ''}`));
  }

  updateBookingStatus(id: string, status: string): Promise<void> {
    return firstValueFrom(this.api.patch<void>(`/admin/bookings/${id}`, { status }));
  }

  getReviews(): Promise<AdminReview[]> {
    return firstValueFrom(this.api.get<AdminReview[]>('/admin/reviews'));
  }

  deleteReview(id: string): Promise<void> {
    return firstValueFrom(this.api.delete<void>(`/admin/reviews/${id}`));
  }
}
