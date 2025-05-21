import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-business-login',
  templateUrl: './business-login.component.html',
  styleUrls: ['./business-login.component.scss']
})
export class BusinessLoginComponent {
  username = '';
  password = '';
  loginError = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.http.post<any>(`${environment.apiURL}api/businesses/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        const businessId = res.business?.id;
        if (businessId) {
          this.http.get<any>(`${environment.apiURL}api/businesses/${businessId}`).subscribe({
            next: (fullBusiness) => {
              fullBusiness.password = ''; // Non salviamo mai password
              localStorage.setItem('business', JSON.stringify(fullBusiness));
              this.loginError = '';
              this.router.navigate(['/business-dashboard']);
            },
            error: () => {
              this.loginError = '❌ Errore caricamento dati azienda.';
            }
          });
        } else {
          this.loginError = '❌ Errore login: ID azienda mancante.';
        }
      },
      error: () => {
        this.loginError = '❌ Credenziali errate!';
      }
    });
  }  
}
