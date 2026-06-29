import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminService, AdminStats, AdminUser, AdminProvider, AdminBooking, AdminReview
} from '../../../core/services/admin.service';

type Tab = 'overview' | 'users' | 'providers' | 'bookings' | 'reviews';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab = signal<Tab>('overview');

  // Stats
  stats = signal<AdminStats | null>(null);
  statsLoading = signal(true);

  // Users
  users = signal<AdminUser[]>([]);
  usersTotal = signal(0);
  usersLoading = signal(false);
  userSearch = signal('');
  userRoleFilter = signal('');
  userStatusFilter = signal('');
  userPage = signal(1);

  // Providers
  providers = signal<AdminProvider[]>([]);
  providersTotal = signal(0);
  providersLoading = signal(false);
  providerPending = signal(false);
  providerPage = signal(1);

  // Bookings
  bookings = signal<AdminBooking[]>([]);
  bookingsLoading = signal(false);
  bookingSearch = signal('');
  bookingStatusFilter = signal('');

  // Reviews
  reviews = signal<AdminReview[]>([]);
  reviewsLoading = signal(false);

  // Feedback
  actionMsg = signal('');

  // Create user form
  showCreateUser = signal(false);
  createForm = signal({ email: '', displayName: '', password: '', role: 'admin' });
  createSaving = signal(false);
  createError = signal('');

  ngOnInit() {
    this.loadStats();
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'overview' && !this.stats())    this.loadStats();
    if (tab === 'users')     this.loadUsers();
    if (tab === 'providers') this.loadProviders();
    if (tab === 'bookings')  this.loadBookings();
    if (tab === 'reviews')   this.loadReviews();
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  async loadStats() {
    this.statsLoading.set(true);
    try { this.stats.set(await this.adminService.getStats()); }
    finally { this.statsLoading.set(false); }
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  async loadUsers() {
    this.usersLoading.set(true);
    try {
      const p: Record<string, string> = { page: String(this.userPage()) };
      if (this.userSearch())       p['search'] = this.userSearch();
      if (this.userRoleFilter())   p['role']   = this.userRoleFilter();
      if (this.userStatusFilter()) p['status'] = this.userStatusFilter();
      const res = await this.adminService.getUsers(p);
      this.users.set(res.data);
      this.usersTotal.set(res.total);
    } finally { this.usersLoading.set(false); }
  }

  async setUserStatus(user: AdminUser, status: string) {
    await this.adminService.updateUser(user.id, { status });
    user.status = status;
    this.users.set([...this.users()]);
    this.flash(`${user.displayName} marked as ${status}`);
  }

  async setUserRole(user: AdminUser, role: string) {
    await this.adminService.updateUser(user.id, { role });
    user.role = role;
    this.users.set([...this.users()]);
    this.flash(`${user.displayName} role changed to ${role}`);
  }

  async deleteUser(user: AdminUser) {
    if (!confirm(`Permanently delete ${user.displayName}? This cannot be undone.`)) return;
    await this.adminService.deleteUser(user.id);
    this.users.set(this.users().filter(u => u.id !== user.id));
    this.flash(`${user.displayName} deleted`);
  }

  onUserSearch() {
    this.userPage.set(1);
    this.loadUsers();
  }

  openCreateUser() {
    this.createForm.set({ email: '', displayName: '', password: '', role: 'admin' });
    this.createError.set('');
    this.showCreateUser.set(true);
  }

  cancelCreateUser() { this.showCreateUser.set(false); }

  updateCreateForm(field: string, value: string) {
    this.createForm.set({ ...this.createForm(), [field]: value });
  }

  async submitCreateUser() {
    const f = this.createForm();
    if (!f.email || !f.displayName || f.password.length < 8) {
      this.createError.set('All fields required. Password must be at least 8 characters.');
      return;
    }
    this.createSaving.set(true);
    this.createError.set('');
    try {
      const newUser = await this.adminService.createUser(f);
      this.users.set([{ ...newUser, createdAt: new Date().toISOString() } as any, ...this.users()]);
      this.usersTotal.update(n => n + 1);
      this.showCreateUser.set(false);
      this.flash(`${newUser.displayName} created as ${newUser.role}`);
    } catch (e: any) {
      this.createError.set(e?.error?.error ?? 'Failed to create user');
    } finally {
      this.createSaving.set(false);
    }
  }

  // ── Providers ─────────────────────────────────────────────────────────────
  async loadProviders() {
    this.providersLoading.set(true);
    try {
      const p: Record<string, string> = { page: String(this.providerPage()) };
      if (this.providerPending()) p['pending'] = 'true';
      const res = await this.adminService.getProviders(p);
      this.providers.set(res.data);
      this.providersTotal.set(res.total);
    } finally { this.providersLoading.set(false); }
  }

  async toggleProviderFlag(provider: AdminProvider, flag: 'approved' | 'verified' | 'featured') {
    const newVal = !provider[flag];
    await this.adminService.updateProvider(provider.id, { [flag]: newVal });
    (provider as any)[flag] = newVal;
    this.providers.set([...this.providers()]);
    this.flash(`${provider.name} ${flag} set to ${newVal}`);
  }

  // ── Bookings ───────────────────────────────────────────────────────────────
  async loadBookings() {
    this.bookingsLoading.set(true);
    try {
      const p: Record<string, string> = {};
      if (this.bookingSearch())       p['search'] = this.bookingSearch();
      if (this.bookingStatusFilter()) p['status'] = this.bookingStatusFilter();
      this.bookings.set(await this.adminService.getBookings(p));
    } finally { this.bookingsLoading.set(false); }
  }

  async updateBookingStatus(booking: AdminBooking, status: string) {
    await this.adminService.updateBookingStatus(booking.id, status);
    booking.status = status;
    this.bookings.set([...this.bookings()]);
    this.flash(`Booking updated to ${status}`);
  }

  // ── Reviews ────────────────────────────────────────────────────────────────
  async loadReviews() {
    this.reviewsLoading.set(true);
    try { this.reviews.set(await this.adminService.getReviews()); }
    finally { this.reviewsLoading.set(false); }
  }

  async deleteReview(review: AdminReview) {
    if (!confirm('Remove this review? This cannot be undone.')) return;
    await this.adminService.deleteReview(review.id);
    this.reviews.set(this.reviews().filter(r => r.id !== review.id));
    this.flash('Review removed');
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  flash(msg: string) {
    this.actionMsg.set(msg);
    setTimeout(() => this.actionMsg.set(''), 3000);
  }

  statusColor(status: string): string {
    return ({ active: '#4A7C59', suspended: '#E8A030', banned: '#C62828', pending: '#E8A030',
              confirmed: '#4A7C59', cancelled: '#C62828', completed: '#1C0A00' } as any)[status] ?? '#999';
  }

  stars(n: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆');
  }

  formatDate(d: string | Date): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  get bookingsByStatus(): Record<string, number> {
    return this.stats()?.bookings?.byStatus ?? {};
  }
}
