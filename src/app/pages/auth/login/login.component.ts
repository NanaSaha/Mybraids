import { Component, AfterViewInit, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);

  @ViewChild('googleBtnContainer') googleBtnContainer!: ElementRef<HTMLDivElement>;

  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  ngAfterViewInit() {
    this.authService.renderGoogleButton(
      this.googleBtnContainer.nativeElement,
      'client',
      (msg) => this.error.set(msg)
    );
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    try {
      await this.authService.login(this.email, this.password);
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Sign in failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
