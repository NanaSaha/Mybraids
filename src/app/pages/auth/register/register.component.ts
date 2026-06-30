import { Component, AfterViewInit, ElementRef, ViewChild, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  @ViewChild('googleBtnContainer') googleBtnContainer!: ElementRef<HTMLDivElement>;

  name = '';
  email = '';
  phone = '';
  password = '';
  role = signal<UserRole>('client');
  agreeToTerms = false;
  error = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  ngOnInit() {
    const roleParam = this.route.snapshot.queryParams['role'];
    if (roleParam === 'provider') this.role.set('provider');
  }

  ngAfterViewInit() {
    // Pass a getter so the callback always picks up the currently selected role
    this.authService.renderGoogleButton(
      this.googleBtnContainer.nativeElement,
      () => this.role(),
      (msg) => this.error.set(msg)
    );
  }

  setRole(r: UserRole) {
    this.role.set(r);
  }

  async onRegister() {
    if (!this.name || !this.email || !this.phone || !this.password) {
      this.error.set('Please fill in all required fields including phone number.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    if (!this.agreeToTerms) {
      this.error.set('Please agree to the Terms of Service.');
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    try {
      await this.authService.register(this.email, this.password, this.name, this.role(), this.phone);
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Registration failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
