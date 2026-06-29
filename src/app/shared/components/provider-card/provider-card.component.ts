import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Provider } from '../../../core/models/provider.model';
import { ProviderService } from '../../../core/services/provider.service';

@Component({
  selector: 'app-provider-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './provider-card.component.html',
  styleUrls: ['./provider-card.component.scss']
})
export class ProviderCardComponent {
  @Input({ required: true }) provider!: Provider;
  @Input() index = 0;

  constructor(private providerService: ProviderService) {}

  get gradient(): string {
    return this.providerService.getAvatarGradient(this.index);
  }

  get initials(): string {
    return this.providerService.getInitials(this.provider.name);
  }

  get categoryIcon(): string {
    const icons: Record<string, string> = {
      hair: 'fa-scissors',
      makeup: 'fa-palette',
      eyelashes: 'fa-eye',
      nails: 'fa-hand-sparkles',
      skincare: 'fa-spa',
    };
    return icons[this.provider.category] || 'fa-star';
  }

  get categoryLabel(): string {
    const labels: Record<string, string> = {
      hair: 'Hair Artist',
      makeup: 'Makeup Artist',
      eyelashes: 'Lash Tech',
      nails: 'Nail Artist',
      skincare: 'Skincare',
    };
    return labels[this.provider.category] || this.provider.category;
  }

  get stars(): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  isStarFilled(star: number): boolean {
    return star <= Math.floor(this.provider.rating);
  }

  isStarHalf(star: number): boolean {
    return star === Math.ceil(this.provider.rating) && !Number.isInteger(this.provider.rating);
  }
}
