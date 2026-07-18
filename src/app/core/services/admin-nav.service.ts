import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminNavService {
  private _pendingTab = new BehaviorSubject<string>('');

  /** Emits non-empty tab names whenever the navbar requests a tab switch. */
  readonly tabRequest$ = this._pendingTab.pipe(filter(t => !!t));

  /** Current pending tab value (for sync reads in ngOnInit). */
  get pendingTab(): string { return this._pendingTab.getValue(); }

  requestTab(tab: string): void { this._pendingTab.next(tab); }
  clearTab(): void { this._pendingTab.next(''); }
}
