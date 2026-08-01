import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../core/services/provider.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Provider, ServiceOffering } from '../../core/models/provider.model';
import { ApiService } from '../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

type Step = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private providerService = inject(ProviderService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private api = inject(ApiService);

  provider = signal<Provider | null>(null);
  currentStep = signal<Step>(1);
  isSubmitting = signal(false);
  isSuccess = signal(false);
  bookingId = signal('');
  stepAttempted = signal(false);

  selectedService = signal<ServiceOffering | null>(null);
  selectedDate = signal('');
  selectedTime = signal('');
  selectedPaymentMethod = signal('');
  bookedSlots = signal<{ date: string; time: string }[]>([]);

  clientName = '';
  clientPhone = '';
  clientPhoneCode = '+44';
  clientEmail = '';
  clientLocation = '';
  notes = '';
  hairType = '';

  readonly paymentMethods = [
    { id: 'card',     label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: '💳' },
    { id: 'paypal',   label: 'PayPal',               desc: 'Pay via PayPal account', icon: '🅿️' },
    { id: 'sepa',     label: 'Bank Transfer',         desc: 'SEPA / IBAN transfer',  icon: '🏦' },
    { id: 'cash',     label: 'Cash',                  desc: 'Pay in person',          icon: '💵' },
  ];

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

  availableTimeSlots = signal<string[]>([]);

  showHairTypeOption = computed(() => {
    const name = (this.selectedService()?.name ?? '').toLowerCase();
    return /hair|cornrow|braid/.test(name);
  });

  private readonly dayNames = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  private readonly dayLabels: Record<string, string> = {
    monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu',
    friday:'Fri', saturday:'Sat', sunday:'Sun',
  };

  availabilityDays = computed(() => {
    const avail = (this.provider() as any)?.availability ?? {};
    return this.dayNames.map(day => {
      const slot = avail[day];
      const isOpen = slot ? (slot.available === true || slot.available === 1) : true;
      return {
        day,
        label: this.dayLabels[day],
        open: isOpen,
        openTime:  this.fmtTime(slot?.open  ?? '09:00'),
        closeTime: this.fmtTime(slot?.close ?? '18:00'),
      };
    });
  });

  private fmtTime(t: string): string {
    if (!t) return '';
    const match = t.match(/\b(\d{2}:\d{2})\b/g);
    if (match) return match[match.length > 1 ? 1 : 0];
    return t.slice(0, 5);
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('providerId');
    if (id) {
      const p = await this.providerService.getProviderById(id);
      this.provider.set(p);
      try {
        const slots = await firstValueFrom(this.api.get<{ date: string; time: string }[]>(`/providers/${id}/booked-dates`));
        this.bookedSlots.set(slots);
      } catch { /* non-critical — proceed without booked dates */ }
    }
    const user = this.authService.currentUser();
    if (user) {
      this.clientName = user.displayName;
      this.clientEmail = user.email;
      // Parse country code out of stored phone
      const rawPhone = user.phone || '';
      const matched = [...this.phoneCodes]
        .sort((a, b) => b.code.length - a.code.length)
        .find(p => rawPhone.startsWith(p.code));
      if (matched) {
        this.clientPhoneCode = matched.code;
        this.clientPhone = rawPhone.slice(matched.code.length).trim();
      } else {
        this.clientPhone = rawPhone;
      }
    }
  }

  selectService(service: ServiceOffering) {
    this.selectedService.set(service);
  }

  onDateChange() {
    const p = this.provider();
    const svc = this.selectedService();
    if (!p || !svc || !this.selectedDate()) return;

    const day = new Date(this.selectedDate() + 'T00:00:00')
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const avail = (p as any).availability ?? {};
    const slot  = avail[day];

    const open   = slot?.open  || '09:00';
    const close  = slot?.close || '18:00';
    const isOpen = slot ? (slot.available === true || slot.available === 1) : true;

    if (isOpen && open && close) {
      let slots = this.bookingService.generateTimeSlots(open, close, svc.duration || 60);

      // Filter out times that have already passed if booking today
      const today = new Date().toISOString().split('T')[0];
      if (this.selectedDate() === today) {
        const now = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();
        slots = slots.filter(t => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m > nowMins;
        });
      }

      // Filter out time slots already confirmed for this provider
      const confirmedTimes = new Set(
        this.bookedSlots()
          .filter(s => s.date === this.selectedDate())
          .map(s => s.time)
      );
      slots = slots.filter(t => !confirmedTimes.has(t));

      this.availableTimeSlots.set(slots);
    } else {
      this.availableTimeSlots.set([]);
    }
    this.selectedTime.set('');
  }

  isDateDisabled(dateStr: string): boolean {
    const p = this.provider();
    if (!p || !dateStr) return false;
    const day = new Date(dateStr + 'T00:00:00')
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    const avail = (p as any).availability ?? {};
    const slot  = avail[day];
    if (!slot) return false;
    return !(slot.available === true || slot.available === 1);
  }

  isStepLocked(step: number): boolean {
    return step > this.currentStep();
  }

  goToStep(step: number) {
    const current = this.currentStep();
    if (step === current) return;
    if (step < current) {
      this.stepAttempted.set(false);
      this.currentStep.set(step as Step);
      return;
    }
    // Going forward: only one step at a time, only if current is complete
    if (step === current + 1 && this.canProceed()) {
      this.stepAttempted.set(false);
      this.currentStep.set(step as Step);
    } else {
      this.stepAttempted.set(true);
    }
  }

  tryNextStep() {
    if (this.canProceed()) {
      this.stepAttempted.set(false);
      this.nextStep();
    } else {
      this.stepAttempted.set(true);
    }
  }

  nextStep() {
    const s = this.currentStep();
    if (s < 4) this.currentStep.set((s + 1) as Step);
  }

  prevStep() {
    const s = this.currentStep();
    if (s > 1) {
      this.stepAttempted.set(false);
      this.currentStep.set((s - 1) as Step);
    }
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1: return !!this.selectedService();
      case 2: return !!this.selectedDate() && !!this.selectedTime();
      case 3: return !!this.clientName && !!this.clientEmail && !!this.clientPhone.trim() && !!this.clientLocation.trim();
      case 4: return !!this.selectedPaymentMethod();
      default: return true;
    }
  }

  async confirmBooking() {
    const p = this.provider();
    const svc = this.selectedService();
    if (!p || !svc) return;

    const pm = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod());
    const paymentLabel = pm ? pm.label : this.selectedPaymentMethod();

    this.isSubmitting.set(true);
    try {
      const id = await this.bookingService.createBooking({
        providerId: p.id,
        serviceId: svc.id,
        date: this.selectedDate(),
        time: this.selectedTime(),
        notes: this.notes,
        clientPhone: `${this.clientPhoneCode}${this.clientPhone.trim()}`,
        clientLocation: this.clientLocation,
        hairType: this.showHairTypeOption() ? this.hairType : '',
        paymentMethod: paymentLabel,
      });
      this.bookingId.set(id);
      this.isSuccess.set(true);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatDate(d: string): string {
    return this.bookingService.formatDate(d);
  }

  getGradient(): string {
    return this.providerService.getAvatarGradient(0);
  }

  getInitials(): string {
    return this.providerService.getInitials(this.provider()?.name || '');
  }
}
