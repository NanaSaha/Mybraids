import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService, SearchFilters } from '../../core/services/provider.service';
import { Provider, SERVICE_CATEGORIES, ServiceCategory } from '../../core/models/provider.model';
import { ProviderCardComponent } from '../../shared/components/provider-card/provider-card.component';
import { LocationAutocompleteComponent } from '../../shared/components/location-autocomplete/location-autocomplete.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ProviderCardComponent, LocationAutocompleteComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);

  providers = signal<Provider[]>([]);
  isLoading = signal(false);
  showFilters = signal(false);

  categories = SERVICE_CATEGORIES;

  filters: SearchFilters = {
    location: '',
    category: '',
    minRating: 0,
    maxPrice: undefined,
    sortBy: 'rating',
  };

  sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];

  ratingOptions = [
    { value: 0, label: 'Any Rating' },
    { value: 4, label: '4★ and above' },
    { value: 4.5, label: '4.5★ and above' },
    { value: 4.8, label: '4.8★ and above' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters.location = params['location'] || '';
      this.filters.category = (params['category'] as ServiceCategory) || '';
      this.runSearch();
    });
  }

  async runSearch() {
    this.isLoading.set(true);
    try {
      const providers = await this.providerService.searchProviders(this.filters);
      this.providers.set(providers);
    } finally {
      this.isLoading.set(false);
    }
  }

  clearFilters() {
    this.filters = { location: '', category: '', minRating: 0, sortBy: 'rating' };
    this.runSearch();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filters.location) count++;
    if (this.filters.category) count++;
    if (this.filters.minRating) count++;
    if (this.filters.maxPrice) count++;
    return count;
  }

  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || value;
  }

  getSkeletonArray(): number[] {
    return Array(6).fill(0);
  }

  getGradient(index: number): string {
    return this.providerService.getAvatarGradient(index);
  }
}
