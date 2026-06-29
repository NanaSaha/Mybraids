import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../core/services/provider.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Provider, ServiceOffering } from '../../core/models/provider.model';
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

  provider = signal<Provider | null>(null);
  currentStep = signal<Step>(1);
  isSubmitting = signal(false);
  isSuccess = signal(false);
  bookingId = signal('');

  selectedService = signal<ServiceOffering | null>(null);
  selectedDate = signal('');
  selectedTime = signal('');

  clientName = '';
  clientPhone = '';
  clientEmail = '';
  notes = '';

  availableTimeSlots = signal<string[]>([]);

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
    // Handle "2000-01-01 09:00:00 +0100" → "09:00"
    const match = t.match(/\b(\d{2}:\d{2})\b/g);
    if (match) return match[match.length > 1 ? 1 : 0];
    return t.slice(0, 5);
  }

  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('providerId');
    if (id) {
      const p = await this.providerService.getProviderById(id);
      this.provider.set(p);
    }
    const user = this.authService.currentUser();
    if (user) {
      this.clientName = user.displayName;
      this.clientEmail = user.email;
      this.clientPhone = user.phone;
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

    // If no availability data at all for this provider, fall back to open hours
    const open  = slot?.open  || '09:00';
    const close = slot?.close || '18:00';
    const isOpen = slot ? (slot.available === true || slot.available === 1) : true;

    if (isOpen && open && close) {
      this.availableTimeSlots.set(
        this.bookingService.generateTimeSlots(open, close, svc.duration)
      );
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

  goToStep(step: number) {
    if (step > this.currentStep() + 1) return;
    this.currentStep.set(step as Step);
  }

  nextStep() {
    const s = this.currentStep();
    if (s < 4) this.currentStep.set((s + 1) as Step);
  }

  prevStep() {
    const s = this.currentStep();
    if (s > 1) this.currentStep.set((s - 1) as Step);
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1: return !!this.selectedService();
      case 2: return !!this.selectedDate() && !!this.selectedTime();
      case 3: return !!this.clientName && !!this.clientEmail;
      default: return true;
    }
  }

  async confirmBooking() {
    const p = this.provider();
    const svc = this.selectedService();
    if (!p || !svc) return;

    this.isSubmitting.set(true);
    try {
      const id = await this.bookingService.createBooking({
        providerId: p.id,
        serviceId: svc.id,
        date: this.selectedDate(),
        time: this.selectedTime(),
        notes: this.notes,
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
