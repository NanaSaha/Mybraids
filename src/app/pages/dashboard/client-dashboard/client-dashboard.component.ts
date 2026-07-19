import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  private api  = inject(ApiService);
  private route = inject(ActivatedRoute);

  activeTab = signal<'upcoming' | 'past' | 'profile'>('upcoming');
  bookings  = signal<Booking[]>([]);
  isLoading = signal(true);

  profileName      = '';
  profilePhone     = '';
  profilePhoneCode  = '+44';
  profileLocation  = '';
  profileDob       = '';
  avatarUrl        = signal<string | null>(null);
  avatarUploading  = signal(false);
  profileSaving    = signal(false);
  profileSuccess   = signal(false);
  profileError     = signal('');

  readonly phoneCodes = [
    { code: '+1',   country: 'United States / Canada' },
    { code: '+7',   country: 'Russia / Kazakhstan' },
    { code: '+20',  country: 'Egypt' },
    { code: '+27',  country: 'South Africa' },
    { code: '+33',  country: 'France' },
    { code: '+34',  country: 'Spain' },
    { code: '+39',  country: 'Italy' },
    { code: '+44',  country: 'United Kingdom' },
    { code: '+46',  country: 'Sweden' },
    { code: '+47',  country: 'Norway' },
    { code: '+49',  country: 'Germany' },
    { code: '+52',  country: 'Mexico' },
    { code: '+55',  country: 'Brazil' },
    { code: '+61',  country: 'Australia' },
    { code: '+63',  country: 'Philippines' },
    { code: '+64',  country: 'New Zealand' },
    { code: '+65',  country: 'Singapore' },
    { code: '+81',  country: 'Japan' },
    { code: '+82',  country: 'South Korea' },
    { code: '+86',  country: 'China' },
    { code: '+91',  country: 'India' },
    { code: '+212', country: 'Morocco' },
    { code: '+213', country: 'Algeria' },
    { code: '+216', country: 'Tunisia' },
    { code: '+220', country: 'Gambia' },
    { code: '+221', country: 'Senegal' },
    { code: '+224', country: 'Guinea' },
    { code: '+225', country: 'Ivory Coast' },
    { code: '+229', country: 'Benin' },
    { code: '+231', country: 'Liberia' },
    { code: '+232', country: 'Sierra Leone' },
    { code: '+233', country: 'Ghana' },
    { code: '+234', country: 'Nigeria' },
    { code: '+237', country: 'Cameroon' },
    { code: '+241', country: 'Gabon' },
    { code: '+243', country: 'DR Congo' },
    { code: '+244', country: 'Angola' },
    { code: '+249', country: 'Sudan' },
    { code: '+250', country: 'Rwanda' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+254', country: 'Kenya' },
    { code: '+255', country: 'Tanzania' },
    { code: '+256', country: 'Uganda' },
    { code: '+260', country: 'Zambia' },
    { code: '+263', country: 'Zimbabwe' },
    { code: '+264', country: 'Namibia' },
    { code: '+267', country: 'Botswana' },
    { code: '+353', country: 'Ireland' },
    { code: '+351', country: 'Portugal' },
    { code: '+420', country: 'Czech Republic' },
    { code: '+971', country: 'UAE' },
    { code: '+972', country: 'Israel' },
  ];

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
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'profile' || tab === 'upcoming' || tab === 'past') {
      this.activeTab.set(tab);
    }

    const bookings = await this.bookingService.getClientBookings();
    this.bookings.set(bookings);
    this.isLoading.set(false);

    const user = this.authService.currentUser();
    if (user) {
      this.profileName     = user.displayName  || '';
      this.profileLocation = user.location     || '';
      this.profileDob      = user.dateOfBirth  || '';
      this.avatarUrl.set(user.photoURL);

      const rawPhone = user.phone || '';
      const matched = [...this.phoneCodes]
        .sort((a, b) => b.code.length - a.code.length)
        .find(p => rawPhone.startsWith(p.code));
      if (matched) {
        this.profilePhoneCode = matched.code;
        this.profilePhone     = rawPhone.slice(matched.code.length).trim();
      } else {
        this.profilePhone = rawPhone;
      }
    }
  }

  async onAvatarFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    this.avatarUploading.set(true);
    this.profileError.set('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await firstValueFrom(
        this.api.upload<{ url: string }>('/uploads/user-avatar', formData)
      );
      this.avatarUrl.set(res.url);
      await this.authService.updateProfile({ photoURL: res.url });
    } catch {
      this.profileError.set('Could not upload photo. Please try again.');
    } finally {
      this.avatarUploading.set(false);
      input.value = '';
    }
  }

  async saveProfile() {
    if (!this.profilePhone.trim()) { this.profileError.set('Phone number is required.'); return; }
    this.profileSaving.set(true);
    this.profileError.set('');
    try {
      await this.authService.updateProfile({
        displayName: this.profileName.trim() || undefined,
        phone:       `${this.profilePhoneCode}${this.profilePhone.trim()}`,
        location:    this.profileLocation.trim() || undefined,
        dateOfBirth: this.profileDob || undefined,
      });
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
