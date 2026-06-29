import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../core/services/provider.service';
import { Provider, Review } from '../../core/models/provider.model';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.scss']
})
export class ProviderProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);

  provider = signal<Provider | null>(null);
  reviews = signal<Review[]>([]);
  activeTab = signal<'gallery' | 'services' | 'reviews'>('gallery');
  selectedGalleryIndex = signal<number | null>(null);

  galleryGradients = [
    'linear-gradient(135deg, #C85A2E 0%, #E8A030 100%)',
    'linear-gradient(135deg, #4A7C59 0%, #C85A2E 100%)',
    'linear-gradient(135deg, #7B3F35 0%, #E8A030 100%)',
    'linear-gradient(135deg, #1C0A00 0%, #4A7C59 100%)',
    'linear-gradient(135deg, #E8A030 0%, #4A7C59 100%)',
    'linear-gradient(135deg, #A04420 0%, #1C0A00 100%)',
  ];

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const p = await this.providerService.getProviderById(id);
      this.provider.set(p);
      if (p) {
        const reviews = await this.providerService.getReviews(id);
        this.reviews.set(reviews);
      }
    }
  }

  get gradient(): string {
    const idx = parseInt(this.provider()?.id || '0', 10) - 1;
    return this.providerService.getAvatarGradient(idx);
  }

  get initials(): string {
    return this.providerService.getInitials(this.provider()?.name || '');
  }

  get availabilityDays(): { day: string; label: string; slot: { open: string; close: string; available: boolean } }[] {
    const p = this.provider();
    if (!p) return [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      label: labels[i],
      slot: (p.availability as any)[day],
    }));
  }

  get stars(): number[] {
    return [0, 1, 2, 3, 4];
  }

  isStarFilled(star: number, rating: number): boolean {
    return star + 1 <= Math.floor(rating);
  }

  isStarHalf(star: number, rating: number): boolean {
    return star + 1 === Math.ceil(rating) && !Number.isInteger(rating);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getReviewInitials(name: string): string {
    return this.providerService.getInitials(name);
  }

  getReviewGradient(index: number): string {
    return this.providerService.getAvatarGradient(index + 2);
  }
}
