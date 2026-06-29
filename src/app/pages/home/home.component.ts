import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProviderService } from '../../core/services/provider.service';
import { ApiService } from '../../core/services/api.service';
import { Provider, SERVICE_CATEGORIES } from '../../core/models/provider.model';
import { ProviderCardComponent } from '../../shared/components/provider-card/provider-card.component';
import { LocationAutocompleteComponent } from '../../shared/components/location-autocomplete/location-autocomplete.component';
import { firstValueFrom, catchError, of } from 'rxjs';

interface LocationEntry {
  city: string;
  country: string;
  count: number;
  categories: string[];
}

// Curated fallback cities shown before any providers have set their location
const CURATED_LOCATIONS: LocationEntry[] = [
  { city: 'Lagos',        country: 'Nigeria',      count: 0, categories: ['hair','makeup','nails'] },
  { city: 'London',       country: 'UK',           count: 0, categories: ['hair','makeup','eyelashes'] },
  { city: 'Accra',        country: 'Ghana',        count: 0, categories: ['hair','makeup'] },
  { city: 'New York',     country: 'USA',          count: 0, categories: ['hair','makeup','nails','eyelashes'] },
  { city: 'Nairobi',      country: 'Kenya',        count: 0, categories: ['hair','makeup'] },
  { city: 'Paris',        country: 'France',       count: 0, categories: ['hair','makeup','skincare'] },
  { city: 'Toronto',      country: 'Canada',       count: 0, categories: ['hair','makeup','nails'] },
  { city: 'Johannesburg', country: 'South Africa', count: 0, categories: ['hair','makeup'] },
  { city: 'Dubai',        country: 'UAE',          count: 0, categories: ['makeup','skincare','eyelashes'] },
  { city: 'Amsterdam',    country: 'Netherlands',  count: 0, categories: ['hair','makeup'] },
  { city: 'Abuja',        country: 'Nigeria',      count: 0, categories: ['hair','makeup','nails'] },
  { city: 'Manchester',   country: 'UK',           count: 0, categories: ['hair','makeup','eyelashes'] },
];

const CATEGORY_LABELS: Record<string, string> = {
  hair: 'Hair', makeup: 'Makeup', eyelashes: 'Lashes',
  nails: 'Nails', skincare: 'Skincare', other: 'Other',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ProviderCardComponent, LocationAutocompleteComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private providerService = inject(ProviderService);
  private api             = inject(ApiService);
  private router          = inject(Router);

  searchLocation  = '';
  searchCategory  = '';
  featuredProviders = signal<Provider[]>([]);
  categories = SERVICE_CATEGORIES;

  // Location browsing
  locationData    = signal<LocationEntry[]>([]);
  selectedCountry = signal<string>('All');
  locationsLoading = signal(true);

  countries = computed(() => {
    const unique = ['All', ...new Set(this.locationData().map(l => l.country))];
    return unique;
  });

  filteredLocations = computed(() => {
    const all = this.locationData();
    const sel = this.selectedCountry();
    return sel === 'All' ? all : all.filter(l => l.country === sel);
  });

  categoryLabel(cat: string) { return CATEGORY_LABELS[cat] ?? cat; }

  testimonials = [
    {
      name: 'Ama Owusu', location: 'Accra, Ghana', rating: 5,
      text: 'MyBraids completely changed how I find stylists when I travel. I visited London and found an amazing braider within 5 minutes. The booking was seamless!',
      service: 'Box Braids', initials: 'AO',
      gradient: 'linear-gradient(135deg, #C85A2E 0%, #E8A030 100%)',
    },
    {
      name: 'Chioma Okafor', location: 'London, UK', rating: 5,
      text: 'As a working mum, I love how easy it is to schedule appointments around my schedule. The providers are all verified and professional. 10/10 experience.',
      service: 'Makeup & Lashes', initials: 'CO',
      gradient: 'linear-gradient(135deg, #4A7C59 0%, #E8A030 100%)',
    },
    {
      name: 'Yetunde Balogun', location: 'Lagos, Nigeria', rating: 5,
      text: 'I signed up as a provider 6 months ago and my bookings have tripled! MyBraids has connected me with international clients I never would have reached otherwise.',
      service: 'Hair Stylist', initials: 'YB',
      gradient: 'linear-gradient(135deg, #7B3F35 0%, #C85A2E 100%)',
    },
  ];

  stats = [
    { value: '12,000+', label: 'Talented Artists', icon: 'fa-users' },
    { value: '85+',     label: 'Countries',         icon: 'fa-globe-africa' },
    { value: '1M+',     label: 'Bookings Made',     icon: 'fa-calendar-check' },
    { value: '4.9★',   label: 'Average Rating',    icon: 'fa-star' },
  ];

  howItWorks = [
    { step: '01', icon: 'fa-search', title: 'Search & Discover',
      description: 'Search by location, service type, or specialty. Browse verified profiles with portfolios and real reviews.' },
    { step: '02', icon: 'fa-heart', title: 'Choose Your Artist',
      description: 'Explore galleries, read authentic reviews, check availability, and find the perfect match for your style.' },
    { step: '03', icon: 'fa-calendar-check', title: 'Book Instantly',
      description: 'Select your date and time, confirm your appointment in seconds, and look forward to your transformation.' },
  ];

  providerBenefits = [
    { icon: 'fa-globe',        text: 'Reach clients globally' },
    { icon: 'fa-calendar',     text: 'Manage your schedule easily' },
    { icon: 'fa-images',       text: 'Showcase your portfolio' },
    { icon: 'fa-shield-check', text: 'Get verified badge' },
    { icon: 'fa-chart-line',   text: 'Grow your business' },
    { icon: 'fa-bell',         text: 'Real-time booking alerts' },
  ];

  async ngOnInit() {
    await Promise.all([this.loadFeatured(), this.loadLocations()]);
  }

  private async loadFeatured() {
    const providers = await this.providerService.getFeaturedProviders();
    this.featuredProviders.set(providers);
  }

  private async loadLocations() {
    try {
      const data = await firstValueFrom(
        this.api.get<LocationEntry[]>('/providers/locations').pipe(
          catchError(() => of([] as LocationEntry[]))
        )
      );
      // Use real DB data if available, otherwise fall back to curated list
      this.locationData.set(data.length > 0 ? data : CURATED_LOCATIONS);
    } finally {
      this.locationsLoading.set(false);
    }
  }

  onSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        location: this.searchLocation || null,
        category: this.searchCategory || null,
      }
    });
  }

  searchByCity(city: string, category?: string) {
    this.router.navigate(['/search'], {
      queryParams: { location: city, category: category || null }
    });
  }

  getStars(): number[] { return [0, 1, 2, 3, 4]; }

  isStarFilled(star: number, rating: number): boolean { return star < rating; }

  getInitials(name: string): string { return this.providerService.getInitials(name); }

  getGradient(index: number): string { return this.providerService.getAvatarGradient(index); }
}
