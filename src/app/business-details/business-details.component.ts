import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ScontoService } from '../service/sconto.service';

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.scss'],
})
export class BusinessDetailsComponent {
  username = '';
  password = '';
  business: any = null;
  loginError = '';

  searchInput = '';
  fidelityCode = '';
  cardFound = false;
  cardNotFound = false;
  userName = '';
  userSurname = '';
  servizioOfferto = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private scontoService: ScontoService
  ) {}

  ngOnInit() {
    const businessData = localStorage.getItem('business');
    if (businessData) {
      this.business = JSON.parse(businessData);
    }
  }

  logout() {
    this.business = null;
    localStorage.removeItem('business');
    this.username = '';
    this.password = '';
    this.cardFound = false;
    this.cardNotFound = false;
    this.router.navigate(['/']);
  }

  searchCardUnified() {
    const input = this.searchInput.trim();
    if (!input) {
      alert('⚠️ Inserisci un codice card o un numero di telefono.');
      return;
    }

    const isPhone = /^[\d\s+]+$/.test(input);
    const url = isPhone
      ? `${environment.apiURL}api/fidelitycards/phone/${input}`
      : `${environment.apiURL}api/fidelitycards/code/${input.toUpperCase()}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.userName = res.name;
        this.userSurname = res.surname;
        this.fidelityCode = res.codiceUnivoco;
        this.cardFound = true;
        this.cardNotFound = false;
      },
      error: (err) => {
        console.error('Errore ricerca card:', err);
        this.cardFound = false;
        this.cardNotFound = true;
      }
    });
  }

  salvaOfferta() {
    const payload = {
      ...this.business,
      offerta: this.servizioOfferto,
    };

    this.http.put(`${environment.apiURL}api/businesses/${this.business.id}`, payload).subscribe({
      next: (updated: any) => {
        alert('✅ Offerta aggiornata!');
        this.business = updated;
        this.servizioOfferto = updated.offerta;
        localStorage.setItem('business', JSON.stringify(updated));
      },
      error: () => alert('❌ Errore nel salvataggio dell’offerta.'),
    });
  }

  applicaSconto() {
    if (!this.fidelityCode || !this.userName || !this.userSurname || !this.business?.servizioOfferto) {
      alert('⚠️ Dati incompleti per applicare lo sconto.');
      return;
    }

    const payload = {
      codiceFidelity: this.fidelityCode.trim().toUpperCase(),
      nome: this.userName,
      cognome: this.userSurname,
      offerta: this.business.servizioOfferto,
      businessId: this.business.id
    };

    this.scontoService.applicaSconto(payload).subscribe({
      next: () => {
        alert('✅ Sconto applicato con successo!');
        this.resetCardFields();
      },
      error: () => alert('❌ Errore durante l`applicazione dello sconto.')
    });
  }

  resetCardFields(): void {
    this.searchInput = '';
    this.fidelityCode = '';
    this.cardFound = false;
    this.cardNotFound = false;
    this.userName = '';
    this.userSurname = '';
  }

  visualizzaScontiBusiness(): void {
    if (this.business?.id) {
      this.router.navigate(['/sconti-admin', this.business.id]);
    }
  }
}
