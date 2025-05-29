import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthData } from 'src/interfaces/auth-data.interface';
import { Register } from 'src/interfaces/register.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  

  private apiURL = 'http://api.happycash.it/auth';
  private token: string | null = null;
  private authSubject = new BehaviorSubject<AuthData | null>(null);
  user$ = this.authSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedToken = this.getStoredToken();
    if (storedToken) {
      this.token = storedToken;
      const userData = this.getCurrentUser();
      if (userData) {
        this.authSubject.next(userData);
      } else {
        this.logout(); // token malformato
      }
    }
  }

  login(user: { email: string; password: string }): Observable<boolean> {
    return this.http.post<string>(`${this.apiURL}/login`, user, { responseType: 'text' as 'json' }).pipe(
      tap((token: string) => {
        this.token = token;
        localStorage.setItem('user', token);
        const authData = this.getCurrentUser();
        this.authSubject.next(authData); 
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('user');
    this.authSubject.next(null);
  }

  signUp(user: Register): Observable<string> {
    return this.http.post<string>(`${this.apiURL}/register`, user, { responseType: 'text' as 'json' }).pipe(
      tap((res: string) => res),
      catchError((error) => {
        console.error('❌ Errore durante la registrazione:', error);
        throw error;
      })
    );
  }
  

  getStoredToken(): string | null {
    return localStorage.getItem('user');
  }

  getCurrentUser(): AuthData | null {
    const token = this.getStoredToken();
    if (!token) return null;
  
    const tokenData = this.parseJwt(token);
    if (tokenData) {
      return {
        accessToken: token,
        user: {
          ...tokenData,
          id: Number(tokenData.id)
        }
      };
    }
    return null;
  }
  
  

  isLoggedIn(): boolean {
    return !!this.getStoredToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.user?.roles?.includes('ADMIN') ?? false;
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Errore nel parsing del token JWT', e);
      return null;
    }
  }

  updateUser(userId: number, user: Register): Observable<any> {
    return this.http.put(`${this.apiURL.replace('/auth', '/api/users/update-profile')}/${userId}`, user);
  }
  
}
