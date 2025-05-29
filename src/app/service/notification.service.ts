import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'https://api.happycash.it/api/notifications';

  constructor(private http: HttpClient) {}

  sendBroadcast(subject: string, message: string) {
    return this.http.post(
      `${this.apiUrl}/broadcast`,
      { subject, message },
      { responseType: 'text' }
    );
  }

  sendBroadcastToComuni(comuni: string[], subject: string, message: string) {
    return this.http.post(`${this.apiUrl}/broadcastComuni`, { comuni, subject, message });
  }

  getComuniUtenti() {
    return this.http.get<string[]>('https://api.happycash.it/api/users/comuni');
  }
}
