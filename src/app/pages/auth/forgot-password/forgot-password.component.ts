import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email     = '';
  loading   = signal(false);
  error     = signal('');
  submitted = signal(false);

  async onSubmit() {
    if (!this.email.trim()) { this.error.set('Please enter your email address.'); return; }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.forgotPassword(this.email.trim());
      this.submitted.set(true);
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Something went wrong. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
