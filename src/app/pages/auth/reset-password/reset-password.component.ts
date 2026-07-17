import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route       = inject(ActivatedRoute);

  token           = '';
  password        = '';
  confirmPassword = '';
  showPassword    = signal(false);
  loading         = signal(false);
  error           = signal('');
  success         = signal(false);

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error.set('Invalid reset link. Please request a new one.');
    }
  }

  async onSubmit() {
    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.resetPassword(this.token, this.password);
      this.success.set(true);
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Something went wrong. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
