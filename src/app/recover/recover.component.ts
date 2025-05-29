import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent {
  inputValue: string = '';
  submitted: boolean = false;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  recover() {
    this.errorMessage = '';
    this.loading = true;

    this.http.post('http://api.happycash.it/auth/recover', { email: this.inputValue }, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
          setTimeout(() => this.router.navigate(['/']), 4000);
        },
        error: (err) => {
          console.error('Errore durante il recupero:', err);
          this.errorMessage = '❌ Dato non valido o assente. Controlla i dati inseriti.';
          this.loading = false;
        }
      });
  }
}
