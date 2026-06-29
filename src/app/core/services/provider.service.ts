import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Provider, Review, ServiceCategory } from '../models/provider.model';

export interface SearchFilters {
  location?: string;
  category?: ServiceCategory | '';
  minRating?: number;
  maxPrice?: number;
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'newest';
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private api = inject(ApiService);

  async getFeaturedProviders(): Promise<Provider[]> {
    return firstValueFrom(
      this.api.get<Provider[]>('/providers/featured').pipe(
        catchError(() => of(this.mockFeatured()))
      )
    );
  }

  async searchProviders(filters: SearchFilters): Promise<Provider[]> {
    const params: Record<string, string> = {};
    if (filters.location)  params['location']  = filters.location;
    if (filters.category)  params['category']  = filters.category;
    if (filters.minRating) params['minRating']  = String(filters.minRating);
    if (filters.maxPrice)  params['maxPrice']   = String(filters.maxPrice);
    if (filters.sortBy)    params['sortBy']     = filters.sortBy;

    return firstValueFrom(
      this.api.get<Provider[]>('/providers', params).pipe(
        catchError(() => of(this.mockSearch(filters)))
      )
    );
  }

  async getProviderById(id: string): Promise<Provider | null> {
    return firstValueFrom(
      this.api.get<Provider>(`/providers/${id}`).pipe(
        catchError(() => of(this.mockProviders.find(p => p.id === id) ?? null))
      )
    );
  }

  async getReviews(providerId: string): Promise<Review[]> {
    return firstValueFrom(
      this.api.get<Review[]>(`/providers/${providerId}/reviews`).pipe(
        catchError(() => of(this.mockReviews[providerId] ?? []))
      )
    );
  }

  async submitReview(providerId: string, data: { rating: number; comment: string; serviceProvided: string; bookingId?: string }): Promise<void> {
    await firstValueFrom(this.api.post(`/providers/${providerId}/reviews`, data));
  }

  getAvatarGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #C85A2E 0%, #E8A030 100%)',
      'linear-gradient(135deg, #4A7C59 0%, #E8A030 100%)',
      'linear-gradient(135deg, #7B3F35 0%, #C85A2E 100%)',
      'linear-gradient(135deg, #1C0A00 0%, #4A7C59 100%)',
      'linear-gradient(135deg, #E8A030 0%, #C85A2E 100%)',
      'linear-gradient(135deg, #A04420 0%, #E8A030 100%)',
    ];
    return gradients[index % gradients.length];
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  // ── Mock data fallback (shown when backend is offline) ───────────────

  private mockFeatured(): Provider[] {
    return this.mockProviders.filter(p => p.featured).slice(0, 6);
  }

  private mockSearch(filters: SearchFilters): Provider[] {
    let results = [...this.mockProviders];
    if (filters.category) results = results.filter(p => p.category === filters.category);
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(p =>
        p.location.city.toLowerCase().includes(loc) ||
        p.location.country.toLowerCase().includes(loc)
      );
    }
    if (filters.minRating) results = results.filter(p => p.rating >= filters.minRating!);
    if (filters.maxPrice)  results = results.filter(p => p.startingPrice <= filters.maxPrice!);
    switch (filters.sortBy) {
      case 'rating':     results.sort((a, b) => b.rating - a.rating); break;
      case 'price_asc':  results.sort((a, b) => a.startingPrice - b.startingPrice); break;
      case 'price_desc': results.sort((a, b) => b.startingPrice - a.startingPrice); break;
      case 'newest':     results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
    }
    return results;
  }

  private mockProviders: Provider[] = [
    {
      id: '1', userId: 'u1', name: 'Amara Diallo',
      bio: 'Master hair braider with 12 years of experience specializing in protective styles, knotless braids, and traditional African weaving techniques.',
      tagline: 'Where art meets tradition', category: 'hair',
      specialties: ['Box Braids', 'Knotless Braids', 'Cornrows', 'Senegalese Twists', 'Faux Locs'],
      location: { city: 'Accra', state: 'Greater Accra', country: 'Ghana', address: '14 Independence Ave', lat: 5.5913, lng: -0.1969 },
      profileImage: '', galleryImages: ['', '', '', '', '', ''],
      services: [
        { id: 's1', name: 'Knotless Box Braids', description: 'Medium length, all hair included', duration: 240, price: 120, currency: 'USD' },
        { id: 's2', name: 'Cornrows', description: 'Custom designs, scalp care included', duration: 90, price: 60, currency: 'USD' },
        { id: 's3', name: 'Senegalese Twists', description: 'Waist length, all hair included', duration: 300, price: 150, currency: 'USD' },
      ],
      availability: {
        monday: { open: '09:00', close: '18:00', available: true }, tuesday: { open: '09:00', close: '18:00', available: true },
        wednesday: { open: '09:00', close: '18:00', available: true }, thursday: { open: '09:00', close: '20:00', available: true },
        friday: { open: '09:00', close: '20:00', available: true }, saturday: { open: '10:00', close: '16:00', available: true },
        sunday: { open: '', close: '', available: false },
      },
      rating: 4.9, reviewCount: 127, startingPrice: 60, currency: 'USD', verified: true, featured: true,
      yearsExperience: 12, instagram: '@amara.braids', createdAt: new Date('2023-01-15'), updatedAt: new Date(),
    },
    {
      id: '2', userId: 'u2', name: 'Fatima Ouédraogo',
      bio: 'Celebrity makeup artist based in Lagos. Trained in Paris and New York, specializing in bridal glam and editorial looks.',
      tagline: 'Beauty for every shade', category: 'makeup',
      specialties: ['Bridal Glam', 'Editorial', 'Natural Glow', 'Contouring', 'Airbrush'],
      location: { city: 'Lagos', state: 'Lagos', country: 'Nigeria', address: 'Victoria Island', lat: 6.4281, lng: 3.4219 },
      profileImage: '', galleryImages: ['', '', '', '', '', ''],
      services: [
        { id: 's1', name: 'Bridal Makeup', description: 'Full glam with lashes, 8-hour wear', duration: 120, price: 200, currency: 'USD' },
        { id: 's2', name: 'Evening Glam', description: 'Flawless full-face for events', duration: 60, price: 100, currency: 'USD' },
        { id: 's3', name: 'Natural Glow', description: 'Dewy skin, defined features', duration: 45, price: 75, currency: 'USD' },
      ],
      availability: {
        monday: { open: '10:00', close: '19:00', available: true }, tuesday: { open: '10:00', close: '19:00', available: true },
        wednesday: { open: '10:00', close: '19:00', available: true }, thursday: { open: '10:00', close: '19:00', available: true },
        friday: { open: '10:00', close: '21:00', available: true }, saturday: { open: '09:00', close: '21:00', available: true },
        sunday: { open: '11:00', close: '17:00', available: true },
      },
      rating: 4.8, reviewCount: 94, startingPrice: 75, currency: 'USD', verified: true, featured: true,
      yearsExperience: 8, instagram: '@fatima.glam', createdAt: new Date('2023-03-10'), updatedAt: new Date(),
    },
    {
      id: '3', userId: 'u3', name: 'Zara Mensah',
      bio: 'Precision lash artist and brow architect with an eye for detail. Every set is customized for your eye shape.',
      tagline: 'Frame your beauty', category: 'eyelashes',
      specialties: ['Classic Lashes', 'Volume Lashes', 'Hybrid Sets', 'Brow Lamination', 'Tinting'],
      location: { city: 'London', state: 'England', country: 'United Kingdom', address: 'Brixton, SW9', lat: 51.4613, lng: -0.1156 },
      profileImage: '', galleryImages: ['', '', '', '', '', ''],
      services: [
        { id: 's1', name: 'Classic Full Set', description: 'Natural 1:1 extension application', duration: 90, price: 85, currency: 'GBP' },
        { id: 's2', name: 'Volume Full Set', description: '2D-6D fan application for drama', duration: 120, price: 110, currency: 'GBP' },
        { id: 's3', name: 'Hybrid Set', description: 'Mix of classic and volume fans', duration: 105, price: 95, currency: 'GBP' },
        { id: 's4', name: 'Infill (2-3 weeks)', description: 'Maintenance fill appointment', duration: 60, price: 55, currency: 'GBP' },
      ],
      availability: {
        monday: { open: '', close: '', available: false }, tuesday: { open: '10:00', close: '18:00', available: true },
        wednesday: { open: '10:00', close: '18:00', available: true }, thursday: { open: '10:00', close: '20:00', available: true },
        friday: { open: '10:00', close: '20:00', available: true }, saturday: { open: '09:00', close: '18:00', available: true },
        sunday: { open: '10:00', close: '15:00', available: true },
      },
      rating: 4.9, reviewCount: 203, startingPrice: 55, currency: 'GBP', verified: true, featured: true,
      yearsExperience: 5, instagram: '@zara.lashes', createdAt: new Date('2023-02-20'), updatedAt: new Date(),
    },
    {
      id: '4', userId: 'u4', name: 'Aisha Kamara',
      bio: 'Versatile hairstylist from Dakar, now serving the Toronto community. Expert in natural hair care and loc maintenance.',
      tagline: 'Embrace your crown', category: 'hair',
      specialties: ['Loc Maintenance', 'Natural Hair', 'Children\'s Braids', 'Twists', 'Crochet Styles'],
      location: { city: 'Toronto', state: 'Ontario', country: 'Canada', address: 'Scarborough, ON', lat: 43.7731, lng: -79.2574 },
      profileImage: '', galleryImages: ['', '', '', '', '', ''],
      services: [
        { id: 's1', name: 'Loc Retwist', description: 'Full head retwist, palm-rolling technique', duration: 180, price: 90, currency: 'CAD' },
        { id: 's2', name: 'Crochet Braids', description: 'Any style, hair not included', duration: 120, price: 70, currency: 'CAD' },
        { id: 's3', name: 'Kids Braids', description: 'For children under 12', duration: 90, price: 55, currency: 'CAD' },
      ],
      availability: {
        monday: { open: '10:00', close: '18:00', available: true }, tuesday: { open: '10:00', close: '18:00', available: true },
        wednesday: { open: '', close: '', available: false }, thursday: { open: '10:00', close: '18:00', available: true },
        friday: { open: '10:00', close: '18:00', available: true }, saturday: { open: '09:00', close: '17:00', available: true },
        sunday: { open: '', close: '', available: false },
      },
      rating: 4.7, reviewCount: 88, startingPrice: 55, currency: 'CAD', verified: true, featured: false,
      yearsExperience: 9, instagram: '@aisha.hair_to', createdAt: new Date('2023-05-01'), updatedAt: new Date(),
    },
    {
      id: '5', userId: 'u5', name: 'Nkechi Obi',
      bio: 'Nail artist with a passion for intricate nail art inspired by Afrocentric patterns and bold colors.',
      tagline: 'Nails as bold as you are', category: 'nails',
      specialties: ['Gel Extensions', 'Nail Art', 'Acrylic Sets', 'Ombre', 'African Prints'],
      location: { city: 'Abuja', state: 'FCT', country: 'Nigeria', address: 'Wuse 2', lat: 9.0765, lng: 7.3986 },
      profileImage: '', galleryImages: ['', '', '', '', '', ''],
      services: [
        { id: 's1', name: 'Full Gel Set', description: 'Gel extensions with nail art', duration: 120, price: 45, currency: 'USD' },
        { id: 's2', name: 'Acrylic Full Set', description: 'Custom shape and length', duration: 90, price: 35, currency: 'USD' },
        { id: 's3', name: 'Nail Art Only', description: 'On existing nails or extensions', duration: 60, price: 25, currency: 'USD' },
      ],
      availability: {
        monday: { open: '09:00', close: '17:00', available: true }, tuesday: { open: '09:00', close: '17:00', available: true },
        wednesday: { open: '09:00', close: '17:00', available: true }, thursday: { open: '09:00', close: '17:00', available: true },
        friday: { open: '09:00', close: '19:00', available: true }, saturday: { open: '10:00', close: '18:00', available: true },
        sunday: { open: '', close: '', available: false },
      },
      rating: 4.8, reviewCount: 156, startingPrice: 25, currency: 'USD', verified: false, featured: true,
      yearsExperience: 6, instagram: '@nkechi.nails', createdAt: new Date('2023-07-12'), updatedAt: new Date(),
    },
    {
      id: '6', userId: 'u6', name: 'Grace Adekunle',
      bio: 'Bridal and event makeup specialist in New York City. Every face tells a story — let me help you tell yours beautifully.',
      tagline: 'Flawless for every moment', category: 'makeup',
      specialties: ['Bridal', 'Prom', 'Film & TV', 'Mature Skin', 'Dark Complexions'],
      location: { city: 'New York', state: 'New York', country: 'United States', address: 'Harlem, NY 10027', lat: 40.8116, lng: -73.9465 },
      profileImage: '', galleryImages: ['', '', '', '', '', ''],
      services: [
        { id: 's1', name: 'Bridal Package', description: 'Trial + wedding day, includes lashes', duration: 180, price: 350, currency: 'USD' },
        { id: 's2', name: 'Event Makeup', description: 'Full face for parties and events', duration: 60, price: 120, currency: 'USD' },
        { id: 's3', name: 'Skin Prep & Makeup', description: 'Skincare + flawless base', duration: 75, price: 140, currency: 'USD' },
      ],
      availability: {
        monday: { open: '', close: '', available: false }, tuesday: { open: '11:00', close: '19:00', available: true },
        wednesday: { open: '11:00', close: '19:00', available: true }, thursday: { open: '11:00', close: '19:00', available: true },
        friday: { open: '09:00', close: '21:00', available: true }, saturday: { open: '08:00', close: '21:00', available: true },
        sunday: { open: '10:00', close: '18:00', available: true },
      },
      rating: 5.0, reviewCount: 72, startingPrice: 120, currency: 'USD', verified: true, featured: true,
      yearsExperience: 11, instagram: '@grace.glam.nyc', createdAt: new Date('2023-04-05'), updatedAt: new Date(),
    },
  ];

  private mockReviews: { [providerId: string]: Review[] } = {
    '1': [
      { id: 'r1', providerId: '1', clientId: 'c1', clientName: 'Kezia Asante', clientPhoto: '', rating: 5, comment: 'Amara is absolutely incredible! My knotless braids lasted 8 weeks and still looked fresh.', serviceProvided: 'Knotless Box Braids', createdAt: new Date('2024-02-10') },
      { id: 'r2', providerId: '1', clientId: 'c2', clientName: 'Yaa Boateng', clientPhoto: '', rating: 5, comment: 'Super professional, great with detail. The cornrows design was exactly what I wanted.', serviceProvided: 'Cornrows', createdAt: new Date('2024-01-22') },
      { id: 'r3', providerId: '1', clientId: 'c3', clientName: 'Abena Dankwa', clientPhoto: '', rating: 4, comment: 'Beautiful twists, the texture looks so natural. Took a bit longer but the result was perfect.', serviceProvided: 'Senegalese Twists', createdAt: new Date('2024-01-08') },
    ],
    '2': [
      { id: 'r4', providerId: '2', clientId: 'c4', clientName: 'Folake Adeleke', clientPhoto: '', rating: 5, comment: 'Fatima did my bridal makeup and I felt like a queen! She understood exactly the look I wanted.', serviceProvided: 'Bridal Makeup', createdAt: new Date('2024-02-14') },
      { id: 'r5', providerId: '2', clientId: 'c5', clientName: 'Sade Bello', clientPhoto: '', rating: 5, comment: 'Fatima\'s skill with dark skin tones is unmatched. The glow was everything!', serviceProvided: 'Natural Glow', createdAt: new Date('2024-01-30') },
    ],
  };
}
