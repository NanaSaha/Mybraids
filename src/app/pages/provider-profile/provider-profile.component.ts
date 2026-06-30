import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProviderService } from '../../core/services/provider.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Provider, Review } from '../../core/models/provider.model';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.scss']
})
export class ProviderProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);
  authService = inject(AuthService);
  private api = inject(ApiService);

  provider = signal<Provider | null>(null);
  reviews  = signal<Review[]>([]);
  activeTab = signal<'gallery' | 'services' | 'reviews'>('gallery');
  selectedGalleryIndex = signal<number | null>(null);

  // Review form
  reviewRating   = signal(0);
  reviewHover    = signal(0);
  reviewComment  = signal('');
  reviewService  = signal('');
  reviewSaving   = signal(false);
  reviewSuccess  = signal(false);
  reviewError    = signal('');

  get canReview(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.role === 'provider' || user.role === 'admin') return false;
    return true;
  }

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

  async submitReview() {
    if (this.reviewRating() === 0) { this.reviewError.set('Please select a star rating.'); return; }
    if (!this.reviewComment().trim()) { this.reviewError.set('Please write a comment.'); return; }

    this.reviewSaving.set(true);
    this.reviewError.set('');
    try {
      await firstValueFrom(this.api.post(`/providers/${this.provider()!.id}/reviews`, {
        rating:          this.reviewRating(),
        comment:         this.reviewComment().trim(),
        serviceProvided: this.reviewService().trim(),
      }));
      // Refresh reviews list
      const updated = await this.providerService.getReviews(this.provider()!.id);
      this.reviews.set(updated);
      // Reset form
      this.reviewRating.set(0);
      this.reviewComment.set('');
      this.reviewService.set('');
      this.reviewSuccess.set(true);
      setTimeout(() => this.reviewSuccess.set(false), 4000);
    } catch (e: any) {
      this.reviewError.set(e?.error?.error || 'Failed to submit review. Please try again.');
    } finally {
      this.reviewSaving.set(false);
    }
  }
}
