import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { ApiService } from '../../../core/services/api.service';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private api = inject(ApiService);

  activeTab = signal<'upcoming' | 'past' | 'profile'>('upcoming');
  bookings  = signal<Booking[]>([]);

  profilePhone   = '';
  profileSaving  = signal(false);
  profileSuccess = signal(false);
  profileError   = signal('');

  reviewingBookingId = signal<string | null>(null);
  reviewRating       = 0;
  reviewComment      = '';
  reviewSubmitting   = signal(false);
  reviewError        = signal('');
  reviewedIds        = signal<Set<string>>(new Set());

  get upcomingBookings(): Booking[] {
    return this.bookings().filter(b => b.status === 'pending' || b.status === 'confirmed');
  }

  get pastBookings(): Booking[] {
    return this.bookings().filter(b => b.status === 'completed' || b.status === 'cancelled');
  }

  async ngOnInit() {
    const bookings = await this.bookingService.getClientBookings();
    this.bookings.set(bookings);
    this.profilePhone = this.authService.currentUser()?.phone || '';
  }

  async saveProfile() {
    if (!this.profilePhone.trim()) { this.profileError.set('Phone number is required.'); return; }
    this.profileSaving.set(true);
    this.profileError.set('');
    try {
      await this.authService.updateProfile({ phone: this.profilePhone.trim() });
      this.profileSuccess.set(true);
      setTimeout(() => this.profileSuccess.set(false), 3000);
    } catch {
      this.profileError.set('Could not save profile. Please try again.');
    } finally {
      this.profileSaving.set(false);
    }
  }

  async cancelBooking(id: string) {
    await this.bookingService.cancelBooking(id);
    this.bookings.update(list => list.map(b => b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b));
  }

  openReview(booking: Booking) {
    this.reviewingBookingId.set(booking.id);
    this.reviewRating  = 0;
    this.reviewComment = '';
    this.reviewError.set('');
  }

  cancelReview() {
    this.reviewingBookingId.set(null);
    this.reviewError.set('');
  }

  setRating(stars: number) { this.reviewRating = stars; }

  async submitReview(booking: Booking) {
    if (this.reviewRating < 1) { this.reviewError.set('Please select a star rating.'); return; }
    this.reviewSubmitting.set(true);
    this.reviewError.set('');
    try {
      await firstValueFrom(this.api.post(`/providers/${booking.providerId}/reviews`, {
        rating:          this.reviewRating,
        comment:         this.reviewComment,
        bookingId:       booking.id,
        serviceProvided: booking.serviceName,
      }));
      this.reviewedIds.update(ids => new Set([...ids, booking.id]));
      this.reviewingBookingId.set(null);
    } catch (e: any) {
      this.reviewError.set(e?.error?.error || 'Could not submit review. Try again.');
    } finally {
      this.reviewSubmitting.set(false);
    }
  }

  isReviewed(id: string): boolean { return this.reviewedIds().has(id); }

  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      pending:   'Awaiting Confirmation',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };
    return labels[status];
  }

  getStatusClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      pending:   'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed',
    };
    return classes[status];
  }

  formatDate(d: string): string {
    return this.bookingService.formatDate(d);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
