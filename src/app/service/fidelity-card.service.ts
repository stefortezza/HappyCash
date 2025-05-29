import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FidelityCard } from 'src/interfaces/fidelity-card';

@Injectable({ providedIn: 'root' })
export class FidelityCardService {
  private apiURL = 'https://api.happycash.it/api/fidelitycards';

  constructor(private http: HttpClient) {}

  getCardByUserId(userId: number): Observable<FidelityCard> {
    return this.http.get<FidelityCard>(`${this.apiURL}/user/${userId}`);
  }
}
