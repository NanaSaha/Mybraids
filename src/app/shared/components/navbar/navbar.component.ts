import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdminNavService } from '../../../core/services/admin-nav.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  authService     = inject(AuthService);
  private router  = inject(Router);
  private adminNav = inject(AdminNavService);

  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }

  closeMenus() {
    this.mobileMenuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeMenus();
  }

  openServiceSetup(): void {
    this.adminNav.requestTab('service-types');
    this.router.navigate(['/dashboard/admin']);
    this.closeMenus();
  }

  get logoRoute(): string {
    if (this.authService.isAdmin) return '/dashboard/admin';
    if (this.authService.isProvider) return '/dashboard/provider';
    return '/';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
