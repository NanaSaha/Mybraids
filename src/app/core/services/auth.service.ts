import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserProfile, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    role: UserRole;
    phone: string;
    location: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService);
  private router = inject(Router);

  currentUser = signal<UserProfile | null>(null);
  isLoading   = signal<boolean>(true);

  constructor() {
    this.restoreSession();
  }

  get isAuthenticated(): boolean { return !!this.currentUser(); }
  get userRole(): UserRole | null { return this.currentUser()?.role ?? null; }
  get isProvider(): boolean { return this.userRole === 'provider'; }
  get isAdmin(): boolean { return this.userRole === 'admin'; }

  private async restoreSession(): Promise<void> {
    const token = localStorage.getItem('mb_token');
    if (!token) { this.isLoading.set(false); return; }
    try {
      const user = await firstValueFrom(this.api.get<UserProfile>('/auth/me'));
      this.currentUser.set(this.normalizeUser(user as any));
    } catch {
      localStorage.removeItem('mb_token');
    } finally {
      this.isLoading.set(false);
    }
  }

  async register(email: string, password: string, name: string, role: UserRole = 'client'): Promise<void> {
    const res = await firstValueFrom(
      this.api.post<AuthResponse>('/auth/register', { email, password, displayName: name, role })
    );
    this.saveSession(res);
    this.router.navigate([role === 'provider' ? '/dashboard/provider' : '/']);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.api.post<AuthResponse>('/auth/login', { email, password })
    );
    this.saveSession(res);
    this.router.navigate([res.user.role === 'provider' ? '/dashboard/provider' : '/']);
  }

  /**
   * Renders Google's sign-in button inside `container`.
   * Call this from ngAfterViewInit so the DOM element exists.
   * `onError` receives a human-readable message if anything goes wrong.
   */
  /**
   * Renders Google's sign-in button inside `container`.
   * `getRole` is a function so it reads the current role at click time (important for register).
   * `onError` receives a human-readable message on failure.
   */
  renderGoogleButton(
    container: HTMLElement,
    getRole: UserRole | (() => UserRole) = 'client',
    onError: (msg: string) => void = () => {}
  ): void {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      onError('Google Sign-In did not load. Please refresh the page.');
      return;
    }

    const resolveRole = (): UserRole =>
      typeof getRole === 'function' ? getRole() : getRole;

    google.accounts.id.initialize({
      client_id:            environment.googleClientId,
      callback:             async (response: { credential: string }) => {
        try {
          const res = await firstValueFrom(
            this.api.post<AuthResponse>('/auth/google', { idToken: response.credential, role: resolveRole() })
          );
          this.saveSession(res);
          this.router.navigate([res.user.role === 'provider' ? '/dashboard/provider' : '/']);
        } catch (err: any) {
          onError(err?.error?.error || 'Google sign-in failed. Please try again.');
        }
      },
      use_fedcm_for_prompt: false,
      ux_mode:              'popup',
    });

    google.accounts.id.renderButton(container, {
      type:           'standard',
      theme:          'outline',
      size:           'large',
      text:           'continue_with',
      width:          container.offsetWidth || 340,
      logo_alignment: 'left',
    });
  }

  /** @deprecated Use renderGoogleButton() instead */
  async loginWithGoogle(role: UserRole = 'client'): Promise<void> {
    throw new Error('Use renderGoogleButton() — One Tap is disabled on localhost.');
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mb_token');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  async updateProfile(data: { displayName?: string; phone?: string; location?: string }): Promise<void> {
    await firstValueFrom(this.api.put('/auth/profile', data));
    const current = this.currentUser();
    if (current) {
      this.currentUser.set({ ...current, ...data } as UserProfile);
    }
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('mb_token', res.token);
    this.currentUser.set(this.normalizeUser(res.user));
  }

  private normalizeUser(u: AuthResponse['user']): UserProfile {
    return {
      uid:         u.id,
      email:       u.email,
      displayName: u.displayName,
      photoURL:    u.photoURL,
      role:        u.role,
      phone:       u.phone || '',
      location:    u.location || '',
      createdAt:   new Date(),
      updatedAt:   new Date(),
    };
  }
}
