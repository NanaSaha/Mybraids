import {
  Component, Input, Output, EventEmitter, OnInit, inject,
  signal, HostListener, ElementRef, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { WORLD_CITIES, CityEntry } from './cities-data';

// ── Static country list ───────────────────────────────────────────────────
export const COUNTRIES: string[] = [
  'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus',
  'Belgium','Belize','Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
  'Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada',
  'Cape Verde','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominican Republic','DR Congo','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland',
  'France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala',
  'Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Lesotho','Liberia','Libya','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova',
  'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia',
  'Norway','Oman','Pakistan','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore','Slovakia',
  'Slovenia','Somalia','South Africa','South Korea','South Sudan','Spain',
  'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan',
  'Tanzania','Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey',
  'Turkmenistan','Uganda','UAE','UK','Ukraine','Uruguay','USA','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

interface Suggestion {
  label: string;       // display text
  value: string;       // what goes in the input
  sub?: string;        // secondary line (city→ country)
  type: 'country' | 'city';
}

// Cache shared across all component instances
let _cityCache: { city: string; country: string }[] | null = null;
let _cityLoading: Promise<void> | null = null;

@Component({
  selector: 'app-location-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lac-wrap">
      <div class="lac-input-row" [class.focused]="open()">
        @if (icon) { <i class="fas {{ icon }} lac-icon"></i> }
        <input
          #inputEl
          class="lac-input"
          [placeholder]="placeholder"
          [value]="inputValue()"
          (input)="onInput($any($event.target).value)"
          (focus)="onFocus()"
          (keydown)="onKeydown($event)"
          autocomplete="off"
        >
        @if (inputValue()) {
          <button class="lac-clear" (click)="clear()" tabindex="-1">
            <i class="fas fa-times"></i>
          </button>
        }
      </div>

      @if (open() && suggestions().length > 0) {
        <ul class="lac-dropdown">
          @for (s of suggestions(); track s.value + s.type; let i = $index) {
            <li class="lac-item"
                [class.highlighted]="i === highlighted()"
                (mousedown)="select(s)">
              <i class="fas {{ s.type === 'country' ? 'fa-globe' : 'fa-location-dot' }} lac-item-icon"></i>
              <span class="lac-item-label">{{ s.label }}</span>
              @if (s.sub) { <span class="lac-item-sub">{{ s.sub }}</span> }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrls: ['./location-autocomplete.component.scss'],
})
export class LocationAutocompleteComponent implements OnInit, OnChanges {
  private api = inject(ApiService);
  private el  = inject(ElementRef);

  /** 'location' = countries + cities, 'country' = countries only, 'city' = cities only */
  @Input() mode: 'location' | 'country' | 'city' = 'location';
  @Input() placeholder = 'City, country or region…';
  @Input() icon = 'fa-location-dot';
  @Input() value = '';
  /** Optional: restrict city suggestions to this country (used in provider settings) */
  @Input() countryFilter = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() selected    = new EventEmitter<string>();

  inputValue  = signal('');
  suggestions = signal<Suggestion[]>([]);
  highlighted = signal(-1);
  open        = signal(false);

  ngOnInit() {
    this.inputValue.set(this.value);
    this.preloadCities();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !changes['value'].firstChange) {
      this.inputValue.set(this.value);
    }
  }

  private async preloadCities() {
    if (_cityCache !== null || _cityLoading) return;
    _cityLoading = firstValueFrom(
      this.api.get<{ city: string; country: string }[]>('/providers/locations').pipe(
        catchError(() => of([]))
      )
    ).then(data => { _cityCache = data; });
    await _cityLoading;
  }

  onInput(val: string) {
    this.inputValue.set(val);
    this.valueChange.emit(val);
    this.highlighted.set(-1);
    this.open.set(true);
    this.updateSuggestions(val);
  }

  onFocus() {
    this.open.set(true);
    this.updateSuggestions(this.inputValue());
  }

  onKeydown(e: KeyboardEvent) {
    const list = this.suggestions();
    if (!this.open() || list.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlighted.set(Math.min(this.highlighted() + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlighted.set(Math.max(this.highlighted() - 1, 0));
    } else if (e.key === 'Enter' && this.highlighted() >= 0) {
      e.preventDefault();
      this.select(list[this.highlighted()]);
    } else if (e.key === 'Escape') {
      this.open.set(false);
    }
  }

  select(s: Suggestion) {
    this.inputValue.set(s.value);
    this.valueChange.emit(s.value);
    this.selected.emit(s.value);
    this.open.set(false);
    this.suggestions.set([]);
  }

  clear() {
    this.inputValue.set('');
    this.valueChange.emit('');
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.open.set(false);
    }
  }

  private updateSuggestions(query: string) {
    const q = query.trim().toLowerCase();
    if (q.length < 1) { this.suggestions.set([]); return; }

    const results: Suggestion[] = [];
    const countryF = this.countryFilter.toLowerCase();

    // ── Cities (provider DB first — they have real artists) ──────────────
    if (this.mode !== 'country') {
      const dbCities: CityEntry[] = (_cityCache ?? []).filter(e =>
        (!countryF || e.country.toLowerCase() === countryF) &&
        (e.city.toLowerCase().startsWith(q) || e.city.toLowerCase().includes(q))
      );

      // Static world cities — starts-with first, then contains
      const staticCities: CityEntry[] = WORLD_CITIES.filter(e =>
        (!countryF || e.country.toLowerCase() === countryF) &&
        (e.city.toLowerCase().startsWith(q) || e.city.toLowerCase().includes(q))
      ).sort((a, b) => {
        const as = a.city.toLowerCase().startsWith(q);
        const bs = b.city.toLowerCase().startsWith(q);
        return as === bs ? a.city.localeCompare(b.city) : as ? -1 : 1;
      });

      // DB cities get priority (they have providers), then fill with static
      const seen = new Set<string>();
      for (const e of [...dbCities, ...staticCities]) {
        const key = e.city.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const isLive = dbCities.some(d => d.city.toLowerCase() === key);
        results.push({
          label: e.city,
          value: e.city,
          sub: e.country,
          type: 'city',
          ...(isLive ? {} : {}),
        });
        if (results.length >= 6) break;
      }
    }

    // ── Countries ────────────────────────────────────────────────────────
    if (this.mode !== 'city') {
      const countryResults: Suggestion[] = [];
      // starts-with first
      COUNTRIES.filter(c => c.toLowerCase().startsWith(q))
        .slice(0, 4)
        .forEach(c => countryResults.push({ label: c, value: c, type: 'country' }));
      // then contains
      if (countryResults.length < 4) {
        COUNTRIES
          .filter(c => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q))
          .slice(0, 4 - countryResults.length)
          .forEach(c => countryResults.push({ label: c, value: c, type: 'country' }));
      }

      // In 'country' mode show countries only; in 'location' mode append after cities
      if (this.mode === 'country') {
        results.push(...countryResults);
      } else {
        // only add countries if very few city matches so far
        const slots = 8 - results.length;
        results.push(...countryResults.slice(0, slots));
      }
    }

    // Final dedup and cap
    const seen = new Set<string>();
    this.suggestions.set(
      results.filter(r => {
        if (seen.has(r.value.toLowerCase())) return false;
        seen.add(r.value.toLowerCase());
        return true;
      }).slice(0, 8)
    );
  }
}
