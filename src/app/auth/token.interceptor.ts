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

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.authSrv.user$.pipe(
      take(1),
      switchMap(() => {
        const userToken = localStorage.getItem('user');
        const businessToken = localStorage.getItem('businessToken');

        const activeToken = userToken || businessToken;

        if (activeToken) {
          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${activeToken}`
            }
          });
          return next.handle(clonedRequest);
        } else {
          return next.handle(request);
        }
      })
    );
  }
}
