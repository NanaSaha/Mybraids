import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Booking, BookingStatus } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = inject(ApiService);

  async getClientBookings(): Promise<Booking[]> {
    return firstValueFrom(
      this.api.get<Booking[]>('/bookings').pipe(
        catchError(() => of([] as Booking[]))
      )
    );
  }

  async getProviderBookings(): Promise<Booking[]> {
    return firstValueFrom(
      this.api.get<Booking[]>('/bookings/provider').pipe(
        catchError(() => of([]))
      )
    );
  }

  async createBooking(booking: {
    providerId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.api.post<{ id: string }>('/bookings', booking)
      );
      return res.id;
    } catch {
      const id = 'b' + Date.now();
      this.mockBookings.push({
        ...booking,
        id,
        clientId: 'current-user',
        clientName: 'You',
        clientEmail: '',
        clientPhone: '',
        providerId: booking.providerId,
        providerName: '',
        serviceId: booking.serviceId,
        serviceName: '',
        servicePrice: 0,
        currency: 'USD',
        duration: 60,
        status: 'pending',
        notes: booking.notes ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return id;
    }
  }

  async cancelBooking(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.delete(`/bookings/${id}`));
    } catch {
      const b = this.mockBookings.find(b => b.id === id);
      if (b) { b.status = 'cancelled'; b.updatedAt = new Date(); }
    }
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    await firstValueFrom(this.api.patch(`/bookings/${id}/status`, { status }));
  }

  generateTimeSlots(open: string, close: string, duration: number): string[] {
    const toMins = (t: string): number => {
      // Handle "HH:MM", "HH:MM:SS", or full datetime "2000-01-01 09:00:00 +0100"
      const match = t.match(/(\d{1,2}):(\d{2})/g);
      if (!match || match.length === 0) return NaN;
      // For a full datetime string like "2000-01-01 09:00:00", match[0] is "01:01" (date part)
      // and match[1] is "09:00" — take the last time-looking match that makes sense
      const timePart = match.find(m => {
        const [h] = m.split(':').map(Number);
        return h >= 0 && h <= 23;
      }) ?? match[match.length - 1];
      const [h, m] = timePart.split(':').map(Number);
      return h * 60 + m;
    };

    const slots: string[] = [];
    let current = toMins(open);
    const end   = toMins(close);
    if (isNaN(current) || isNaN(end) || end <= current) return slots;
    while (current + duration <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current += duration;
    }
    return slots;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  getStatusColor(status: BookingStatus): string {
    const colors: Record<BookingStatus, string> = {
      pending:   '#E8A030',
      confirmed: '#4A7C59',
      cancelled: '#C62828',
      completed: '#2D1B0E',
    };
    return colors[status];
  }

  private mockBookings: Booking[] = [
    {
      id: 'b1', clientId: 'current-user', clientName: 'You',
      clientEmail: 'user@example.com', clientPhone: '+1 555 0100',
      providerId: '1', providerName: 'Amara Diallo',
      serviceId: 's1', serviceName: 'Knotless Box Braids',
      servicePrice: 120, currency: 'USD', date: '2024-07-15', time: '10:00', duration: 240,
      status: 'confirmed', notes: 'Please prepare hair with conditioner',
      createdAt: new Date('2024-06-20'), updatedAt: new Date('2024-06-20'),
    },
    {
      id: 'b2', clientId: 'current-user', clientName: 'You',
      clientEmail: 'user@example.com', clientPhone: '+1 555 0100',
      providerId: '2', providerName: 'Fatima Ouédraogo',
      serviceId: 's2', serviceName: 'Evening Glam',
      servicePrice: 100, currency: 'USD', date: '2024-08-02', time: '14:00', duration: 60,
      status: 'pending', notes: 'Birthday party, going for bold red look',
      createdAt: new Date('2024-06-22'), updatedAt: new Date('2024-06-22'),
    },
  ];
}
