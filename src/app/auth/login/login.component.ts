import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage: string | null = null;

  constructor(
    private authSrv: AuthService,
    private router: Router,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  login(form: NgForm) {
    if (form.invalid) return;

    const loginData = form.value;

    this.recaptchaV3Service.execute(
      environment.recaptchaSiteKey, 
      'login',                      
      (token: string) => {          
        const payload = {
          email: loginData.email,
          password: loginData.password,
          recaptchaToken: token
        };

        this.authSrv.login(payload).subscribe({
          next: (success) => {
            if (success) {
              const user = this.authSrv.getCurrentUser();
              if (user?.user.roles.includes('ADMIN')) {
                this.router.navigate(['/admin-dashboard']);
              } else {
                this.router.navigate(['/user-dashboard']);
              }
            } else {
              this.errorMessage = 'Email o password non validi.';
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            if (error.status === 403 || error.status === 401) {
              this.errorMessage = 'Il tuo account non è stato ancora approvato.';
            } else {
              this.errorMessage = 'Errore durante il login. Riprova più tardi.';
            }
          }
        });
      },
      {
        useGlobalDomain: false // ✅ opzionale
      },
      (error) => {
        console.error('Errore reCAPTCHA:', error);
        this.errorMessage = 'Errore nella verifica reCAPTCHA.';
      }
    );
  }
}
