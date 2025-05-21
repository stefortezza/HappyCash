import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

  constructor(private http: HttpClient) {}

  forwardGeocode(query: string): Observable<any> {
    const params = new HttpParams()
      .set('access_token', environment.mapboxToken)
      .set('autocomplete', 'true')
      .set('country', 'IT')
      .set('limit', '5');

    return this.http.get(`${this.baseUrl}${encodeURIComponent(query)}.json`, { params });
  }
}
