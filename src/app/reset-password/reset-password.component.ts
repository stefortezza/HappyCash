import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  submitted: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  resetPassword(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Le password non coincidono.';
      return;
    }

    this.http.post('http://api.happycash.it/auth/reset-password', {
      token: this.token,
      newPassword: this.newPassword
    }, { responseType: 'text' }).subscribe({
      next: () => {
        this.successMessage = '✅ Password aggiornata con successo! Ora puoi effettuare il login.';
        this.submitted = true;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        console.error('Errore durante il reset password:', err);
        this.errorMessage = '❌ Errore nel reset della password.';
      }
    });
  }
}
