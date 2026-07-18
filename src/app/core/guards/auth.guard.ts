import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

function waitForAuth(
  authService: AuthService,
  check: () => boolean,
  onFail: () => void
): boolean | Observable<boolean> {
  if (!authService.isLoading()) {
    if (check()) return true;
    onFail();
    return false;
  }
  return toObservable(authService.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (check()) return true;
      onFail();
      return false;
    })
  );
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return waitForAuth(
    authService,
    () => authService.isAuthenticated,
    () => router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } })
  );
};

export const providerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return waitForAuth(
    authService,
    () => authService.isAuthenticated && authService.isProvider,
    () => {
      if (!authService.isAuthenticated) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      } else {
        router.navigate(['/dashboard/client']);
      }
    }
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return waitForAuth(
    authService,
    () => authService.isAuthenticated && authService.isAdmin,
    () => {
      if (!authService.isAuthenticated) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      } else {
        router.navigate(['/dashboard/client']);
      }
    }
  );
};
