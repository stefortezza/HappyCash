import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authSrv: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.authSrv.user$.pipe(
      take(1),
      switchMap(() => {
        const userToken = localStorage.getItem('user');
        const businessToken = localStorage.getItem('businessToken');
        const activeToken = userToken || businessToken;

        // ✅ Lista degli endpoint pubblici da escludere
        const excludedPaths = [
          '/api/businesses/create',
          '/api/businesses/login',
          '/api/businesses', // GET aziende pubbliche
          '/auth/login',
          '/auth/register',
          '/auth/recover',
          '/auth/reset-password',
          '/api/fidelitycards/code/',
          '/api/fidelitycards/phone/',
          '/api/sconti/applica',
          '/api/sconti/business/',
          '/api/notifications/', // POST broadcast comuni
        ];

        // ❗ Escludi token se la richiesta è per uno degli endpoint pubblici
        const isExcluded = excludedPaths.some((path) =>
          request.url.includes(path)
        );

        if (activeToken && !isExcluded) {
          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${activeToken}`,
            },
          });
          return next.handle(clonedRequest);
        } else {
          return next.handle(request);
        }
      })
    );
  }
}
