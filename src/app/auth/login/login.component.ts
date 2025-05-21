import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage: string | null = null; 

  constructor(private authSrv: AuthService, private router: Router) {}

  login(form: NgForm) {
    this.authSrv.login(form.value).subscribe({
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
  }
}  
