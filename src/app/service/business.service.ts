import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business } from 'src/interfaces/business';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private apiURL = 'https://api.happycash.it/api/businesses';

  constructor(private http: HttpClient) {}

  getBusinessesByUser(userId: number): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiURL}/user/${userId}`);
  }

  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(this.apiURL);
  }

  getBusinessById(id: number): Observable<Business> {
    return this.http.get<Business>(`${this.apiURL}/${id}`);
  }

  createBusiness(business: Business): Observable<Business> {
    return this.http.post<Business>(`${this.apiURL}/create`, business);
  }

  joinBusiness(businessId: number, userId: number): Observable<any> {
    return this.http.post(
      `${this.apiURL}/join/${businessId}?userId=${userId}`,
      {},
      { responseType: 'text' as 'json' }
    );
  }

  deleteBusiness(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  approveBusiness(id: number): Observable<Business> {
    return this.http.put<Business>(`${this.apiURL}/approve/${id}`, {});
  }

  updateBusiness(id: number, business: Business): Observable<Business> {
    return this.http.put<Business>(`${this.apiURL}/${id}`, business);
  }
}
