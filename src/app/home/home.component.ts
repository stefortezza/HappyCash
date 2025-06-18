import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isLoginView: boolean = true;
  identifier: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authSrv: AuthService,
    private http: HttpClient,
    private router: Router,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  ngOnInit(): void {
    const userToken = localStorage.getItem('user');
    const businessData = localStorage.getItem('business');

    if (userToken) {
      const user = this.authSrv.getCurrentUser();
      if (user?.user.roles.includes('ADMIN')) {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/user-dashboard']);
      }
    } else if (businessData) {
      this.router.navigate(['/business-dashboard']);
    }
  }

  toggleView(): void {
    this.isLoginView = !this.isLoginView;
  }

  login(): void {
    this.errorMessage = '';
    const rawIdentifier = this.identifier.trim();
    const normalizedIdentifier = rawIdentifier.replace(/\s+/g, ' ').trim();

    const isEmail = normalizedIdentifier.includes('@');

    if (isEmail) {
      // ✅ Login utente con verifica reCAPTCHA
      this.recaptchaV3Service.execute(
        environment.recaptchaSiteKey,
        'login',
        (token: string) => {
          this.authSrv
            .login({
              email: rawIdentifier,
              password: this.password,
              recaptchaToken: token,
            })
            .subscribe({
              next: (success) => {
                if (success) {
                  const user = this.authSrv.getCurrentUser();
                  if (user?.user.roles.includes('ADMIN')) {
                    this.router.navigate(['/admin-dashboard']);
                  } else {
                    this.router.navigate(['/user-dashboard']);
                  }
                } else {
                  this.errorMessage = '❌ Email o password non validi.';
                }
              },
              error: (error) => {
                console.error('Login error:', error);
                this.errorMessage =
                  error.status === 403 || error.status === 401
                    ? '⚠️ Il tuo account non è stato ancora approvato o reCAPTCHA non valido.'
                    : '❌ Errore durante il login. Riprova più tardi.';
              },
            });
        },
        {
          useGlobalDomain: false,
        },
        (error) => {
          console.error('Errore reCAPTCHA:', error);
          this.errorMessage = '❌ Errore nella verifica reCAPTCHA.';
        }
      );
    } else {
      // Login azienda
      const usernameClean = normalizedIdentifier
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

      this.http
        .post<any>(`${environment.apiURL}api/businesses/login`, {
          username: usernameClean,
          password: this.password,
        })
        .subscribe({
          next: (res) => {
            const businessId = res.business?.id;
            if (businessId) {
              this.http
                .get<any>(`${environment.apiURL}api/businesses/${businessId}`)
                .subscribe({
                  next: (fullBusiness) => {
                    fullBusiness.password = '';
                    localStorage.setItem(
                      'business',
                      JSON.stringify(fullBusiness)
                    );
                    this.router.navigate(['/business-dashboard']);
                  },
                  error: () =>
                    (this.errorMessage =
                      '❌ Errore nel caricamento dei dati azienda.'),
                });
            } else {
              this.errorMessage = '❌ Errore login: ID azienda mancante.';
            }
          },
          error: () => {
            this.errorMessage = '❌ Username o password azienda errati!';
          },
        });
    }
  }
}
