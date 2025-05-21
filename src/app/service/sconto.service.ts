import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ScontoApplicato {
  id: number;
  codiceFidelity: string;
  nome: string;
  cognome: string;
  offerta: string;
  dataOra: string;
  businessId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScontoService {

  private apiUrl = `${environment.apiURL}api/sconti`;

  constructor(private http: HttpClient) {}

  applicaSconto(scontoDto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applica`, scontoDto);
  }

  getScontiByBusiness(businessId: number): Observable<ScontoApplicato[]> {
    return this.http.get<ScontoApplicato[]>(`${this.apiUrl}/business/${businessId}`);
  }

  getAllSconti(): Observable<ScontoApplicato[]> {
    return this.http.get<ScontoApplicato[]>(`${this.apiUrl}`);
  }
} 
