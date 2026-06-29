import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationAutocompleteComponent } from '../../../shared/components/location-autocomplete/location-autocomplete.component';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { UploadService } from '../../../core/services/upload.service';
import { ApiService } from '../../../core/services/api.service';
import { SERVICE_CATEGORIES, ServiceCategory } from '../../../core/models/provider.model';
import { Booking } from '../../../core/models/booking.model';
import { firstValueFrom } from 'rxjs';

interface ProviderService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LocationAutocompleteComponent],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit {
  authService   = inject(AuthService);
  private route = inject(ActivatedRoute);
  private api   = inject(ApiService);
  private uploadService = inject(UploadService);
  private bookingService = inject(BookingService);

  activeTab   = signal<'overview' | 'bookings' | 'services' | 'gallery' | 'settings'>('overview');
  categories  = SERVICE_CATEGORIES;
  isSaving    = signal(false);
  saveSuccess = signal(false);
  uploadError = signal('');
  isUploading = signal(false);

  galleryImages  = signal<string[]>([]);
  bookings       = signal<Booking[]>([]);
  profileImage   = signal<string>('');
  providerId     = signal<string>('');
  isUploadingAvatar = signal(false);

  // Services & Pricing
  services        = signal<ProviderService[]>([]);
  showServiceForm = signal(false);
  editingServiceId = signal<string | null>(null);
  serviceSaving   = signal(false);
  serviceError    = signal('');
  serviceForm = {
    name:        '',
    description: '',
    duration:    60,
    price:       0,
    currency:    'USD',
  };
  readonly currencies = ['USD', 'GBP', 'EUR', 'GHS', 'NGN', 'CAD', 'AUD'];
  readonly durations  = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240];

  stats = [
    { label: 'Total Bookings', value: '—', icon: 'fa-calendar-check', color: 'primary' },
    { label: 'This Month',     value: '—', icon: 'fa-calendar-day',   color: 'secondary' },
    { label: 'Rating',         value: '—', icon: 'fa-star',           color: 'sage' },
    { label: 'Revenue',        value: '—', icon: 'fa-dollar-sign',    color: 'primary' },
  ];

  profileForm = {
    bio:             '',
    tagline:         '',
    category:        'hair' as ServiceCategory,
    instagram:       '',
    city:            '',
    state:           '',
    country:         '',
    years_experience: 0,
  };

  locationBannerDismissed = signal(false);
  hasLocation = computed(() => !!this.profileForm.city);

  availability: Record<string, { open: string; close: string; available: boolean }> = {
    monday:    { open: '09:00', close: '18:00', available: true  },
    tuesday:   { open: '09:00', close: '18:00', available: true  },
    wednesday: { open: '09:00', close: '18:00', available: true  },
    thursday:  { open: '09:00', close: '20:00', available: true  },
    friday:    { open: '09:00', close: '20:00', available: true  },
    saturday:  { open: '10:00', close: '16:00', available: true  },
    sunday:    { open: '',      close: '',       available: false },
  };

  availabilityDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  dayLabels: Record<string, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
  };

  async ngOnInit() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab) this.activeTab.set(tab as 'overview' | 'bookings' | 'services' | 'gallery' | 'settings');
    await Promise.all([this.loadProfile(), this.loadBookings()]);
  }

  private async loadProfile() {
    try {
      const uid = this.authService.currentUser()?.uid;
      if (!uid) return;
      const provider: any = await firstValueFrom(this.api.get(`/providers/me`));
      if (provider.id) this.providerId.set(provider.id);
      this.profileForm.bio              = provider.bio || '';
      this.profileForm.tagline          = provider.tagline || '';
      this.profileForm.category         = provider.category || 'hair';
      this.profileForm.instagram        = provider.instagram || '';
      this.profileForm.city             = provider.location?.city || '';
      this.profileForm.state            = provider.location?.state || '';
      this.profileForm.country          = provider.location?.country || '';
      this.profileForm.years_experience = provider.yearsExperience || 0;
      this.galleryImages.set(provider.galleryImages?.filter((u: string) => u) || []);
      if (provider.profileImage) this.profileImage.set(provider.profileImage);
      // Services come from the same /providers/me response — no separate GET needed
      if (Array.isArray(provider.services)) {
        this.services.set(provider.services);
      }
    } catch {
      // backend may not be running; keep defaults
    }
  }

  private async loadBookings() {
    try {
      const list = await this.bookingService.getProviderBookings();
      this.bookings.set(list);
      const total = list.length;
      const now = new Date();
      const thisMonth = list.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      const revenue = list
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.servicePrice, 0);

      this.stats[0].value = String(total);
      this.stats[1].value = String(thisMonth);
      this.stats[3].value = `$${revenue.toLocaleString()}`;
    } catch { /* keep dashes */ }
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.displayName || '';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  async onProfileImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const validation = this.uploadService.validateImageFile(file);
    if (!validation.valid) { this.uploadError.set(validation.error!); return; }
    this.uploadError.set('');
    this.isUploadingAvatar.set(true);

    try {
      const url = await this.uploadService.uploadProviderImage(file, 'profile');
      this.profileImage.set(url);
    } catch {
      const preview = this.uploadService.createObjectURL(file);
      this.profileImage.set(preview);
      this.uploadError.set('Preview only — will upload when server is connected.');
    } finally {
      this.isUploadingAvatar.set(false);
      input.value = '';
    }
  }

  async onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const validation = this.uploadService.validateImageFile(file);
    if (!validation.valid) { this.uploadError.set(validation.error!); return; }
    this.uploadError.set('');
    this.isUploading.set(true);

    try {
      const url = await this.uploadService.uploadProviderImage(file, 'gallery');
      this.galleryImages.update(imgs => [...imgs, url]);
    } catch {
      // backend offline — show preview only
      const preview = this.uploadService.createObjectURL(file);
      this.galleryImages.update(imgs => [...imgs, preview]);
      this.uploadError.set('Image saved locally. It will upload when the server is connected.');
    } finally {
      this.isUploading.set(false);
      input.value = '';
    }
  }

  async removeGalleryImage(index: number) {
    const url = this.galleryImages()[index];
    this.galleryImages.update(imgs => imgs.filter((_, i) => i !== index));
    if (url.startsWith('http')) {
      try { await this.uploadService.deleteGalleryImage(url); } catch { /* ignore */ }
    }
  }

  async saveSettings() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    try {
      await firstValueFrom(this.api.put('/providers/me', {
        ...this.profileForm,
        availability: this.availability,
      }));
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } catch {
      this.uploadError.set('Could not save settings. Make sure the backend server is running.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed') {
    try {
      await this.bookingService.updateBookingStatus(id, status);
      this.bookings.update(list =>
        list.map(b => b.id === id ? { ...b, status } : b)
      );
    } catch { /* ignore */ }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending:   'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed',
    };
    return map[status] || '';
  }

  getAvailabilitySlot(day: string) {
    return this.availability[day];
  }

  formatDate(d: string): string {
    return this.bookingService.formatDate(d);
  }

  // ── Services ──────────────────────────────────────────────────────────────
  private async refreshServices() {
    try {
      const list = await firstValueFrom(this.api.get<ProviderService[]>('/providers/me/services'));
      this.services.set(list);
    } catch { /* profile already populated services */ }
  }

  openAddService() {
    this.editingServiceId.set(null);
    this.serviceForm = { name: '', description: '', duration: 60, price: 0, currency: 'USD' };
    this.serviceError.set('');
    this.showServiceForm.set(true);
  }

  openEditService(s: ProviderService) {
    this.editingServiceId.set(s.id);
    this.serviceForm = { name: s.name, description: s.description, duration: s.duration, price: s.price, currency: s.currency };
    this.serviceError.set('');
    this.showServiceForm.set(true);
  }

  cancelServiceForm() {
    this.showServiceForm.set(false);
    this.editingServiceId.set(null);
  }

  async saveService() {
    if (!this.serviceForm.name.trim()) { this.serviceError.set('Service name is required.'); return; }
    if (this.serviceForm.price <= 0)   { this.serviceError.set('Price must be greater than 0.'); return; }
    this.serviceSaving.set(true);
    this.serviceError.set('');
    try {
      const id = this.editingServiceId();
      if (id) {
        await firstValueFrom(this.api.put(`/providers/me/services/${id}`, this.serviceForm));
        this.services.update(list => list.map(s => s.id === id ? { ...s, ...this.serviceForm } : s));
      } else {
        const res: any = await firstValueFrom(this.api.post('/providers/me/services', this.serviceForm));
        this.services.update(list => [...list, { id: res.id, ...this.serviceForm }]);
      }
      this.showServiceForm.set(false);
      this.editingServiceId.set(null);
    } catch (e: any) {
      this.serviceError.set(e?.error?.error || 'Could not save service. Try again.');
    } finally {
      this.serviceSaving.set(false);
    }
  }

  async deleteService(id: string) {
    if (!confirm('Remove this service? Clients will no longer see it.')) return;
    try {
      await firstValueFrom(this.api.delete(`/providers/me/services/${id}`));
      this.services.update(list => list.filter(s => s.id !== id));
    } catch { /* ignore */ }
  }

  formatDuration(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }
}
