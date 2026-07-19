import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationAutocompleteComponent } from '../../../shared/components/location-autocomplete/location-autocomplete.component';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { UploadService } from '../../../core/services/upload.service';
import { ApiService } from '../../../core/services/api.service';
import { Booking } from '../../../core/models/booking.model';
import { firstValueFrom } from 'rxjs';

interface ProviderService {
  id: string;
  name: string;
  description: string;
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
  isLoading   = signal(true);

  // Unique ENUM category values from admin-managed service types
  categoryOptions = computed(() =>
    [...new Set(this.serviceTypeOptions().map(s => s.category))].filter(Boolean)
  );
  isSaving         = signal(false);
  saveSuccess      = signal(false);
  uploadError      = signal('');
  profileSubmitted = signal(false);
  isUploading = signal(false);

  galleryImages  = signal<string[]>([]);
  bookings       = signal<Booking[]>([]);
  profileImage   = signal<string>('');
  providerId     = signal<string>('');
  isUploadingAvatar = signal(false);

  // Master service type list (from admin)
  serviceTypeOptions = signal<{ id: string; name: string; category: string }[]>([]);

  // Gallery lightbox
  lightboxIndex = signal<number | null>(null);

  // Services & Pricing
  services        = signal<ProviderService[]>([]);
  showServiceForm = signal(false);
  editingServiceId = signal<string | null>(null);
  serviceSaving   = signal(false);
  serviceError    = signal('');
  serviceForm = {
    name:        '',
    description: '',
    price:       0,
    currency:    'USD',
  };
  readonly currencies = ['USD', 'GBP', 'EUR', 'GHS', 'NGN', 'CAD', 'AUD'];

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

  stats = [
    { label: 'Total Bookings', value: '—', icon: 'fa-calendar-check', color: 'primary' },
    { label: 'This Month',     value: '—', icon: 'fa-calendar-day',   color: 'secondary' },
    { label: 'Rating',         value: '—', icon: 'fa-star',           color: 'sage' },
    { label: 'Revenue',        value: '—', icon: 'fa-dollar-sign',    color: 'primary' },
  ];

  profileForm = {
    bio:              '',
    tagline:          '',
    category:         'hair',
    city:             '',
    state:            '',
    country:          '',
    postcode:         '',
    address:          '',
    phoneCode:        '+1',
    phone:            '',
    years_experience: 0,
    dateOfBirth:      '',
    accountType:      'individual' as 'individual' | 'company',
    companyName:      '',
    taxId:            '',
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
    await Promise.all([this.loadProfile(), this.loadBookings(), this.loadServiceTypes()]);
    this.isLoading.set(false);
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
      this.profileForm.city             = provider.location?.city || '';
      this.profileForm.state            = provider.location?.state || '';
      this.profileForm.country          = provider.location?.country || '';
      this.profileForm.postcode         = provider.location?.postcode || '';
      this.profileForm.address          = provider.location?.address || '';
      this.profileForm.years_experience = provider.yearsExperience || 0;
      // Split stored phone into dial code + local number
      const rawPhone = provider.phone || '';
      const matched = [...this.phoneCodes]
        .sort((a, b) => b.code.length - a.code.length)
        .find(p => rawPhone.startsWith(p.code));
      if (matched) {
        this.profileForm.phoneCode = matched.code;
        this.profileForm.phone     = rawPhone.slice(matched.code.length).trim();
      } else {
        this.profileForm.phone = rawPhone;
      }
      this.profileForm.dateOfBirth  = provider.dateOfBirth  || '';
      this.profileForm.accountType  = provider.accountType  || 'individual';
      this.profileForm.companyName  = provider.companyName  || '';
      this.profileForm.taxId        = provider.taxId        || '';
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

  private async loadServiceTypes() {
    try {
      const list = await firstValueFrom(this.api.get<{ id: string; name: string; category: string }[]>('/service-types'));
      this.serviceTypeOptions.set(list);
    } catch { /* no master list yet — free text fallback */ }
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
    this.profileSubmitted.set(true);
    const f = this.profileForm;
    const missing: string[] = [];
    if (!f.bio.trim())                                      missing.push('Bio');
    if (!f.tagline.trim())                                  missing.push('Tagline');
    if (!f.category && this.categoryOptions().length > 0)   missing.push('Service Category');
    if (!f.city.trim())                                     missing.push('City');
    if (!f.country.trim())                                  missing.push('Country');
    if (!f.postcode.trim())                                 missing.push('Postcode');
    if (!f.address.trim())                                  missing.push('Full Address');
    if (!f.phone.trim())                                    missing.push('Phone Number');
    if (f.accountType === 'company' && !f.companyName.trim()) missing.push('Company Name');
    if (missing.length > 0) {
      this.uploadError.set(`Please complete all required fields: ${missing.join(', ')}`);
      return;
    }
    this.uploadError.set('');
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    try {
      const fullPhone = this.profileForm.phone.trim()
        ? `${this.profileForm.phoneCode}${this.profileForm.phone.trim()}`
        : '';
      await firstValueFrom(this.api.put('/providers/me', {
        bio:              this.profileForm.bio,
        tagline:          this.profileForm.tagline,
        category:         this.profileForm.category || undefined,
        city:             this.profileForm.city,
        state:            this.profileForm.state,
        country:          this.profileForm.country,
        postcode:         this.profileForm.postcode,
        address:          this.profileForm.address,
        years_experience: this.profileForm.years_experience,
        availability:     this.availability,
        dateOfBirth:      this.profileForm.dateOfBirth || '',
        accountType:      this.profileForm.accountType,
        companyName:      this.profileForm.companyName,
        taxId:            this.profileForm.taxId,
      }));
      if (fullPhone) {
        await firstValueFrom(this.api.put('/auth/profile', { phone: fullPhone }));
      }
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

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending:   'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };
    return map[status] || status;
  }

  getAvailabilitySlot(day: string) {
    return this.availability[day];
  }

  formatDate(d: string): string {
    return this.bookingService.formatDate(d);
  }

  formatCategory(cat: string): string {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
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
    this.serviceForm = { name: '', description: '', price: 0, currency: 'USD' };
    this.serviceError.set('');
    this.showServiceForm.set(true);
  }

  openEditService(s: ProviderService) {
    this.editingServiceId.set(s.id);
    this.serviceForm = { name: s.name, description: s.description, price: s.price, currency: s.currency };
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

  // ── Gallery lightbox ──────────────────────────────────────────────────────
  openLightbox(i: number)  { this.lightboxIndex.set(i); }
  closeLightbox()          { this.lightboxIndex.set(null); }
  prevImage() {
    const i = this.lightboxIndex();
    if (i === null) return;
    this.lightboxIndex.set(i > 0 ? i - 1 : this.galleryImages().length - 1);
  }
  nextImage() {
    const i = this.lightboxIndex();
    if (i === null) return;
    this.lightboxIndex.set(i < this.galleryImages().length - 1 ? i + 1 : 0);
  }
}
